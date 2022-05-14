import React, { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import * as THREE from "three"
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer"
import * as POSTPROCESSING from "postprocessing"
import { gsap, Power2 } from "gsap"
import RMLine from "./libs/RMLine"
import RMNode from "./libs/RMNode"
import DescriptionModal from "components/DescriptionModal"
import "animate.css"
import ArrowButton from "components/ArrowButton"
import Composer from "./libs/composer/Composer"

let composer
let assets = { "smaa-search": null, "smaa-area": null }

function ProductRoadmap({ dataset }) {
  const canvasHolderRef = useRef(null)
  const [isOpenDesModal, setIsOpenDesModal] = useState(false)
  const [modalData, setModalData] = useState({})
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    let width = canvasHolderRef.current.offsetWidth
    let height = canvasHolderRef.current.offsetHeight
    setIsPortrait(height > width)

    // eslint-disable-next-line
    const clock = new THREE.Clock()
    const rayCaster = new THREE.Raycaster()
    let intersects = []
    let rmLines = []
    let rmNodes = []
    /**
     * Scene
     */
    const scene = new THREE.Scene()
    // scene.background = new THREE.Color(0x000000)
    // scene.fog = new THREE.Fog(0xa0a0a0, 30, 64);

    /**
     * Lighter
     */
    // let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    // scene.add(hemiLight);

    /**
     * Helper
     */
    //Axis
    // const axisHelper = new THREE.AxesHelper(150);
    // scene.add(axisHelper);

    //Cube
    const geometry = new THREE.CircleGeometry(10, 64)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const baseObj = new THREE.Mesh(geometry, material)
    baseObj.position.set(0, 0, 0)
    // scene.add(baseObj);

    /**
     * Renderer
     */
    //3D renderer
    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      stencil: false,
      depth: false,
      alpha: true
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0xff0000, 0)
    // renderer.physicallyCorrectLights = true
    // renderer.toneMapping = THREE.ACESFilmicToneMapping
    // renderer.outputEncoding = THREE.sRGBEncoding
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // renderer.shadowMap.enabled = true
    renderer.setSize(width, height, false)

    canvasHolderRef.current.appendChild(renderer.domElement)

    //2D renderer
    const renderer2D = new CSS2DRenderer()
    renderer2D.setSize(width, height)
    renderer2D.domElement.className = "renderer2D"
    canvasHolderRef.current.appendChild(renderer2D.domElement)

    //Mouse&Touch event
    function onMouseDown(event) {}
    function onMouseUp(event) {
      const pickedPoint = new THREE.Vector2(
        (event.offsetX / width) * 2 - 1,
        -(event.offsetY / height) * 2 + 1
      )
      rayCaster.setFromCamera(pickedPoint, camera)
      let pickedObjs = rayCaster.intersectObjects(intersects)
      if (pickedObjs.length > 0) {
        //Show pop up
        setModalData(pickedObjs[0].object.hotspot)
        setIsOpenDesModal(true)
      }
    }
    function onMouseMove(event) {
      const pickedPoint = new THREE.Vector2(
        (event.offsetX / width) * 2 - 1,
        -(event.offsetY / height) * 2 + 1
      )

      rayCaster.setFromCamera(pickedPoint, camera)

      let pickedObjs = rayCaster.intersectObjects(intersects)
      if (pickedObjs.length > 0) {
        document.body.style.cursor = "pointer"
      } else {
        document.body.style.cursor = "default"
      }
    }

    function onTouchStart(event) {}
    function onTouchEnd(event) {
      const pickedPoint = new THREE.Vector2(
        (event.changedTouches[0].pageX / width) * 2 - 1,
        -(event.changedTouches[0].pageY / height) * 2 + 1
      )
      rayCaster.setFromCamera(pickedPoint, camera)
      let pickedObjs = rayCaster.intersectObjects(intersects)
      if (pickedObjs.length > 0) {
        //Show pop up
        setModalData(pickedObjs[0].object.hotspot)
        setIsOpenDesModal(true)
      }
    }
    function onTouchMove() {}

    renderer.domElement.addEventListener("mousedown", onMouseDown)
    renderer.domElement.addEventListener("mouseup", onMouseUp)
    renderer.domElement.addEventListener("mousemove", onMouseMove)

    renderer.domElement.addEventListener("touchstart", onTouchStart)
    renderer.domElement.addEventListener("touchend", onTouchEnd)
    renderer.domElement.addEventListener("touchmove", onTouchMove)

    /**
     * Camera
     */
    // frustumSize is the height of screen
    let frustumSize = 160
    let aspect = width / height
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      -100,
      100
    )

    //cam positions for portrait
    const VIEWPORT_LOCATIONS = [
      new THREE.Vector3(-70, 0, 0),
      new THREE.Vector3(-16.9, 0, 0),
      new THREE.Vector3(16.9, 0, 0),
      new THREE.Vector3(70, 0, 0)
    ]
    let curViewportIdx = 0

    function initCamPos() {
      camera.position.set(0, 0, 0)
      if (height > width) {
        camera.position.set(
          VIEWPORT_LOCATIONS[curViewportIdx].x,
          VIEWPORT_LOCATIONS[curViewportIdx].y,
          VIEWPORT_LOCATIONS[curViewportIdx].z
        )
      }
    }

    function nextViewport() {
      let idx = curViewportIdx
      idx++
      if (idx > VIEWPORT_LOCATIONS.length - 1) {
        idx = VIEWPORT_LOCATIONS.length - 1
      }
      if (idx === curViewportIdx) return

      curViewportIdx = idx

      gsap.killTweensOf(camera.position)
      gsap.to(camera.position, {
        x: VIEWPORT_LOCATIONS[curViewportIdx].x,
        y: VIEWPORT_LOCATIONS[curViewportIdx].y,
        z: VIEWPORT_LOCATIONS[curViewportIdx].z,
        duration: 1,
        delay: 0,
        ease: Power2.easeOut,
        onUpdate() {
          requestRenderIfNotRequested()
        }
      })
    }
    window.nextViewport = nextViewport

    function prevViewport() {
      let idx = curViewportIdx
      idx--
      if (idx < 0) {
        idx = 0
      }
      if (idx === curViewportIdx) return

      curViewportIdx = idx

      gsap.killTweensOf(camera.position)
      gsap.to(camera.position, {
        x: VIEWPORT_LOCATIONS[curViewportIdx].x,
        y: VIEWPORT_LOCATIONS[curViewportIdx].y,
        z: VIEWPORT_LOCATIONS[curViewportIdx].z,
        duration: 1,
        delay: 0,
        ease: Power2.easeOut,
        onUpdate() {
          requestRenderIfNotRequested()
        }
      })
    }
    window.prevViewport = prevViewport

    /**
     * Resize & Render
     */
    function resizeRendererToDisplaySize() {
      const canvasWidth = renderer.domElement.offsetWidth
      const canvasHeight = renderer.domElement.offsetHeight
      const needResize = canvasWidth !== width || canvasHeight !== height
      if (needResize) {
        width = canvasWidth
        height = canvasHeight
        aspect = width / height
        camera.left = (-frustumSize * aspect) / 2
        camera.right = (frustumSize * aspect) / 2
        camera.top = frustumSize / 2
        camera.bottom = -frustumSize / 2
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        renderer2D.setSize(width, height)
        composer.setSize(width, height)
        setIsPortrait(height > width)
        initCamPos()
      }
    }

    let renderRequested = false
    function render() {
      renderRequested = false
      resizeRendererToDisplaySize()

      //Update rmLine
      for (let i in rmLines) {
        rmLines[i].update(width, height)
      }

      renderer2D.render(scene, camera)
      renderer.render(scene, camera)
      if (composer) {
        composer.render(clock.getDelta())
      }
    }

    function requestRenderIfNotRequested() {
      if (!renderRequested) {
        renderRequested = true
        requestAnimationFrame(render)
      }
    }
    window.requestRenderIfNotRequested = requestRenderIfNotRequested

    const IntervalRMLine = 1
    function generateRMLines() {
      //Generate line data from node data
      const dataset_line = []
      for (let i in dataset) {
        const k = i - 1
        if (k < 0) continue
        const data = {
          start: {
            title: dataset[k].title,
            texture: dataset[k].texture,
            position: dataset[k].position,
            color: dataset[k].color
          },
          end: {
            title: dataset[i].title,
            texture: dataset[i].texture,
            position: dataset[i].position,
            color: dataset[i].color
          }
        }
        dataset_line.push(data)
      }

      //Create rmlines
      for (let i in dataset_line) {
        dataset_line[i].delay = i * IntervalRMLine
        const rmLine = RMLine(scene, dataset_line[i])
        rmLines.push(rmLine)
      }
    }

    const IntervalRMNode = 1
    function generateRMNodes() {
      for (let i in dataset) {
        dataset[i].delay = i * IntervalRMNode
        const rmNode = RMNode(scene, dataset[i])
        rmNodes.push(rmNode)
        intersects.push(rmNode.intersect)
      }
    }

    /**
     * Load Assets
     */
    const loadingManager = new THREE.LoadingManager()
    loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {}
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {}
    loadingManager.onLoad = () => {
      //Install composer
      composer = new Composer(renderer, scene, camera, assets)

      initCamPos()

      requestRenderIfNotRequested()
      generateRMLines()
      generateRMNodes()
    }

    //Load smaa images
    const smaaImageLoader = new POSTPROCESSING.SMAAImageLoader(loadingManager)
    smaaImageLoader.load(([search, area]) => {
      assets["smaa-search"] = search
      assets["smaa-area"] = area
    })

    //Load textures
    const textureLoader = new THREE.TextureLoader(loadingManager)
    for (let i in dataset) {
      dataset[i].texture = textureLoader.load(dataset[i].texturePath)
    }

    /**
     * RenderEvent & Dispose
     */
    window.addEventListener("resize", requestRenderIfNotRequested)
    return () => {
      window.removeEventListener("resize", requestRenderIfNotRequested)
      if (canvasHolderRef.current) canvasHolderRef.current.innerHTML = ""
    }
  }, [])

  return (
    <Holder>
      <DescriptionModal
        modalIsOpen={isOpenDesModal}
        onRequestClose={() => {
          setIsOpenDesModal(false)
        }}
        modalData={modalData}
      />
      {isPortrait && (
        <>
          <NextButton
            onClick={() => {
              window.nextViewport()
            }}
          />
          <PrevButton
            onClick={() => {
              window.prevViewport()
            }}
          />
        </>
      )}
      <CanvasHolder ref={canvasHolderRef} />
    </Holder>
  )
}

export default ProductRoadmap

const Holder = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`

const CanvasHolder = styled.div`
  width: 100%;
  height: 100%;
  canvas {
    width: 100% !important;
    height: 100% !important;
    background-color: #212121;
  }
`

const NextButton = styled(ArrowButton)`
  position: absolute;
  top: 50%;
  right: 0.5em;
  z-index: 1;
  &:after {
    content: "";
    width: 1em;
    height: 1em;
    border-top: 0.15em solid rgb(216, 216, 216);
    border-right: 0.15em solid rgb(216, 216, 216);
    transform: rotate(45deg);
  }
`
const PrevButton = styled(ArrowButton)`
  position: absolute;
  top: 50%;
  left: 0.5em;
  z-index: 1;
  &:after {
    content: "";
    width: 1em;
    height: 1em;
    border-top: 0.15em solid rgb(216, 216, 216);
    border-right: 0.15em solid rgb(216, 216, 216);
    transform: rotate(-135deg);
  }
`
