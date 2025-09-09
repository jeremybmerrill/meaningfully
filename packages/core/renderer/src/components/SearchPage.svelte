<script lang="ts">
  import { navigate } from 'svelte-routing';
  import type { DocumentSet } from '../types';
  import Results from './Results.svelte';

  interface Props {
    validApiKeysSet: boolean;
  }

  let { validApiKeysSet }: Props = $props();

  let documentSetId = parseInt(window.location.href.split("?")[0].split('/').pop());
  let documentSet: DocumentSet | null = $state(null);
  let documentSetLoading = $state(true);
  let metadataColumns: string[] = $state([]);
  let textColumn: string = $state('');
  let loading = $state(false);
  let hasResults = $state(false);
  let showModal = $state(false);
  let modalContent: Record<string, any> | null = $state(null);

  const blankSearchQuery = '';
  let searchQuery = $state(blankSearchQuery);
  let metadataFilters: Array<{ key: string, operator: "==" | "in" | ">" | "<" | "!=" | ">=" | "<=" | "nin" | "any" | "all" | "text_match" | "contains" | "is_empty", value: any }> = $state([]);

  let results: Array<Record<string, any>> = $state([]);
  let error: string | null = $state(null);

  window.api.getDocumentSet(documentSetId).then(receivedDocumentSet => {
    documentSet = receivedDocumentSet;
    metadataColumns = (documentSet.parameters.metadataColumns ?? []) as string[];
    textColumn = documentSet.parameters.textColumns[0] as string;
    documentSetLoading = false;
  }).catch(error => {
    console.error('Error fetching document set:', error);
    navigate('/');
  });

  const placeholderQueries = [
    "The CEO got fired",
    "My car caught on fire as I was driving on the highway",
    "I surprised my closest friends by starting a business selling handmade candles",
    "Our company's stock price could plummet if we don't address the recent scandal involving our CEO",
    "Don't tell anyone that I was the one who leaked the confidential information about our competitor's new product launch",
    "I can't believe I got fired for accidentally sending a company-wide email with a meme instead of the quarterly report",
  ];
  const placeholderQuery = placeholderQueries[Math.floor(Math.random() * placeholderQueries.length)];

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    hasResults = true;
    loading = true;
    try {
      const searchResults = await window.api.searchDocumentSet({
        documentSetId: documentSet.documentSetId,
        query: searchQuery,
        n_results: 100,
        filters: metadataFilters.map(filter => ({
          key: filter.key,
          operator: filter.operator,
          value: filter.value
        }))
      });
      results = searchResults.map(result => ({ // TODO Factor this out if preview and search use the same data structure.
        ...result.metadata, // flatten the metadata so that this object is the same shape as a CSV row.
        similarity: result.score.toFixed(2),
        [textColumn]: result.text,
        sourceNodeId: result.sourceNodeId
      })); 
      error = null; 
    } catch (error_) {
      console.error('Search failed:', error_);
      error = error_;
    } finally {
      loading = false;
    }
  }

  function addFilter() {
    metadataFilters = [...metadataFilters, { key: '', operator: '==', value: '' }];
  }

  function removeFilter(index: number) {
    metadataFilters = metadataFilters.filter((_, i) => i !== index);
  }

  async function handleOriginalDocumentClick( documentId: string) {
    try {
      const documentData = await window.api.getDocument({ documentSetId, documentId });
      modalContent = documentData;
      showModal = true;
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  }

  function closeModal() {
    showModal = false;
    modalContent = null;
  }
</script>

<div class="p-6 space-y-6">
  <div class="flex items-center space-x-4">
    <button 
      class="text-blue-500 hover:text-blue-600 flex items-center space-x-1"
      onclick={() => history.back()}
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
      <h1 class="text-2xl font-bold" data-testid="document-set-name">{documentSet.name}</h1>
      <p class="text-gray-600">
        {documentSet.totalDocuments.toLocaleString()} documents • Uploaded {documentSet.uploadDate.toLocaleDateString()}
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
            data-testid="search-bar"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
          <button
            onclick={handleSearch}
            disabled={loading || !validApiKeysSet}
            data-testid="search-button"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <!-- Metadata Filters -->
      {#if metadataColumns.length > 0}  
      <div class="space-y-2">
        <p class="block text-sm font-medium text-gray-700">
          Search only records that match...
        </p>
        <div class="space-y-4">
          {#each metadataFilters as filter, index}
            <div class="flex space-x-2 items-center">
              <select bind:value={filter.key} class="px-2 py-1 border border-gray-300 rounded-md">
                <option value="" disabled>Select column</option>
                {#each metadataColumns as column}
                  <option value={column}>{column}</option>
                {/each}
              </select>
              <select bind:value={filter.operator} class="px-2 py-1 border border-gray-300 rounded-md">
                <option value="==">==</option>
                <option value="in">in</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="!=">!=</option>
                <option value=">=">&gt;=</option>
                <option value="<=">&lt;=</option>
                <option value="nin">not in</option>
                <option value="any">any</option>
                <option value="all">all</option>
                <option value="text_match">text matches</option>
                <option value="contains">contains</option>
                <option value="is_empty">is empty</option>
              </select>
              <input
                type="text"
                bind:value={filter.value}
                placeholder="Value"
                class="flex-1 px-2 py-1 border border-gray-300 rounded-md"
              />
              <button onclick={() => removeFilter(index)} class="text-red-500 hover:text-red-600">
                Remove
              </button>
            </div>
          {/each}
          <button onclick={addFilter} class="text-blue-500 hover:text-blue-600">
            Add Filter
          </button>
        </div>
      </div>
      {/if}
    </div>

    <!-- Results -->
    {#if error}
      <div class="my-10 p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    {/if}
    {#if (searchQuery != blankSearchQuery || metadataFilters.length > 0) && hasResults}
      <!-- Wrap Results component for easier selection -->
      <div data-testid="results">
        <Results
          {results}
          {loading}
          {textColumn}
          {metadataColumns}
          originalDocumentClick={handleOriginalDocumentClick}
          />
      </div>
    {/if}
  {/if}
</div>

<!-- modal for showing a whole document -->
{#if showModal && modalContent}
  <div data-testid="details" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white text-black p-6 rounded-lg shadow-lg max-w-xl w-full max-h-screen overflow-y-auto">
      <h2 class="text-xl font-semibold mb-4">Original Document</h2>
      <table>
        <thead>
          <tr>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="px-4 py-2 text-left border-b text-black">Original text</td>
            <td class="px-4 py-2 border-b text-black">{modalContent.text}</td>
          </tr>
          {#each metadataColumns as key}
            <tr>
              <td class="px-4 py-2 text-left border-b text-black">{key}</td>
              <td class="px-4 py-2 border-b text-black">{modalContent.metadata[key]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onclick={closeModal}>Close</button>
    </div>
  </div>
{/if}