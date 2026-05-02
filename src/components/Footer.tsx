import Link from "next/link";
import { profile } from "@/lib/data";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Consultancy Experience", href: "/experience" },
  { label: "Work Experience", href: "/work-experience" },
  { label: "Publications", href: "/publications" },
  { label: "Clients", href: "/clients" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex flex-col leading-none">
              <span className="text-white font-display font-bold text-xl tracking-tight">
                Dr. B. A. Mosiwa
              </span>
              <span className="text-gold-400 text-xs font-medium tracking-widest uppercase mt-1">
                International Health & Development Expert
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
              Senior Health Systems & Policy Consultant delivering evidence-based solutions for governments, donors, and NGOs across Africa.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-gold-500 transition-colors text-sm"
                aria-label="LinkedIn"
              >
                in
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-gold-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Get In Touch</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">LinkedIn</span>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold-400 transition-colors">
                  linkedin.com/in/azariahmosiwa
                </a>
              </li>
              <li>
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Enquiries</span>
                <Link href="/contact" className="text-gray-300 hover:text-gold-400 transition-colors">
                  Use the contact form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Dr. Benjamin Azariah Mosiwa. All rights reserved.</p>
          <p className="text-xs">International Health & Development Expert · Malawi · Africa</p>
        </div>
      </div>
    </footer>
  );
}
