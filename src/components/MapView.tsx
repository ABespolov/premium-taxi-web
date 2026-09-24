import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { mapboxToken } from '@/api/mapbox';
import {
  CHEVRON_SVG,
  DROPOFF_SVG,
  PICKUP_SVG,
  PIN_SVG,
  PULSE_SVG,
  STOP_SVG,
} from '@/components/map-glyphs';
import type { Coord } from '@/mocks/places';
import { colors, mapColors } from '@/theme/tokens';

export type MapMarker =
  | { id: string; kind: 'pin'; coord: Coord; label?: string }
  | { id: string; kind: 'pulse'; coord: Coord }
  | { id: string; kind: 'stop'; coord: Coord }
  | {
      id: string;
      kind: 'pickup' | 'dropoff';
      coord: Coord;
      label?: string;
      sublabel?: string;
      isPressable?: boolean;
    };

// One coordinate centres the map on it; several fit them all in view.
export type MapFocus = { coords: readonly Coord[]; zoom?: number };

export type MapPadding = { top: number; bottom: number; left: number; right: number };

export type MapScene = {
  focus: MapFocus;
  padding: MapPadding;
  markers?: readonly MapMarker[];
  route?: readonly Coord[];
  isInteractive?: boolean;
  // Bump to fly back to `focus` after the rider panned away.
  focusKey?: number;
};

export type MapHandlers = {
  onCenterChange?: (coord: Coord) => void;
  onMarkerPress?: (id: string) => void;
};

const GLIDE_MS = 600;
const DEFAULT_ZOOM = 15;
const FIT_MAX_ZOOM = 15.5;

const GLYPHS = { pickup: PICKUP_SVG, dropoff: DROPOFF_SVG, stop: STOP_SVG } as const;

mapboxgl.accessToken = mapboxToken;

type Props = MapScene & MapHandlers;

// Mapbox GL on the page itself: the browser hands it every touch, pinch and scroll.
export function MapView(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const drawn = useRef({ markers: '', route: '', focus: '', padding: '', isLoaded: false });
  const markers = useRef<mapboxgl.Marker[]>([]);

  const sceneKey = JSON.stringify({
    focus: props.focus,
    padding: props.padding,
    markers: props.markers ?? [],
    route: props.route ?? [],
    isInteractive: props.isInteractive ?? true,
    focusKey: props.focusKey ?? 0,
  });

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const initial = latest.current;
    const instance = new mapboxgl.Map({
      container: node,
      style: 'mapbox://styles/mapbox/light-v11',
      // Street and place names in English rather than the local language.
      language: 'en',
      center: [...initial.focus.coords[0]] as [number, number],
      zoom: initial.focus.zoom ?? DEFAULT_ZOOM,
      attributionControl: false,
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
    });
    instance.touchZoomRotate.disableRotation();
    instance.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');
    map.current = instance;

    instance.on('style.load', () => {
      if (instance.getLayer('land')) {
        instance.setPaintProperty('land', 'background-color', mapColors.land);
      }
      if (instance.getLayer('water'))
        instance.setPaintProperty('water', 'fill-color', mapColors.water);
      if (instance.getLayer('landuse')) {
        instance.setPaintProperty('landuse', 'fill-color', mapColors.park);
      }
    });

    // Place the camera with the sheet's padding before the first frame is drawn.
    applyFocus(instance, latest.current, drawn.current);

    instance.on('load', () => {
      drawn.current.isLoaded = true;
      applyScene(instance, latest.current, drawn.current, markers.current, latest);
    });

    // Fade the map in once its tiles are drawn, instead of showing them pop in.
    instance.once('idle', () => node.classList.add('is-drawn'));

    instance.on('moveend', (event) => {
      if (!('originalEvent' in event) || !event.originalEvent) return;
      const center = instance.getCenter();
      latest.current.onCenterChange?.([center.lng, center.lat]);
    });

    const resize = new ResizeObserver(() => instance.resize());
    resize.observe(node);

    return () => {
      resize.disconnect();
      instance.remove();
      map.current = null;
      markers.current = [];
      drawn.current = { markers: '', route: '', focus: '', padding: '', isLoaded: false };
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the scene is read from `latest`; its key says when it changed.
  useEffect(() => {
    const instance = map.current;
    if (!instance || !drawn.current.isLoaded) return;
    applyScene(instance, latest.current, drawn.current, markers.current, latest);
  }, [sceneKey]);

  // Inline, because Mapbox's own stylesheet makes its container `position: relative`.
  return (
    <div ref={container} className="map bg-map-land" style={{ position: 'absolute', inset: 0 }} />
  );
}

type Drawn = { markers: string; route: string; focus: string; padding: string; isLoaded: boolean };

function applyScene(
  instance: mapboxgl.Map,
  scene: MapScene,
  drawn: Drawn,
  markers: mapboxgl.Marker[],
  handlers: { current: MapHandlers },
) {
  const isInteractive = scene.isInteractive ?? true;
  for (const handler of [
    instance.dragPan,
    instance.scrollZoom,
    instance.touchZoomRotate,
    instance.doubleClickZoom,
  ]) {
    if (isInteractive) handler.enable();
    else handler.disable();
  }
  instance.touchZoomRotate.disableRotation();
  drawMarkers(instance, scene.markers ?? [], drawn, markers, handlers);
  drawRoute(instance, scene.route ?? [], drawn);
  const attribution = instance
    .getContainer()
    .querySelector<HTMLElement>('.mapboxgl-ctrl-bottom-left');
  if (attribution) attribution.style.bottom = `${scene.padding.bottom}px`;
  applyFocus(instance, scene, drawn);
}

// Glides only when the place changes or the rider asks to recenter; a new sheet height
// or the first placement moves the camera at once, so nothing drifts on arrival. A sheet
// measured mid-glide retargets the glide instead of cutting it short.
function applyFocus(instance: mapboxgl.Map, scene: MapScene, drawn: Drawn) {
  const focusKey = JSON.stringify([scene.focus, scene.focusKey ?? 0]);
  const paddingKey = JSON.stringify(scene.padding);
  if (focusKey === drawn.focus && paddingKey === drawn.padding) return;
  const shouldGlide = drawn.focus !== '' && (focusKey !== drawn.focus || instance.isEasing());
  drawn.focus = focusKey;
  drawn.padding = paddingKey;
  moveCamera(instance, scene, shouldGlide ? GLIDE_MS : 0);
}

function moveCamera(instance: mapboxgl.Map, { focus, padding }: MapScene, duration: number) {
  const [first] = focus.coords;
  if (focus.coords.length > 1) {
    const bounds = new mapboxgl.LngLatBounds(
      [...first] as [number, number],
      [...first] as [number, number],
    );
    for (const coord of focus.coords) bounds.extend([...coord] as [number, number]);
    instance.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
    instance.fitBounds(bounds, {
      padding: {
        top: padding.top + 64,
        bottom: padding.bottom + 48,
        left: padding.left + 48,
        right: padding.right + 48,
      },
      maxZoom: FIT_MAX_ZOOM,
      duration,
    });
    return;
  }
  instance.easeTo({
    center: [...first] as [number, number],
    zoom: focus.zoom ?? DEFAULT_ZOOM,
    padding,
    duration,
  });
}

function drawRoute(instance: mapboxgl.Map, path: readonly Coord[], drawn: Drawn) {
  const key = JSON.stringify(path);
  if (key === drawn.route) return;
  drawn.route = key;
  const data = {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'LineString' as const, coordinates: path.map((coord) => [...coord]) },
  };
  const source = instance.getSource<mapboxgl.GeoJSONSource>('route');
  if (source) {
    source.setData(data);
    return;
  }
  instance.addSource('route', { type: 'geojson', data });
  instance.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': colors.label.primary, 'line-width': 3 },
  });
}

