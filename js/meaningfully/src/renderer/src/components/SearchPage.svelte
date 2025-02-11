<script lang="ts">
//   import { onMount } from 'svelte';
  import type { DocumentSet } from '../main';
  import Results from './Results.svelte';

  export let documentSet: DocumentSet = history.state?.documentSet;
  
  let searchQuery = '';
  let metadataFilters: Record<string, string> = {};
  let results: Array<Record<string, any>> = [];
  let loading = false;

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    loading = true;
    try {
      // Mock API call - replace with actual API call later
      const searchResults = await window.api.searchDocumentSet({
        documentSetId: documentSet.setId,
        query: searchQuery,
        filters: metadataFilters
      });
      
      results = searchResults.map(result => ({
        ...result,
        similarity: result.similarity.toFixed(2)
      }));
    } catch (error) {
      console.error('Search failed:', error);
      // You might want to show an error message to the user
    } finally {
      loading = false;
    }
  }
</script>

<div class="p-6 space-y-6">
  <div class="flex items-center space-x-4">
    <button 
      class="text-blue-500 hover:text-blue-600 flex items-center space-x-1"
      on:click={() => history.back()}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Back to Document Sets</span>
    </button>
  </div>

  <div class="space-y-2">
    <h1 class="text-2xl font-bold">Search: {documentSet.name}</h1>
    <p class="text-gray-600">
      {documentSet.totalDocuments} documents • Uploaded {documentSet.uploadDate.toLocaleDateString()}
    </p>
  </div>

  <div class="space-y-4 max-w-3xl">
    <!-- Search Input -->
    <div class="space-y-2">
      <label for="search" class="block text-sm font-medium text-gray-700">
        Semantic Search
      </label>
      <div class="flex space-x-4">
        <input
          id="search"
          type="text"
          bind:value={searchQuery}
          placeholder="Enter your search query..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          on:click={handleSearch}
          disabled={loading}
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>

    <!-- Metadata Filters -->
    <div class="space-y-2">
      <p class="block text-sm font-medium text-gray-700">
        Metadata Filters
      </p>
      <div class="grid grid-cols-2 gap-4">
        {#each Object.keys(documentSet.parameters) as field}
          <div>
            <label class="block text-sm text-gray-600" for={field}>
              {field}
            </label>
            <input
              id={field}
              type="text"
              bind:value={metadataFilters[field]}
              placeholder={`Filter by ${field}...`}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Results -->
  <Results
    {results}
    {loading}
    textColumn="content"
    metadataColumns={Object.keys(documentSet.parameters)}
  />
</div> 