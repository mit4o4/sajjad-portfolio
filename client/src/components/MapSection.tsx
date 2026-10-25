import { useMemo, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapView } from "./Map";
import { projectsData, type Project } from "@/data/projectsData";

// Marker sizing constants (pixels)
const MARKER_SIZE = 56; // main circular marker diameter
const SMALL_SIZE = 28; // diameter for small images shown around a marker
const SMALL_RADIUS = 36; // distance from center for small images
const THRESHOLD_ZOOM = 14; // zoom level at which extra images appear
const ROTATION_INTERVAL_MS = 3000; // slower rotation reduces work

type Coords = { lat: number; lng: number };
type ProjectWithCoords = Project & { coordinates: Coords };

interface MarkerData {
  marker: any;
  project: ProjectWithCoords;
  container: HTMLElement | null;
  position: Coords;
  smallEls?: HTMLElement[];
}

/** Image list for a project; the first entry is the lightweight thumb. */
function getMarkerImages(p: Project): string[] {
  const list = p.allImages && p.allImages.length > 0 ? [...p.allImages] : [p.image];
  list[0] = p.thumb ?? p.image;
  return list;
}

/** Remove a marker from its map. Handles Google (setMap / AdvancedMarkerElement.map) and Leaflet. */
function removeMarker(m: any): void {
  if (!m) return;
  try {
    if ("setMap" in m && typeof m.setMap === "function") {
      m.setMap(null);
    } else if ("map" in m) {
      m.map = null; // google.maps.marker.AdvancedMarkerElement
    } else if (typeof m.remove === "function") {
      m.remove(); // Leaflet marker
    }
  } catch {
    // Safe to ignore: the map may already be destroyed, so the marker is gone with it.
  }
}

function createLazyImg(src: string): HTMLImageElement {
  const img = document.createElement("img");
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "cover";
  img.draggable = false;
  img.decoding = "async";
  img.loading = "lazy";
  img.src = src;
  return img;
}

interface ControllerOptions {
  /** Current zoom of the underlying map. */
  getZoom: () => number;
  /** Current center of the underlying map, or null if unavailable. */
  getCenter: () => Coords | null;
}

/**
 * Shared marker behaviour for the Google and Leaflet branches: small images
 * around the nearest marker and a single rotation interval. Returns the marker
 * registry plus `update` and `dispose`.
 */
