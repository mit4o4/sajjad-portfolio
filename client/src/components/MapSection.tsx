import { useMemo, useRef, useEffect } from "react";
import { useLanguage } from '@/contexts/LanguageContext';
import { MapView } from "./Map";
import { projectsData } from "@/data/projectsData";

export default function MapSection() {
  const { t } = useLanguage();
  // Marker sizing constants (pixels)
  const MARKER_SIZE = 56; // main circular marker diameter
  const SMALL_SIZE = 28; // diameter for small images shown around a marker
  const SMALL_RADIUS = 36; // distance from center for small images
  // Build list of projects to display on the map.
  // Show projects that have explicit coordinates, and for projects that mention Karbala or Hilla
  // provide an approximate fallback coordinate so they appear on the map.
  const projectsWithCoords = useMemo(() => {
    const karbala = { lat: 32.6027147, lng: 44.0196987 };
    const hilla = { lat: 32.4638284, lng: 44.3987497 };

    return projectsData
      .map((p) => {
        if (p.coordinates) return p;
        const hay = ((p.title || '') + ' ' + (p.titleAr || '') + ' ' + (p.description || '') + ' ' + (p.descriptionAr || '')).toLowerCase();
        if (hay.includes('كربلاء') || hay.includes('karbala')) {
          return { ...p, coordinates: karbala } as typeof p & { coordinates: { lat: number; lng: number } };
        }
        if (hay.includes('الحلة') || hay.includes('hilla')) {
          return { ...p, coordinates: hilla } as typeof p & { coordinates: { lat: number; lng: number } };
        }
        return null;
      })
      .filter(Boolean) as (typeof projectsData[0] & { coordinates: { lat: number; lng: number } })[];
  }, []);

  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const initialCenter = useMemo(() => {
    if (projectsWithCoords.length === 0) return { lat: 32.0, lng: 44.32 };
    const avg = projectsWithCoords.reduce(
      (acc, cur) => {
        return { lat: acc.lat + (cur.coordinates!.lat || 0), lng: acc.lng + (cur.coordinates!.lng || 0) };
      },
      { lat: 0, lng: 0 }
    );
    return { lat: avg.lat / projectsWithCoords.length, lng: avg.lng / projectsWithCoords.length };
  }, [projectsWithCoords]);

  function onMapReady(map: any) {
    // If google maps available, use Google marker flow
    if ((window as any).google && (window as any).google.maps && (map && map instanceof (window as any).google.maps.Map)) {
      // clean previous infoWindow
      infoWindowRef.current = new window.google.maps.InfoWindow();

      // containers for cleanup and nearest-marker behavior
      const markers: Array<any> = [];
      // We only keep a single global rotation interval for the nearest marker
      let globalRotationInterval: number | null = null;
      let currentRotatingMd: typeof markerData[number] | null = null;
      const markerData: Array<{
        marker: any;
        project: any;
        container: HTMLElement | null;
        position: { lat: number; lng: number };
        smallEls?: HTMLElement[];
      }> = [];

      // helper to clear small images for a marker
      function clearSmallImagesFor(md: typeof markerData[number]) {
        if (!md?.smallEls) return;
        md.smallEls.forEach((el) => el.remove());
        md.smallEls = [];
      }

      // show small images around the marker's container (up to 5)
      function showSmallImagesFor(md: typeof markerData[number], max = 5) {
        clearSmallImagesFor(md);
        if (!md || !md.container) return;
        const images = (md.project.allImages && md.project.allImages.length > 0) ? md.project.allImages : [md.project.image];
        if (!images || images.length <= 1) return; // nothing extra to show

        const count = Math.min(max, images.length - 1);
        const center = { x: MARKER_SIZE / 2, y: MARKER_SIZE / 2 };
        const radius = SMALL_RADIUS; // distance from center for small images
        const startDeg = 120; // distribute along lower semicircle
        const endDeg = 240;
        const smallEls: HTMLElement[] = [];

        for (let i = 0; i < count; i++) {
          const t = count === 1 ? 0.5 : i / (count - 1);
          const deg = startDeg + (endDeg - startDeg) * t;
          const rad = (deg * Math.PI) / 180;
          const x = center.x + Math.cos(rad) * radius;
          const y = center.y + Math.sin(rad) * radius;

          const small = document.createElement('div');
          small.style.position = 'absolute';
          small.style.left = `${x}px`;
          small.style.top = `${y}px`;
          small.style.width = `${SMALL_SIZE}px`;
          small.style.height = `${SMALL_SIZE}px`;
          small.style.margin = '0';
          small.style.padding = '0';
          small.style.borderRadius = '50%';
          small.style.overflow = 'hidden';
          small.style.transform = 'translate(-50%, -50%)';
          small.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
          small.style.cursor = 'pointer';
          small.style.zIndex = '9999';

          const img = document.createElement('img');
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.draggable = false;
          try {
            (img as HTMLImageElement).loading = 'lazy';
            (img as HTMLImageElement).decoding = 'async';
          } catch (e) {}
          // pick subsequent images (skip the current main image which appears first)
          img.src = images[(i + 1) % images.length];

          small.appendChild(img);

          // clicking a small image opens the project modal and attempts to navigate to that image
          small.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const ev2 = new CustomEvent('open-project', { detail: { id: md.project.id, imageIndex: (i + 1) % images.length } });
            window.dispatchEvent(ev2);
          });

          md.container.appendChild(small);
          smallEls.push(small);
        }

        md.smallEls = smallEls;
      }

      // compute nearest marker to map center and show small images accordingly
      function updateNearestMarkerForZoom() {
        try {
          const zoom = map.getZoom();
          const center = map.getCenter();
          if (!center) return;
          const centerLat = center.lat();
          const centerLng = center.lng();

          // only show when zoomed in enough
          const thresholdZoom = 14;

          let nearest: typeof markerData[number] | null = null;
          let bestDist = Infinity;
          for (const md of markerData) {
            const dlat = md.position.lat - centerLat;
            const dlng = md.position.lng - centerLng;
            const dist = dlat * dlat + dlng * dlng;
            if (dist < bestDist) {
              bestDist = dist;
              nearest = md;
            }
          }

          markerData.forEach((md) => {
            if (md === nearest && zoom >= thresholdZoom) {
              showSmallImagesFor(md, 5);
            } else {
              clearSmallImagesFor(md);
            }
          });

          // manage global rotation: only rotate images for the nearest marker when zoomed in
          if (nearest && zoom >= thresholdZoom) {
            if (currentRotatingMd !== nearest) {
              currentRotatingMd = nearest;
              try {
                const imgEl = nearest.container?.querySelector('img') as HTMLImageElement | null;
                if (imgEl) imgEl.dataset.__idx = '0';
              } catch (e) {}
              startGlobalRotation();
            }
          } else {
            stopGlobalRotation();
          }
        } catch (e) {}
      }

      // attach zoom listener (Google)
      const zoomListener = map.addListener('zoom_changed', () => {
        // small delay to allow zoom to settle
        setTimeout(updateNearestMarkerForZoom, 80);
      });

      // run once to initialize state
      setTimeout(updateNearestMarkerForZoom, 200);
      // iterate projects to create markers
      projectsWithCoords.forEach((p) => {
        // create a DOM element to act as marker content (circular image)
        const container = document.createElement('div');
        container.style.width = `${MARKER_SIZE}px`;
        container.style.height = `${MARKER_SIZE}px`;
        container.style.position = 'relative';
        container.style.borderRadius = '50%';
        container.style.overflow = 'hidden';
        container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        container.style.cursor = 'pointer';

        const img = document.createElement('img');
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.draggable = false;
        try {
          (img as HTMLImageElement).loading = 'lazy';
          (img as HTMLImageElement).decoding = 'async';
        } catch (e) {}
        const images = (p.allImages && p.allImages.length > 0) ? p.allImages : [p.image];
        let idx = 0;
        img.src = images[idx];
        container.appendChild(img);

        // create AdvancedMarkerElement using DOM content
        const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
          map,
          position: p.coordinates as google.maps.LatLngLiteral,
          content: container,
          title: p.title,
        });

        // do not create per-marker intervals (expensive for many markers)
        // image rotation will be handled by a single global interval below

        // click opens portfolio modal via custom event
        container.addEventListener('click', () => {
          const ev = new CustomEvent('open-project', { detail: { id: p.id } });
          window.dispatchEvent(ev);
        });

        // keep references for cleanup and nearest marker calculations
        markers.push(marker);
        markerData.push({ marker, project: p, container, position: { lat: p.coordinates.lat, lng: p.coordinates.lng } });
      });

      // start a single rotation interval that updates only the nearest marker when zoomed in
      function startGlobalRotation() {
        stopGlobalRotation();
        const intervalMs = 3000; // slower rotation reduces work
        globalRotationInterval = window.setInterval(() => {
          try {
            if (!currentRotatingMd) return;
            const md = currentRotatingMd;
            const images = (md.project.allImages && md.project.allImages.length > 0) ? md.project.allImages : [md.project.image];
            if (!images || images.length <= 1) return;
            const imgEl = md.container?.querySelector('img') as HTMLImageElement | null;
            if (!imgEl) return;
            // advance image index stored on the element dataset
            const cur = Number(imgEl.dataset.__idx || 0);
            const next = (cur + 1) % images.length;
            imgEl.dataset.__idx = String(next);
            imgEl.src = images[next];
          } catch (e) {}
        }, intervalMs) as unknown as number;
      }

      function stopGlobalRotation() {
        if (globalRotationInterval != null) {
          clearInterval(globalRotationInterval);
          globalRotationInterval = null;
        }
        currentRotatingMd = null;
      }

      // cleanup on unmount: store for outer effect and remove listeners
      (window as any).__mapMarkers = (window as any).__mapMarkers || [];
      (window as any).__mapMarkers.push(...markers);
      (window as any).__mapMarkerData = (window as any).__mapMarkerData || [];
      (window as any).__mapMarkerData.push(...markerData);
      // store zoom listener to remove later
      (window as any).__mapZoomListener = (window as any).__mapZoomListener || [];
      (window as any).__mapZoomListener.push(zoomListener);
      return;
    }

    // Otherwise assume Leaflet map instance
    const L = (window as any).L;
    if (L && map && typeof map.setView === 'function') {
      const leafletMap = map as any;
      const markers: any[] = [];
      let globalRotationInterval: number | null = null;
      let currentRotatingMd: typeof markerData[number] | null = null;
      const markerData: Array<{
        marker: any;
        project: any;
        container: HTMLElement | null;
        position: { lat: number; lng: number };
        smallEls?: HTMLElement[];
      }> = [];

      function clearSmallImagesFor(md: typeof markerData[number]) {
        if (!md?.smallEls) return;
        md.smallEls.forEach((el) => el.remove());
        md.smallEls = [];
      }

      function showSmallImagesFor(md: typeof markerData[number], max = 5) {
        clearSmallImagesFor(md);
        if (!md || !md.container) return;
        const images = (md.project.allImages && md.project.allImages.length > 0) ? md.project.allImages : [md.project.image];
        if (!images || images.length <= 1) return;

        const count = Math.min(max, images.length - 1);
        const center = { x: MARKER_SIZE / 2, y: MARKER_SIZE / 2 };
        const radius = SMALL_RADIUS;
        const startDeg = 120;
        const endDeg = 240;
        const smallEls: HTMLElement[] = [];

        for (let i = 0; i < count; i++) {
          const t = count === 1 ? 0.5 : i / (count - 1);
          const deg = startDeg + (endDeg - startDeg) * t;
          const rad = (deg * Math.PI) / 180;
          const x = center.x + Math.cos(rad) * radius;
          const y = center.y + Math.sin(rad) * radius;

          const small = document.createElement('div');
          small.style.position = 'absolute';
          small.style.left = `${x}px`;
          small.style.top = `${y}px`;
          small.style.width = `${SMALL_SIZE}px`;
          small.style.height = `${SMALL_SIZE}px`;
          small.style.margin = '0';
          small.style.padding = '0';
          small.style.borderRadius = '50%';
          small.style.overflow = 'hidden';
          small.style.transform = 'translate(-50%, -50%)';
          small.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
          small.style.cursor = 'pointer';
          small.style.zIndex = '9999';

          const img = document.createElement('img');
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.draggable = false;
          img.src = images[(i + 1) % images.length];

          small.appendChild(img);
          small.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const ev2 = new CustomEvent('open-project', { detail: { id: md.project.id, imageIndex: (i + 1) % images.length } });
            window.dispatchEvent(ev2);
          });

          md.container.appendChild(small);
          smallEls.push(small);
        }

        md.smallEls = smallEls;
      }

      function updateNearestMarkerForZoom() {
        try {
          const zoom = leafletMap.getZoom();
          const center = leafletMap.getCenter();
          if (!center) return;
          const centerLat = center.lat;
          const centerLng = center.lng;
          const thresholdZoom = 14;

          let nearest: typeof markerData[number] | null = null;
          let bestDist = Infinity;
          for (const md of markerData) {
            const dlat = md.position.lat - centerLat;
            const dlng = md.position.lng - centerLng;
            const dist = dlat * dlat + dlng * dlng;
            if (dist < bestDist) {
              bestDist = dist;
              nearest = md;
            }
          }

          markerData.forEach((md) => {
            if (md === nearest && leafletMap.getZoom() >= thresholdZoom) {
              showSmallImagesFor(md, 5);
            } else {
              clearSmallImagesFor(md);
            }
          });

          // manage global rotation: only rotate images for the nearest marker when zoomed in
          if (nearest && leafletMap.getZoom() >= thresholdZoom) {
            if (currentRotatingMd !== nearest) {
              currentRotatingMd = nearest;
              try {
                const imgEl = nearest.container?.querySelector('img') as HTMLImageElement | null;
                if (imgEl) imgEl.dataset.__idx = '0';
              } catch (e) {}
              startGlobalRotation();
            }
          } else {
            stopGlobalRotation();
          }
        } catch (e) {}
      }

      projectsWithCoords.forEach((p) => {
        const images = (p.allImages && p.allImages.length > 0) ? p.allImages : [p.image];
        let idx = 0;

        // create placeholder html for divIcon
        const html = `<div style="width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;border-radius:50%;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;position:relative;"><img loading="lazy" decoding="async" src="${images[0]}" style="width:100%;height:100%;object-fit:cover;"/></div>`;
        const icon = L.divIcon({ html, className: '', iconSize: [MARKER_SIZE, MARKER_SIZE] });
        const marker = L.marker([p.coordinates.lat, p.coordinates.lng], { icon }).addTo(leafletMap as any);

        // once element available, rotation will be handled by global interval
        const el = marker.getElement();

        marker.on('click', () => {
          const ev = new CustomEvent('open-project', { detail: { id: p.id } });
          window.dispatchEvent(ev);
        });

        markers.push(marker);
        markerData.push({ marker, project: p, container: el, position: { lat: p.coordinates.lat, lng: p.coordinates.lng } });
      });
      (window as any).__mapMarkers = (window as any).__mapMarkers || [];
      (window as any).__mapMarkers.push(...markers);
      (window as any).__mapMarkerData = (window as any).__mapMarkerData || [];
      (window as any).__mapMarkerData.push(...markerData);

      // global rotation control for Leaflet: start/stop functions
      function startGlobalRotation() {
        stopGlobalRotation();
        const intervalMs = 3000;
        globalRotationInterval = window.setInterval(() => {
          try {
            if (!currentRotatingMd) return;
            const md = currentRotatingMd;
            const images = (md.project.allImages && md.project.allImages.length > 0) ? md.project.allImages : [md.project.image];
            if (!images || images.length <= 1) return;
            const imgEl = md.container?.querySelector('img') as HTMLImageElement | null;
            if (!imgEl) return;
            const cur = Number(imgEl.dataset.__idx || 0);
            const next = (cur + 1) % images.length;
            imgEl.dataset.__idx = String(next);
            imgEl.src = images[next];
          } catch (e) {}
        }, intervalMs) as unknown as number;
        (window as any).__mapRotationInterval = globalRotationInterval;
      }

      function stopGlobalRotation() {
        if (globalRotationInterval != null) {
          clearInterval(globalRotationInterval);
          globalRotationInterval = null;
        }
        currentRotatingMd = null;
        (window as any).__mapRotationInterval = null;
      }

      // listen for zoom end
      const onZoomEnd = () => setTimeout(updateNearestMarkerForZoom, 80);
      leafletMap.on('zoomend', onZoomEnd);
      (window as any).__mapZoomListener = (window as any).__mapZoomListener || [];
      (window as any).__mapZoomListener.push({ leafletMap, onZoomEnd });
      // initial update
      setTimeout(updateNearestMarkerForZoom, 200);
      return;
    }

    console.warn('onMapReady: unknown map instance — markers not created');
  }

  // cleanup when component unmounts
  // clear intervals and remove markers from map
  useEffect(() => {
    return () => {
      const markers = (window as any).__mapMarkers as any[] | undefined;
      const intervals = (window as any).__mapIntervals as number[] | undefined;
      if (intervals) {
        intervals.forEach((id) => clearInterval(id));
        (window as any).__mapIntervals = [];
      }
      const rotation = (window as any).__mapRotationInterval as number | undefined;
      if (rotation) {
        try { clearInterval(rotation); } catch (e) {}
        (window as any).__mapRotationInterval = null;
      }
      if (markers) {
        markers.forEach((m) => {
          try {
            m?.setMap?.(null);
          } catch (e) {}
        });
        (window as any).__mapMarkers = [];
      }
      // clear any small image elements created around markers
      const markerData = (window as any).__mapMarkerData as any[] | undefined;
      if (markerData) {
        markerData.forEach((md) => {
          try {
            if (md?.smallEls) md.smallEls.forEach((el: HTMLElement) => el.remove());
            // for Leaflet markers, try to remove element
            if (md?.marker && md.marker.remove) {
              try { md.marker.remove(); } catch (e) {}
            }
          } catch (e) {}
        });
        (window as any).__mapMarkerData = [];
      }
      // unregister zoom listeners
      const zoomListeners = (window as any).__mapZoomListener as any[] | undefined;
      if (zoomListeners) {
        zoomListeners.forEach((l) => {
          try {
            if (l && l.remove) l.remove(); // google listener
            if (l && l.leafletMap && l.onZoomEnd) l.leafletMap.off('zoomend', l.onZoomEnd);
          } catch (e) {}
        });
        (window as any).__mapZoomListener = [];
      }
    };
  }, []);

  return (
    <section id="projects-map" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">{t('map.title')}</h2>
        <div>
          <MapView className="rounded-lg shadow-lg" initialCenter={initialCenter} initialZoom={12} onMapReady={onMapReady} />
        </div>
      </div>
    </section>
  );
}
