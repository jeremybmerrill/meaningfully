<script lang="ts">
  import { navigate } from 'svelte-routing'

//   import { onMount } from 'svelte';
  import type { DocumentSet } from '../main';
  import Results from './Results.svelte';

  export let validApiKeysSet: boolean;

  let documentSetId = parseInt(window.location.href.split("?")[0].split('/').pop());
  let documentSet: DocumentSet | null = null;
  let documentSetLoading = true;
  let metadataColumns: string[] = [];
  let textColumn: string = ''
  let loading = false;
  let hasResults = false;

  const blankSearchQuery = '';
  let searchQuery = blankSearchQuery
  const emptyMetadataFilters: Record<string, string>  = {};
  let metadataFilters: Record<string, string> = emptyMetadataFilters;

  let results: Array<Record<string, any>> = [];
  let error: string | null = null;

  window.api.getDocumentSet(documentSetId).then(receivedDocumentSet => {
    documentSet = receivedDocumentSet;
    metadataColumns = (documentSet.parameters.metadataColumns ?? []) as string[];
    textColumn = documentSet.parameters.textColumns[0] as string;
    documentSetLoading = false;
  }).catch(error => {
    console.error('Error fetching document set:', error);
    // You might want to redirect or show an error message
    navigate('/');
    // Handle the error, e.g., show an error message or redirect
  });


  const placeholderQueries = [
    "The CEO got fired",
    "My car caught on fire as I was driving on the highway",
    "I surprised my closest friends by starting a business selling handmade candles",
    "Our company's stock price could plummet if we don't address the recent scandal involving our CEO",
    "Don't tell anyone that I was the one who leaked the confidential information about our competitor's new product launch",
    "I can't believe I got fired for accidentally sending a company-wide email with a meme instead of the quarterly report",
  ]
  const placeholderQuery = placeholderQueries[Math.floor(Math.random()*placeholderQueries.length)];
  async function handleSearch() {
    if (!searchQuery.trim()) return;
    hasResults = true;
    loading = true;
    try {
      // Mock API call - replace with actual API call later
      const searchResults = await window.api.searchDocumentSet({
        documentSetId: documentSet.documentSetId,
        query: searchQuery,
        n_results: 100, // selector not yet implemented
        filters: metadataFilters // not yet implemented
      });
      results = searchResults.map(result => ({ // TODO Factor this out if preview and search use the same data structure.
        ...result.metadata, // flatten the metadata so that this object is the same shape as a CSV row.
        similarity: result.score.toFixed(2),
        [textColumn]: result.text
      })); 
      error = null; 
    } catch (error_) {
      console.error('Search failed:', error_);
      error = error_;
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

  {#if documentSetLoading}
    <p>Loading document set...</p>
  {:else if !documentSet}
    <p>Document set not found. {documentSetId}</p>
  {:else}
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
        <p class="text-xs text-gray-500">
          Imagine the perfect document that you hope might exist in your spreadsheet. Type it here. Meaningfully will find the real documents that mean 
          about the same thing -- even if they have no keywords in common.
        </p>
        <div class="flex space-x-4">
          <input
            id="search"
            type="text"
            bind:value={searchQuery}
            placeholder={placeholderQuery}
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            on:click={handleSearch}
            disabled={loading || !validApiKeysSet}
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <!-- Metadata Filters -->
      {#if metadataColumns}  
      <div class="space-y-2">
        <p class="block text-sm font-medium text-gray-700">
          Metadata Filters
        </p>
        <div class="grid grid-cols-2 gap-4">
          {#each metadataColumns as field}
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
      <!-- keyword filters TK -->
      {/if}
    </div>

    <!-- Results -->
    {#if error}
      <div class="my-10 p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    {/if}
    {#if (searchQuery != blankSearchQuery || metadataFilters != emptyMetadataFilters) && hasResults}
      <Results
        {results}
        {loading}
        {textColumn}
        {metadataColumns}
      />
    {/if}
  {/if} <!--  documentSetLoading -->
</div> 