function createMarkerController({ getZoom, getCenter }: ControllerOptions) {
  const markerData: MarkerData[] = [];
  let rotationInterval: number | null = null;
  let currentRotatingMd: MarkerData | null = null;
  const timeouts = new Set<number>();

  function clearSmallImagesFor(md: MarkerData) {
    if (!md?.smallEls) return;
    md.smallEls.forEach(el => el.remove());
    md.smallEls = [];
  }

  function showSmallImagesFor(md: MarkerData, max = 5) {
    clearSmallImagesFor(md);
    if (!md || !md.container) return;
    const container = md.container;
    const images = getMarkerImages(md.project);
    if (images.length <= 1) return; // nothing extra to show

    const count = Math.min(max, images.length - 1);
    const center = { x: MARKER_SIZE / 2, y: MARKER_SIZE / 2 };
    const startDeg = 120; // distribute along lower semicircle
    const endDeg = 240;
    const smallEls: HTMLElement[] = [];

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const rad = ((startDeg + (endDeg - startDeg) * t) * Math.PI) / 180;
      const x = center.x + Math.cos(rad) * SMALL_RADIUS;
      const y = center.y + Math.sin(rad) * SMALL_RADIUS;

      const small = document.createElement("div");
      small.style.position = "absolute";
      small.style.left = `${x}px`;
      small.style.top = `${y}px`;
      small.style.width = `${SMALL_SIZE}px`;
      small.style.height = `${SMALL_SIZE}px`;
      small.style.margin = "0";
      small.style.padding = "0";
      small.style.borderRadius = "50%";
      small.style.overflow = "hidden";
      small.style.transform = "translate(-50%, -50%)";
      small.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
      small.style.cursor = "pointer";
      small.style.zIndex = "9999";

      const imageIndex = (i + 1) % images.length;
      small.appendChild(createLazyImg(images[imageIndex]));

      // clicking a small image opens the project modal at that image
      small.addEventListener("click", ev => {
        ev.stopPropagation();
        window.dispatchEvent(
          new CustomEvent("open-project", {
            detail: { id: md.project.id, imageIndex },
          })
        );
      });

      container.appendChild(small);
      smallEls.push(small);
    }

    md.smallEls = smallEls;
  }

  function stopRotation() {
    if (rotationInterval != null) {
      clearInterval(rotationInterval);
      rotationInterval = null;
    }
    currentRotatingMd = null;
  }

  function rotateOnce(md: MarkerData) {
    const images = getMarkerImages(md.project);
    if (images.length <= 1) return;
    const imgEl = md.container?.querySelector("img") as HTMLImageElement | null;
    if (!imgEl) return;
    const cur = Number(imgEl.dataset.idx || 0);
    const next = (cur + 1) % images.length;
    const src = images[next];

    // preload the next image so the swap does not flash an empty marker
    const pre = new Image();
    pre.decoding = "async";
    pre.onload = () => {
      if (currentRotatingMd !== md) return; // rotation moved on or stopped
      imgEl.dataset.idx = String(next);
      imgEl.src = src;
    };
    pre.onerror = () => {
      // Safe to ignore: keep showing the current image; next tick retries.
    };
    pre.src = src;
  }

  function startRotation() {
    stopRotation();
    rotationInterval = window.setInterval(() => {
      if (currentRotatingMd) rotateOnce(currentRotatingMd);
    }, ROTATION_INTERVAL_MS);
  }

  // compute nearest marker to map center and show extra images accordingly
  function update() {
    try {
      const zoom = getZoom();
      const center = getCenter();
      if (!center) return;

      let nearest: MarkerData | null = null;
      let bestDist = Infinity;
      for (const md of markerData) {
        const dlat = md.position.lat - center.lat;
        const dlng = md.position.lng - center.lng;
        const dist = dlat * dlat + dlng * dlng;
        if (dist < bestDist) {
          bestDist = dist;
          nearest = md;
        }
      }

      const zoomedIn = zoom >= THRESHOLD_ZOOM;
      markerData.forEach(md => {
        if (md === nearest && zoomedIn) showSmallImagesFor(md, 5);
        else clearSmallImagesFor(md);
      });

      // only rotate images for the nearest marker when zoomed in
      if (nearest && zoomedIn) {
        if (currentRotatingMd !== nearest) {
          currentRotatingMd = nearest;
          const imgEl = (nearest as MarkerData).container?.querySelector(
            "img"
          ) as HTMLImageElement | null;
          if (imgEl) imgEl.dataset.idx = "0";
          startRotation();
        }
      } else {
        stopRotation();
      }
    } catch {
      // Safe to ignore: map may be mid-teardown or not yet laid out; the next zoom event retries.
    }
  }

  function scheduleUpdate(delayMs: number) {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      update();
    }, delayMs);
    timeouts.add(id);
  }

  function dispose() {
    stopRotation();
    timeouts.forEach(id => clearTimeout(id));
    timeouts.clear();
    markerData.forEach(md => {
      clearSmallImagesFor(md);
      removeMarker(md.marker);
    });
    markerData.length = 0;
  }

  return { markerData, update, scheduleUpdate, dispose };
}

