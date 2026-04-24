import type { Metadata } from "next";
import Link from "next/link";
import { clients } from "@/lib/data";

export const metadata: Metadata = {
  title: "Clients & Partners",
  description:
    "Trusted by USAID, World Bank, FCDO, WHO, UNICEF, Gavi, Global Fund, Africa CDC, Palladium, DAI, and leading NGOs and research institutions across Africa and globally.",
};

const categories = Array.from(new Set(clients.map((c) => c.category)));

const categoryColors: Record<string, string> = {
  "Donor": "bg-blue-50 text-blue-700 border-blue-200",
  "Multilateral": "bg-purple-50 text-purple-700 border-purple-200",
  "UN Agency": "bg-sky-50 text-sky-700 border-sky-200",
  "Regional Body": "bg-orange-50 text-orange-700 border-orange-200",
  "Foundation": "bg-green-50 text-green-700 border-green-200",
  "Implementing Partner": "bg-gold-50 text-gold-700 border-gold-200",
  "NGO": "bg-teal-50 text-teal-700 border-teal-200",
  "Research Institute": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Advocacy": "bg-rose-50 text-rose-700 border-rose-200",
  "Civil Society": "bg-gray-50 text-gray-700 border-gray-200",
  "Legal / Advocacy": "bg-red-50 text-red-700 border-red-200",
};

export default function ClientsPage() {
  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <section className="bg-navy-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-widest">Clients & Partners</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">
              Trusted by the Institutions Shaping Global Health
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              From bilateral donors to UN agencies, implementing partners to civil society — a track record of delivery across the global health landscape.
            </p>
          </div>
        </div>
      </section>

      {/* ─── ALL CLIENTS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Partners</span>
            <h2 className="section-heading mt-2">Sampled Clients & Institutional Partners</h2>
            <p className="section-subheading mx-auto text-center">
              Organisations Dr. Mosiwa has worked with, advised, or delivered technical outputs for.
            </p>
          </div>

          <div className="space-y-12">
            {categories.map((category) => {
              const categoryClients = clients.filter((c) => c.category === category);
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[category] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {category}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {categoryClients.map((client) => (
                      <div
                        key={client.name}
                        className="flex items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-navy-200 hover:bg-white hover:shadow-sm transition-all text-center"
                      >
                        <span className="font-semibold text-navy-800 text-sm">{client.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ENGAGEMENT TYPES ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Engagement Models</span>
            <h2 className="section-heading mt-2">How We Can Work Together</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🏛️",
                title: "Government Technical Assistance",
                desc: "Embedded advisory within ministries of health, finance, and planning. Supporting strategic planning, policy reform, and institutional capacity — from district level to national.",
                examples: ["District Implementation Planning", "National Strategy Development", "Policy Review & Reform", "Stakeholder Facilitation"],
              },
              {
                icon: "📊",
                title: "Donor-Commissioned Evaluations",
                desc: "Independent mixed-methods evaluations for USAID, FCDO, Global Fund, and Gavi-funded programmes — from baseline design to endline reporting and learning products.",
                examples: ["Baseline & Endline Assessments", "Mid-Course Reviews", "Process Evaluations", "Market Intelligence Assessments"],
              },
              {
                icon: "🌐",
                title: "Policy Research & Advisory",
                desc: "Rapid evidence synthesis, political economy analysis, and policy briefs for governments, research institutions, and advocacy organisations seeking to influence health financing and systems reform.",
                examples: ["Political Economy Analysis", "Policy Landscape Mapping", "Evidence Synthesis", "Advocacy Strategy Development"],
              },
            ].map((item) => (
              <div key={item.title} className="card flex flex-col">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-display font-bold text-navy-900 text-lg">{item.title}</h3>
                <p className="mt-3 text-gray-500 text-sm leading-relaxed flex-1">{item.desc}</p>
                <ul className="mt-5 space-y-1.5">
                  {item.examples.map((ex) => (
                    <li key={ex} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1 h-1 rounded-full bg-gold-500 flex-shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS STRIP ─── */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl md:text-2xl text-white font-display italic leading-relaxed">
            &ldquo;Benjamin brings a rare combination of clinical grounding, policy acumen, and implementation know-how. His ability to navigate government systems and produce high-quality technical outputs under pressure is exceptional.&rdquo;
          </blockquote>
          <div className="mt-6">
            <div className="font-semibold text-gold-400">Amy Kesterton</div>
            <div className="text-gray-400 text-sm">Team and Technical Lead, Technical Support Programme for Health · DAI</div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-heading">Become a Partner</h2>
          <p className="section-subheading mx-auto text-center">
            Whether you&apos;re a donor, government ministry, or implementing partner — let&apos;s explore how to work together.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-primary">Start a Conversation</Link>
            <Link href="/experience" className="btn-navy">View Portfolio</Link>
          </div>
        </div>
      </section>
    </>
  );
}
