<script lang="ts">
  import Table from './Table.svelte';
  
  export let data: Array<Record<string, any>> = [];
  export let textColumn: string;
  export let metadataColumns: string[] = [];
  console.log("Preview data", data);
  // Take 10 rows from the middle of the dataset for preview
  const previewData = data.slice(
    Math.floor(data.length / 2),
    Math.floor(data.length / 2) + 10
  );
  console.log("previewData", previewData);
  console.log("textColumn", textColumn);
  console.log("metadataColumns", metadataColumns);
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