export default function MapSection() {
  const { t } = useLanguage();
  // Build list of projects to display on the map.
  // Show projects that have explicit coordinates, and for projects that mention Karbala or Hilla
  // provide an approximate fallback coordinate so they appear on the map.
  const projectsWithCoords = useMemo(() => {
    const karbala = { lat: 32.6027147, lng: 44.0196987 };
    const hilla = { lat: 32.4638284, lng: 44.3987497 };

    return projectsData
      .map(p => {
        if (p.coordinates) return p;
        const hay = (
          (p.title || "") +
          " " +
          (p.titleAr || "") +
          " " +
          (p.description || "") +
          " " +
          (p.descriptionAr || "")
        ).toLowerCase();
        if (hay.includes("كربلاء") || hay.includes("karbala")) {
          return { ...p, coordinates: karbala } as ProjectWithCoords;
        }
        if (hay.includes("الحلة") || hay.includes("hilla")) {
          return { ...p, coordinates: hilla } as ProjectWithCoords;
        }
        return null;
      })
      .filter(Boolean) as ProjectWithCoords[];
  }, []);

  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  // Disposers for everything created in onMapReady (markers, listeners, intervals, timeouts)
  const cleanupsRef = useRef<Array<() => void>>([]);
  const isMountedRef = useRef(true);

  const initialCenter = useMemo(() => {
    if (projectsWithCoords.length === 0) return { lat: 32.0, lng: 44.32 };
    const avg = projectsWithCoords.reduce(
      (acc, cur) => {
        return {
          lat: acc.lat + (cur.coordinates!.lat || 0),
          lng: acc.lng + (cur.coordinates!.lng || 0),
        };
      },
      { lat: 0, lng: 0 }
    );
    return {
      lat: avg.lat / projectsWithCoords.length,
      lng: avg.lng / projectsWithCoords.length,
    };
  }, [projectsWithCoords]);

  function dispatchOpenProject(id: Project["id"]) {
    window.dispatchEvent(new CustomEvent("open-project", { detail: { id } }));
  }

  function setupGoogleMap(map: google.maps.Map) {
    infoWindowRef.current = new window.google.maps.InfoWindow();

    const controller = createMarkerController({
      getZoom: () => map.getZoom() ?? 0,
      getCenter: () => {
        const c = map.getCenter();
        return c ? { lat: c.lat(), lng: c.lng() } : null;
      },
    });

    const zoomListener = map.addListener("zoom_changed", () => {
      // small delay to allow zoom to settle
      controller.scheduleUpdate(80);
    });
    controller.scheduleUpdate(200);

    projectsWithCoords.forEach(p => {
      // DOM element acting as marker content (circular image)
      const container = document.createElement("div");
      container.style.width = `${MARKER_SIZE}px`;
      container.style.height = `${MARKER_SIZE}px`;
      container.style.position = "relative";
      container.style.borderRadius = "50%";
      container.style.overflow = "hidden";
      container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      container.style.cursor = "pointer";
      container.appendChild(createLazyImg(getMarkerImages(p)[0]));

      const marker = new (
        window as any
      ).google.maps.marker.AdvancedMarkerElement({
        map,
        position: p.coordinates as google.maps.LatLngLiteral,
        content: container,
        title: p.title,
      });

      // click opens portfolio modal via custom event
      container.addEventListener("click", () => dispatchOpenProject(p.id));

      controller.markerData.push({
        marker,
        project: p,
        container,
        position: { lat: p.coordinates.lat, lng: p.coordinates.lng },
      });
    });

    cleanupsRef.current.push(() => {
      zoomListener.remove();
      controller.dispose();
    });
  }

  function setupLeafletMap(L: any, leafletMap: any) {
    const controller = createMarkerController({
      getZoom: () => leafletMap.getZoom(),
      getCenter: () => {
        const c = leafletMap.getCenter();
        return c ? { lat: c.lat, lng: c.lng } : null;
      },
    });

    projectsWithCoords.forEach(p => {
      const html = `<div style="width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;border-radius:50%;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;position:relative;"><img loading="lazy" decoding="async" src="${getMarkerImages(p)[0]}" style="width:100%;height:100%;object-fit:cover;"/></div>`;
      const icon = L.divIcon({
        html,
        className: "",
        iconSize: [MARKER_SIZE, MARKER_SIZE],
      });
      const marker = L.marker([p.coordinates.lat, p.coordinates.lng], {
        icon,
      }).addTo(leafletMap);

      marker.on("click", () => dispatchOpenProject(p.id));

      controller.markerData.push({
        marker,
        project: p,
        container: marker.getElement(),
        position: { lat: p.coordinates.lat, lng: p.coordinates.lng },
      });
    });

    const onZoomEnd = () => controller.scheduleUpdate(80);
    leafletMap.on("zoomend", onZoomEnd);
    controller.scheduleUpdate(200);

    cleanupsRef.current.push(() => {
      leafletMap.off("zoomend", onZoomEnd);
      controller.dispose();
    });
  }

  function onMapReady(map: any) {
    if (!isMountedRef.current) return; // map finished loading after unmount

    // Google Maps flow
    if (
      (window as any).google &&
      (window as any).google.maps &&
      map &&
      map instanceof (window as any).google.maps.Map
    ) {
      setupGoogleMap(map);
      return;
    }

    // Otherwise assume Leaflet map instance (fallback loaded by Map.tsx when no Google key)
    const L = (window as any).L;
    if (L && map && typeof map.setView === "function") {
      setupLeafletMap(L, map);
      return;
    }

    console.warn("onMapReady: unknown map instance — markers not created");
  }

  // cleanup when component unmounts: stop intervals, remove markers and listeners
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const cleanups = cleanupsRef.current;
      cleanupsRef.current = [];
      cleanups.forEach(fn => {
        try {
          fn();
        } catch {
          // Safe to ignore: the map instance may already be destroyed during unmount.
        }
      });
    };
  }, []);

  return (
    <section id="projects-map" className="tb-wrap tb-sec tb-sec-tight">
      <div className="tb-head">
        <span className="tb-eyebrow">{t("site.map.eyebrow")}</span>
        <h2>{t("map.title")}</h2>
        <p>{t("site.map.intro")}</p>
      </div>
      <div
        style={{
          borderRadius: "calc(var(--tb-r) * 2)",
          overflow: "hidden",
          border: "1px solid var(--tb-line)",
        }}
      >
        <MapView
          initialCenter={initialCenter}
          initialZoom={12}
          onMapReady={onMapReady}
        />
      </div>
    </section>
  );
}
