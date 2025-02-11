<script lang="ts">
  export let data: Array<Record<string, any>> = [];
  export let textColumn: string;
  export let metadataColumns: string[] = [];
  export let showSimilarity: boolean = false;
  
  // Combine all columns in display order: metadata, similarity
  // text column is always called text internally, but we rename just the header.
  $: columns = [textColumn, ...metadataColumns, ...(showSimilarity ? ['similarity'] : [])];
</script>

<div class="w-full overflow-x-auto">
  <table class="min-w-full table-auto border-collapse">
    <thead>
      <tr class="bg-gray-100">
        {#each columns as column}
          <th class="px-4 py-2 text-left border-b">{column}</th>
        {/each}
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
        </tr>
      {/each}
    </tbody>
  </table>
</div> 