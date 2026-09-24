import { createContext, type RefObject, use, useLayoutEffect } from 'react';
import type { MapHandlers, MapScene } from '@/components/MapView';

type MapStage = { show: (scene: MapScene) => void; handlers: RefObject<MapHandlers> };

export const MapStageContext = createContext<MapStage | null>(null);

// Hands the one map on Home what this step wants shown and where its taps should go. The
// map keeps the last scene while a step without one, like Where to, covers it.
export function useMapScene(scene: MapScene, handlers: MapHandlers = {}) {
  const stage = use(MapStageContext);
  if (!stage) throw new Error('useMapScene must be used inside Home');
  const sceneKey = JSON.stringify(scene);

  // Layout effects, so the camera and markers change in the same frame as the sheet.
  useLayoutEffect(() => {
    stage.show(JSON.parse(sceneKey));
  }, [stage, sceneKey]);

  useLayoutEffect(() => {
    stage.handlers.current = handlers;
  });

  useLayoutEffect(() => {
    return () => {
      stage.handlers.current = {};
    };
  }, [stage]);
}
