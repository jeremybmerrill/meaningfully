<script lang="ts">
  import { run } from 'svelte/legacy';

  import { navigate } from 'svelte-routing';
  import Papa from 'papaparse';
  import Preview from './Preview.svelte';


  let {
    validApiKeysSet,
    fileSelected,
    uploadComplete
  } = $props();
  let files: FileList;
  let uploading = $state(false);
  let error = $state('');
  let availableColumns: string[] = $state([]);
  let selectedTextColumn = $state('');
  let selectedMetadataColumns: string[] = $state([]);
  let showUploadSettings = $state(false); // don't show upload settings until the user has selected a text column and a file.
  let generatingPreview = $state(false); // loading state for the preview data.
  let datasetName = $state('');
  const defaultChunkSize = 100
  const defaultChunkOverlap = 20;
  let chunkSize = $state(defaultChunkSize);
  let chunkOverlap = $state(defaultChunkOverlap);
  const availableModelNames = ["text-embedding-3-small", "text-embedding-3-large"] // TODO: add Llama support, get this from the backend.
  let modelName = $state("text-embedding-3-small");
  let modelProvider = "openai"; // TODO: make configurable
  let splitIntoSentences = $state(true);
  let combineSentencesIntoChunks = $state(true); // aka combineSentencesIntoChunks
  let previewData: Array<Record<string, any>> = $state([]); // processed data from 'backend'
  let costEstimate: number = $state();
  let tokenCount: number = $state();
  let isCollapsed = $state(true);


  const handleFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    fileSelected();

    const file = input.files[0];
    showUploadSettings = false;
    datasetName = file.name.replace(/\.csv$/, '');
    
    // only necessary to get the column names.
    Papa.parse(file, {
      complete: async (results) => {
        availableColumns = results.meta.fields || [];
        selectedTextColumn = '';
        selectedMetadataColumns = [];
        showUploadSettings = true;
      },
      header: true
    });
    files = input.files;
  };

  const generatePreview = async () => {

    if (!files?.[0]) {
      error = 'Please select a file';
      return;
    }
    if (!selectedTextColumn) {
      error = 'Please select a text column';
      return;
    }
    try {
      uploading = true;
      generatingPreview = true;
      error = '';
    
      const response = await window.api.generatePreviewData({
        file: files[0],
        datasetName,
        description: 'TK',
        textColumns: [selectedTextColumn],
        metadataColumns: selectedMetadataColumns.map(c => c), // de-proxy
        splitIntoSentences: splitIntoSentences,
        combineSentencesIntoChunks: combineSentencesIntoChunks,
        sploderMaxSize: 100,
        modelName,
        modelProvider,
        chunkSize,
        chunkOverlap
      });

      if (response.success) {
        costEstimate = response.estimatedPrice; // TODO rename to costEstimate
        tokenCount = response.tokenCount;
        previewData = response.nodes.map(result => ({ // TODO Factor this out if preview and search use the same data structure.
          ...result.metadata, // flatten the metadata so that this object is the same shape as a CSV row.
          [selectedTextColumn]: result.text
        })); 

        showUploadSettings = true;
        generatingPreview = false;
      } else {
        error =  'Upload failed';
        generatingPreview = false;
      }
    } catch (e) {
      error = e.message;
    } finally {
      uploading = false;
    }
  };

  const handleUpload = async () => {
    if (!files?.[0]) {
      error = 'Please select a file';
      return;
    }
    if (!selectedTextColumn) {
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
        metadataColumns: selectedMetadataColumns.map(c => c), // de-proxy
        splitIntoSentences: splitIntoSentences,
        combineSentencesIntoChunks: combineSentencesIntoChunks,
        sploderMaxSize: 100,
        chunkSize,
        chunkOverlap,
        modelName,
        modelProvider
      });

      if (response.success) {
        uploadComplete();
        navigate("/search/" + response.documentSetId);
        showUploadSettings = false;
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

  const toggleTextHandlingSectionCollapse = () => {
    isCollapsed = !isCollapsed;
  };
  run(() => {
    if (selectedTextColumn || selectedMetadataColumns.length || chunkSize != defaultChunkSize || chunkOverlap != defaultChunkOverlap) {
      generatePreview();
    }
  });
</script>

<div class="bg-white p-6 rounded-lg shadow space-y-6 text-black mb-10" data-testid="upload-a-spreadsheet">
  <h2 class="text-xl font-semibold">Upload A Spreadsheet</h2>
  
  <label class="block">
    <span class="sr-only">Choose CSV file</span>
    <input
      type="file"
      accept=".csv"
      onchange={handleFileSelect}
      class="block w-full text-sm text-slate-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-violet-50 file:text-violet-700
        hover:file:bg-violet-100
      "
    />
  </label>
</div>

{#if showUploadSettings && availableColumns.length > 0}
  <div data-testid="csv-upload-settings">
    <div class="bg-white p-6 rounded-lg shadow space-y-6 text-black mb-10">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Give the spreadsheet a name:
          <input
            type="text"
            data-testid="dataset-name-input"
            bind:value={datasetName}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
          />
        </label>
        <p class="text-xs text-gray-500">
          The name is just for you. Use something that will help you remember what this spreadsheet is.
        </p>
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          What embedding model should we use?
          <select
            bind:value={modelName}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500">
            {#each availableModelNames as modelNameChoice}
              <option value={modelNameChoice}>{modelNameChoice}</option>
            {/each}
          </select>
        </label>  
        <p class="text-xs text-gray-500">
          The model used to generate embeddings for the text.
        </p>
      </div>
    </div>
  
    <div class="bg-white p-6 rounded-lg shadow space-y-6 text-black mb-10">
      <h3>Column Configuration</h3>
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Which column holds the text you want to search?
            <select
              bind:value={selectedTextColumn}
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              data-testid="column-to-embed-select"
            >
              <option value="">Select a column...</option>
              {#each availableColumns as column}
                <option value={column}>{column}</option>
              {/each}
            </select>
          </label>
        </div>

        <div class="space-y-2">
          <p class="block text-sm font-medium text-gray-700">
            Which other columns should be shown in the results, and available for filtering?
          </p>
          <p class="text-xs text-gray-500">
            For instance, if your spreadsheet has a <code>Category</code> column, you might want to select it so you can filter by it when searching. If it has a 
            <code>URL</code>, you might select it so you can click through to the original.
          </p>
          <div class="flex flex-wrap gap-2">
            {#each availableColumns as column}
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  id={`metadata-${column}`}
                  checked={selectedMetadataColumns.includes(column)}
                  disabled={column === selectedTextColumn}
                  onchange={() => toggleMetadataColumn(column)}
                  class="rounded border-gray-300 text-violet-600 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                />
                <span class="ml-2 text-sm text-gray-700">{column}</span>
              </label>
            {/each}
          </div>
        </div>
      </div>    
    </div>
    <div class="bg-white p-6 rounded-lg shadow space-y-6 text-black mb-10">
      <h3><button onclick={toggleTextHandlingSectionCollapse}>Text Handling Options {isCollapsed ? '›' : '⌄'}</button></h3>

      {#if !isCollapsed}
        <div class="space-y-6">
          <div class="space-y-2 flex flex-wrap gap-2">
            <p>Each text might contain multiple ideas. Meaningfully tries to represent these ideas at multiple levels, returning search results of a 1, 2 or 3 sentences long</p>
            <label class="inline-flex items-center">
              <input
                type="checkbox"
                bind:checked={splitIntoSentences}
                class="rounded border-gray-300 text-violet-600 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              />
              <span class="ml-2 text-sm text-gray-700">Split into sentences?</span>
            </label>
            <label class="inline-flex items-center">
              <input
                type="checkbox"
                bind:checked={combineSentencesIntoChunks}
                class="rounded border-gray-300 text-violet-600 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              />
              <span class="ml-2 text-sm text-gray-700">Combine sentences into chunks?</span>
            </label>
          </div>

          <div class="space-y-2">
            <h3>Split long sentences into chunks</h3>
            <div class="flex flex-wrap gap-2">
              <div class="inline-flex max-w-md p-2">
                <label class="block text-sm font-medium text-gray-700">
                  Chunk Size (in tokens):
                  <input
                    type="range"
                    bind:value={chunkSize}
                    min="10"
                    max="500"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                  />
                </label>
                <p class="text-xs text-gray-500">
                  Split each text into chunks of about this many words.
                  (Sentences will stay together.)
                </p>
              </div>
              <div class="inline-flex max-w-md p-2">
                <label class="block text-sm font-medium text-gray-700">
                  Chunk Overlap (in tokens):
                  <input
                    type="range" 
                    bind:value={chunkOverlap}
                    min="0"
                    max="500"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                  />
                </label>  
                <p class="text-xs text-gray-500">
                  If a text is split into multiple chunks, about this many words between chunks will overlap.
                </p>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    <div class="bg-white p-6 rounded-lg shadow space-y-6 text-black mb-10">
      {#key costEstimate}
        {#key tokenCount}
          {#if tokenCount > 0 && costEstimate > 0}
            <div data-testid="cost-estimate">
              <p>Cost estimate: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(costEstimate)} for {new Intl.NumberFormat("en-US").format(tokenCount)} tokens </p>
              <p>Disclaimer: You are responsible for all costs. The estimate might be wrong. Price and model name TK</p>
            </div>
          {/if}
        {/key}
      {/key}
      
      {#key previewData}
        {#key selectedTextColumn}
          {#key selectedMetadataColumns}
            {#if (previewData.length > 0 || generatingPreview) && selectedTextColumn}
              <Preview
                loading={generatingPreview}
                previewData={previewData}
                textColumn={selectedTextColumn}
                metadataColumns={selectedMetadataColumns}
              />
            {/if}
          {/key}
        {/key}

      <button
        onclick={handleUpload}
        data-testid="upload-button"
        disabled={!selectedTextColumn || uploading || !validApiKeysSet}
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload Spreadsheet'}
      </button>
      {#if uploading}
        <p>This could take a few minutes. Go get a cup of coffee or re-arrange your MySpace Top 8.</p>
      {/if }
    </div>
  </div>
{/if}

{#if error}
  <div class="mt-4 text-red-600">{error}</div>
{/if}
