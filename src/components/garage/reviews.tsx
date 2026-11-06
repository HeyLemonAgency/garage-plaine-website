import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { googleProfile, googleReviews } from "@/lib/garage";
import { fallbackRating, type GoogleRating } from "@/lib/google-rating.functions";

// Formatted by hand: server and browser locales may disagree, which breaks hydration.
const decimal = (n: number) => n.toFixed(1).replace(".", ",");
const avatarColors = ["#1f6feb", "#c2410c", "#0f766e", "#7c3aed", "#b45309"];

export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

/** Five stars filled to the rating (4,5 -> four and a half). */
export function Stars({ value = 5, label }: { value?: number; label?: string }) {
  return (
    <span
      className="stars"
      role="img"
      aria-label={label ?? `${decimal(value)} sur 5`}
      style={{ "--fill": `${(value / 5) * 100}%` } as CSSProperties}
    >
      <span className="stars-track" aria-hidden="true">
        ★★★★★
      </span>
      <span className="stars-fill" aria-hidden="true">
        ★★★★★
      </span>
    </span>
  );
}

function ReviewCard({ review, index }: { review: (typeof googleReviews)[number]; index: number }) {
  const [open, setOpen] = useState(false);
  const [clipped, setClipped] = useState(false);
  const text = useRef<HTMLParagraphElement>(null);
  // Offer "read all" only where the text is actually cut (it depends on the card's width).
  useEffect(() => {
    const el = text.current;
    if (!el || !("ResizeObserver" in window)) return;
    const check = () => setClipped(el.scrollHeight > el.clientHeight + 1);
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <article
      className={`review-card reveal-on-scroll ${open ? "is-open" : ""}`}
      style={{ "--i": index } as CSSProperties}
    >
      <header>
        <span className="review-avatar" style={{ background: avatarColors[index % 5] }}>
          {review.name.charAt(0)}
        </span>
        <div>
          <strong>{review.name}</strong>
          <span>{review.topic}</span>
        </div>
        <GoogleMark className="review-google" />
      </header>
      <Stars label="5 étoiles sur 5" />
      <p className="review-text" ref={text}>
        {review.text}
      </p>
      {(clipped || open) && (
        <button
          type="button"
          className="review-more"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Réduire" : "Lire tout l’avis"}
        </button>
      )}
    </article>
  );
}

/** The garage's Google rating (live when the key is set) and the reviews chosen with it. */
export function GoogleReviews({ rating = fallbackRating }: { rating?: GoogleRating }) {
  return (
    <section className="section reviews-section" aria-labelledby="reviews-title">
      <div className="container reviews-grid">
        <div className="reviews-head">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Avis Google
          </div>
          <h2 id="reviews-title">
            Ce que nos clients <em>disent de nous.</em>
          </h2>
          <a className="reviews-score" href={googleProfile.url} target="_blank" rel="noreferrer">
            <strong>{decimal(rating.rating)}</strong>
            <span className="sr-only"> sur 5,</span>
            <span>
              {/* the score is said in words just before: the stars stay decorative here */}
              <span aria-hidden="true">
                <Stars value={rating.rating} />
              </span>
              <span className="reviews-count">
                note moyenne sur <b>{rating.count} avis Google</b>
                <span className="sr-only"> (nouvel onglet)</span>
              </span>
            </span>
          </a>
          <a className="reviews-all" href={googleProfile.url} target="_blank" rel="noreferrer">
            Voir tous les avis sur Google <ArrowUpRight />
          </a>
        </div>
        <div className="reviews-cards">
          {googleReviews.map((r, i) => (
            <ReviewCard review={r} index={i} key={r.name} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** One review in a page's margin, e.g. the trade-in review on /reprise. */
export function ReviewQuote({ name }: { name: (typeof googleReviews)[number]["name"] }) {
  const review = googleReviews.find((r) => r.name === name);
  if (!review) return null;
  return (
    <a className="review-quote" href={googleProfile.url} target="_blank" rel="noreferrer">
      <span className="review-quote-top">
        <Stars label="5 étoiles sur 5" />
        <GoogleMark className="review-google" />
      </span>
      <q>{review.text}</q>
      <span className="review-quote-name">
        {review.name} · avis Google <ArrowUpRight />
      </span>
    </a>
  );
}
