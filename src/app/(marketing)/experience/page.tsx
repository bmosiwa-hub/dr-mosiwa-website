import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Consultancy Experience",
  description:
    "Consultancy engagements across health and development systems strengthening, programme evaluation, health financing, and digital health — for World Bank, USAID, FCDO, Palladium, Frontline AIDS, and governments across Africa.",
};

const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)));

export default function ExperiencePage() {
  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <section className="bg-navy-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-widest">Consultancy Experience</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">
              15+ Engagements. Real Results.
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              A track record built across governments, multilateral donors, and implementing partners — from ministry-level planning to multi-country evaluations and continental regulatory work.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROJECTS ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4">
                {/* Sidebar */}
                <div className="lg:col-span-1 bg-navy-900 p-8 text-white flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-gold-400 font-semibold uppercase tracking-widest mb-2">
                      Project {String(index + 1).padStart(2, "0")}
                    </div>
                    <h2 className="font-display font-bold text-white text-lg leading-snug">
                      {project.title}
                    </h2>
                  </div>
                  <div className="mt-6 space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Role</span>
                      <span className="text-gray-200">{project.role}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Client</span>
                      <span className="text-gray-200">{project.client}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Period</span>
                      <span className="text-gray-200">{project.period}</span>
                    </div>
                    {project.partners.length > 1 && (
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Partners</span>
                        <span className="text-gray-200 text-xs">{project.partners.join(" · ")}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 p-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-600 leading-relaxed">{project.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">The Challenge</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{project.problem}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Our Approach</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{project.approach}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Results & Impact</h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {project.results.map((result) => (
                          <li key={result} className="flex items-start gap-2.5 text-sm text-navy-800">
                            <svg className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {result}
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

      {/* ─── CTA ─── */}
      <section className="py-20 bg-navy-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-white">Commission a Technical Expert</h2>
          <p className="mt-4 text-gray-300">
            Explore partnership opportunities for your next evaluation, policy review, or programme design.
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
