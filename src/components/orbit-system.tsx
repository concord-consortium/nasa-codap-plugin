import React, { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(100, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(500, 500);
    mount.appendChild(renderer.domElement);

    // Create a globe
    const globe = new ThreeGlobe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png");

    const calculateEarthPosition = (day: number) => {
      const angle = (day / 365) * Math.PI * 2;
      const radius = 200;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return new THREE.Vector3(x, 0, z);
    };

    const earthPosition = calculateEarthPosition(dayOfYear);
    globe.position.copy(earthPosition);
    scene.add(globe);

    const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const pointLight = new THREE.PointLight(0xffffff, 2, 1000); // Bright light
    pointLight.position.set(0, 0, 0); // Position at the sun
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xbbbbbb, 2);
    scene.add(ambientLight);

    // Set up camera and controls
    camera.position.set(0, 300, 300);
    camera.lookAt(scene.position);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;

    // Add a point for the given latitude and longitude
    const pointData = [{ lat: latitude, lng: longitude, size: 5, color: "#00bb00" }];
    globe.pointsData(pointData);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      globe.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
      mount.removeChild(renderer.domElement);
    };
  }, [latitude, longitude, dayOfYear]);

  return <div ref={mountRef} />;
};
