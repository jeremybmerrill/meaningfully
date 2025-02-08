

// src/main/ipc.ts
import { ipcMain } from 'electron';
import { DocumentService } from './documentManager';

const docService = new DocumentService();

export function setupIpcHandlers() {
  ipcMain.handle('list-document-sets', async () => {
    try {
      return await docService.listDocumentSets();
    } catch (error) {
      console.error('Error listing document sets:', error);
      throw error;
    }
  });
}

// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  listDocumentSets: () => ipcRenderer.invoke('list-document-sets')
});

// src/renderer/src/lib/types.ts
export interface DocumentSet {
  setId: number;
  name: string;
  uploadDate: Date;
  parameters: Record<string, unknown>;
  totalDocuments: number;
}

// src/renderer/src/lib/DocumentList.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import type { DocumentSet } from './types';

  let documentSets: DocumentSet[] = [];
  let loading = true;
  let error: string | null = null;

  async function loadDocumentSets() {
    try {
      loading = true;
      const sets = await window.electronAPI.listDocumentSets();
      documentSets = sets.map(set => ({
        ...set,
        uploadDate: new Date(set.uploadDate)
      }));
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load document sets';
    } finally {
      loading = false;
    }
  }

  onMount(loadDocumentSets);
</script>

{#if loading}
  <div class="flex justify-center p-8">
    <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
  </div>
{:else if error}
  <div class="p-4 bg-red-100 text-red-700 rounded-md">
    {error}
  </div>
{:else}
  <div class="space-y-4">
    <h2 class="text-2xl font-bold">Document Sets</h2>
    {#if documentSets.length === 0}
      <p class="text-gray-500">No document sets found</p>
    {:else}
      <div class="grid gap-4">
        {#each documentSets as set}
          <div class="p-4 bg-white shadow rounded-lg">
            <h3 class="text-lg font-semibold">{set.name}</h3>
            <div class="mt-2 text-sm text-gray-600">
              <p>Uploaded: {set.uploadDate.toLocaleString()}</p>
              <p>Documents: {set.totalDocuments}</p>
              {#if Object.keys(set.parameters).length > 0}
                <details class="mt-2">
                  <summary class="cursor-pointer">Parameters</summary>
                  <pre class="mt-2 p-2 bg-gray-50 rounded">{JSON.stringify(set.parameters, null, 2)}</pre>
                </details>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

// src/renderer/src/app.d.ts
interface Window {
  electronAPI: {
    listDocumentSets: () => Promise<DocumentSet[]>;
  }
}
