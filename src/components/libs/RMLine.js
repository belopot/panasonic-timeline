import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { gsap, Power1 } from "gsap";

const LINE_WIDTH = 60; //in pixels

function GetLineWidth(screenHeight) {
  var width = LINE_WIDTH;
  
  if (screenHeight > 0 && screenHeight <= 320) {
    width = 22;
  } else if (screenHeight > 320 && screenHeight <= 420) {
    width = 27;
  } else if (screenHeight > 420 && screenHeight <= 520) {
    width = 33;
  } else if (screenHeight > 520 && screenHeight <= 620) {
    width = 38;
  } else if (screenHeight > 620 && screenHeight <= 720) {
    width = 43;
  } else if (screenHeight > 720 && screenHeight <= 820) {
    width = 48;
  } else if (screenHeight > 820 && screenHeight <= 920) {
    width = 53;
  } else if (screenHeight > 920 && screenHeight <= 1020) {
    width = 58;
  } else if (screenHeight > 1020 && screenHeight <= 1120) {
    width = 60;
  } else {
    width = 60;
  }
  return width;
}

export default (scene, data) => {
  const startPoint = new THREE.Vector3(
    data.start.position.x,
    data.start.position.y,
    0
  );
  const endPoint = new THREE.Vector3(
    data.end.position.x,
    data.end.position.y,
    0
  );

  const drawPoint = new THREE.Vector3();
  drawPoint.copy(startPoint);

  const positions = [];
  positions.push(startPoint.x, startPoint.y, startPoint.z);
  positions.push(startPoint.x, startPoint.y, startPoint.z);

  const startColor = new THREE.Color(data.start.color);
  const endColor = new THREE.Color(data.end.color);
  const colors = [];
  colors.push(startColor.r, startColor.g, startColor.b);
  colors.push(endColor.r, endColor.g, endColor.b);

  const geometry = new LineGeometry();
  geometry.setPositions(positions);
  geometry.setColors(colors);

  const material = new LineMaterial({
    // color: 0xffffff,
    linewidth: LINE_WIDTH, // in pixels
    vertexColors: true,
    //resolution:  // to be set by renderer, eventually
    dashed: false,
  });

  const line = new Line2(geometry, material);
  line.computeLineDistances();
  line.position.z = -30;
  scene.add(line);

  // Start animation
  function startTrigger() {
    gsap.to(drawPoint, {
      x: endPoint.x,
      y: endPoint.y,
      z: endPoint.z,
      duration: 0.8,
      delay: data.delay,
      ease: "none",
      onUpdate() {
        const p = [];
        p.push(startPoint.x, startPoint.y, startPoint.z);
        p.push(drawPoint.x, drawPoint.y, drawPoint.z);
        line.geometry.setPositions(p);
        window.requestRenderIfNotRequested();
      },
    });
  }

  startTrigger();

  function update(screenWidth, screenHeight) {
    material.linewidth = GetLineWidth(screenHeight);
    material.resolution.set(screenWidth, screenHeight);
  }

  return { update };
};
