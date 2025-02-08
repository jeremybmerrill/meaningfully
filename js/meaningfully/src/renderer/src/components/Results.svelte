<script lang="ts">
  import Table from './Table.svelte';
  
  export let results: Array<Record<string, any>> = [];
  export let textColumn: string;
  export let metadataColumns: string[] = [];
</script>

<div class="space-y-4">
  <h2 class="text-xl font-semibold">Search Results</h2>
  <div class="bg-white rounded-lg shadow">
    <Table
      data={results}
      {textColumn}
      {metadataColumns}
      showSimilarity={true}
    />
  </div>
</div> 