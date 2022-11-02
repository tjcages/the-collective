/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  Suspense,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  createRef,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { OrbitControls, Plane, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";

import styles from "../styles/map.module.scss";
import lerp from "@14islands/lerp";
import gsap from "gsap";

import archivesData from "./temporary/archivesData";

import Effects, {
  myLensDistortionPass,
} from "./temporary/shared/three/Effects";

import DistortionMaterial from "./temporary/shared/three/DistortionMaterial";
import GradientMaterial from "./temporary/shared/three/GradientMaterial";
import { motion } from "framer-motion";
import { useMediaQuery } from "beautiful-react-hooks";

extend({ DistortionMaterial });
extend({ GradientMaterial });

const vec3 = new THREE.Vector3();

const shaderRef = createRef();
// const filterRef = createRef();
const controlsRef = createRef();

let speed = createRef(0);
let projectIsOpened = createRef();

function visibleBox(camera, z) {
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const height = t * 2 * (camera.position.z - z);
  const width = height * camera.aspect;
  return { width, height };
}

const isColliding = (items, testedItem) => {
  const spacing = 1.7;
  let colliding = false;
  for (const item of items) {
    if (
      testedItem.x < item.x + item.width * spacing &&
      testedItem.x + testedItem.width * spacing > item.x &&
      testedItem.y < item.y + item.height * spacing &&
      testedItem.height * spacing + testedItem.y > item.y
    ) {
      colliding = true;
    }
  }
  return colliding;
};

const getNewPosition = (item, minRadius) => {
  vec3
    .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
    .normalize()
    .multiplyScalar(minRadius);
  return { x: vec3.x, y: vec3.y };
};

function ShaderPlane(props) {
  const { width, height, x, y } = props.itemData;

  const camera = useThree((state) => state.camera);

  const meshRef = useRef();
  const matRef = useRef();
  const domTextRef = useRef();
  const domLinkRef = useRef();
  const clickOutPlaneRef = useRef();

  const [hovering, setHovering] = useState(false);
  // only using an object because thats what gsap wants
  const hoverValue = useRef({ value: 0 });

  const openTl = useRef(null);
  const closeTl = useRef(null);

  const isSmallDesktop = useMediaQuery("(max-width: 1440px)");
  const isTablet = useMediaQuery("(min-width: 480px) and (max-width: 960px)");
  const isMobile = useMediaQuery("(max-width: 479px)");
  
  const zoomOffset = isMobile
    ? 0.99
    : isTablet
    ? 0.8
    : isSmallDesktop
    ? 0.9
    : 0.6

  // painting data
  const split = props.project.title.split(", ");
  const title = split[1] ? split[1] : split[0];

  const closeProject = useCallback(() => {
    controlsRef.current.enabled = true;

    if (openTl.current) {
      openTl.current.progress(1);
    }

    closeTl.current = gsap
      .timeline({
        onComplete: () => {
          props.openProject(false, title);
          projectIsOpened.current = {
            isOpened: false,
            id: null,
          };
        },
      })
      .addLabel("sync1")
      .to(domTextRef.current, { opacity: 0, duration: 0.4 }, "sync1")
      .to(domLinkRef.current, { opacity: 0, duration: 0.25 }, "sync1")
      .set(
        clickOutPlaneRef.current.scale,
        { x: 0.01, y: 0.01, z: 0.01 },
        "sync1"
      )
      .to(
        meshRef.current.position,
        {
          x,
          y,
          z: 0,
          duration: 0.5,
          ease: "Power3.easeOut",
        },
        "-=0.15"
      )
      .to(domTextRef.current, { opacity: 0, duration: 0.25 }, "sync1")
      .to(domLinkRef.current, { opacity: 0, duration: 0.25 }, "sync1");
  }, []);

  const openProject = useCallback(() => {
    controlsRef.current.enabled = false;

    var vec = new THREE.Vector3();
    vec.set(1.5, 0.5, -1);
    vec.unproject(camera);

    openTl.current = gsap
      .timeline({
        onStart: () => {
          props.openProject(true, title);
          setHovering(false);

          projectIsOpened.current = {
            isOpened: true,
            id: props.project.id,
          };
        },
      })
      .to(meshRef.current.position, {
        x: vec.x,
        y: vec.y,
        z: camera.position.z - zoomOffset,
        duration: 0.5,
        ease: "Power3.easeOut",
      })
      .addLabel("sync", "-=0.3")
      .set(clickOutPlaneRef.current.scale, { x: 50, y: 50, z: 50 }, "sync")
      .addLabel("sync2", "-=0.2")
      .to(domTextRef.current, { opacity: 1, duration: 0.25 }, "sync2")
      .to(domLinkRef.current, { opacity: 1, duration: 0.25 }, "sync2");
  }, []);

  const clickHandler = useCallback((e) => {
    e.stopPropagation();
    if (
      projectIsOpened.current.isOpened &&
      projectIsOpened.current.id !== props.project.id
    )
      return;

    if (projectIsOpened.current.isOpened && !props.selfIsOpened) {
      closeProject();
    } else {
      openProject();
    }
  }, []);

  const handleClickOut = useCallback(() => {
    if (
      projectIsOpened.current.isOpened &&
      projectIsOpened.current.id !== props.project.id
    )
      return;

    if (projectIsOpened.current.isOpened && !props.selfIsOpened) {
      closeProject();
    }
  }, []);

  useFrame((_, delta) => {
    matRef.current.time += delta;
    matRef.current.speed = speed.current * 10;

    if (
      props.selfIsOpened &&
      projectIsOpened.current.id &&
      projectIsOpened.current.id !== props.project.id
    ) {
      const newOpacity = matRef.current.opacity - 0.05;
      matRef.current.opacity = newOpacity > 0 ? newOpacity : 0;
      shaderRef.current.opacity = newOpacity > 0.3 ? newOpacity : 0.3;
    } else {
      const newOpacity = matRef.current.opacity + 0.05;
      matRef.current.opacity = newOpacity > 1 ? 1 : newOpacity;
      shaderRef.current.opacity = newOpacity > 0.2 ? 0.2 : newOpacity;
    }
  });

  useLayoutEffect(() => {
    let tween;

    if (hoverValue.current && !projectIsOpened.current.isOpened) {
      tween = gsap.to(hoverValue.current, {
        value: hovering ? 1 : 0,
        onUpdate: () => {},
      });
    }
    return () => {
      tween && tween.kill();
    };
  }, []);

  useEffect(() => {
    const closeProjectWithKey = (e) => {
      e.key === "Escape" && handleClickOut();
    };
    window.addEventListener("keydown", closeProjectWithKey);

    return () => {
      window.removeEventListener("keydown", closeProjectWithKey);
    };
  }, []);

  return (
    <mesh
      {...props}
      onClick={clickHandler}
      onPointerOver={() => !props.selfIsOpened && setHovering(true)}
      onPointerOut={() => !props.selfIsOpened && setHovering(false)}
      ref={meshRef}
      position={[x, y, 0]}
      transparent={true}
    >
      <planeGeometry args={[width, height, 32, 32]} />
      <distortionMaterial
        opacity={1}
        frameAspect={width / height}
        textureAspect={
          props.texture.image.naturalWidth / props.texture.image.naturalHeight
        }
        ref={matRef}
        tex={props.texture}
        transparent={true}
      />
      <Plane
        ref={clickOutPlaneRef}
        onPointerOver={() => props.selfIsOpened && setHovering(true)}
        onPointerOut={() => props.selfIsOpened && setHovering(false)}
        onClick={handleClickOut}
        position-z={-0.001}
        args={[1, 1]}
      >
        <meshNormalMaterial transparent={true} opacity={0} attach="material" />
      </Plane>
      <Html
        ref={domTextRef}
        position={[-width / 2, -height / 2, 0]}
        className={`${styles.archiveItem} ${
          !props.selfIsOpened && styles.hidden
        }`}
      >
        <motion.div className={styles.wrapper}>
          <h1 className={styles.title}>{title}</h1>
        </motion.div>
      </Html>
    </mesh>
  );
}

const _v = new THREE.Vector3();
const panMargin = -2;

const Scene = (props) => {
  const camera = useThree((state) => state.camera);

  const covers = useTexture(
    archivesData.map((archiveItem) => archiveItem.coverImg)
  );
  const [itemsData, setItemsData] = useState([]);

  const lastPos = useRef(new THREE.Vector3(0, 0, 0));
  const isHolding = useRef(false);
  const distortionStrength = useRef(0);
  const focalStrength = useRef(1);

  const camBox = useRef();
  const canvasBox = useRef();

  const panLimits = useRef({
    min: new THREE.Vector3(-10, -10, -10),
    max: new THREE.Vector3(10, 10, 10),
  });

  useFrame(({ camera }, delta) => {
    speed.current = lerp(
      speed.current,
      camera.position.distanceTo(lastPos.current),
      0.2,
      delta
    );
    lastPos.current.copy(camera.position);

    const focalValue =
      isHolding.current && !projectIsOpened.current.isOpened ? -0.1 : 0;
    focalStrength.current = lerp(focalStrength.current, focalValue, 0.4, delta);

    let distortionValue =
      isHolding.current && !projectIsOpened.current.isOpened ? 0.2 : 0;
    distortionValue += speed.current * 3;
    distortionStrength.current = lerp(
      distortionStrength.current,
      distortionValue,
      0.2,
      delta
    );
    myLensDistortionPass.distortion.set(
      distortionStrength.current,
      distortionStrength.current
    );
    myLensDistortionPass.focalLength.set(
      1 - focalStrength.current,
      1 - focalStrength.current
    );

    if (shaderRef.current) {
      shaderRef.current.time += delta;
      shaderRef.current.resolution = new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      );
    }
  });

  useEffect(() => {
    if (!covers) return;

    let items = [];

    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    covers.forEach((cover, index) => {
      let size;
      const ratio = cover.image.naturalWidth / cover.image.naturalHeight;

      if (ratio < 1) {
        size = { width: 2 * ratio, height: 2 };
      } else size = { width: 2, height: 2 / ratio };

      let item = { x: 0, y: 0, width: size.width, height: size.height };

      if (index === 0) {
        items.push(item);
        return;
      }

      let positionIsValid = false;

      let numberOfTests = 0;
      let minRadius = 2;

      let tempPos;

      while (!positionIsValid) {
        tempPos = getNewPosition(item, minRadius);
        // add space for the text in height
        positionIsValid = !isColliding(items, {
          ...tempPos,
          width: item.width,
          height: item.height + 0.35,
        });

        numberOfTests++;
        if (numberOfTests > 10) minRadius += 0.1;
      }

      minX = Math.min(minX, tempPos.x - item.width);
      maxX = Math.max(maxX, tempPos.x + item.width);
      minY = Math.min(minY, tempPos.y - item.height);
      maxY = Math.max(maxY, tempPos.y + item.height);

      items.push({ ...item, ...tempPos });
    });

    panLimits.current.min.set(minX - panMargin, minY - panMargin, -10);
    panLimits.current.max.set(maxX + panMargin, maxY + panMargin, 10);

    canvasBox.current = {
      width: maxX - minX,
      height: maxY - minY,
    };

    camBox.current = visibleBox(camera, 0);

    setItemsData(items);
  }, [covers]);

  // ENFORCE PAN LIMITS
  useLayoutEffect(() => {
    const handlePan = () => {
      _v.copy(controlsRef.current.target);
      controlsRef.current.target.clamp(
        panLimits.current.min,
        panLimits.current.max
      );
      _v.sub(controlsRef.current.target);
      camera.position.sub(_v);
    };

    controlsRef.current.addEventListener("change", handlePan);
    return () => controlsRef.current.removeEventListener("change", handlePan);
  }, [camera.position]);

  // INIT
  useEffect(() => {
    projectIsOpened.current = {
      isOpened: false,
      id: null,
    };

    speed.current = 1000;
  }, []);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        panSpeed={2}
        mouseButtons={{ LEFT: THREE.MOUSE.PAN }}
        touches={{ ONE: THREE.TOUCH.PAN }}
        enableRotate={false}
        enableZoom={true}
        screenSpacePanning={true}
        minDistance={1.2}
        maxDistance={1.8}
      />
      <Plane position-z={-1} args={[50, 50]}>
        <gradientMaterial
          ref={shaderRef}
          resolution={new THREE.Vector2()}
          transparent={true}
        />
      </Plane>
      <group>
        <Plane
          onPointerDown={() => (isHolding.current = true)}
          onPointerUp={() => (isHolding.current = false)}
          visible={false}
          position-z={10}
          args={[50, 50]}
        />
        {itemsData.length &&
          archivesData.map((project, index) => (
            <ShaderPlane
              {...props}
              itemData={itemsData[index]}
              index={index}
              key={project.name + index}
              texture={covers[index]}
              project={archivesData[index]}
            />
          ))}
      </group>
    </>
  );
};

const Map = (props) => {
  return (
    <div className={styles.container}>
      <Canvas
        dpr={[1, 1.1]}
        mode="concurrent"
        camera={{ position: [0, 0, 1.8], fov: 140, far: 10 }}
      >
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
        <Effects />
      </Canvas>
    </div>
  );
};
export default Map;
