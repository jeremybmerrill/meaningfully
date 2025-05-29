<script lang="ts">
  import { onMount } from 'svelte';
  import type { DocumentSet } from '../main';
  import { Link } from 'svelte-routing';

  let documentSets: DocumentSet[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let hidden = $state(false);
  let currentPage = $state(1);
  let totalPages = $state(1);
  let totalDocuments = $state(0);
  const pageSize = 10;

  export function hide() {
    hidden = true;
  }

  export function show() {
    hidden = false;
  }

  export async function loadDocumentSets(page: number = 1) {
    try {
      loading = true;
      const result = await window.api.listDocumentSets(page, pageSize);
      documentSets = result.documents.map(set => ({
        ...set,
        uploadDate: new Date(set.uploadDate)
      }));
      totalDocuments = result.total;
      totalPages = Math.ceil(totalDocuments / pageSize);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load document sets';
    } finally {
      loading = false;
    }
  }

  async function handleDelete(documentSetId: number, name: string, e: Event) {
    e.preventDefault();
    if (confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      try {
        await window.api.deleteDocumentSet(documentSetId);
        await loadDocumentSets(currentPage);
      } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to delete document set';
      }
    }
  }

  function nextPage(e: Event) {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      loadDocumentSets(currentPage);
    }
  }

  function previousPage(e: Event) {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      loadDocumentSets(currentPage);
    }
  }

  onMount(() => loadDocumentSets(1));
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
  <div class="my-10 bg-white p-6 rounded-lg shadow space-y-6 text-black" data-testid="existing-spreadsheets">
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
              <th class="px-4 py-2 text-left"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {#each documentSets as set}
              <tr 
                class="border-t hover:bg-gray-50 transition-colors" 
                data-testid="existing-spreadsheet-row"
              >
                <td class="px-4 py-2 font-medium">
                  <Link 
                    to={`/search/${set.documentSetId}`} 
                    class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
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
                <td class="px-4 py-2">
                  <button
                    type="button"
                    class="text-gray-500 hover:text-red-600 transition-colors"
                    aria-label="Delete {set.name}"
                    title="Delete {set.name}"
                    onclick={(e) => handleDelete(set.documentSetId, set.name, e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        
        <!-- Add pagination controls -->
        <div class="mt-4 flex items-center justify-between px-4">
          <div class="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages}
          </div>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              onclick={previousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              class="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              onclick={nextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
