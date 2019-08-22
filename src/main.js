import Vue from 'vue'
import App from './App.vue'
import 'element-ui/lib/theme-chalk/index.css'
import { Container,Header,Main,Tabs,TabPane,Input,Select,Option,Tag, Button} from 'element-ui';

Vue.component(Container.name, Container);
Vue.component(Header.name, Header);
Vue.component(Main.name, Main);
Vue.component(Tabs.name, Tabs);
Vue.component(TabPane.name, TabPane);
Vue.component(Input.name, Input);
Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.component(Tag.name, Tag);
Vue.component(Button.name, Button);
Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
