import { useEffect, useRef } from "react";
import Spline from "@splinetool/react-spline";

const sceneUrl = import.meta.env.VITE_SPLINE_SCENE_URL;

export default function SplineCardScene({ className = "" }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const isInsideWrapper = (event) => {
      const target = event.target;
      return target instanceof Node && wrapper.contains(target);
    };

    const blockZoom = (event) => {
      if (!isInsideWrapper(event)) return;

      event.preventDefault();
      event.stopPropagation();
    };

    const blockRotateDrag = (event) => {
      if (!isInsideWrapper(event)) return;

      const draggingWithMouse = "buttons" in event && event.buttons > 0;
      const touchEvent = event.type.startsWith("touch");
      if (!draggingWithMouse && !touchEvent && event.type !== "pointerdown" && event.type !== "mousedown") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener("wheel", blockZoom, { passive: false, capture: true });
    document.addEventListener("gesturestart", blockZoom, { passive: false, capture: true });
    document.addEventListener("gesturechange", blockZoom, { passive: false, capture: true });
    document.addEventListener("dblclick", blockZoom, { passive: false, capture: true });

    document.addEventListener("pointerdown", blockRotateDrag, { passive: false, capture: true });
    document.addEventListener("mousedown", blockRotateDrag, { passive: false, capture: true });
    document.addEventListener("touchstart", blockRotateDrag, { passive: false, capture: true });
    document.addEventListener("touchmove", blockRotateDrag, { passive: false, capture: true });
    document.addEventListener("pointermove", blockRotateDrag, { passive: false, capture: true });
    document.addEventListener("mousemove", blockRotateDrag, { passive: false, capture: true });

    return () => {
      document.removeEventListener("wheel", blockZoom, { capture: true });
      document.removeEventListener("gesturestart", blockZoom, { capture: true });
      document.removeEventListener("gesturechange", blockZoom, { capture: true });
      document.removeEventListener("dblclick", blockZoom, { capture: true });

      document.removeEventListener("pointerdown", blockRotateDrag, { capture: true });
      document.removeEventListener("mousedown", blockRotateDrag, { capture: true });
      document.removeEventListener("touchstart", blockRotateDrag, { capture: true });
      document.removeEventListener("touchmove", blockRotateDrag, { capture: true });
      document.removeEventListener("pointermove", blockRotateDrag, { capture: true });
      document.removeEventListener("mousemove", blockRotateDrag, { capture: true });
    };
  }, []);

  if (!sceneUrl) {
    return (
      <div
        ref={wrapperRef}
        onWheelCapture={(event) => event.preventDefault()}
        className={`flex h-full w-full items-center justify-center px-4 text-center text-xs font-medium text-blue-100/85 md:text-sm ${className}`}
      >
        Set VITE_SPLINE_SCENE_URL to show interactive 3D scene.
      </div>
    );
  }

  return (
    <div ref={wrapperRef} onWheelCapture={(event) => event.preventDefault()} className={className}>
      <Spline scene={sceneUrl} className="h-full w-full" />
    </div>
  );
}
