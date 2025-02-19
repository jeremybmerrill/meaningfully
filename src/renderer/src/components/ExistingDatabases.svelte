<script lang="ts">
  import { onMount } from 'svelte';
  import type { DocumentSet } from '../main';
  // import { createEventDispatcher } from 'svelte';
  import { Link } from 'svelte-routing';

//   const dispatch = createEventDispatcher();
  let documentSets: DocumentSet[] = [];
  let loading = true;
  let error: string | null = null;
  let hidden = false;

  export function hide() {
    hidden = true;
  }

  export function show() {
    hidden = false;
  }

  export async function loadDocumentSets() {
    try {
      loading = true;
      const sets = await window.api.listDocumentSets();
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

{#if hidden}
  <div class="my-10 flex justify-center p-8">
  </div>
{:else if loading}
  <div class="my-10 flex justify-center p-8">
    <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
  </div>
{:else if error}
  <div class="my-10 p-4 bg-red-100 text-red-700 rounded-md">
    {error}
  </div>
{:else}
  <div class="my-10 bg-white p-6 rounded-lg shadow space-y-6 text-black">
    <h2 class="text-2xl font-bold">Existing Spreadsheets</h2>
    {#if documentSets.length === 0}
      <p class="text-gray-500">No spreadsheets found. Upload one to get started.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead>
            <tr class="">
              <th class="px-4 py-2 text-left">Name</th>
              <th class="px-4 py-2 text-left">Upload Date</th>
              <th class="px-4 py-2 text-left">Documents</th>
              <th class="px-4 py-2 text-left">Parameters</th>
            </tr>
          </thead>
          <tbody>
            {#each documentSets as set}
              <tr 
                class="border-t hover:bg-gray-50 cursor-pointer transition-colors" 
              >
                <td class="px-4 py-2 font-medium">
                  <Link 
                    to={`/search/${set.setId}`} 
                    state={{ documentSet: set }}
                    class="block w-full underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                  >
                    {set.name}
                  </Link>
                </td>
                <td class="px-4 py-2 text-gray-600">{set.uploadDate.toLocaleString()}</td>
                <td class="px-4 py-2 text-gray-600">{set.totalDocuments}</td>
                <td class="px-4 py-2">
                  {#if Object.keys(set.parameters).length > 0}
                    <details>
                      <summary class="cursor-pointer text-sm text-blue-600">View Parameters</summary>
                      <pre class="mt-2 p-2 bg-gray-50 rounded text-sm">{JSON.stringify(set.parameters, null, 2)}</pre>
                    </details>
                  {:else}
                    <span class="text-gray-400">None</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
{/if}
