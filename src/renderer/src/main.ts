import './assets/main.css'

import App from './App.svelte'
import { mount } from "svelte";

const app = mount(App, {
  target: document.getElementById('app')
})

export default app

export interface DocumentSet {
  documentSetId: number;
  name: string;
  uploadDate: Date;
  parameters: Record<string, unknown>;
  totalDocuments: number;
}
