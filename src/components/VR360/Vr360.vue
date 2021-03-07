<template>
  <div v-bind:style="updateCanvasDimension" class="componentContainer">
    <div class="canvasContainer">
      <canvas
        ref="webxrContainer"
        class="myCanvas"
        v-on:mousemove="mouseMove($event)"
        v-on:touchmove="touchMove($event)"
        v-on:touchstart="touchStart($event)"
        v-on:touchend="touchEnd($event)"
        v-on:touchcancel="touchCancel($event)"
      ></canvas>
    </div>
    <VrButton
      ref="myVrButton"
      class="vrButton"
      v-bind:class="{ hideBtn: !showVRButton }"
      v-bind:optionsStyle="customButtonStyle"
      v-bind:RequestSession="onRequestSession"
      v-bind:EndSession="onEndSession"
      v-bind:RequestFullScreen="onFullScreenStart"
    ></VrButton>
  </div>
</template>



<script>
import VrButton from "./VrButton.vue";
import { Scene, WebXRView } from "./class/render/scenes/scene";
import { Renderer, createWebGLContext } from "./class/render/core/renderer";
import { SkyboxNode } from "./class/render/nodes/skybox";
import { InlineViewerHelper } from "./class/util/inline-viewer-helper";

import WebXRPolyfill from "webxr-polyfill";
new WebXRPolyfill();

