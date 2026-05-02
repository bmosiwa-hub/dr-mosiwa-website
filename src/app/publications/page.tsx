import type { Metadata } from "next";
import Link from "next/link";
import { publications } from "@/lib/data";

export const metadata: Metadata = {
  title: "Publications & Insights",
  description:
    "Peer-reviewed articles, policy reports, and conference presentations by Dr. Benjamin Azariah Mosiwa on health and development systems strengthening, political economy analysis, health financing, and digital health across Africa.",
};

export default function PublicationsPage() {
  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <section className="bg-navy-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-widest">Publications & Insights</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">
              Thought Leadership & Published Research
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              Peer-reviewed articles, policy reports, and international conference presentations advancing the evidence base for health and development systems, policy, and financing in Africa.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-8">
            {[
              { value: `${publications.peerReviewed.length}`, label: "Peer-Reviewed Articles" },
              { value: `${publications.reports.length}`, label: "Published Reports" },
              { value: `${publications.presentations.length}`, label: "Conference Presentations" },
            ].map((s) => (
              <div key={s.label} className="border-l-2 border-gold-500 pl-4">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PEER-REVIEWED ARTICLES ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white text-sm font-bold">
              📄
            </div>
            <h2 className="section-heading text-2xl">Peer-Reviewed Articles</h2>
          </div>

          <div className="space-y-6">
            {publications.peerReviewed.map((article, i) => (
              <div key={i} className="p-6 rounded-xl border border-gray-100 bg-gray-50 hover:border-navy-200 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-navy-900 flex items-center justify-center text-gold-400 font-bold text-sm">
                    {article.year}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy-900 leading-snug">{article.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{article.authors}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-white bg-navy-700 px-2 py-0.5 rounded">
                        {article.journal}
                      </span>
                      <span className="text-xs text-gray-500">{article.volume}</span>
                    </div>
                    {article.link && (
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-gold-600 hover:text-gold-700 font-semibold transition-colors"
                      >
                        Access Article
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REPORTS ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-white text-sm font-bold">
              📊
            </div>
            <h2 className="section-heading text-2xl">Policy Reports & Publications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publications.reports.map((report, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="tag bg-gold-50 text-gold-700">{report.year}</span>
                  <span className="text-xs text-gray-400">{report.publisher}</span>
                </div>
                <h3 className="font-semibold text-navy-900 leading-snug flex-1">{report.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{report.authors}</p>
                {report.link && (
                  <a
                    href={report.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm text-white bg-navy-900 hover:bg-navy-800 px-4 py-2 rounded-lg transition-colors font-medium w-fit"
                  >
                    Download Report
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRESENTATIONS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-sm">
              🎤
            </div>
            <h2 className="section-heading text-2xl">Conference Presentations</h2>
          </div>

          <div className="space-y-4">
            {publications.presentations.map((pres, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                <div className="flex-shrink-0 text-center w-14">
                  <div className="text-2xl font-bold text-gray-200">{pres.year}</div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`tag text-white text-xs ${
                      pres.type === "Oral Presentation" ? "bg-navy-700" :
                      pres.type === "Panel Discussion" ? "bg-gold-600" :
                      "bg-green-600"
                    }`}>
                      {pres.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-navy-900 text-sm leading-snug">{pres.title}</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    {pres.event} · {pres.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INSIGHTS CTA ─── */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-2xl border border-white/10 bg-white/5">
            <div>
              <h3 className="font-display text-xl font-bold text-white">Looking for More Insights?</h3>
              <p className="text-gray-400 mt-2 text-sm max-w-md">
                Connect on LinkedIn for updates on health and development policy analysis, research findings, and commentary on global health and development systems trends.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <a
                href="https://linkedin.com/in/azariahmosiwa"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary whitespace-nowrap"
              >
                Connect on LinkedIn
              </a>
              <Link href="/contact" className="btn-outline whitespace-nowrap">
                Commission Research
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
