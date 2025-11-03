"use client";

export default function LogoMarquee() {
  const items = Array(30).fill("Contract analyzed with Lexi");

  return (
    <section className="py-12 border-y border-white/5 overflow-hidden">
      <div className="flex gap-12 animate-marquee">
        {items.map((text, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 px-6 py-3 text-white/30 text-base font-medium whitespace-nowrap"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}