import type { Metadata } from "next";
import { profile } from "@/lib/data";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Dr. Benjamin Azariah Mosiwa to discuss consulting engagements in health systems strengthening, programme evaluation, health financing, and policy advisory across Africa.",
};

export default function ContactPage() {
  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <section className="bg-navy-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-widest">Contact</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">
              Let&apos;s Work Together
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              Whether you&apos;re planning a new evaluation, seeking technical assistance for your ministry, or looking for a policy advisor — reach out to start a conversation.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Sidebar info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Direct contact */}
              <div className="bg-navy-900 rounded-2xl p-8 text-white">
                <h2 className="font-display font-bold text-xl mb-6">Connect</h2>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-400 flex-shrink-0 group-hover:bg-gold-500/30 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">LinkedIn</div>
                    <div className="text-white group-hover:text-gold-300 transition-colors text-sm">linkedin.com/in/azariahmosiwa</div>
                  </div>
                </a>
              </div>

              {/* What to expect */}
              <div className="card">
                <h3 className="font-semibold text-navy-900 text-sm uppercase tracking-widest mb-4">What Happens Next</h3>
                <div className="space-y-4">
                  {[
                    { step: "1", text: "Submit your enquiry with as much context as possible." },
                    { step: "2", text: "Receive a response within 2 business days to discuss your needs." },
                    { step: "3", text: "We scope the engagement together and agree on terms and timeline." },
                    { step: "4", text: "Work begins — with regular updates and clear deliverables." },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {item.step}
                      </div>
                      <span className="text-gray-600">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas of enquiry */}
              <div className="card">
                <h3 className="font-semibold text-navy-900 text-sm uppercase tracking-widest mb-4">Common Enquiries</h3>
                <ul className="space-y-2">
                  {[
                    "Programme evaluations (baseline, midline, endline)",
                    "Health systems technical assistance",
                    "Health financing analysis",
                    "Policy reviews and political economy analysis",
                    "Digital health governance advisory",
                    "Rapid evidence synthesis and policy briefs",
                    "Conference presentations and keynote talks",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1 h-1 rounded-full bg-gold-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2 className="font-display font-bold text-2xl text-navy-900 mb-2">Send an Enquiry</h2>
                <p className="text-gray-500 text-sm mb-8">
                  Fill in the form below and Dr. Mosiwa will respond within 2 business days.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
