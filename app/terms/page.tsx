import Link from "next/link";

export default function TermsPage() {
  return <main className="mx-auto min-h-screen max-w-3xl px-6 py-16"><Link href="/" className="text-xl font-black">ANY.</Link><h1 className="mt-14 text-4xl font-semibold tracking-tight">Terms of service</h1><p className="mt-6 text-sm leading-7 text-neutral-600">This is a pre-launch placeholder, not a binding set of terms. Before launch, the service needs reviewed terms covering eligibility, acceptable use, subscriptions, renewals, cancellation, refunds, taxes, intellectual property, service availability, liability and governing law.</p><p className="mt-4 text-sm leading-7 text-neutral-600">No paid service is offered through this preview.</p></main>;
}
