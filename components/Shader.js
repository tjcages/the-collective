import React, { useEffect } from "react";
import * as THREE from "three";
import styles from "../styles/shader.module.scss";

import vs from "./glsl/shader.vert";
import fs from "./glsl/shader.frag"

const Shader = () => {
  var canvas;
  var camera, scene, renderer;
  var uniforms;

  useEffect(() => {
    init();
    animate();
  });

  function init() {
    canvas = document.getElementById("container");
    renderer = new THREE.WebGL1Renderer({
      antialias: false,
      canvas: canvas,
    });

    camera = new THREE.Camera();
    camera.position.z = 1;

    scene = new THREE.Scene();

    var geometry = new THREE.PlaneGeometry(2, 2);

    uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    };

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vs,
      fragmentShader: fs,
    });

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(document.body.clientWidth, window.innerHeight);

    onWindowResize();
    window.addEventListener("resize", onWindowResize, false);
  }

  function onWindowResize(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    uniforms.time.value += 0.01;
    renderer.render(scene, camera);
  }

  return <canvas id="container" className={styles.main} />
};

export default Shader;
