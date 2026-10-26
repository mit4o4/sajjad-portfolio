import { Award, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { FOUNDER_PORTRAIT, FOUNDER_PORTRAIT_SIZE } from "@/data/founder";

interface ExperienceItem {
  when: string;
  title: string;
  org: string;
  text: string;
}

interface Credential {
  title: string;
  issuer: string;
  date: string;
  kind: "degree" | "cert";
}

/**
 * The one dark chapter of the page. Its background matches the portrait's studio backdrop,
 * so the photo dissolves into the section instead of sitting in a box.
 * The credentials rail leads with the degree and architecture-relevant certificates;
 * unrelated ones are tucked into a disclosure so they don't dilute the pitch.
 */
export default function AboutSection() {
  const { t, tList } = useLanguage();
  const experience = tList<ExperienceItem>("site.about.experience");
  const skills = tList<string>("site.about.skills");
  const credentials = tList<Credential>("site.credentials.items");
  const otherCredentials = tList<string>("site.credentials.more");

  return (
    <section id="about" className="tb-about-dark" aria-labelledby="about-title">
      <div className="tb-wrap tb-about">
        <figure className="tb-founder tb-rv">
          <img
            src={FOUNDER_PORTRAIT}
            alt={t("site.about.portraitAlt")}
            width={FOUNDER_PORTRAIT_SIZE.width}
            height={FOUNDER_PORTRAIT_SIZE.height}
            loading="lazy"
            decoding="async"
          />
        </figure>

        <div className="tb-about-intro tb-rv">
          <span className="tb-eyebrow">{t("site.about.eyebrow")}</span>
          <h2 id="about-title">{t("site.about.name")}</h2>
          <p className="tb-role-line">{t("site.about.role")}</p>
          <p className="tb-bio">{t("site.about.bio")}</p>
          <div className="tb-skills">
            {skills.map(skill => (
              <span key={skill} className="tb-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="tb-about-exp">
          <h3>{t("site.about.experienceTitle")}</h3>
          <ol className="tb-exp">
            {experience.map(item => (
              <li key={item.title + item.org} className="tb-exp-item tb-rv">
                <span className="tb-when">{item.when}</span>
                <div>
                  <b>{item.title}</b>
                  <div className="tb-org">{item.org}</div>
                </div>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <aside className="tb-rail" aria-label={t("site.credentials.title")}>
          <h3>
            <Award aria-hidden="true" />
            {t("site.credentials.title")}
          </h3>
          {credentials.map(c => (
            <div key={c.title} className={`tb-cred${c.kind === "degree" ? " is-degree" : ""}`}>
              <span className="tb-ico" aria-hidden="true">
                {c.kind === "degree" ? <GraduationCap /> : <Award />}
              </span>
              <b>{c.title}</b>
              <span>{c.issuer}</span>
              <span>{c.date}</span>
            </div>
          ))}
          {otherCredentials.length > 0 && (
            <details>
              <summary>{t("site.credentials.moreTitle")}</summary>
              <ul>
                {otherCredentials.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          )}
        </aside>
      </div>
    </section>
  );
}
