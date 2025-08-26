// VantaBackground.js
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import WAVES from "vanta/dist/vanta.waves.min";
import "./VantaBackground.css";

export default function VantaBackground({ children }) {
  const vantaRef = useRef(null);

  useEffect(() => {
    const effect = WAVES({
      el: vantaRef.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x5788, // main wave color
      shininess: 50.0,
      waveHeight: 20.0,
      waveSpeed: 1.0,
      zoom: 0.75,
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
