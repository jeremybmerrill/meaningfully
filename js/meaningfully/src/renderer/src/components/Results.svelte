<script lang="ts">
  import Table from './Table.svelte';
  
  export let results: Array<Record<string, any>> = [];
  export let textColumn: string;
  export let metadataColumns: string[] = [];
  export let loading = false;
</script>

<div class="space-y-4">
  <h2 class="text-xl font-semibold">Search Results</h2>
  
  {#if loading}
    <div class="flex justify-center p-8">
      <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  {:else if results.length === 0}
    <div class="p-4 bg-gray-50 text-gray-600 rounded-lg text-center">
      No results found
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow">
      <Table
        data={results}
        {textColumn}
        {metadataColumns}
        showSimilarity={true}
      />
    </div>
  {/if}
</div> 