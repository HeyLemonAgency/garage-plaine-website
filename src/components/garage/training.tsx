import { GraduationCap, Mail, SprayCan } from "lucide-react";
import { apprenticeAwards, team } from "@/lib/garage";

/** "Entreprise formatrice": the apprentices' awards, and where that know-how is today. */
export function TrainingStory() {
  const today = team.carrosserie;
  return (
    <section className="training" aria-labelledby="training-title">
      <span className="training-ghost" aria-hidden="true">
        Relève
      </span>
      <div className="container training-grid">
        <div className="training-copy">
          <div className="eyebrow">
            <GraduationCap className="size-4" />
            Entreprise formatrice
          </div>
          <h2 id="training-title">
            Transmettre <br />
            le savoir-faire.
          </h2>
          <div className="red-rule" />
          <p>
            Former la relève fait partie de notre métier. Nos apprentis apprennent aux côtés d’une
            équipe de professionnels motivés et passionnés, dans un cadre de travail performant.
          </p>
          <p>
            Leurs résultats nous rendent fiers. Et ce savoir-faire reste dans la maison, au service
            de votre voiture.
          </p>
        </div>
        <ol className="training-timeline">
          {apprenticeAwards.map((award) => (
            <li className="training-step reveal-on-scroll" key={award.year}>
              <span className="training-badge" aria-hidden="true">
                {award.rank}
              </span>
              <div className="training-card">
                <span className="training-year">{award.year}</span>
                <h3>{award.title}</h3>
                <p>{award.name}, apprenti du garage</p>
              </div>
            </li>
          ))}
          <li className="training-step training-step-today reveal-on-scroll">
            <span className="training-badge" aria-hidden="true">
              <SprayCan />
            </span>
            <div className="training-card">
              <span className="training-year">Aujourd’hui</span>
              <h3>Votre interlocuteur à la carrosserie</h3>
              <p>Formé chez nous, {today.name} vous accueille aujourd’hui à la carrosserie.</p>
              <a href={`mailto:${today.email}`}>
                <Mail /> Écrire à {today.name.split(" ")[0]}
              </a>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
