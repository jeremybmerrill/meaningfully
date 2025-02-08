<script lang="ts">
  import ExistingDatabases from './components/ExistingDatabases.svelte'
  import CsvUpload from './components/CsvUpload.svelte'

//  import electronLogo from './assets/electron.svg'

  let databasesComponent: ExistingDatabases
</script>

<!-- <img alt="logo" class="logo" src={electronLogo} /> -->
<div class="creator">Built with ❤️ at The Eclectic Company</div>
<h1>Meaningfully</h1>
<div class="text">
  Semantic search for your spreadsheets
</div>
<p class="tip">Please try pressing <code>F12</code> to open the devTool</p>

<div class="container mx-auto px-4 space-y-8">
  <CsvUpload on:upload-complete={() => {
    // Optionally refresh the ExistingDatabases component loadDocumentSets
    databasesComponent.loadDocumentSets()
  }}/>
  <ExistingDatabases />
</div>
