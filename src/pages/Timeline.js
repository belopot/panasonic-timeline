import "./Timeline.css";
import * as THREE from "three";
import * as POSTPROCESSING from "postprocessing";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "mobile-device-detect";
import DescriptionModal from "../components/DescriptionModal";
import { CSS2DRenderer } from "../libs/CSS2DRenderer";
import RMLine from "../libs/RMLine";

THREE.Cache.enabled = true;

function Timeline({ dataset }) {
  const canvasContainer = useRef(null);
  const [isOpenDesModal, setIsOpenDesModal] = useState(false);
  const [modalData, setModalData] = useState({});

  useEffect(() => {
    let width = canvasContainer.current.offsetWidth;
    let height = canvasContainer.current.offsetHeight;
    const clock = new THREE.Clock();
    const rayCaster = new THREE.Raycaster();
    let intersects = [];
    let rmLines = [];
    /**
     * Scene
     */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    // scene.fog = new THREE.Fog(0xa0a0a0, 30, 64);

    /**
     * Lighter
     */
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(hemiLight);

    /**
     * Helper
     */
    //Axis
    const axisHelper = new THREE.AxesHelper(150);
    scene.add(axisHelper);

    //Cube
    const geometry = new THREE.CircleGeometry(10, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const baseObj = new THREE.Mesh(geometry, material);
    baseObj.position.set(0, 0, 0);
    // scene.add(baseObj);

    /**
     * Renderer
     */
    //3D renderer
    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
    });
    renderer.setClearColor("#ffffff");
    renderer.setSize(width, height);
    renderer.setPixelRatio(2);

    canvasContainer.current.appendChild(renderer.domElement);

    //2D renderer
    const renderer2D = new CSS2DRenderer();
    renderer2D.setSize(width, height);
    renderer2D.domElement.className = "renderer2D";
    canvasContainer.current.appendChild(renderer2D.domElement);

    //Mouse&Touch event
    function onMouseDown(event) {}
    function onMouseUp(event) {
      const pickedPoint = new THREE.Vector2(
        (event.offsetX / width) * 2 - 1,
        -(event.offsetY / height) * 2 + 1
      );
      rayCaster.setFromCamera(pickedPoint, camera);
      let pickedObjs = rayCaster.intersectObjects(intersects);
      if (pickedObjs.length > 0) {
        //Show pop up
        setModalData(pickedObjs[0].object.parent.popupData);
        setIsOpenDesModal(true);
      }
    }
    function onMouseMove(event) {
      const pickedPoint = new THREE.Vector2(
        (event.offsetX / width) * 2 - 1,
        -(event.offsetY / height) * 2 + 1
      );

      rayCaster.setFromCamera(pickedPoint, camera);

      let pickedObjs = rayCaster.intersectObjects(intersects);
      if (pickedObjs.length > 0) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    }

    function onTouchStart(event) {}
    function onTouchEnd(event) {
      const pickedPoint = new THREE.Vector2(
        (event.changedTouches[0].pageX / width) * 2 - 1,
        -(event.changedTouches[0].pageY / height) * 2 + 1
      );
      rayCaster.setFromCamera(pickedPoint, camera);
      let pickedObjs = rayCaster.intersectObjects(intersects);
      if (pickedObjs.length > 0) {
        //Show pop up
        setModalData(pickedObjs[0].object.parent.popupData);
        setIsOpenDesModal(true);
      }
    }
    function onTouchMove() {}

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mousemove", onMouseMove);

    renderer.domElement.addEventListener("touchstart", onTouchStart);
    renderer.domElement.addEventListener("touchend", onTouchEnd);
    renderer.domElement.addEventListener("touchmove", onTouchMove);

    /**
     * Camera
     */
    // frustumSize is the height of screen
    let frustumSize = 160;
    let aspect = width / height;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      -100,
      100
    );
    camera.position.set(0, 0, 0);

    /**
     * Composer
     */
    let composer;
    function createComposer() {
      //Composer
      composer = new POSTPROCESSING.EffectComposer(renderer);
      const renderPass = new POSTPROCESSING.RenderPass(scene, camera);
      composer.addPass(renderPass);
      const vignetteEffect = new POSTPROCESSING.VignetteEffect({
        eskil: false,
        offset: 0.1,
        darkness: 0.7,
      });
      const brightnessContrastEffect = new POSTPROCESSING.BrightnessContrastEffect(
        {
          contrast: 0.05,
          brightness: 0.0,
        }
      );
      const gammaCorrectionEffect = new POSTPROCESSING.GammaCorrectionEffect({
        gamma: 1.5,
      });

      const smaaEffect = new POSTPROCESSING.SMAAEffect(
        smaaSearchImage,
        smaaAreaImage,
        POSTPROCESSING.SMAAPreset.HIGH,
        POSTPROCESSING.EdgeDetectionMode.DEPTH
      );
      smaaEffect.setEdgeDetectionThreshold(0.02);

      const bloomEffect = new POSTPROCESSING.BloomEffect({
        blendFunction: POSTPROCESSING.BlendFunction.SCREEN,
        kernelSize: POSTPROCESSING.KernelSize.MEDIUM,
        luminanceThreshold: 0.3,
        luminanceSmoothing: 0.83,
        height: 1024,
        intensity: 1.5,
        resolutionScale: 0.5,
      });

      const hueSaturationEffect = new POSTPROCESSING.HueSaturationEffect({
        hue: 0.0,
        saturation: 0.191,
      });

      const normalPass = new POSTPROCESSING.NormalPass(scene, camera);
      const depthDownsamplingPass = new POSTPROCESSING.DepthDownsamplingPass({
        normalBuffer: normalPass.texture,
        resolutionScale: 0.5,
      });
      const normalDepthBuffer = renderer.capabilities.isWebGL2
        ? depthDownsamplingPass.texture
        : null;

      // Note: Thresholds and falloff correspond to camera near/far.
      // Example: worldDistance = distanceThreshold * (camera.far - camera.near)
      const ssaoEffect = new POSTPROCESSING.SSAOEffect(
        camera,
        normalPass.texture,
        {
          blendFunction: POSTPROCESSING.BlendFunction.MULTIPLY,
          distanceScaling: true,
          depthAwareUpsampling: true,
          normalDepthBuffer,
          samples: 9,
          rings: 7,
          distanceThreshold: 0.02, // Render up to a distance of ~20 world units
          distanceFalloff: 0.0025, // with an additional ~2.5 units of falloff.
          rangeThreshold: 0.0003, // Occlusion proximity of ~0.3 world units
          rangeFalloff: 0.0001, // with ~0.1 units of falloff.
          luminanceInfluence: 0.7,
          minRadiusScale: 0.33,
          radius: 0.1,
          intensity: 1.33,
          bias: 0.025,
          fade: 0.01,
          color: null,
          resolutionScale: 0.5,
        }
      );

      const textureEffect = new POSTPROCESSING.TextureEffect({
        blendFunction: POSTPROCESSING.BlendFunction.SKIP,
        texture: depthDownsamplingPass.texture,
      });

      const effectPass = new POSTPROCESSING.EffectPass(
        camera,
        // bloomEffect,
        smaaEffect,
        ssaoEffect,
        textureEffect,
        vignetteEffect,
        brightnessContrastEffect,
        gammaCorrectionEffect,
        hueSaturationEffect
      );

      composer.addPass(normalPass);
      if (renderer.capabilities.isWebGL2) {
        composer.addPass(depthDownsamplingPass);
      } else {
        console.log(
          "WebGL 2 not supported, falling back to naive depth downsampling"
        );
      }

      composer.addPass(effectPass);
      composer.setSize(width, height);
    }

    /**
     * Resize & Render
     */
    function resizeRendererToDisplaySize() {
      const canvasWidth = renderer.domElement.offsetWidth;
      const canvasHeight = renderer.domElement.offsetHeight;

      const needResize = canvasWidth !== width || canvasHeight !== height;
      if (needResize) {
        width = canvasWidth;
        height = canvasHeight;
        aspect = width / height;
        camera.left = (-frustumSize * aspect) / 2;
        camera.right = (frustumSize * aspect) / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        composer.setSize(width, height);
        renderer2D.setSize(width, height);
      }
    }

    let renderRequested = false;
    function render() {
      renderRequested = false;
      resizeRendererToDisplaySize();

      //Update rmLine
      for (let i in rmLines) {
        rmLines[i].update(width, height);
      }

      composer.render();
      renderer2D.render(scene, camera);
    }

    function requestRenderIfNotRequested() {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
      }
    }
    window.requestRenderIfNotRequested = requestRenderIfNotRequested;

    function startRender() {
      createComposer();
      requestRenderIfNotRequested();
      generateRMLines();
    }

    const IntervalRMLine = 1.3;
    function generateRMLines() {
      //Generate line data from node data
      const dataset_line = [];
      for (let i in dataset) {
        const k = i - 1;
        if (k < 0) continue;
        const data = {
          start: {
            title: dataset[k].title,
            texture: dataset[k].texture,
            position: dataset[k].position,
            color: dataset[k].color,
          },
          end: {
            title: dataset[i].title,
            texture: dataset[i].texture,
            position: dataset[i].position,
            color: dataset[i].color,
          },
        };
        dataset_line.push(data);
      }

      //Create rmlines
      for (let i in dataset_line) {
        dataset_line[i].delay = i * IntervalRMLine;
        const rmLine = RMLine(scene, dataset_line[i]);
        rmLines.push(rmLine);
      }
    }

    /**
     * Load Assets
     */
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {};
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {};
    loadingManager.onLoad = () => {
      startRender();
    };

    //Load smaa images
    let smaaSearchImage, smaaAreaImage;
    const smaaImageLoader = new POSTPROCESSING.SMAAImageLoader(loadingManager);
    smaaImageLoader.load(([search, area]) => {
      smaaSearchImage = search;
      smaaAreaImage = area;
    });

    //Load textures
    const textureLoader = new THREE.TextureLoader(loadingManager);
    for (let i in dataset) {
      dataset[i].texture = textureLoader.load(dataset[i].texturePath);
    }

    /**
     * RenderEvent & Dispose
     */
    window.addEventListener("resize", requestRenderIfNotRequested);
    return () => {
      window.removeEventListener("resize", requestRenderIfNotRequested);
      canvasContainer.current.innerHTML = "";
    };
  }, []);

  return (
    <>
      <DescriptionModal
        modalIsOpen={isOpenDesModal}
        onRequestClose={() => {
          setIsOpenDesModal(false);
        }}
        appRootId="#root"
        modalData={modalData}
      />
      <div className="controls">
        <button
          onClick={() => {
            console.log("Move to left");
          }}
        >
          left
        </button>
        <button
          onClick={() => {
            console.log("Move to right");
          }}
        >
          right
        </button>
      </div>
      <div className="canvasContainer" ref={canvasContainer}></div>
    </>
  );
}

export default Timeline;
