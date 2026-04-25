"use client";
import { useState, useEffect, useCallback } from "react";
import { testimonials } from "@/lib/data";

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <>
      {/* Mobile: auto-sliding carousel */}
      <div className="md:hidden">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-600 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="w-full flex-shrink-0 bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="text-gold-400 text-3xl leading-none mb-4">&ldquo;</div>
                <p className="text-gray-300 text-sm leading-relaxed italic">{t.quote}</p>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="font-semibold text-white text-sm">{t.author}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{t.title}</div>
                  <div className="text-gold-400 text-xs font-medium mt-0.5">{t.org}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-gold-400 w-5" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.author}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.08] transition-colors"
          >
            <div className="text-gold-400 text-3xl leading-none mb-4">&ldquo;</div>
            <p className="text-gray-300 text-sm leading-relaxed italic">{t.quote}</p>
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="font-semibold text-white text-sm">{t.author}</div>
              <div className="text-gray-400 text-xs mt-0.5">{t.title}</div>
              <div className="text-gold-400 text-xs font-medium mt-0.5">{t.org}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
