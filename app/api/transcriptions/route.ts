import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/flac",
  "audio/mp4",
  "audio/m4a",
  "audio/mpeg",
  "audio/mpga",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
  "audio/x-wav",
  "video/mp4"
]);

type TranscriptionResponse = {
  text?: string;
  languages?: Array<{ code: string }>;
};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : request.nextUrl.origin;

  if (origin && origin !== expectedOrigin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in before transcribing audio." }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_AUDIO_BYTES + 256 * 1024) {
    return NextResponse.json({ error: "Audio must be 25 MB or smaller." }, { status: 413 });
  }

  let audio: File;
  try {
    const form = await request.formData();
    const candidate = form.get("audio");
    if (!(candidate instanceof File)) {
      return NextResponse.json({ error: "An audio file is required." }, { status: 400 });
    }
    audio = candidate;
  } catch {
    return NextResponse.json({ error: "Unable to read the audio upload." }, { status: 400 });
  }

  const mimeType = audio.type.split(";")[0].toLowerCase();
  if (!ALLOWED_AUDIO_TYPES.has(mimeType)) {
    return NextResponse.json({ error: "Unsupported audio format. Use WebM, MP3, WAV, M4A, MP4, OGG or FLAC." }, { status: 415 });
  }
  if (audio.size === 0) {
    return NextResponse.json({ error: "The audio recording is empty." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Audio must be 25 MB or smaller." }, { status: 413 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The transcription provider is not configured yet." }, { status: 503 });
  }

  const model = process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-transcribe";
  const requestId = crypto.randomUUID();

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Usage storage is not configured yet." }, { status: 503 });
  }

  // Record the request before spending provider credits. Raw audio and transcript text are never stored.
  const { data: usageEvent, error: usageError } = await admin
    .from("usage_events")
    .insert({
      user_id: user.id,
      event_type: "transcription",
      units: 1,
      request_id: requestId,
      metadata: {
        provider: "openai",
        model,
        mime_type: mimeType,
        file_size_bytes: audio.size
      }
    })
    .select("id")
    .single();

  if (usageError || !usageEvent) {
    return NextResponse.json({ error: "Unable to record usage. Please try again later." }, { status: 503 });
  }

  const upstreamForm = new FormData();
  const safeName = audio.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "recording.webm";
  upstreamForm.append("file", audio, safeName);
  upstreamForm.append("model", model);
  upstreamForm.append("response_format", "json");

  try {
    const upstream = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstreamForm,
      signal: AbortSignal.timeout(120_000)
    });

    if (!upstream.ok) {
      await admin.from("usage_events").delete().eq("id", usageEvent.id);
      if (upstream.status === 429) {
        return NextResponse.json({ error: "The transcription provider is busy. Please try again shortly." }, { status: 429 });
      }
      return NextResponse.json({ error: "Transcription failed. Please try another recording." }, { status: 502 });
    }

    const result = await upstream.json() as TranscriptionResponse;
    if (typeof result.text !== "string" || !result.text.trim()) {
      await admin.from("usage_events").delete().eq("id", usageEvent.id);
      return NextResponse.json({ error: "No speech could be transcribed from this recording." }, { status: 422 });
    }

    return NextResponse.json({
      request_id: requestId,
      text: result.text,
      languages: result.languages ?? [],
      model
    });
  } catch {
    await admin.from("usage_events").delete().eq("id", usageEvent.id);
    return NextResponse.json({ error: "Transcription timed out or the provider could not be reached." }, { status: 502 });
  }
}
