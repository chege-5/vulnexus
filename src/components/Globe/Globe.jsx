import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./Globe.css";

const DEG2RAD = Math.PI / 180;
const GLOBE_RADIUS = 1;

const COLORS = {
  scan: "#00f5ff",
  attack: "#ff004c",
  exploit: "#7c3aed",
  patch: "#00ff9c"
};

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function easeOut(v) {
  return 1 - Math.pow(1 - clamp(v, 0, 1), 3);
}

function latLngToVector3(lat, lon, radius = GLOBE_RADIUS) {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lon + 180) * DEG2RAD;

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function eventAt(index) {
  return {
    start: {
      lat: seededRandom(index * 11 + 1) * 180 - 90,
      long: seededRandom(index * 11 + 2) * 360 - 180
    },
    end: {
      lat: seededRandom(index * 11 + 3) * 180 - 90,
      long: seededRandom(index * 11 + 4) * 360 - 180
    },
    orbit: 1.2 + seededRandom(index * 11 + 5) * 0.25,
    delay: seededRandom(index * 11 + 6),
    color: Object.values(COLORS)[Math.floor(seededRandom(index * 11 + 7) * 4)]
  };
}

const EVENTS = Array.from({ length: 8 }, (_, index) => eventAt(index));

function Starfield() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(1000 * 3);

    for (let i = 0; i < 1000; i++) {
      const radius = 6 + seededRandom(i * 3 + 100) * 4;
      const theta = seededRandom(i * 3 + 101) * Math.PI * 2;
      const phi = Math.acos(seededRandom(i * 3 + 102) * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#ffffff"
        size={0.02}
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}

function WorldDots() {
  const meshRef = useRef();
  const count = 5000;

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    for (let i = 0; i < count; i++) {
      const lat = seededRandom(i * 2 + 5000) * 180 - 90;
      const lon = seededRandom(i * 2 + 5001) * 360 - 180;

      const pos = latLngToVector3(lat, lon, 1.01);
      dummy.position.copy(pos);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <circleGeometry args={[0.008, 6]} />
      <meshBasicMaterial
        color={COLORS.scan}
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

function PulseMarker({ location, color, progressRef }) {
  const mesh = useRef();

  const normal = useMemo(
    () => latLngToVector3(location.lat, location.long).normalize(),
    [location]
  );

  const position = useMemo(() => normal.clone().multiplyScalar(1.03), [normal]);

  useFrame(() => {
    const progress = progressRef.current;

    if (mesh.current) {
      const s = 0.3 + easeOut(progress) * 0.9;
      mesh.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.02, 12, 12]} />
      <meshBasicMaterial color={color} />
      <pointLight color={color} intensity={2} distance={0.4} />
    </mesh>
  );
}

function AnimatedArc({ event }) {
  const materialRef = useRef();
  const markerProgress = useRef(0);

  const start = useMemo(
    () => latLngToVector3(event.start.lat, event.start.long, 1.02),
    [event]
  );

  const end = useMemo(
    () => latLngToVector3(event.end.lat, event.end.long, 1.02),
    [event]
  );

  const curve = useMemo(() => {
    const mid = start
      .clone()
      .add(end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(event.orbit);

    return new THREE.CubicBezierCurve3(
      start,
      start.clone().lerp(mid, 0.5),
      end.clone().lerp(mid, 0.5),
      end
    );
  }, [start, end, event.orbit]);

  const geometry = useMemo(
    () => new THREE.TubeGeometry(curve, 64, 0.004, 6, false),
    [curve]
  );

  const total = geometry.attributes.position.count;

  useEffect(() => {
    geometry.setDrawRange(0, 0);
  }, [geometry]);

  useFrame(({ clock }) => {
    const cycle = (clock.getElapsedTime() * 0.2 + event.delay) % 1;

    const progress = cycle < 0.8 ? easeOut(cycle / 0.8) : 1;
    const draw = Math.floor(total * progress);

    geometry.setDrawRange(0, draw);
    markerProgress.current = cycle;

    if (materialRef.current) {
      materialRef.current.opacity = cycle < 0.9 ? 0.9 : 0.9 * (1 - (cycle - 0.9) / 0.1);
    }
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          ref={materialRef}
          color={event.color}
          emissive={event.color}
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>

      <PulseMarker
        location={event.end}
        color={event.color}
        progressRef={markerProgress}
      />
    </group>
  );
}

function GlobeScene() {
  const globeRef = useRef();

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    globeRef.current.rotation.y += delta * 0.08;
    globeRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
  });

  return (
    <>
      <Starfield />

      <group ref={globeRef}>
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
          <meshStandardMaterial
            color="#050505"
            roughness={1}
            metalness={0.2}
            emissive="#0a0a0a"
          />
        </mesh>

        <mesh scale={1.015}>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
          <meshBasicMaterial
            color={COLORS.scan}
            wireframe
            transparent
            opacity={0.05}
          />
        </mesh>

        <WorldDots />

        {EVENTS.map((e, i) => (
          <AnimatedArc key={i} event={e} />
        ))}
      </group>
    </>
  );
}

export default function Globe() {
  const [ready, setReady] = useState(false);

  const handleReady = useCallback(() => {
    setReady(true);
  }, []);

  return (
    <div className={`globe-container ${ready ? "ready" : ""}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 2, 4]} intensity={1.2} />
        <pointLight position={[-3, -3, -3]} intensity={0.3} />

        <GlobeScene onReady={handleReady} />
      </Canvas>
    </div>
  );
}
