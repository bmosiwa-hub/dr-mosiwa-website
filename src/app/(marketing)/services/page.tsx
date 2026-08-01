import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Consulting services in Health Systems Strengthening, PHC Reform, Health Financing, Programme Evaluation, Digital Health Policy, Political Economy Analysis, HIV/AIDS, SRH, and MNCH — for governments, donors, and NGOs across Africa.",
};

export default function ServicesPage() {
  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <section className="bg-navy-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-widest">Services</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">
              Integrated Consulting for the Global Health Architecture
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              From PHC reform to digital health governance, each service is built around one objective: generating measurable results that improve health outcomes and strengthen systems.
            </p>
          </div>
        </div>
      </section>

      {/* ─── WHO THIS IS FOR ─── */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Who I work with
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🏛️", title: "Government Ministries", desc: "Health, Finance, and Planning ministries seeking embedded technical advisory" },
              { icon: "💼", title: "Donors & Funders", desc: "World Bank, USAID, FCDO, Gavi, and Global Fund — for programme design and evaluation" },
              { icon: "🌐", title: "NGOs & Implementers", desc: "Implementing partners needing policy, evaluation, or health and development systems expertise" },
              { icon: "🎓", title: "Research Institutions", desc: "Academic and policy research organisations seeking experienced field partners" },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-xl border border-gray-100 hover:border-gold-200 hover:shadow-sm transition-all">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-navy-900 text-sm mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              id={service.id}
              className={`rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow scroll-mt-24`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Service header */}
                <div className={`lg:col-span-2 p-8 ${index % 2 === 0 ? "bg-navy-900" : "bg-navy-800"} text-white`}>
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <span className="text-xs text-gold-400 font-semibold uppercase tracking-widest">
                    Service {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-xl font-bold text-white mt-2 leading-snug">
                    {service.title}
                  </h2>
                  <p className="mt-4 text-gray-300 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Service detail */}
                <div className="lg:col-span-3 p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Problems I Solve</h3>
                      <ul className="space-y-3">
                        {service.problems.map((p) => (
                          <li key={p} className="flex items-start gap-2.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Typical Outputs</h3>
                      <ul className="space-y-3">
                        {service.outputs.map((o) => (
                          <li key={o} className="flex items-start gap-2.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-navy-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── APPROACH ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Approach</span>
            <h2 className="section-heading mt-2">How I Work</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Understand",
                desc: "Deep dive into your context — political environment, system constraints, stakeholder landscape, and programme goals.",
              },
              {
                step: "02",
                title: "Analyse",
                desc: "Rigorous data collection, policy review, and stakeholder engagement to generate credible evidence and diagnosis.",
              },
              {
                step: "03",
                title: "Design",
                desc: "Co-create practical, context-sensitive solutions — from frameworks and strategies to action plans and evaluation tools.",
              },
              {
                step: "04",
                title: "Deliver",
                desc: "High-quality, publication-ready outputs produced to donor and ministry standards, on time and within budget.",
              },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-xl border border-gray-100 bg-gray-50">
                <div className="font-display text-5xl font-bold text-gray-100 absolute top-4 right-4">{item.step}</div>
                <div className="relative">
                  <h3 className="font-display font-bold text-navy-900 text-lg mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-navy-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-white">Need a Technical Expert for Your Programme?</h2>
          <p className="mt-4 text-gray-300">
            Discuss your requirements and find out how we can build a tailored engagement.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-primary">Get in Touch</Link>
            <Link href="/experience" className="btn-outline">See Case Studies</Link>
          </div>
        </div>
      </section>
    </>
  );
}
