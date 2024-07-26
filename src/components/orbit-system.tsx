import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface OrbitSystemProps {
  latitude: number;
  longitude: number;
}

export const OrbitSystem: React.FC<OrbitSystemProps> = ({
  latitude,
  longitude
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(300, 300);
    mount.appendChild(renderer.domElement);

    // Create a globe
    const globe = new ThreeGlobe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#3a228a")
      .atmosphereAltitude(0.25);

    scene.add(globe);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xbbbbbb);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Set up camera and controls
    camera.position.z = 300;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Add a point for the given latitude and longitude
    const pointData = [{ lat: latitude, lng: longitude, size: 0.5, color: "#330000" }];
    globe.pointsData(pointData);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
      mount.removeChild(renderer.domElement);
    };
  }, [latitude, longitude]);

  return <div ref={mountRef} />;
};
