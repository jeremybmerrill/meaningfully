<script lang="ts">
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing'

    let openAIKey: string = null;
    let oLlamaModelType: string = null;
    let oLlamaBaseURL: string = null;

    let loading = true;
    const getSettings = async () => {
        try {
            const settings = await window.api.getSettings();
            openAIKey = settings.openAIKey;
            oLlamaModelType = settings.oLlamaModelType;
            oLlamaBaseURL = settings.oLlamaBaseURL;
            loading = false;
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const saveSettings = async () => {
        const settings = {
            openAIKey: openAIKey,
            oLlamaModelType: oLlamaModelType,
            oLlamaBaseURL: oLlamaBaseURL
        };
        try {
            const response = await window.api.setSettings(settings);

            if (!response.success) {
                throw new Error('Failed to save settings');
            }

            navigate("/");
        } catch (error) {
            console.error(error);
            alert('Error saving settings');
        }
    };
    onMount(() => {
        getSettings();
    });
</script>

<div>
    <h1>Settings and API Keys</h1>

    {#if loading}
        <p>Loading settings...</p>
    {:else}
        <p>Configure API keys for at least one provider.</p>
        <div class="settings-section">
            <h2>OpenAI</h2>
            <p>OpenAI provides embeddings at a (generally very cheap) cost.</p>
            <input type="text" placeholder="sk-proj-test-1234567890" bind:value={openAIKey} />
        </div>
    
        <div class="settings-section">
            <h2>OLlama</h2>
            <p>OLlama lets you run embedding models on your computer. This is free (except for electricity, wear-and-tear, etc.).</p>
            <input type="text" placeholder="mxbai-embed-large" bind:value={oLlamaModelType} />
            <input type="text" placeholder="http://localhost:11434" bind:value={oLlamaBaseURL} />
        </div>
    
        <button on:click={saveSettings}>Save</button>
    
    {/if}
</div>


<style>
    .settings-section {
        margin-bottom: 20px;
    }

    .settings-section h2 {
        margin-bottom: 10px;
    }

    .settings-section input {
        display: block;
        margin-bottom: 10px;
        padding: 8px;
        width: 100%;
        box-sizing: border-box;
    }

    button {
        padding: 10px 20px;
        background-color: #007BFF;
        color: white;
        border: none;
        cursor: pointer;
    }

    button:hover {
        background-color: #0056b3;
    }
</style>