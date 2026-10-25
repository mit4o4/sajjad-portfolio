import { useMemo, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Project } from "@/data/types";

interface ImageSet {
  key: string;
  label: string;
  images: string[];
}

function buildImageSets(
  project: Project,
  isRTL: boolean,
  allLabel: string
): ImageSet[] {
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
  const sections = (project.sections ?? [])
    .map(s => ({
      key: `sec-${s.name}`,
      label: isRTL ? s.nameAr : s.name,
      images: s.images,
    }))
    .filter(s => s.images.length > 0);
  return [all, ...sections];
}

interface GalleryProps {
  project: Project;
  initialImage?: number;
}

/** Image viewer with set switcher (facade options / sections), thumbnails and arrow-key navigation. */
export default function Gallery({ project, initialImage = 0 }: GalleryProps) {
  const { t, isRTL } = useLanguage();
  const sets = useMemo(
    () => buildImageSets(project, isRTL, t("site.dialog.all")),
    [project, isRTL, t]
  );
  const [setIndex, setSetIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(initialImage);

  const images = sets[Math.min(setIndex, sets.length - 1)]?.images ?? [
    project.image,
  ];
  const safeIndex = Math.min(imageIndex, images.length - 1);
  const title = isRTL ? project.titleAr : project.title;
  const step = (delta: number) =>
    setImageIndex(i => (i + delta + images.length) % images.length);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (images.length < 2) return;
    // In RTL the "next" image sits to the left.
    if (e.key === "ArrowRight") step(isRTL ? -1 : 1);
    if (e.key === "ArrowLeft") step(isRTL ? 1 : -1);
  };

  return (
    <div className="tb-gallery" onKeyDown={onKeyDown}>
      <div
        className="tb-frame tb-frame--contain tb-dlg-main"
        tabIndex={0}
        aria-label={t("site.dialog.views")}
      >
        <img
          src={images[safeIndex]}
          alt={`${title} — ${safeIndex + 1}`}
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
              {safeIndex + 1} / {images.length}
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
            key={`${i}-${src}`}
            type="button"
            aria-current={i === safeIndex}
            onClick={() => setImageIndex(i)}
            aria-label={`${i + 1}`}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
