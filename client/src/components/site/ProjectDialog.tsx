import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { whatsappUrl } from "@/data/contact";
import type { Project } from "@/data/types";
import { projectPath } from "@/seo/routes";
import { WhatsAppIcon } from "./icons";
import Gallery from "./Gallery";
import ProjectFacts from "./ProjectFacts";

interface ProjectDialogProps {
  project: Project;
  initialImage?: number;
  onClose: () => void;
}

/** Quick-look dialog on the home page; the full, indexable page lives at projectPath(). */
export default function ProjectDialog({
  project,
  initialImage = 0,
  onClose,
}: ProjectDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const title = isRTL ? project.titleAr : project.title;
  const similarMessage = t("site.dialog.similarMessage")
    .replace("{title}", title)
    .replace("{code}", project.id);

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
            <Gallery project={project} initialImage={initialImage} />
          </div>
          <div className="tb-dlg-info">
            <Dialog.Title asChild>
              <h2>{title}</h2>
            </Dialog.Title>
            <p>{isRTL ? project.descriptionAr : project.description}</p>
            <ProjectFacts project={project} />
            <a
              className="tb-btn tb-btn--primary"
              href={whatsappUrl(similarMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              {t("site.dialog.similar")}
            </a>
            <a
              className="tb-btn tb-btn--line"
              href={projectPath(project, language)}
            >
              {t("site.dialog.fullPage")}
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
