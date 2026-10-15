import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/garage/sections";
import { garage } from "@/lib/garage";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/confidentialite")({
  head: () =>
    pageHead({
      path: "/confidentialite",
      title: "Confidentialité des demandes",
      crumb: "Confidentialité",
      description:
        "Comment le site du Garage de la Plaine traite vos demandes de contact et les contenus externes (cartes, annonces Autolina).",
    }),
  component: Confidentialite,
});
function Confidentialite() {
  return (
    <>
      <PageIntro
        label="Confidentialité"
        title="Vos demandes de contact."
        description="Les informations utiles concernant les formulaires et les contenus externes de ce site."
      />
      <section className="section">
        <div className="container detail-layout">
          <div>
            <h2>Formulaires de contact</h2>
            <p>
              Les formulaires préparent un e-mail dans votre application de messagerie. Aucune
              demande n’est enregistrée par ce site. L’envoi intervient uniquement lorsque vous
              envoyez l’e-mail depuis votre messagerie.
            </p>
            <p>
              Vos coordonnées et votre message sont destinés au service du garage que vous
              contactez, pour lui permettre de répondre à votre demande.
            </p>
            <h2>Contenus externes</h2>
            <p>
              La page des véhicules intègre le stock Autolina. En consultant ce contenu, votre
              navigateur communique avec Autolina. Les liens vers Suzuki et Google Maps ouvrent
              leurs sites respectifs, avec leurs propres règles de confidentialité. La carte Google
              Maps de la page Contact ne se charge que lorsque vous cliquez sur « Afficher la carte
              ». La page d’accueil affiche nos dernières annonces Autolina : elles sont lues par
              notre serveur, et seules les photos des véhicules sont chargées depuis Autolina par
              votre navigateur.
            </p>
          </div>
          <div>
            <h2>Nous contacter</h2>
            <p>
              Garage de la Plaine <br />
              {garage.address} <br />
              {garage.locality}
            </p>
            <a className="section-link" href={"mailto:" + garage.email}>
              {garage.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
