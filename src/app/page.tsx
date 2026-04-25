import Link from "next/link";
import Image from "next/image";
import { profile, services, projects, clients } from "@/lib/data";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

const featuredProjects = projects.slice(0, 3);
const featuredClients = clients.slice(0, 10);

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center bg-navy-900 overflow-hidden">

        {/* ── Portrait photo — right half, fades seamlessly into navy ── */}
        {/* Photo has dark background so blending is very natural */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[58%] lg:w-[52%] pointer-events-none select-none">
          <Image
            src="/images/hero-photo.jpg"
            alt="Dr. Benjamin Azariah Mosiwa"
            fill
            priority
            className="object-cover object-[center_15%]"
            sizes="(max-width: 768px) 100vw, 52vw"
          />
          {/* Left edge hard stop — keeps text area solid navy */}
          <div className="absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-navy-900 to-transparent" />
          {/* Left soft blend — feathers into the photo */}
          <div className="absolute inset-y-0 left-0 w-[52%] bg-gradient-to-r from-navy-900/60 to-transparent" />
          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-navy-900 to-transparent" />
          {/* Top vignette — blends with header */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy-900/50 to-transparent" />
        </div>

        {/* Mobile-only scrim — darkens photo so white text is legible over white shirt */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/65 to-navy-900/20 md:hidden pointer-events-none" />

        {/* Subtle dot grid — left content area only */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "48px 48px"
          }} />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
          <div className="max-w-xl lg:max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Dr. Benjamin<br />
              <span className="text-gold-400">Azariah Mosiwa</span>
            </h1>

            {/* Specialist badge — sits under the name */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 mt-5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-gold-300 text-sm font-medium tracking-wide">
                Health Systems & Policy Specialist
              </span>
            </div>

            <p className="mt-6 text-lg md:text-xl text-gray-300 leading-relaxed">
              Translating evidence into policy. Strengthening health systems. Delivering measurable impact across 9 African countries — for governments, donors, and global health organisations.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary text-base">
                Work With Me
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link href="/experience" className="btn-outline text-base">
                View Experience
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {profile.stats.map((stat) => (
                <div key={stat.label} className="border-l-2 border-gold-500 pl-4">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ─── TRUSTED BY ─── */}
      <section className="bg-gray-50 border-y border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Trusted by leading governments, donors & global health organisations
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            {featuredClients.map((c) => (
              <span key={c.name} className="text-gray-500 font-semibold text-sm hover:text-navy-700 transition-colors">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT SNAPSHOT ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">About</span>
              <h2 className="section-heading mt-2">
                Senior Advisor at the Intersection of Health Systems, Policy & Evidence
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed">
                With a foundation in clinical medicine and a career spanning health systems strengthening, policy research, and global health advisory, Dr. Mosiwa brings a rare combination of technical depth and strategic influence to every engagement.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                He has embedded within ministries, supported donor-funded reform programmes, and published peer-reviewed research — always with one goal: converting evidence and analysis into decisions that improve health outcomes.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: "🌍", label: "9 Countries", sub: "Across Africa & UK" },
                  { icon: "🎓", label: "MSc Edinburgh", sub: "Global Health Policy" },
                  { icon: "📊", label: "Mixed Methods", sub: "Evaluations & Research" },
                  { icon: "🏛️", label: "Government TA", sub: "Ministry-level engagement" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-navy-900 text-sm">{item.label}</div>
                      <div className="text-gray-500 text-xs">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/about" className="btn-navy inline-flex">
                  Full Profile
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            </div>

            {/* Credential cards */}
            <div className="space-y-4">
              {[
                {
                  icon: "🏥",
                  title: "Health Systems & PHC Reform",
                  desc: "Embedded ministry-level technical assistance across sub-Saharan Africa, designing costed national health plans and PHC integration frameworks.",
                },
                {
                  icon: "📋",
                  title: "Policy & Evidence Translation",
                  desc: "Converting rigorous research into actionable policy briefs, investment cases, and advocacy strategies that move governments and donors to act.",
                },
                {
                  icon: "🔬",
                  title: "Programme Evaluation",
                  desc: "Leading baseline-to-endline mixed-methods evaluations for USAID, Global Fund, and FCDO-funded programmes across multiple countries.",
                },
                {
                  icon: "💻",
                  title: "Digital Health Governance",
                  desc: "Supporting governments in building telehealth regulatory frameworks and digital health investment readiness across the African continent.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-gold-200 hover:shadow-sm transition-all bg-white">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-navy-900 text-sm">{item.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Services</span>
            <h2 className="section-heading mt-2">Consulting Services & Areas of Expertise</h2>
            <p className="section-subheading">
              From policy design to programme evaluation, offering integrated technical advisory across the global health value chain.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link key={service.id} href={`/services#${service.id}`} className="group card hover:border-gold-200">
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="font-display font-semibold text-lg text-navy-900 group-hover:text-gold-600 transition-colors leading-snug">
                  {service.title}
                </h3>
                <p className="mt-3 text-gray-500 text-sm leading-relaxed">{service.shortDesc}</p>
                <div className="mt-4 flex items-center gap-1 text-gold-600 text-sm font-medium">
                  Learn more
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/services" className="btn-navy">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SELECTED WORK ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Portfolio</span>
              <h2 className="section-heading mt-2">Selected Projects & Impact</h2>
            </div>
            <Link href="/experience" className="text-gold-600 font-semibold text-sm hover:text-gold-700 transition-colors flex items-center gap-1 whitespace-nowrap">
              View all projects
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div key={project.id} className="card group flex flex-col">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag bg-navy-50 text-navy-700">{tag}</span>
                  ))}
                </div>
                <h3 className="font-display font-semibold text-navy-900 text-lg leading-snug group-hover:text-gold-600 transition-colors">
                  {project.title}
                </h3>
                <p className="mt-1 text-xs text-gray-400 font-medium">{project.client} · {project.period}</p>
                <p className="mt-3 text-gray-500 text-sm leading-relaxed flex-1">{project.summary}</p>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Result</p>
                  <p className="text-sm text-navy-800">{project.results[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-widest">Testimonials</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
              What Clients & Partners Say
            </h2>
          </div>

          <TestimonialsCarousel />
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-gradient-to-br from-gold-500 to-gold-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            Ready to Strengthen Your Health Systems Programme?
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Whether you need a technical expert, an evaluation lead, or a policy advisor — let&apos;s discuss how we can work together.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-gold-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-lg text-base"
            >
              Start a Conversation
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-base"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
