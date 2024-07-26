import React, { useRef, useEffect } from "react";
import * as THREE from "three";

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
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(300, 300);
    mount.appendChild(renderer.domElement);

    // Create a sphere to represent the planet
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0077be, wireframe: true });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Create a small dot to represent the location
    const dotGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    scene.add(dot);

    camera.position.z = 3;

    // Function to update dot position
    const updateDotPosition = () => {
      const phi = (90 - latitude) * (Math.PI / 180);
      const theta = (longitude + 180) * (Math.PI / 180);

      dot.position.x = -Math.sin(phi) * Math.cos(theta);
      dot.position.y = Math.cos(phi);
      dot.position.z = Math.sin(phi) * Math.sin(theta);
    };

    // Initial position update
    updateDotPosition();

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      sphere.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
      mount.removeChild(renderer.domElement);
    };
  }, [latitude, longitude]); // Re-run effect when latitude or longitude changes

  return <div ref={mountRef} />;
};
