import React, { useRef, useEffect, useCallback, useMemo } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface OrbitSystemProps {
  latitude: number;
  longitude: number;
  dayOfYear: number;
}

export const OrbitSystem: React.FC<OrbitSystemProps> = ({
  latitude,
  longitude,
  dayOfYear
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const globeRef = useRef<ThreeGlobe>();
  const sunRef = useRef<THREE.Mesh>();
  const controlsRef = useRef<OrbitControls>();

  const calculateEarthPosition = useCallback((day: number) => {
    const angle = (day / 365) * Math.PI * 2;
    const radius = 200;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return new THREE.Vector3(x, 0, z);
  }, []);

  const pointData = useMemo(() => [
    { lat: latitude, lng: longitude, size: 5, color: "#00bb00" }
  ], [latitude, longitude]);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;

    // Set up scene, camera, and renderer
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(100, 1, 0.1, 1000);
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });

    rendererRef.current.setSize(500, 500);
    mount.appendChild(rendererRef.current.domElement);

    // Create a globe
    globeRef.current = new ThreeGlobe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png");

    const earthPosition = calculateEarthPosition(dayOfYear);
    globeRef.current.position.copy(earthPosition);
    sceneRef.current.add(globeRef.current);

    const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    sunRef.current = new THREE.Mesh(sunGeometry, sunMaterial);
    sceneRef.current.add(sunRef.current);

    const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight.position.set(0, 0, 0);
    sceneRef.current.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xbbbbbb, 2);
    sceneRef.current.add(ambientLight);

    // Set up camera and controls
    cameraRef.current.position.set(0, 300, 300);
    cameraRef.current.lookAt(sceneRef.current.position);
    controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    controlsRef.current.enableRotate = false;
    controlsRef.current.enableZoom = false;
    controlsRef.current.enablePan = false;

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.01;
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current) {
        mount.removeChild(rendererRef.current.domElement);
      }
    };
    /* TODO: Address legit es-lint warning by setting up isInitialized state and depend on that */
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const earthPosition = calculateEarthPosition(dayOfYear);
      globeRef.current.position.copy(earthPosition);
    }
  }, [dayOfYear, calculateEarthPosition]);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointsData(pointData);
    }
  }, [pointData]);

  return <div ref={mountRef} />;
};
