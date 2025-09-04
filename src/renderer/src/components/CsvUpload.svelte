<script lang="ts">
  import { navigate } from 'svelte-routing';
  import Papa from 'papaparse';
  import { openDB } from 'idb';

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

        // Store file data in IndexedDB for the next step
        const db = await openDB('CsvUploadDB', 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('files')) {
              db.createObjectStore('files', { keyPath: 'id' });
            }
          },
        });

        const fileId = `${file.name}-${file.lastModified}`;
        const reader = new FileReader();
        reader.onload = async () => {
          const fileContent = reader.result as string;
          await db.put('files', {
            id: fileId,
            name: file.name,
            size: file.size,
            lastModified: file.lastModified,
            availableColumns,
            fileContent,
          });

          // Navigate to configuration page with fileId
          navigate(`/configure-upload?fileId=${encodeURIComponent(fileId)}`);
        };
        reader.readAsDataURL(file);
      },
      header: true,
      skipEmptyLines: true,
      preview: 10, // Only parse first 10 rows for validation
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
