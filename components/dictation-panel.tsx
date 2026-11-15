"use client";

import { useEffect, useRef, useState } from "react";

type DictationState = "idle" | "recording" | "transcribing" | "done";

type TranscriptionResult = {
  text?: string;
  error?: string;
};

export function DictationPanel() {
  const [state, setState] = useState<DictationState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function transcribe(blob: Blob, mimeType: string) {
    setState("transcribing");
    setError("");
    setCopied(false);

    try {
      if (blob.size > 25 * 1024 * 1024) {
        throw new Error("This recording is larger than 25 MB. Please record a shorter note.");
      }

      const extension = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
      const file = new File([blob], `any-recording.${extension}`, { type: mimeType });
      const form = new FormData();
      form.append("audio", file);

      const response = await fetch("/api/transcriptions", { method: "POST", body: form });
      const result = await response.json() as TranscriptionResult;

      if (!response.ok) {
        throw new Error(result.error ?? "Transcription failed.");
      }
      if (!result.text) {
        throw new Error("The provider returned an empty transcript.");
      }

      setTranscript(result.text);
      setState("done");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to transcribe this recording.");
      setState("idle");
    }
  }

  async function startRecording() {
    setError("");
    setTranscript("");
    setCopied(false);

    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("This browser does not support microphone recording. Try a current version of Chrome, Edge or Safari.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const preferredType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const recorder = preferredType
        ? new MediaRecorder(stream, { mimeType: preferredType })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || chunksRef.current[0]?.type || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        void transcribe(blob, mimeType.split(";")[0]);
      };

      recorder.start();
      setState("recording");
    } catch (caught) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError(caught instanceof Error ? caught.message : "Microphone permission was not granted.");
      setState("idle");
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      setState("transcribing");
    }
  }

  async function copyTranscript() {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
    } catch {
      setError("Clipboard access was blocked. Select the transcript and copy it manually.");
    }
  }

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-neutral-400">ANY voice workspace</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-.05em]">Speak. Get your words back.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">Record a short note and turn it into editable text. Your recording is sent for transcription and is not saved by the ANY app.</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${state === "recording" ? "bg-red-50 text-red-700" : "bg-lime-100 text-neutral-700"}`} aria-live="polite">
          {state === "recording" ? "● Recording" : state === "transcribing" ? "Transcribing…" : state === "done" ? "Ready to edit" : "Microphone idle"}
        </span>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {state === "recording" ? (
          <button type="button" onClick={stopRecording} className="rounded-full bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700">
            Stop recording
          </button>
        ) : (
          <button type="button" onClick={startRecording} disabled={state === "transcribing"} className="rounded-full bg-black px-6 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50">
            {state === "transcribing" ? "Transcribing…" : state === "done" ? "Record another" : "Start recording"}
          </button>
        )}
        {state === "done" && (
          <button type="button" onClick={copyTranscript} className="rounded-full border border-black/15 px-6 py-3.5 text-sm font-semibold hover:bg-neutral-50">
            {copied ? "Copied" : "Copy transcript"}
          </button>
        )}
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <label className="mt-7 block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-[.16em] text-neutral-400">Transcript</span>
        <textarea
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          placeholder="Your transcript will appear here. You can edit it before copying."
          rows={7}
          className="w-full resize-y rounded-2xl border border-neutral-200 bg-[#f7f7f4] p-4 text-sm leading-7 text-neutral-800 outline-none transition focus:border-black"
        />
      </label>
      <p className="mt-3 text-xs leading-5 text-neutral-400">Audio is processed by the configured transcription provider. Standard file uploads are limited to 25 MB. Browser microphone access requires HTTPS or localhost.</p>
    </section>
  );
}
