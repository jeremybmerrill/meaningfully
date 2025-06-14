<script lang="ts">
    import { Link } from 'svelte-routing'
    interface Props {
        settings: Settings; // TODO: replace with $props call in Svelte5 
        validApiKeysSet: boolean;
    }

    let {  validApiKeysSet }: Props = $props();
</script>

{#if !validApiKeysSet }
    <div class="alert alert-warning" data-testid="api-key-status">
        <p>No OpenAI API key is set. Please <Link to="/settings" class="text-blue text-decoration-line"><span class="text-blue text-decoration-line">add one</span></Link> (or details for another provider) in order to use Meaningfully.</p>
    </div>
{/if}


<style>
.alert {
    padding: 10px;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 5px;
    margin-top: 20px;
}
.alert-warning {
    background-color: #fff3cd;
    color: #856404;
    border-color: #ffeeba;
}
.alert :global(a) , .alert-warning :global(a) { /* hack */
    color: #0d6efd;
    text-decoration: underline;
    cursor: pointer;
    font-weight: bold;
}
</style>