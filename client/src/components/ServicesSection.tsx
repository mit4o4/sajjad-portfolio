import { useLanguage } from "@/contexts/LanguageContext";
import { showcase } from "@/data/taxonomy";

interface ServiceItem {
  title: string;
  text: string;
  points: string[];
}

const SERVICE_IMAGES = [
  showcase("villa-kinda.webp"),
  showcase("s2.webp"),
  showcase("house-201.webp"),
];

export default function ServicesSection() {
  const { t, tList } = useLanguage();
  const services = tList<ServiceItem>("site.services.items");
  const steps = tList<{ title: string; text: string }>("site.process.steps");

  return (
    <section id="services" className="tb-wrap tb-sec tb-sec-tight">
      <div className="tb-head">
        <span className="tb-eyebrow">{t("site.services.eyebrow")}</span>
        <h2>{t("site.services.title")}</h2>
      </div>
      <div className="tb-services">
        {Array.isArray(services) &&
          services.map((service, i) => (
            <article key={service.title} className="tb-svc tb-rv">
              <div className="tb-frame tb-rv-img">
                <img
                  src={SERVICE_IMAGES[i]}
                  alt=""
                  loading="lazy"
                  width={1600}
                  height={1200}
                />
              </div>
              <div className="tb-body">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <ul className="tb-list">
                  {service.points.map(point => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
      </div>

      <div className="tb-head" style={{ marginTop: "var(--tb-sec)" }}>
        <span className="tb-eyebrow">{t("site.process.eyebrow")}</span>
        <h2>{t("site.process.title")}</h2>
      </div>
      <ol className="tb-process">
        {Array.isArray(steps) &&
          steps.map(step => (
            <li key={step.title} className="tb-pstep">
              <b>{step.title}</b>
              <p>{step.text}</p>
            </li>
          ))}
      </ol>
    </section>
  );
}