export default {
  name: "Vr360",
  components: {
    VrButton,
  },
  props: {
    imgSrc: String,
    displayMode: String,
    customButtonStyle: Object,
    customCanvasDimensions: Object,
    showVRButton: {
      type: Boolean,
      default: true,
    },
  },
  data: function () {
    return {
      xrImmersiveRefSpace: Object,
      inlineViewerHelper: Object,
      gl: Object,
      scene: Object,
      primaryTouch: Object,
      prevTouchX: Number,
      prevTouchY: Number,
      canvasWidth: {
        type: String,
        default: "80vw",
      },
      canvasHeight: {
        type: String,
        default: "80vh",
      },
    };
  },
  methods: {
    initXR() {
      if (navigator.xr) {
        navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
          this.$refs.myVrButton.enabled = supported;
          this.$refs.myVrButton.updateButtonState();
        });
        navigator.xr.requestSession("inline").then(this.onSessionStarted);
      }
    },
    initGL() {
      if (this.gl) {
        return;
      }

      this.gl = createWebGLContext(
        {
          xrCompatible: true,
        },
        this.$refs.webxrContainer
      );
      this.onResize();
      this.scene.setRenderer(new Renderer(this.gl));
    },

    onResize() {
      this.gl.canvas.width =
        this.gl.canvas.clientWidth * window.devicePixelRatio;
      this.gl.canvas.height =
        this.gl.canvas.clientHeight * window.devicePixelRatio;
    },

    onRequestSession() {
      return navigator.xr
        .requestSession("immersive-vr")
        .then((session) => {
          this.$refs.myVrButton.setSession(session);
          session.isImmersive = true;
          this.onSessionStarted(session);
        })
        .catch((err) => {
          const errorMsg = `XRSession creation failed: ${err.message}`;
          console.error(errorMsg);
          this.$refs.myVrButton.setDisabledAttribute(true);
          setTimeout(() => {
            this.$refs.myVrButton.setDisabledAttribute(false);
          }, 1000);
        });
    },

    onSessionStarted(session) {
      session.addEventListener("end", this.onSessionEnded);
      this.initGL();
      const glLayer = new window.XRWebGLLayer(session, this.gl);
      session.updateRenderState({ baseLayer: glLayer });
      const refSpaceType = session.isImmersive ? "local" : "viewer";
      session.requestReferenceSpace(refSpaceType).then((refSpace) => {
        if (session.isImmersive) {
          this.xrImmersiveRefSpace = refSpace;
        } else {
          this.inlineViewerHelper = new InlineViewerHelper(refSpace);
        }
        session.requestAnimationFrame(this.onXRFrame);
      });
    },

    onEndSession(session) {
      session.end();
    },

    onSessionEnded(event) {
      if (event.session.isImmersive) {
        this.$refs.myVrButton.setSession(null);
      }
    },

    onFullScreenStart() {
      if (this.$refs.webxrContainer.requestFullscreen) {
        this.$refs.webxrContainer.requestFullscreen();
      }
    },

    onFullScreenEnd() {
      if (this.$refs.webxrContainer.exitFullscreen) {
        this.$refs.webxrContainer.exitFullscreen();
      }
    },

    onXRFrame(t, frame) {
      const session = frame.session;
      const refSpace = session.isImmersive
        ? this.xrImmersiveRefSpace
        : this.inlineViewerHelper.referenceSpace;
      const pose = frame.getViewerPose(refSpace);
      this.scene.startFrame();
      session.requestAnimationFrame(this.onXRFrame);
      const glLayer = session.renderState.baseLayer;
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, glLayer.framebuffer);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      if (pose) {
        const views = [];
        for (const view of pose.views) {
          const renderView = new WebXRView(view, glLayer);
          renderView.eye = view.eye;
          views.push(renderView);
        }
        this.scene.updateInputSources(frame, refSpace);
        this.scene.drawViewArray(views);
      }
      this.scene.endFrame();
    },

    mouseMove(event) {
      // Only rotate when the left button is pressed
      if (event.buttons & 1) {
        this.inlineViewerHelper.rotateView(event.movementX, event.movementY);
      }
    },

    touchStart(event) {
      if (this.primaryTouch === undefined) {
        const touch = event.changedTouches[0];
        this.primaryTouch = touch.identifier;
        this.prevTouchX = touch.pageX;
        this.prevTouchY = touch.pageY;
      }
    },

    touchEnd(event) {
      for (const touch of event.changedTouches) {
        if (this.primaryTouch === touch.identifier) {
          this.primaryTouch = undefined;
          this.inlineViewerHelper.rotateView(
            touch.pageX - this.prevTouchX,
            touch.pageY - this.prevTouchY
          );
        }
      }
    },

    touchCancel(event) {
      for (const touch of event.changedTouches) {
        if (this.primaryTouch === touch.identifier) {
          this.primaryTouch = undefined;
        }
      }
    },

    touchMove(event) {
      for (const touch of event.changedTouches) {
        if (this.primaryTouch === touch.identifier) {
          this.inlineViewerHelper.rotateView(
            touch.pageX - this.prevTouchX,
            touch.pageY - this.prevTouchY
          );
          this.prevTouchX = touch.pageX;
          this.prevTouchY = touch.pageY;
        }
      }
    },

    changeImg(imgPath, display) {
      this.scene.addNode(
        new SkyboxNode({
          url: imgPath,
          displayMode: display,
        })
      );
    },
  },
  watch: {
    imgSrc: function (newVal) {
      if (newVal !== null && newVal !== undefined) {
        this.changeImg(newVal, this.displayMode);
      } else {
        console.error("path to image invalid");
      }
    },
    displayMode: function (newVal) {
      if (newVal !== null && newVal !== undefined) {
        this.changeImg(newVal, this.displayMode);
      } else {
        console.error("path to image invalid");
      }
    },
  },
  computed: {
    updateCanvasDimension() {
      var canvasDimensions = { width: "80vw", height: "80vh" };
      if (this.customCanvasDimensions && this.customCanvasDimensions.width) {
        canvasDimensions.width = this.customCanvasDimensions.width + "vw";
      }
      if (this.customCanvasDimensions && this.customCanvasDimensions.height) {
        canvasDimensions.height = this.customCanvasDimensions.height + "vh";
      }
      return canvasDimensions;
    },
  },
  mounted() {
    if (this.imgSrc !== null && this.imgSrc !== undefined) {
      this.changeImg(this.imgSrc, this.displayMode);
      this.initXR();
    }
  },
  created() {
    this.xrImmersiveRefSpace = null;
    this.inlineViewerHelper = null;
    this.gl = null;
    this.scene = new Scene();

    window.addEventListener("resize", this.onResize);
  },
  destroyed() {
    window.removeEventListener("resize", this.onResize);
  },
};
</script>


<style scoped>
.componentContainer {
  width: 80vw;
  height: 80vh;
  display: flex;
  min-height: 50vh;
  min-width: 50vw;
  position: relative;
}

.canvasContainer {
  position: relative;
  width: 100%;
  height: 100%;
}

.vrButton {
  z-index: 2;
  text-align: left;
  max-width: 420px;
  padding: 0.5em;
  background-color: white;
  border-radius: 2px;
  position: absolute;
  bottom: 0;
  right: 0;
}

.myCanvas {
  position: absolute;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: grab;
}

.myCanvas :-webkit-full-screen {
  width: 100%;
  height: 100%;
}

.hideBtn {
  display: none;
}
</style>