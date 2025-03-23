<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let data: Array<Record<string, any>> = [];
  export let textColumn: string;
  export let metadataColumns: string[] = [];
  export let showSimilarity: boolean = false;
  export let showShowOriginal: boolean = false;
  const dispatch = createEventDispatcher();

  // Combine all columns in display order: metadata, similarity
  // text column is always called text internally, but we rename just the header.
  $: columns = [textColumn, ...metadataColumns, ...(showSimilarity ? ['similarity'] : [])];

  function handleOriginalDocumentClick(documentId: string) {
    dispatch('originalDocumentClick', { documentId });
  }
</script>

<div class="w-full overflow-x-auto">
  <table class="min-w-full table-auto border-collapse">
    <thead>
      <tr class="bg-gray-100">
        {#each columns as column}
          <th class="px-4 py-2 text-left border-b">{column}</th>
        {/each}
        {#if showShowOriginal}
          <th class="px-4 py-2 text-left border-b"></th><!-- blank column for show all button-->
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each data as row}
        <tr class="border-b hover:bg-gray-50">
          {#each columns as column}
            <td class="px-4 py-2">
              {#if column === 'similarity' && row[column] !== undefined}
                {(row[column] * 100).toFixed(1)}%
              {:else}
                {(row[column]) || ''}
              {/if}
            </td>
          {/each}
          {#if showShowOriginal}
            <td class="px-4 py-2">
              <button class="text-blue-500 hover:text-blue-700" on:click={() => handleOriginalDocumentClick(row.sourceNodeId)}>Original Document</button>
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>