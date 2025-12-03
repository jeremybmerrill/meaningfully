import './main.css'

import { App } from '@meaningfully/ui';
import { mount } from 'svelte'
import electronApi from './electronApi';

// If on windows, add the disk name basepath (ex: C:/) on top-level router.
// via https://github.com/EmilTholin/svelte-routing/issues/143
const basepath = /^\/?[a-zA-Z]+:/.test(window.location.pathname)
  ? window.location.pathname.substr(0, window.location.pathname.indexOf(":") + 1)
  : "/";

const app = mount(App, {
  target: document.getElementById('app')!,
  props: {api: electronApi, basepath: basepath}
})

export default app;