// Labels open away from each other, towards the inside of the route, so neither is pushed
// off the edge of the screen.
function isPickupOnLeft(list: readonly MapMarker[]) {
  const pickup = list.find((marker) => marker.kind === 'pickup');
  const dropoff = list.find((marker) => marker.kind === 'dropoff');
  return !pickup || !dropoff || pickup.coord[0] <= dropoff.coord[0];
}

function labelElement(
  label: string,
  sublabel: string | undefined,
  onPress: (() => void) | undefined,
) {
  const element = document.createElement(onPress ? 'button' : 'div');
  element.className = 'map-label';
  const text = document.createElement('div');
  const title = document.createElement('div');
  title.className = 'map-label-title';
  title.textContent = label;
  text.appendChild(title);
  if (sublabel) {
    const subtitle = document.createElement('div');
    subtitle.className = 'map-label-subtitle';
    subtitle.textContent = sublabel;
    text.appendChild(subtitle);
  }
  element.appendChild(text);
  if (onPress) {
    element.insertAdjacentHTML('beforeend', CHEVRON_SVG);
    element.addEventListener('click', onPress);
  }
  return element;
}

function drawMarkers(
  instance: mapboxgl.Map,
  list: readonly MapMarker[],
  drawn: Drawn,
  markers: mapboxgl.Marker[],
  handlers: { current: MapHandlers },
) {
  // Rebuilding unchanged markers makes them blink, so only a real change redraws them.
  const key = JSON.stringify(list);
  if (key === drawn.markers) return;
  drawn.markers = key;
  for (const marker of markers.splice(0)) marker.remove();

  function add(element: HTMLElement, coord: Coord, options: mapboxgl.MarkerOptions) {
    markers.push(
      new mapboxgl.Marker({ element, ...options })
        .setLngLat([...coord] as [number, number])
        .addTo(instance),
    );
  }

  const pickupOnLeft = isPickupOnLeft(list);
  for (const marker of list) {
    if (marker.kind === 'pin') {
      const element = document.createElement('div');
      element.className = 'map-pin';
      if (marker.label) element.appendChild(labelElement(marker.label, undefined, undefined));
      element.insertAdjacentHTML('beforeend', PIN_SVG);
      // The pin's dot, not its stem, marks the spot.
      add(element, marker.coord, { anchor: 'bottom', offset: [0, 9] });
      continue;
    }
    if (marker.kind === 'pulse') {
      const element = document.createElement('div');
      element.className = 'map-pulse';
      element.innerHTML = PULSE_SVG;
      add(element, marker.coord, { anchor: 'center' });
      continue;
    }
    const glyph = document.createElement('div');
    glyph.innerHTML = GLYPHS[marker.kind];
    add(glyph, marker.coord, { anchor: 'center' });
    if (marker.kind === 'stop' || !marker.label) continue;
    const onPress = marker.isPressable
      ? () => handlers.current.onMarkerPress?.(marker.id)
      : undefined;
    const opensRight = (marker.kind === 'pickup') === pickupOnLeft;
    const lift = marker.kind === 'dropoff' ? [17, -21] : [12, -12];
    add(labelElement(marker.label, marker.sublabel, onPress), marker.coord, {
      anchor: opensRight ? 'bottom-left' : 'bottom-right',
      offset: opensRight ? [-lift[0], lift[1]] : [lift[0], lift[1]],
    });
  }
}
