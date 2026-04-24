import type { Metadata } from "next";
import Link from "next/link";
import { profile, education, certifications } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Dr. Benjamin Azariah Mosiwa — a Senior Health Systems & Policy Consultant with 10+ years of experience across 9 African countries, combining clinical expertise with global health policy advisory.",
};

export default function AboutPage() {
  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <section className="bg-navy-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-widest">About</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">
              A Career Built on Evidence, Systems, and Impact
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              From clinical practice to global health policy advisory — the story of a specialist who turned deep technical expertise into measurable change for governments and communities across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* ─── PROFILE ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick facts */}
              <div className="bg-navy-900 text-white rounded-2xl p-6">
                <h3 className="font-semibold text-sm uppercase tracking-widest text-gold-400 mb-4">Quick Facts</h3>
                <ul className="space-y-4 text-sm">
                  <li>
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Nationality</span>
                    <span>{profile.nationality}</span>
                  </li>
                  <li>
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Languages</span>
                    <span>{profile.languages.join(" · ")}</span>
                  </li>
                  <li>
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Countries Worked</span>
                    <span>{profile.countries.join(", ")}</span>
                  </li>
                  <li>
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Contact</span>
                    <a href={`mailto:${profile.email}`} className="text-gold-300 hover:text-gold-200 transition-colors">
                      {profile.email}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Education */}
              <div className="card">
                <h3 className="font-semibold text-sm uppercase tracking-widest text-navy-900 mb-4">Education</h3>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.degree}>
                      <div className="font-semibold text-sm text-navy-900">{edu.degree}</div>
                      <div className="text-gray-500 text-sm">{edu.institution}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{edu.location} · {edu.year}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="card">
                <h3 className="font-semibold text-sm uppercase tracking-widest text-navy-900 mb-4">Certifications</h3>
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.title} className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-navy-800">{cert.title}</div>
                        <div className="text-xs text-gray-400">{cert.institution} · {cert.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/contact" className="btn-primary w-full justify-center">
                Work With Dr. Mosiwa
              </Link>
            </div>

            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="section-heading text-2xl">Professional Profile</h2>
                <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Dr. Benjamin Azariah Mosiwa is a Senior Health Systems & Policy Consultant with over a decade of experience supporting governments and donors across Africa to design, evaluate, and implement high-impact health policies and programmes.
                  </p>
                  <p>
                    His journey began as a Medical Officer at the Queen Elizabeth Central Hospital in Malawi, where clinical practice gave him an unfiltered view of what system failures cost real patients. That experience became the foundation for a career dedicated to fixing the systems behind the care — through evidence, policy, and strategic advisory work.
                  </p>
                  <p>
                    After completing an MSc in Global Health Policy at the University of Edinburgh, Dr. Mosiwa moved into full-time policy and systems advisory. Today he works across the global health architecture — advising ministries, supporting multilateral donors, leading programme evaluations, and informing investment decisions — always translating complex technical evidence into decisions that matter.
                  </p>
                </div>
              </div>

              {/* Key strengths */}
              <div>
                <h2 className="section-heading text-2xl">Core Strengths</h2>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Policy Influence",
                      desc: "Proven ability to navigate government systems and translate technical evidence into policy change — from district planning to national strategy.",
                    },
                    {
                      title: "Technical Depth",
                      desc: "Rigorous analytical capability across health systems, financing, evaluation methods, and digital health governance.",
                    },
                    {
                      title: "Government Engagement",
                      desc: "Extensive experience as an embedded technical advisor within ministries of health, working directly with senior officials and planning directorates.",
                    },
                    {
                      title: "Donor Alignment",
                      desc: "Deep familiarity with World Bank, USAID, FCDO, Gavi, and Global Fund programming frameworks, compliance requirements, and reporting.",
                    },
                    {
                      title: "Multi-Country Reach",
                      desc: "Active presence across Malawi, Kenya, Uganda, Nigeria, Mozambique, Zambia, DRC, Ethiopia, and the United Kingdom.",
                    },
                    {
                      title: "Mixed-Methods Research",
                      desc: "Designing and leading evaluations that integrate quantitative surveys, qualitative interviews, policy analysis, and stakeholder mapping.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-gold-500" />
                        <h3 className="font-semibold text-navy-900 text-sm">{item.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector expertise */}
              <div>
                <h2 className="section-heading text-2xl">Thematic Expertise</h2>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Health Systems Strengthening", "Primary Health Care Reform",
                    "Health Policy & Governance", "Health Financing & PFM",
                    "HIV/AIDS", "TB / Infectious Disease",
                    "Sexual & Reproductive Health & Rights", "MNCH",
                    "Adolescent & Youth Health", "Immunization",
                    "Faith-Based SRHR Programming", "Digital Health Regulation",
                    "Programme Evaluation", "Political Economy Analysis",
                    "Decentralised Health Planning", "Community Health Systems",
                    "Public Health Security", "Research Uptake & Policy Translation",
                    "Market Intelligence & Commodity Access",
                  ].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-navy-50 text-navy-700 text-xs font-medium rounded-full border border-navy-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-navy-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-white">Ready to Work Together?</h2>
          <p className="mt-4 text-gray-300">
            Whether you need embedded technical assistance, an evaluation lead, or a strategic policy advisor — let&apos;s have a conversation.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-primary">Start a Conversation</Link>
            <Link href="/services" className="btn-outline">View Services</Link>
          </div>
        </div>
      </section>
    </>
  );
}
