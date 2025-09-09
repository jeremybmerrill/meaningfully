import '@meaningfully/core/renderer/src/assets/main.css'

import App from '@meaningfully/core/renderer/src/App.svelte';
import { mount } from "svelte";

const app = mount(App, {
  target: document.getElementById('app')!
})

export default app