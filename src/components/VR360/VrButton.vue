<template>
  <button
    v-on:click="onXRButtonClick()"
    class="webvr-ui-button"
    v-bind:style="customButtonUIStyle"
    :disabled="disabled"
    :opacity="myOpacity"
    :title="title"
  >
    <div class="webvr-ui-logo" v-bind:style="customLogoOKUIStyle">
      <svg
        class="webvr-ui-svg"
        version="1.1"
        x="0px"
        y="0px"
        v-bind:width="aspectDim"
        v-bind:height="logoHeight"
        viewBox="0 0 28 18"
        xml:space="preserve"
      >
        <path
          d="M26.8,1.1C26.1,0.4,25.1,0,24.2,0H3.4c-1,0-1.7,0.4-2.4,1.1C0.3,1.7,0,2.7,0,3.6v10.7
            c0,1,0.3,1.9,0.9,2.6C1.6,17.6,2.4,18,3.4,18h5c0.7,0,1.3-0.2,1.8-0.5c0.6-0.3,1-0.8,1.3-1.4l
            1.5-2.6C13.2,13.1,13,13,14,13v0h-0.2 h0c0.3,0,0.7,0.1,0.8,0.5l1.4,2.6c0.3,0.6,0.8,1.1,1.3,
            1.4c0.6,0.3,1.2,0.5,1.8,0.5h5c1,0,2-0.4,2.7-1.1c0.7-0.7,1.2-1.6,1.2-2.6 V3.6C28,2.7,27.5,
            1.7,26.8,1.1z M7.4,11.8c-1.6,0-2.8-1.3-2.8-2.8c0-1.6,1.3-2.8,2.8-2.8c1.6,0,2.8,1.3,2.8,2.8
            C10.2,10.5,8.9,11.8,7.4,11.8z M20.1,11.8c-1.6,0-2.8-1.3-2.8-2.8c0-1.6,1.3-2.8,2.8-2.8C21.7
            ,6.2,23,7.4,23,9 C23,10.5,21.7,11.8,20.1,11.8z"
        />
      </svg>
    </div>
  </button>
</template>

<script>
export default {
  name: "VrButton",
  props: {
    optionsStyle: String,
    RequestSession: Function,
    EndSession: Function,
    RequestFullScreen: Function
  },
  data: function() {
    return {
      defaultOptionsStyle: Object,
      enabled: Boolean,
      session: Object,
      logoHeight: String,
      aspectDim: String,
      disabled: Boolean,
      myOpacity: Number,
      title: String,
      customButtonUIStyle: Object,
      customLogoOKUIStyle: Object
    };
  },
  watch: {
    optionsStyle() {
      this.setCustomStyle();
    }
  },
  methods: {
    setCustomStyle() {
      const _LOGO_SCALE = 0.8;
      const height =
        this.optionsStyle && this.optionsStyle.height
          ? this.optionsStyle.height
          : this.defaultOptionsStyle.height;
      const corners =
        this.optionsStyle && this.optionsStyle.corners
          ? this.optionsStyle.corners
          : this.defaultOptionsStyle.corners;
      const borderRadius = this.getBorderRadius(height, corners);
      const fontSize = height / 3;

      this.logoHeight = (height * _LOGO_SCALE) / 3 + "px";
      this.aspectDim = (height * _LOGO_SCALE * 14) / 27 + "px";

      this.customButtonUIStyle["border-color"] =
        this.optionsStyle && this.optionsStyle.color
          ? this.optionsStyle.color
          : this.defaultOptionsStyle.color;
      this.customButtonUIStyle["border-radius"] = borderRadius + "px";
      this.customButtonUIStyle["min-width"] = fontSize + "px";

      this.customLogoOKUIStyle["width"] = height + fontSize + "px";
      this.customLogoOKUIStyle["height"] = height - fontSize / 2 + "px";
      this.customLogoOKUIStyle["fill"] =
        this.optionsStyle && this.optionsStyle.color
          ? this.optionsStyle.color
          : this.defaultOptionsStyle.color;
    },

    getBorderRadius(height, corners) {
      let borderRadius;
      if (corners === "round") {
        borderRadius = height / 2;
      } else if (corners === "square") {
        borderRadius = 2;
      } else {
        borderRadius = corners;
      }
      return borderRadius;
    },

    onXRButtonClick() {
      if (this.session) {
        this.EndSession(this.session);
      } else if (this.enabled) {
        this.RequestSession();
      } else {
        this.RequestFullScreen();
      }
    },

    setDisabledAttribute(disabled) {
      this.disabled = disabled;
      if (disabled) {
        this.myOpacity = 0.5;
      } else {
        this.myOpacity = 1;
      }
    },

    setSession(session) {
      this.session = session;
      this.updateButtonState();
      return this;
    },

    updateButtonState() {
      if (this.session) {
        this.setTitle("Exit XR presentation");
      } else if (this.enabled) {
        this.setTitle("Enter XR");
      } else {
        this.setTitle("No XR headset found.");
      }
      this.setDisabledAttribute(false);
    },

    setTitle(title) {
      this.title = title;
      return this;
    }
  },
  created() {
    this.defaultOptionsStyle = {
      color: "rgb(80,168,252)",
      height: 55,
      corners: "square"
    };

    this.enabled = false;
    this.session = null;
    this.logoHeight = 0;
    this.aspectDim = 0;
    this.disabled = true;
    this.myOpacity = 0.5;
    this.title = "";

    this.customButtonUIStyle = {};

    this.customLogoOKUIStyle = {};
    this.setCustomStyle();
  }
};
</script>

<style scoped>
button.webvr-ui-button {
  font-family: sans-serif;
  border: 2px solid;
  box-sizing: border-box;
  background: "none";

  display: inline-block;

  cursor: pointer;
  transition: border 0.5s;
}

button.webvr-ui-button:focus {
  outline: none;
}

/*
* Logo
*/

.webvr-ui-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

/*
* error
*/

button.webvr-ui-button[error="true"] {
  animation: errorShake 0.4s;
}

@keyframes errorShake {
  0% {
    transform: translate(1px, 0);
  }
  10% {
    transform: translate(-2px, 0);
  }
  20% {
    transform: translate(2px, 0);
  }
  30% {
    transform: translate(-2px, 0);
  }
  40% {
    transform: translate(2px, 0);
  }
  50% {
    transform: translate(-2px, 0);
  }
  60% {
    transform: translate(2px, 0);
  }
  70% {
    transform: translate(-2px, 0);
  }
  80% {
    transform: translate(2px, 0);
  }
  90% {
    transform: translate(-1px, 0);
  }
  100% {
    transform: translate(0px, 0);
  }
}
</style>