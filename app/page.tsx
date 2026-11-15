import Link from "next/link";

const features = [
  { n: "01", title: "Speak naturally", copy: "Talk through the thought. ANY is designed to turn natural speech into text you can actually use." },
  { n: "02", title: "Keep your flow", copy: "A voice-first workflow built for the places you write, from quick replies to long-form thinking." },
  { n: "03", title: "Make it yours", copy: "Personal vocabulary, writing preferences and context-aware formatting are core product pillars." }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f4]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="text-2xl font-black tracking-[-0.08em]">ANY<span className="text-lime-600">.</span></Link>
        <div className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
          <a href="#product">Product</a><Link href="/pricing">Pricing</Link><a href="#how">How it works</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold sm:block">Log in</Link>
          <Link href="/signup" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700">Get started <span aria-hidden>↗</span></Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:pb-36 lg:pt-24">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600"><span className="h-2 w-2 rounded-full bg-lime-500" /> Your voice, upgraded</div>
          <h1 className="max-w-3xl text-6xl font-semibold leading-[.94] tracking-[-0.075em] sm:text-7xl lg:text-[6.6rem]">Think it.<br/><span className="text-neutral-400">Say it.</span><br/>ANYwhere.</h1>
          <p className="mt-8 max-w-lg text-lg leading-8 text-neutral-600">Your thoughts move faster than your fingers. Turn the way you speak into clear, polished writing with an AI voice workspace built for your flow.</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/signup" className="rounded-full bg-[#c8f169] px-7 py-4 text-sm font-bold transition hover:bg-[#b7e653]">Start for free <span aria-hidden>↗</span></Link>
            <Link href="/pricing" className="rounded-full border border-neutral-300 px-7 py-4 text-sm font-semibold hover:bg-white">Explore plans</Link>
          </div>
          <p className="mt-5 text-xs text-neutral-500">Designed for the way you think. No credit card required to explore.</p>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 rounded-[3rem] bg-[#dff2b7] blur-3xl" />
          <div className="relative rounded-[2.5rem] border border-black/10 bg-white p-5 shadow-2xl shadow-black/10 sm:p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-5"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-400">ANY voice workspace</p><p className="mt-1 text-sm font-semibold">A thought, becoming a message</p></div><span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold">Concept preview</span></div>
            <div className="py-12 text-center"><div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-black text-3xl text-[#c8f169] shadow-xl">◉</div><p className="mt-6 text-sm font-semibold">Listening experience preview</p><p className="mt-2 text-xs text-neutral-400">The live microphone experience is on the product roadmap.</p><div className="mx-auto mt-8 flex h-12 max-w-xs items-center justify-center gap-1">{Array.from({length:31},(_,i)=><span key={i} className="w-1 rounded-full bg-lime-500" style={{height: 8 + ((i*17)%29)}} />)}</div></div>
            <div className="rounded-2xl bg-[#f7f7f4] p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-neutral-400">Polished output</p><p className="mt-3 text-sm leading-7 text-neutral-700">“Hey, just sharing a quick update. I’ve reviewed the proposal and everything looks good from my side. Let’s move ahead with the next step.”</p><div className="mt-4 flex items-center justify-between text-xs text-neutral-400"><span>Natural speech → clear writing</span><span>ANY ✳</span></div></div>
          </div>
        </div>
      </section>

      <section id="product" className="border-y border-black/10 bg-white px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-neutral-400">A better way to get words out</p><div className="mt-5 grid gap-10 md:grid-cols-[.8fr_1.2fr]"><h2 className="text-4xl font-semibold tracking-[-.06em] sm:text-5xl">Less typing.<br/>More thinking.</h2><div className="grid gap-8 sm:grid-cols-3">{features.map(f=><article key={f.n} className="border-t border-neutral-200 pt-5"><p className="text-xs text-neutral-400">{f.n}</p><h3 className="mt-8 text-lg font-semibold">{f.title}</h3><p className="mt-3 text-sm leading-6 text-neutral-500">{f.copy}</p></article>)}</div></div></div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-24 lg:px-10"><div className="rounded-[2rem] bg-[#c8f169] p-8 sm:p-14"><p className="text-xs font-bold uppercase tracking-[.2em]">Your next thought is waiting</p><div className="mt-6 flex flex-col justify-between gap-8 md:flex-row md:items-end"><h2 className="max-w-2xl text-4xl font-semibold tracking-[-.06em] sm:text-6xl">Give your ideas<br/>a faster way out.</h2><Link href="/signup" className="w-fit rounded-full bg-black px-7 py-4 text-sm font-semibold text-white">Get started with ANY ↗</Link></div></div></section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-black/10 px-6 py-8 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between lg:px-10"><span className="font-black tracking-[-.06em] text-black">ANY.</span><span>Independent product. Built for your voice.</span><div className="flex gap-5"><Link href="/pricing">Pricing</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></footer>
    </main>
  );
}
