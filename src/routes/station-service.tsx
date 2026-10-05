import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Fuel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageIntro, CheckList } from '@/components/garage/sections';
import { Location } from '@/components/garage/contact';
import { pageHead } from '@/lib/garage';
import fuel from '@/assets/fuel.asset.json';
export const Route=createFileRoute('/station-service')({head:()=>pageHead('Station-service Jubin, 24h/24','Faites le plein à la station-service Jubin du Garage de la Plaine à Denges, accessible 24h/24 et 7j/7. Renseignez-vous sur la Jubin Card.'),component:Station});
function Station(){return <><PageIntro label="Station-service" title="Le plein. À votre rythme." description="Notre station-service Jubin à Denges est accessible 24h/24 et 7j/7."/><section className="section"><div className="container editorial-grid"><div className="editorial-copy"><div className="eyebrow"><Fuel className="size-4"/>Station-service Jubin</div><h2>À toute heure,<br/>tout près de chez vous.</h2><p>Retrouvez notre station-service à la Route de la Plaine 20 à Denges. Vous pouvez faire le plein 24h/24, 7 jours sur 7.</p><CheckList items={['Essence Jubin','Accès 24h/24 et 7j/7','Jubin Card disponible sur commande']}/><p>Contactez le garage pour commander votre Jubin Card et connaître ses avantages.</p><Button variant="premium" asChild><Link to="/contact">Nous contacter <ArrowRight/></Link></Button></div><img className="editorial-image" src={fuel.url} alt="Station-service Jubin au Garage de la Plaine" width={700} height={500}/></div></section><Location/></>}
