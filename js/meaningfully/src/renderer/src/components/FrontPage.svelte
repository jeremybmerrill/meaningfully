<script lang="ts">
    import ExistingDatabases from './ExistingDatabases.svelte'
    import CsvUpload from './CsvUpload.svelte'

    let databasesComponent: ExistingDatabases
</script>


<div class="container mx-auto px-4 space-y-8">
    <CsvUpload on:file-selected={() => {databasesComponent.hide()}} on:upload-complete={() => {
      databasesComponent.loadDocumentSets(); 
      databasesComponent.show();
    }}/>
    <ExistingDatabases bind:this={databasesComponent}/>
</div>
  