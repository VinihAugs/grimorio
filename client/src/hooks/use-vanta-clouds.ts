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

interface VantaCloudsOptions {
  el: string | HTMLElement;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  backgroundColor?: number;
  skyColor?: number;
  cloudColor?: number;
  cloudShadowColor?: number;
  sunColor?: number;
  sunGlareColor?: number;
  sunlightColor?: number;
  speed?: number;
}

export function useVantaClouds(options: Partial<VantaCloudsOptions> = {}) {
  const vantaRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Aguardar um pouco para garantir que o DOM está montado
    const initTimer = setTimeout(() => {
      if (!containerRef.current) return;

      // Verificar se os scripts já foram carregados
      if (!window.VANTA || !window.THREE) {
        // Carregar scripts dinamicamente
        const threeScript = document.createElement("script");
        threeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
        threeScript.async = true;

        const vantaScript = document.createElement("script");
        vantaScript.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js";
        vantaScript.async = true;

        const loadVanta = () => {
          if (window.VANTA && window.THREE && containerRef.current) {
            if (vantaRef.current) {
              vantaRef.current.destroy();
            }
            if (window.VANTA.CLOUDS) {
              vantaRef.current = window.VANTA.CLOUDS({
                el: containerRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: true,
                minHeight: 200.0,
                minWidth: 200.0,
                // backgroundColor: 0x0,
                skyColor: 0xd2d41,
                cloudColor: 0x16753f,
                cloudShadowColor: 0xb2643,
                sunColor: 0x0,
                sunGlareColor: 0x80634,
                sunlightColor: 0x0,
                speed: 0.70,
                ...options,
              });
            }
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
        if (window.VANTA.CLOUDS) {
          vantaRef.current = window.VANTA.CLOUDS({
            el: containerRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: true,
            minHeight: 200.0,
            minWidth: 200.0,
            // backgroundColor: 0x0,
            skyColor: 0xd2d41,
            cloudColor: 0x16753f,
            cloudShadowColor: 0xb2643,
            sunColor: 0x0,
            sunGlareColor: 0x80634,
            sunlightColor: 0x0,
            speed: 0.70,
            ...options,
          });
        }
      }
    }, 200);

    return () => {
      clearTimeout(initTimer);
      if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    };
  }, []);

  return containerRef;
}
