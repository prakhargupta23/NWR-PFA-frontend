import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import BIRDS from "vanta/dist/vanta.birds.min";
import "./VantaBackground.css";

export default function VantaBackground({ children }) {
  const vantaRef = useRef(null);

  useEffect(() => {
    const effect = BIRDS({
      el: vantaRef.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color1: 0x8fd3ff, // light blue
      color2: 0xbbe7ff, // lighter blue
      quantity: 10.0, // more birds
      backgroundAlpha: 0.0, // draw over page bg
      birdSize: 1, // larger for visibility
      separation: 50.0,
      alignment: 50.0,
      cohesion: 50.0,
    });

    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  return (
    <main>
      <div className="background" ref={vantaRef} />
      <div className="content">{children}</div>
    </main>
  );
}
