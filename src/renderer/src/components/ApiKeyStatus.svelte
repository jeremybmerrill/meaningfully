<script lang="ts">
    import { onMount } from 'svelte';
    import { Link } from 'svelte-routing'

    let openAIKey: string = null;
    let oLlamaModelType: string = null;
    let oLlamaBaseURL: string = null;

    $: noValidApiKeysSet = false;
    const getSettings = async () => {
        try {
            const settings = await window.api.getSettings();
            openAIKey = settings.openAIKey;
            oLlamaModelType = settings.oLlamaModelType;
            oLlamaBaseURL = settings.oLlamaBaseURL;
            noValidApiKeysSet = !settings.openAIKey && !(settings.oLlamaModelType && settings.oLlamaBaseURL);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    onMount(() => {
        getSettings();
    });
</script>

{#if noValidApiKeysSet }
    <div class="alert alert-warning">
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