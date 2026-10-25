import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SECTORS } from "@/data/taxonomy";
import { whatsappUrl } from "@/data/contact";
import type { Project } from "@/data/types";
import { WhatsAppIcon } from "./icons";

interface ProjectDialogProps {
  project: Project | null;
  initialImage?: number;
  onClose: () => void;
}

interface ImageSet {
  key: string;
  label: string;
  images: string[];
}

function useImageSets(
  project: Project | null,
  isRTL: boolean,
  allLabel: string
): ImageSet[] {
  return useMemo(() => {
    if (!project) return [];
    if (project.options?.length) {
      return project.options.map((o, i) => ({
        key: `opt-${i}`,
        label: isRTL ? o.label.ar : o.label.en,
        images: o.images,
      }));
    }
    const all: ImageSet = {
      key: "all",
      label: allLabel,
      images: project.allImages?.length ? project.allImages : [project.image],
    };
    const sections = (project.sections ?? []).map(s => ({
      key: s.name,
      label: isRTL ? s.nameAr : s.name,
      images: s.images,
    }));
    return [all, ...sections.filter(s => s.images.length > 0)];
  }, [project, isRTL, allLabel]);
}

export default function ProjectDialog({
  project,
  initialImage = 0,
  onClose,
}: ProjectDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const sets = useImageSets(project, isRTL, t("site.dialog.all"));
  const [setIndex, setSetIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(initialImage);

  useEffect(() => {
    setSetIndex(0);
    setImageIndex(initialImage);
  }, [project, initialImage]);

  if (!project) return null;
  const images = sets[setIndex]?.images ?? [project.image];
  const current = images[Math.min(imageIndex, images.length - 1)];
  const title = isRTL ? project.titleAr : project.title;
  const sectorName = SECTORS.find(s => s.id === project.sector)?.name[language];
  const step = (delta: number) =>
    setImageIndex(i => (i + delta + images.length) % images.length);
  const similarMessage = t("site.dialog.similarMessage")
    .replace("{title}", title)
    .replace("{code}", project.id);

  const facts: [string, string | undefined][] = [
    [t("site.dialog.code"), project.id],
    [t("site.dialog.sector"), sectorName],
    [t("site.dialog.role"), project.role?.[language]],
    [t("site.dialog.collaborator"), project.collaborator?.[language]],
    [t("site.dialog.location"), project.location?.[language]],
    [
      t("site.dialog.spaces"),
      project.interiorSpaces ? String(project.interiorSpaces) : undefined,
    ],
  ];

  return (
    <Dialog.Root open onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="tb-dlg-overlay" />
        <Dialog.Content
          className="tb-dlg"
          dir={isRTL ? "rtl" : "ltr"}
          aria-describedby={undefined}
        >
          <Dialog.Close
            className="tb-dlg-close"
            aria-label={t("site.dialog.close")}
          >
            <X size={18} />
          </Dialog.Close>
          <div className="tb-dlg-media">
            <div className="tb-frame tb-frame--contain tb-dlg-main">
              <img
                src={current}
                alt={`${title} — ${imageIndex + 1}`}
                draggable={false}
                onContextMenu={e => e.preventDefault()}
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="tb-dlg-nav is-prev"
                    onClick={() => step(-1)}
                    aria-label={t("site.dialog.prev")}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className="tb-dlg-nav is-next"
                    onClick={() => step(1)}
                    aria-label={t("site.dialog.next")}
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="tb-dlg-count">
                    {imageIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
            {sets.length > 1 && (
              <div
                className="tb-sections"
                role="group"
                aria-label={t("site.dialog.views")}
              >
                {sets.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    className="tb-chip"
                    aria-pressed={i === setIndex}
                    onClick={() => {
                      setSetIndex(i);
                      setImageIndex(0);
                    }}
                  >
                    {s.label}
                    <span>{s.images.length}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="tb-thumbs">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-current={i === imageIndex}
                  onClick={() => setImageIndex(i)}
                  aria-label={`${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" draggable={false} />
                </button>
              ))}
            </div>
          </div>
          <div className="tb-dlg-info">
            <Dialog.Title asChild>
              <h2>{title}</h2>
            </Dialog.Title>
            <p>{isRTL ? project.descriptionAr : project.description}</p>
            <dl className="tb-facts">
              {facts
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
            <a
              className="tb-btn tb-btn--primary"
              href={whatsappUrl(similarMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              {t("site.dialog.similar")}
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
