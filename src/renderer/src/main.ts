import './main.css'

import { App } from '@meaningfully/ui';
import { mount } from 'svelte'
import electronApi from './electronApi';

const app = mount(App, {
  target: document.getElementById('app')!,
  props: {api: electronApi}
})

export default app;