import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Work Experience",
  description:
    "Professional work experience of Dr. Benjamin Azariah Mosiwa — including policy advisory, senior management, research, programme leadership, and clinical practice across global and African health institutions.",
};

const roles = [
  {
    id: "astellic",
    period: "Oct 2025 – Present",
    role: "Chief Executive Officer (CEO)",
    org: "Astellic",
    location: "Africa",
    type: "Executive Leadership",
    summary:
      "Provides strategic and technical leadership for a multidisciplinary research, advisory, and implementation firm operating across health systems, governance, education, and social development in Africa.",
    responsibilities: [
      "Provide strategic and technical leadership for a multidisciplinary research, advisory, and implementation firm operating across health systems, governance, education, and social development in Africa",
      "Lead the design and execution of project assessments, including baseline evaluations, applying mixed-methods approaches to generate actionable evidence for governments, donors, and partners",
      "Provide technical oversight on study methodology, including sampling design, tool development, indicator frameworks, and data analysis plans for complex, multi-sectoral assignments",
      "Oversee the development of monitoring, evaluation, and learning (MEAL) frameworks, ensuring alignment with programme objectives and international best practices",
      "Lead multidisciplinary teams in delivering high-quality research outputs, including inception reports, analytical reports, and policy briefs tailored to decision-makers",
      "Spearhead stakeholder engagement and policy translation processes, including validation workshops, dissemination forums, and advisory support to government and partners",
      "Ensure quality assurance and compliance with ethical research standards, including safeguarding, data protection, and institutional review processes",
    ],
  },
  {
    id: "amari",
    period: "Dec 2025 – Present",
    role: "Policy Advisor – African Mental Health Research Initiative (AMARI)",
    org: "Kamuzu University of Health Sciences (KUHeS)",
    location: "Malawi (Multi-Country: Malawi, Ethiopia, South Africa, Zimbabwe)",
    type: "Advisory",
    summary:
      "Providing policy and advocacy guidance for a multi-country mental health research initiative spanning four African countries, supporting the translation of research evidence into strengthened national mental health systems.",
    responsibilities: [
      "Lead policy mapping and analysis of national and regional mental health frameworks across Malawi, Ethiopia, South Africa, and Zimbabwe",
      "Identify policy gaps, implementation bottlenecks, and opportunities for strengthening mental health systems",
      "Develop policy briefs, advocacy strategies, and stakeholder engagement plans",
      "Support integration of AMARI research into national health programmes and policies",
      "Mentor researchers in policy-oriented research design and science communication",
      "Facilitate cross-sector collaboration to strengthen policy uptake and implementation",
    ],
  },
  {
    id: "villagereach",
    period: "Jan 2025 – Sep 2025",
    role: "Senior Manager, Policy & Advocacy",
    org: "VillageReach",
    location: "Global Role (Remote)",
    type: "Senior Management",
    summary:
      "Led policy and advocacy work across primary health care, immunization, digital health, and health financing in a global role at VillageReach — engaging governments, multilateral institutions, and implementing partners to advance responsive health systems.",
    responsibilities: [
      "Led policy and advocacy strategy across PHC, immunization, digital health, and health financing portfolios",
      "Provided strategic policy advice to governments and global stakeholders including Africa CDC, WHO, and Gavi",
      "Supported government transition and national scale-up of telehealth platforms",
      "Developed policy guidance on responsive primary health care systems",
      "Led advocacy and stakeholder engagement contributing to Gavi replenishment efforts",
      "Translated programme and research evidence into policy briefs and strategic communications",
      "Convened high-level policy dialogues with governments, parliamentarians, and development partners",
      "Strengthened alignment between implementation experience and national and global policy agendas",
    ],
  },
  {
    id: "afidep",
    period: "Jan 2023 – Dec 2024",
    role: "Research & Policy Associate",
    org: "African Institute for Development Policy (AFIDEP)",
    location: "Malawi (Multi-Country: Malawi, Kenya, Nigeria, Zambia)",
    type: "Research & Policy",
    summary:
      "Supported implementation of a multi-country health financing research project across four African countries, building government capacity on public financial management and influencing national health financing decisions through evidence-driven advocacy.",
    responsibilities: [
      "Supported implementation of a multi-country health financing project across Malawi, Kenya, Nigeria, and Zambia",
      "Conducted national health budget analysis and identified critical financing gaps across countries",
      "Designed and delivered capacity building for government officials on Public Financial Management",
      "Supported policy window mapping and stakeholder engagement for research uptake",
      "Developed policy briefs, advocacy materials, and strategic recommendations",
      "Engaged parliamentarians and policymakers to influence national health financing decisions",
      "Strengthened National Health Accounts processes and evidence-based financing",
      "Coordinated multi-country policy and research initiatives across the project",
    ],
  },
  {
    id: "fact",
    period: "2017 – 2021",
    role: "Director of Programs and Strategy",
    org: "Facilitators of Community Transformation (FACT)",
    location: "Malawi",
    type: "Programme Leadership",
    summary:
      "Led the design, implementation, and strategic direction of health and development systems and digital health programmes in partnership with the Ministry of Health, managing donor-funded projects across HIV, TB, and SRH and representing the organisation in national policy platforms.",
    responsibilities: [
      "Led design and implementation of health and development systems and digital health programmes in partnership with the Ministry of Health",
      "Managed USAID and Global Fund-funded projects across HIV, TB, and Sexual and Reproductive Health",
      "Developed and implemented policy advocacy strategies aligned with national health priorities",
      "Designed community-based TB and HIV interventions and digital health reporting tools",
      "Represented the organisation in national policy platforms and technical working groups",
      "Secured institutional funding through proposal development and donor engagement",
      "Oversaw programme management, budgeting, and multi-stakeholder coordination",
    ],
  },
  {
    id: "moh",
    period: "2015 – 2017",
    role: "Medical Officer",
    org: "Ministry of Health – Queen Elizabeth Central Hospital",
    location: "Blantyre, Malawi",
    type: "Clinical Practice",
    summary:
      "Provided clinical care across internal medicine, paediatrics, and obstetrics & gynaecology at Malawi's largest referral hospital, contributing to service delivery improvements and Ministry of Health planning processes.",
    responsibilities: [
      "Provided clinical care across internal medicine, paediatrics, and obstetrics & gynaecology",
      "Contributed to service delivery improvements and referral pathway strengthening",
      "Participated in Ministry of Health planning and coordination processes",
      "Supported health system quality improvement initiatives at facility level",
    ],
  },
];

