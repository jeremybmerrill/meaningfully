<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { debounce } from 'lodash';
  import Preview from './Preview.svelte';
  import { fileDataStore } from '../filestore';

  let {
    validApiKeysSet
  } = $props();

  let fileData: any = $state(null);
  let uploading = $state(false);
  let error = $state('');
  let selectedTextColumn = $state('');
  let selectedMetadataColumns: string[] = $state([]);
  let generatingPreview = $state(false);
  let datasetName = $state('');
  const defaultChunkSize = 100;
  const defaultChunkOverlap = 20;
  let chunkSize = $state(defaultChunkSize);
  let chunkOverlap = $state(defaultChunkOverlap);
  
  // Model options grouped by provider
  const modelOptions = {
    "openai": ["text-embedding-3-small", "text-embedding-3-large"],
    "azure": ["text-embedding-3-small", "text-embedding-3-large"],
    "ollama": ["mxbai-embed-large", "nomic-embed-text"],
    "mistral": ["mistral-embed"],
    "gemini": ["text-embedding-004"]
  };
  
  let modelProvider = $state("openai");
  let modelName = $state("text-embedding-3-small");
  let splitIntoSentences = $state(true);
  let combineSentencesIntoChunks = $state(true);
  let previewData: Array<Record<string, any>> = $state([]);
  let costEstimate: number = $state();
  let tokenCount: number = $state();
  let pricePer1M: number = $state();
  let isCollapsed = $state(true);
  
  // Update model name when provider changes
  $effect(() => {
    if (modelProvider && modelOptions[modelProvider]) {
      modelName = modelOptions[modelProvider][0];
    }
  });

  // Progress tracking
  let progress = $state(0);
  let progressTotal = $state(100);

  onMount(() => {
    fileDataStore.subscribe((data) => {
      if (!data) {
        navigate('/');
        return;
      }

      fileData = data;
      datasetName = fileData.name.replace(/\.csv$/, '');
    });
  });

  // Poll the backend every second for upload progress
  const pollProgress = async () => {
    if (!uploading) return;
    try {
      const result = await window.api.getUploadProgress();
      progress = result.progress;
      progressTotal = result.total;
    } catch(e) {
      console.error("Error fetching progress:", e);
    }
    if (uploading) setTimeout(pollProgress, 1000);
  };

  const generatePreview = async () => {
    if (!fileData || !selectedTextColumn) {
      error = 'Select a text column (or maybe something went wrong with the file you chose)';
      return;
    }
    
    try {
      error = '';
      generatingPreview = true;
      const previewResponse = await window.api.generatePreviewData({
        fileContent: fileData.fileContent,
        fileName: fileData.name,
        datasetName,
        description: 'TK',
        textColumns: [selectedTextColumn],
        metadataColumns: selectedMetadataColumns.map(c => c),
        splitIntoSentences,
        combineSentencesIntoChunks,
        sploderMaxSize: 100,
        modelName,
        modelProvider,
        chunkSize,
        chunkOverlap
      });

      if (previewResponse.success) {
        costEstimate = previewResponse.estimatedPrice;
        tokenCount = previewResponse.tokenCount;
        pricePer1M = previewResponse.pricePer1M;
        previewData = previewResponse.nodes.map(result => ({
          ...result.metadata,
          [selectedTextColumn]: result.text
        }));
      } else {
        error = 'Preview generation failed';
        console.error('Preview generation failed:', previewResponse);
      }
    } catch (e) {
      error = e.message;
    } finally {
      generatingPreview = false;
    }
  };

  const handleUpload = async () => {
    if (!fileData || !selectedTextColumn) {
      error = 'Select a text column (or maybe something went wrong with the file you chose)';
      return;
    }
    
    try {
      uploading = true;
      error = '';

      // Start polling for progress
      pollProgress();
      const uploadResponse = await window.api.uploadCsv({
        fileContent: fileData.fileContent,
        fileName: fileData.name,
        datasetName,
        description: 'TK',
        textColumns: [selectedTextColumn],
        metadataColumns: selectedMetadataColumns.map(c => c),
        splitIntoSentences,
        combineSentencesIntoChunks,
        sploderMaxSize: 100,
        chunkSize,
        chunkOverlap,
        modelName,
        modelProvider
      });

      if (uploadResponse.success) {
        // Clear stored data
        fileDataStore.set(null);
        navigate("/search/" + uploadResponse.documentSetId);
      } else {
        error = 'Upload failed';
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

  const debouncedGeneratePreview = debounce(generatePreview, 1000);

  $effect(() => {
    // Synchronously read all values to establish dependencies
    const params = {
      chunkSize,
      chunkOverlap,
      splitIntoSentences,
      combineSentencesIntoChunks,
      selectedTextColumn,
      selectedMetadataColumns,
      modelName,
      modelProvider,
    };

    // Only trigger preview if we have required values
    if (params.selectedTextColumn || params.selectedMetadataColumns.length) {
      debouncedGeneratePreview();
    }
  });

  const goBack = () => {
    fileDataStore.set(null);
    navigate('/');
  };
</script>

{#if fileData}
  <div class="bg-white p-6 rounded-lg shadow space-y-6 text-black mb-10">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">The Details: Set up semantic search for "{fileData.name}"</h2>
      <button
        onclick={goBack}
        class="text-sm text-gray-600 hover:text-gray-800 underline"
      >
        ← Choose A Different File
      </button>
    </div>
    
    <div class="text-sm text-gray-600">
      File size: {Math.round(fileData.size / 1024)} KB • 
      {fileData.availableColumns.length} columns detected
    </div>
  </div>

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
          What embedding provider should we use?
          <select
            bind:value={modelProvider}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500">
            <option value="openai">OpenAI</option>
            <option value="azure">Azure OpenAI</option>
            <option value="ollama">Ollama</option>
            <option value="mistral">Mistral AI</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </label>  
        <p class="text-xs text-gray-500">
          The provider for the embedding model.
        </p>
      </div>
      
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          What embedding model should we use?
          <select
            bind:value={modelName}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500">
            {#each modelOptions[modelProvider] as modelNameChoice}
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
              {#each fileData.availableColumns as column}
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
            {#each fileData.availableColumns as column}
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
                  Chunk size:
                  <input
                    type="number"
                    bind:value={chunkSize}
                    min="50"
                    max="1000"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                  />
                </label>
              </div>
              <div class="inline-flex max-w-md p-2">
                <label class="block text-sm font-medium text-gray-700">
                  Chunk overlap:
                  <input
                    type="number"
                    bind:value={chunkOverlap}
                    min="0"
                    max="100"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow space-y-6 text-black mb-10">
      {#key costEstimate}
        {#key tokenCount}
          {#key pricePer1M }
            {#if tokenCount > 0 && costEstimate > 0}
              <div data-testid="cost-estimate">
                <h3>Cost Estimate</h3>
                <p class="text-sm text-gray-600">
                  Estimated cost: <strong>${costEstimate.toFixed(4)}</strong> 
                  ({tokenCount.toLocaleString()} tokens at ${pricePer1M.toFixed(2)} per 1M tokens)
                </p>
              </div>
            {/if}
          {/key}
        {/key}
      {/key}
      
      {#key previewData}
        {#key selectedTextColumn}
          {#key selectedMetadataColumns}
            {#if (previewData.length > 0 || generatingPreview) && selectedTextColumn}
              <Preview
                previewData={previewData}
                textColumn={selectedTextColumn}
                metadataColumns={selectedMetadataColumns}
                loading={generatingPreview}
              />
            {/if}
          {/key}
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
        <div class="w-full bg-gray-200 rounded-full h-4 mt-2">
          <div 
            class="bg-violet-600 h-4 rounded-full transition-all duration-500" 
            style="width: {Math.min(100, Math.round((progress / progressTotal) * 100))}%"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-1">
          Progress: {progress <= 5 ? 'processing upload' : ( progress >= 95 ? 'finishing up' : 'embedding') }  ({Math.round((progress / progressTotal) * 100)}%)
        </p>
      {/if }
    </div>
  </div>
{:else}
  <div class="bg-white p-6 rounded-lg shadow space-y-6 text-black mb-10">
    <p>Loading file data...</p>
  </div>
{/if}

{#if error}
  <div class="mt-4 text-red-600">{error}</div>
{/if}
