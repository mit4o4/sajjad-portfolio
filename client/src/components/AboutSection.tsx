import { Award, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import sajjadProfile from "../../public/images/sajjad.png";

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
 * About + credentials. The rail leads with the degree and the architecture-relevant
 * certificates; unrelated ones are tucked into a disclosure so they don't dilute the pitch.
 */
export default function AboutSection() {
  const { t } = useLanguage();
  const experience: ExperienceItem[] = t("site.about.experience");
  const skills: string[] = t("site.about.skills");
  const credentials: Credential[] = t("site.credentials.items");
  const otherCredentials: string[] = t("site.credentials.more");

  return (
    <section id="about" className="tb-wrap tb-sec tb-sec-tight">
      <div className="tb-about">
        <div className="tb-about-main">
          <span className="tb-eyebrow">{t("site.about.eyebrow")}</span>
          <div className="tb-about-intro tb-rv">
            <div className="tb-portrait">
              <img
                src={sajjadProfile}
                alt={t("site.about.portraitAlt")}
                loading="lazy"
              />
            </div>
            <div>
              <h2>{t("site.about.name")}</h2>
              <p className="tb-role-line">{t("site.about.role")}</p>
              <p>{t("site.about.bio")}</p>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: 8 }}>
              {t("site.about.experienceTitle")}
            </h3>
            <div className="tb-exp">
              {Array.isArray(experience) &&
                experience.map(item => (
                  <div key={item.title} className="tb-exp-item tb-rv">
                    <span className="tb-when">{item.when}</span>
                    <div>
                      <b>{item.title}</b>
                      <div className="tb-org">{item.org}</div>
                    </div>
                    <p>{item.text}</p>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: 12 }}>{t("site.about.skillsTitle")}</h3>
            <div className="tb-skills">
              {Array.isArray(skills) &&
                skills.map(skill => (
                  <span key={skill} className="tb-tag">
                    {skill}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <aside className="tb-rail" aria-label={t("site.credentials.title")}>
          <h3>
            <Award aria-hidden="true" />
            {t("site.credentials.title")}
          </h3>
          {Array.isArray(credentials) &&
            credentials.map(c => (
              <div
                key={c.title}
                className={`tb-cred${c.kind === "degree" ? " is-degree" : ""}`}
              >
                <span className="tb-ico" aria-hidden="true">
                  {c.kind === "degree" ? <GraduationCap /> : <Award />}
                </span>
                <b>{c.title}</b>
                <span>{c.issuer}</span>
                <span>{c.date}</span>
              </div>
            ))}
          {Array.isArray(otherCredentials) && otherCredentials.length > 0 && (
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
