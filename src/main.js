import Vue from 'vue'
import App from './App.vue'

import WebXRPolyfill from 'webxr-polyfill'
let polyfill = new WebXRPolyfill()

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
