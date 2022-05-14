import * as THREE from "three"
// eslint-disable-next-line
import { gsap, Power1, Power2, Power3, Power4, Expo } from "gsap"
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer"
import { isMobile } from "react-device-detect"

const NODE_RADIUS = 12.5
const PHOTO_RADIUS = 10
const ANNO_DELTA_DIS = isMobile ? NODE_RADIUS * 1.6 : NODE_RADIUS * 1.5

export default (scene, data) => {
  //Pivot
  const pivot = new THREE.Object3D()
  pivot.position.set(data.position.x, data.position.y, -10)
  scene.add(pivot)

  //Background circle shape
  const background = new THREE.Mesh(
    new THREE.CircleGeometry(NODE_RADIUS, 64),
    new THREE.MeshBasicMaterial({ color: data.color })
  )
  background.scale.set(0, 0, 0)
  pivot.add(background)

  //Photo
  const photo = new THREE.Mesh(
    new THREE.CircleGeometry(PHOTO_RADIUS, 64),
    new THREE.MeshBasicMaterial({ map: data.texture })
  )
  photo.scale.set(0, 0, 0)
  photo.position.z = 1
  pivot.add(photo)
  photo.hotspot = data.hotspot

  //Annotation
  function createAnnotation() {
    const div = document.createElement("div")
    div.classList.add("rmNodeAnno")

    const span = document.createElement("span")
    span.innerHTML = data.title
    span.classList.add("animate__animated", "animate__fadeInUp")
    div.append(span)

    const annotation = new CSS2DObject(div)
    annotation.position.set(data.annoDir.x * ANNO_DELTA_DIS, data.annoDir.y * ANNO_DELTA_DIS, 0)
    pivot.add(annotation)
  }

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
        window.requestRenderIfNotRequested()
      }
    })

    //photo
    gsap.to(photo.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1,
      delay: data.delay - 0.3 + 0.5,
      ease: Power3.easeOut,
      onStart() {
        createAnnotation()
      },
      onUpdate() {
        window.requestRenderIfNotRequested()
      }
    })
  }

  startTrigger()

  return { intersect: photo }
}
