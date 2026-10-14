import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/garage/sections";
import { ContactSection, Location } from "@/components/garage/contact";
import { pageHead } from "@/lib/garage";
export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead(
      "Contact et horaires",
      "Contactez le Garage de la Plaine au 021 801 68 42. Route de la Plaine 20, 1026 Denges. Consultez les horaires et préparez votre demande de rendez-vous.",
    ),
  component: Contact,
});
function Contact() {
  return (
    <>
      <PageIntro
        label="Contact"
        title="Nous sommes à votre écoute."
        description="Pour votre véhicule, un rendez-vous ou un conseil : contactez notre équipe, ou venez nous rencontrer à Denges."
      />
      <ContactSection />
      <Location />
      <section className="section">
        <div className="container staff-grid">
          <div className="staff-item">
            <h3>Vente</h3>
            <p>Tiago Bessa</p>
            <a href="tel:+41791089299">079 108 92 99</a>
            <br />
            <a href="mailto:vente@garageplaine.ch">vente@garageplaine.ch</a>
          </div>
          <div className="staff-item">
            <h3>Atelier mécanique</h3>
            <p>Jérôme Baatard</p>
            <a href="mailto:jerome.baatard@garageplaine.ch">jerome.baatard@garageplaine.ch</a>
          </div>
          <div className="staff-item">
            <h3>Carrosserie</h3>
            <p>Marco Da Silva</p>
            <a href="mailto:marco.dasilva@garageplaine.ch">marco.dasilva@garageplaine.ch</a>
          </div>
        </div>
      </section>
    </>
  );
}
