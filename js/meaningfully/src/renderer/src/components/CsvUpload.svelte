<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Papa from 'papaparse';
  import Preview from './Preview.svelte';

  const dispatch = createEventDispatcher();

  let files: FileList;
  let uploading = false;
  let error = '';
  let parsedData: Array<Record<string, any>> = [];
  let availableColumns: string[] = [];
  let selectedTextColumn = '';
  let selectedMetadataColumns: string[] = [];
  let showPreview = false;
  let datasetName = '';

  const handleFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    showPreview = false;
    datasetName = file.name.replace(/\.csv$/, '');
    
    Papa.parse(file, {
      complete: async (results) => {
        parsedData = results.data;
        availableColumns = results.meta.fields || [];
        selectedTextColumn = '';
        selectedMetadataColumns = [];
        showPreview = true;
      },
      header: true
    });
  };

  const handleUpload = async () => {
    if (!selectedTextColumn || !files?.[0]) {
      error = 'Please select a text column';
      return;
    }

    try {
      uploading = true;
      error = '';
      
      const response = await window.api.uploadCsv({
        file: files[0],
        datasetName,
        description: 'TK',
        textColumns: [selectedTextColumn],
        metadataColumns: selectedMetadataColumns
      });

      if (response.success) {
        dispatch('upload-complete');
        showPreview = false;
        parsedData = [];
        files = null;
      } else {
        error =  'Upload failed';
      }
    } catch (e) {
      error = e.message;
    } finally {
      uploading = false;
    }
  };

  const toggleMetadataColumn = (column: string) => {
    if (column === selectedTextColumn) return;

    const index = selectedMetadataColumns.indexOf(column);
    if (index === -1) {
      selectedMetadataColumns = [...selectedMetadataColumns, column];
    } else {
      selectedMetadataColumns = selectedMetadataColumns.filter(c => c !== column);
    }
  };
</script>

<div class="bg-white p-6 rounded-lg shadow space-y-6">
  <h2 class="text-xl font-semibold">Upload New Dataset</h2>
  
  <label class="block">
    <span class="sr-only">Choose CSV file</span>
    <input
      type="file"
      accept=".csv"
      on:change={handleFileSelect}
      class="block w-full text-sm text-slate-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-violet-50 file:text-violet-700
        hover:file:bg-violet-100
      "
    />
  </label>

  {#if showPreview && availableColumns.length > 0}
    <div class="space-y-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Dataset Name:
          <input
            type="text"
            bind:value={datasetName}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
          />
        </label>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Select Text Column:
          <select
            bind:value={selectedTextColumn}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
          >
            <option value="">Select a column...</option>
            {#each availableColumns as column}
              <option value={column}>{column}</option>
            {/each}
          </select>
        </label>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Select Metadata Columns:
        </label>
        <div class="flex flex-wrap gap-2">
          {#each availableColumns as column}
            <label class="inline-flex items-center">
              <input
                type="checkbox"
                id={`metadata-${column}`}
                checked={selectedMetadataColumns.includes(column)}
                disabled={column === selectedTextColumn}
                on:change={() => toggleMetadataColumn(column)}
                class="rounded border-gray-300 text-violet-600 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              />
              <span class="ml-2 text-sm text-gray-700">{column}</span>
            </label>
          {/each}
        </div>
      </div>

      <Preview
        data={parsedData}
        textColumn={selectedTextColumn}
        metadataColumns={selectedMetadataColumns}
      />

      <button
        on:click={handleUpload}
        disabled={!selectedTextColumn || uploading}
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload Dataset'}
      </button>
    </div>
  {/if}

  {#if error}
    <div class="mt-4 text-red-600">{error}</div>
  {/if}
</div> 