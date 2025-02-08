<script lang="ts">
  import Table from './Table.svelte';
  
  export let data: Array<Record<string, any>> = [];
  export let textColumn: string;
  export let metadataColumns: string[] = [];
  
  // Take 10 rows from the middle of the dataset for preview
  $: previewData = data.slice(
    Math.floor(data.length / 2),
    Math.floor(data.length / 2) + 10
  );
</script>

<div class="space-y-4">
  <h2 class="text-xl font-semibold">Preview</h2>
  <div class="bg-white rounded-lg shadow">
    <Table
      data={previewData}
      {textColumn}
      {metadataColumns}
      showSimilarity={false}
    />
  </div>
</div> 