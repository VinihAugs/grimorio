import { useEffect, useRef } from "react";

declare global {
  interface Window {
    VANTA: {
      CELLS?: (options: any) => any;
      CLOUDS?: (options: any) => any;
    };
    THREE: any;
  }
}

interface VantaCellsOptions {
  el: string | HTMLElement;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  color1?: number;
  color2?: number;
  speed?: number;
  size?: number;
}

export function useVantaCells(options: Partial<VantaCellsOptions> = {}) {
  const vantaRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Verificar se os scripts já foram carregados
    if (!window.VANTA || !window.THREE) {
      // Carregar scripts dinamicamente
      const threeScript = document.createElement("script");
      threeScript.src = "https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js";
      threeScript.async = true;

      const vantaScript = document.createElement("script");
      vantaScript.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.cells.min.js";
      vantaScript.async = true;

      const loadVanta = () => {
        if (window.VANTA && window.THREE && containerRef.current) {
          if (vantaRef.current) {
            vantaRef.current.destroy();
          }
          vantaRef.current = window.VANTA.CELLS?.({
            el: containerRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            color1: 0x6430d,
            color2: 0x59843e,
            speed: 1.0,
            size: 1.5,
            ...options,
          });
        }
      };

      threeScript.onload = () => {
        vantaScript.onload = loadVanta;
        document.body.appendChild(vantaScript);
      };
      document.body.appendChild(threeScript);
    } else {
      // Scripts já carregados, inicializar diretamente
      if (vantaRef.current) {
        vantaRef.current.destroy();
      }
      if (window.VANTA.CELLS) {
        vantaRef.current = window.VANTA.CELLS({
          el: containerRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          color1: 0x6430d,
          color2: 0x59843e,
          speed: 1.0,
          size: 1.5,
          ...options,
        });
      }
    }

    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    };
  }, []);

  return containerRef;
}

