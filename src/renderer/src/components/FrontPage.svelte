<script lang="ts">
    import ExistingDatabases from './ExistingDatabases.svelte'
    import CsvUpload from './CsvUpload.svelte'

    let databasesComponent: ExistingDatabases = $state()
  interface Props {
    validApiKeysSet: boolean;
  }

  let { validApiKeysSet }: Props = $props();
</script>


<div class="container mx-auto px-4 space-y-8">
    <CsvUpload 
        validApiKeysSet={validApiKeysSet}
        fileSelected={() => {databasesComponent.hide()}}
        uploadComplete={() => {
          databasesComponent.loadDocumentSets(); 
          databasesComponent.show();
        }}/>
    <ExistingDatabases bind:this={databasesComponent}/>
</div>
  