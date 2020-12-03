import * as THREE from "three";
import { gsap, Power1, Power2, Power3, Power4, Expo } from "gsap";

const NODE_RADIUS = 10;
const PHOTO_RADIUS = 8;

export default (scene, data) => {
  console.log(data);

  //Pivot
  const pivot = new THREE.Object3D();
  pivot.position.set(data.position.x, data.position.y, 0);
  scene.add(pivot);

  //Background circle shape
  const background = new THREE.Mesh(
    new THREE.CircleGeometry(NODE_RADIUS, 64),
    new THREE.MeshBasicMaterial({ color: data.color })
  );
  background.scale.set(0, 0, 0);
  pivot.add(background);

  //Photo
  const photo = new THREE.Mesh(
    new THREE.CircleGeometry(PHOTO_RADIUS, 64),
    new THREE.MeshBasicMaterial({ map: data.texture })
  );
  photo.scale.set(0, 0, 0);
  pivot.add(photo);

  //Start animation
  function startTrigger() {
    //bg
    gsap.to(background.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.3,
      delay: data.delay - 0.3,
      ease: Power4.easeOut,
      onUpdate() {
        window.requestRenderIfNotRequested();
      },
    });

    //photo
    gsap.to(photo.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1,
        delay: data.delay - 0.3 + 0.5,
        ease: Power3.easeOut,
        onUpdate() {
          window.requestRenderIfNotRequested();
        },
      });
  }

  startTrigger();

  return {};
};
