import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

interface RevealProps {
  children: ReactNode;
  /** Render as a different element (default: div) */
  as?: ElementType;
  /** Stagger delay in ms */
  delay?: number;
  /** Use a clip-path wipe instead of fade-up */
  clip?: boolean;
  /** IntersectionObserver threshold */
  threshold?: number;
  className?: string;
}

/**
 * Scroll-reveal wrapper. Adds the `.reveal` (or `.reveal-clip`) class and
 * toggles `.is-visible` once the element scrolls into view — once only.
 * Motion + reduced-motion handling live in index.css.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  clip = false,
  threshold = 0.18,
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const base = clip ? "reveal-clip" : "reveal";
  return (
    <Tag
      ref={ref}
      className={`${base} ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
