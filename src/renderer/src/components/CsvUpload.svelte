<script lang="ts">
  import { navigate } from 'svelte-routing';
  import Papa from 'papaparse';

  import { fileDataStore } from '../filestore';


  let {
    validApiKeysSet
  } = $props();

  let error = $state('');

  const handleFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    
    // Parse CSV to get column names and validate it's a valid CSV
    Papa.parse(file, {      
      complete: async (results) => {
        if (results.errors.length > 0) {
          error = 'Invalid CSV file';
          console.error('CSV parsing errors:', results.errors);
          return;
        }
        
        const availableColumns = results.meta.fields || [];
        if (availableColumns.length === 0) {
          error = 'CSV file has no columns';
          return;
        }

        const fileData = {
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          availableColumns,
        };

        // Store the actual file as a base64 string
        const reader = new FileReader();
        reader.onload = () => {
          let fileContent = reader.result as string;
          
          // Check if it's already a file URL encoded -- which is base64 encoded and starts with data:text/csv;base64, prefix
          // in real life it always will be since we used readAsDataURL, but not in test, for some reason
          // probably due to a webdriver quirk.
          // or maybe due to me understanding my build pipeline wrong? in which case this might be unnecessary.
          if (!fileContent.startsWith('data:')) {
            // only needed in test.
            fileContent = 'data:text/csv;base64,' + btoa(fileContent);
          }
          
          fileDataStore.set({
            ...fileData,
            fileContent
          });

          // Navigate to configuration page
          navigate('/configure-upload');
        };
        reader.readAsDataURL(file);
      },
      header: true,
      skipEmptyLines: true,
      preview: 10 // Only parse first 10 rows for validation
    });
  };
</script>

<div class="bg-white p-6 rounded-lg shadow space-y-6 text-black mb-10" data-testid="upload-a-spreadsheet">
  <h2 class="text-xl font-semibold">Upload A Spreadsheet</h2>
  
  <label class="block">
    <span class="sr-only">Choose CSV file</span>
    <input
      type="file"
      accept=".csv"
      onchange={handleFileSelect}
      disabled={!validApiKeysSet}
      class="block w-full text-sm text-slate-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-violet-50 file:text-violet-700
        hover:file:bg-violet-100
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    />
  </label>

  {#if !validApiKeysSet}
    <p class="text-sm text-gray-600">
      Please configure your API keys in Settings before uploading a file.
    </p>
  {/if}

  {#if error}
    <div class="mt-4 text-red-600">{error}</div>
  {/if}
</div>
