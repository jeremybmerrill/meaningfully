<script lang="ts">
  import Table from './Table.svelte';
  
  interface Props {
    results?: Array<Record<string, any>>;
    textColumn: string;
    metadataColumns?: string[];
    loading?: boolean;
    originalDocumentClick?: (sourceNodeId: string) => void;
  }

  let {
    results = [],
    textColumn,
    metadataColumns = [],
    loading = false,
    originalDocumentClick = () => {},
  }: Props = $props();

  // Initial number of results to display
  const initialDisplayCount = 10;
  let displayCount = $state(initialDisplayCount);

  // Function to load more results
  const showMore = () => {
    displayCount += 10;
  };

  // Computed property for visible results
  let visibleResults = $derived(results.slice(0, displayCount));
</script>

<div class="space-y-4">
  <h2 class="text-xl font-semibold">Search Results</h2>
  
  {#if loading}
  <div class="flex justify-center items-center h-full">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
  </div>
  {:else if results.length === 0}
    <div class="bg-white rounded-lg shadow text-black">
      <p>No results found. Is it possible there is no data in the dataset?</p>
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow text-black">
      <Table
        data={visibleResults}
        {textColumn}
        {metadataColumns}
        showSimilarity={true}
        showShowOriginal={true}
        originalDocumentClick={originalDocumentClick}
      />
    </div>
    
    {#if displayCount < results.length}
      <div class="flex justify-center mt-4">
        <button
          onclick={showMore}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Show More
        </button>
      </div>
    {/if}
  {/if}
</div>