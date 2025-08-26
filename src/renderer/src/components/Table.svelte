<script lang="ts">
  interface Props {
    data?: Array<Record<string, any>>;
    textColumn: string;
    metadataColumns?: string[];
    showSimilarity?: boolean;
    showShowOriginal?: boolean;
    originalDocumentClick?: (sourceNodeId: string) => void;
  }

  let {
    data = [],
    textColumn,
    metadataColumns = [],
    showSimilarity = false,
    showShowOriginal = false,
    originalDocumentClick = () => {},
  }: Props = $props();

  // Combine all columns in display order: metadata, similarity
  // text column is always called text internally, but we rename just the header.
  let columns = $derived([textColumn, ...metadataColumns, ...(showSimilarity ? ['similarity'] : [])]);

  function sanitizeAndFormatText(text: string): string {
    text = text.trim().replace(/^\\n/, '').replace(/\\n$/, '');
    // First escape special characters
    const escaped = text.replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
    
    // Then convert newlines to <br> tags
    return escaped.replace(/\\n/g, '<br>');
  }

  function is_link(text: string): boolean {
    if (typeof text !== 'string') return false;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return urlPattern.test(text);
  }

  function linkify(text_that_is_a_link: string): string {
    return `<a href="${text_that_is_a_link}" target="_blank" class="text-blue-500 hover:underline">${text_that_is_a_link}</a>`;
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
              {:else if column === textColumn}
                {@html sanitizeAndFormatText(row[column] || '')}
              {:else if is_link(row[column])}
                {@html linkify(row[column])}
              {:else}
                {(row[column]) || ''}
              {/if}
            </td>
          {/each}
          {#if showShowOriginal}
            <td class="px-4 py-2">
              <button data-testid="result-modal-button" class="text-blue-500 hover:text-blue-700" onclick={() => originalDocumentClick(row.sourceNodeId)}>Original Document</button>
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>