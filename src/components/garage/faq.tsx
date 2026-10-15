import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/garage";

/**
 * Questions and answers in plain text, open to read and to quote: the same set is published
 * as structured data in the page's head (see pageHead's `faqs`).
 */
export function FaqSection({
  items,
  title,
  intro,
}: {
  items: readonly Faq[];
  title: string;
  intro?: string;
}) {
  return (
    <section className="section faq-section" aria-labelledby="faq-title">
      <div className="container faq-layout">
        <div className="faq-head">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Questions fréquentes
          </div>
          <h2 id="faq-title">{title}</h2>
          {intro && <p>{intro}</p>}
        </div>
        <div className="faq-list">
          {items.map((f, i) => (
            <details key={f.q} className="faq-item" {...(i === 0 ? { open: true } : {})}>
              <summary>
                <h3>{f.q}</h3>
                <ChevronDown aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
