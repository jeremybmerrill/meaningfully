<script lang="ts">
  import Table from './Table.svelte';
  
  export let previewData: Array<Record<string, any>> = [];
  export let textColumn: string;
  export let metadataColumns: string[] = [];
  export let loading: boolean = false;
</script>

<div data-testid="preview" >
  {#if loading}
    <div class="flex justify-center items-center h-full">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
    </div>
  { :else }
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Preview</h2>
      <div class="bg-white rounded-lg shadow text-black">
        <Table
          data={previewData}
          {textColumn}
          {metadataColumns}
          showSimilarity={false}
        />
      </div>
    </div> 
  {/if} 
</div>