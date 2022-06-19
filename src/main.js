import Vue from 'vue'
import App from './App.vue'
import VueCompositionApi from '@vue/composition-api'
import { firestorePlugin } from 'vuefire'
import { BootstrapVue, BootstrapVueIcons, 
  BIconCaretLeftFill, BIconCaretRightFill, BIconDashCircle, 
  BIconDashCircleFill, BIconPlusCircle, BIconPlusCircleFill,
  BIconGear, BIconGearFill } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import router from './router'
import { createPinia, PiniaVuePlugin } from 'pinia'
import VueDraggableResizable from 'vue-draggable-resizable'
//import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

Vue.use(VueDraggableResizable)
Vue.use(PiniaVuePlugin)
Vue.use(VueCompositionApi)
Vue.use(firestorePlugin)
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use('BIconCaretLeftFill', BIconCaretLeftFill);
Vue.use('BIconCaretRightFill', BIconCaretRightFill);
Vue.use('BIconDashCircle', BIconDashCircle);
Vue.use('BIconDashCircleFill', BIconDashCircleFill);
Vue.use('BIconPlusCircle', BIconPlusCircle);
Vue.use('BIconPlusCircleFill', BIconPlusCircleFill);
Vue.use('BIconGear', BIconGear);
Vue.use('BIconGearFill', BIconGearFill);

Vue.config.productionTip = false
const pinia = createPinia()

new Vue({
  router,
  pinia,
  render: h => h(App),
}).$mount('#app')