const typeColors: Record<string, string> = {
  "Executive Leadership": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Advisory: "bg-purple-50 text-purple-700 border-purple-200",
  "Senior Management": "bg-navy-50 text-navy-700 border-navy-200",
  "Research & Policy": "bg-blue-50 text-blue-700 border-blue-200",
  "Programme Leadership": "bg-gold-50 text-gold-700 border-gold-200",
  "Clinical Practice": "bg-red-50 text-red-700 border-red-200",
};

export default function WorkExperiencePage() {
  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <section className="bg-navy-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-widest">Work Experience</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">
              Professional Roles & Institutional Experience
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              From clinical medicine to senior policy advisory — a career spanning health and development systems leadership, multi-country research, programme management, and global health and development advocacy.
            </p>
          </div>

          {/* Type legend */}
          <div className="mt-10 flex flex-wrap gap-2">
            {Object.entries(typeColors).map(([type, cls]) => (
              <span key={type} className={`px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLES ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {roles.map((item, index) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Header bar */}
              <div className="bg-navy-900 px-6 sm:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-gold-400 text-xs font-semibold uppercase tracking-widest">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeColors[item.type]}`}>
                        {item.type}
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-white text-xl leading-snug">
                      {item.role}
                    </h2>
                    <div className="mt-1 text-gold-300 font-medium text-sm">{item.org}</div>
                  </div>
                  <div className="sm:text-right sm:flex-shrink-0">
                    <div className="text-white font-semibold text-sm">{item.period}</div>
                    <div className="text-gray-400 text-xs mt-1 sm:max-w-[200px] sm:ml-auto">{item.location}</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-7">
                <p className="text-gray-600 leading-relaxed mb-6">{item.summary}</p>

                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Key Responsibilities
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                  {item.responsibilities.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-navy-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-white">Looking for a Seasoned Policy Expert?</h2>
          <p className="mt-4 text-gray-300">
            Explore consultancy engagements or get in touch to discuss how Dr. Mosiwa can support your programme.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-primary">Start a Conversation</Link>
            <Link href="/experience" className="btn-outline">View Consultancy Experience</Link>
          </div>
        </div>
      </section>
    </>
  );
}
