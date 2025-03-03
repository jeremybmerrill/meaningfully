<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { navigate } from 'svelte-routing'

    const dispatch = createEventDispatcher();

    const maskKey = (key: string, n: number = 20): string => {
        return (key && key.length > (n*2)) ? key.slice(0, n) + "*******" + key.slice(key.length - n) : key;
    };

    export let settings : Settings;  // TODO: replace with $props call in Svelte5 
    console.log("apikeypage settings", settings);
    let realOpenAIKey: string = settings.openAIKey;
    let displayedOpenAIKey: string = maskKey(settings.openAIKey);
    let oLlamaModelType: string = settings.oLlamaModelType;
    let oLlamaBaseURL: string = settings.oLlamaBaseURL;

    const saveSettings = async () => {
        if (displayedOpenAIKey != maskKey(realOpenAIKey)) {
            // If the displayed key has changed from the masked version of the set key,
            // then the displayed key is new, and we should set it.
            realOpenAIKey = displayedOpenAIKey;
        }
        const settings = {
            openAIKey: realOpenAIKey,
            oLlamaModelType: oLlamaModelType,
            oLlamaBaseURL: oLlamaBaseURL
        };

        try {
            const response = await window.api.setSettings(settings);

            if (!response.success) {
                throw new Error('Failed to save settings');
            }
            dispatch('SettingsUpdated');
            navigate("/");
        } catch (error) {
            console.error(error);
            alert('Error saving settings');
        }
    };
</script>

<div>
    <h1>Settings and API Keys</h1>

    <p>Configure API keys for at least one provider.</p>
    <div class="settings-section">
        <h2>OpenAI</h2>
        <p>OpenAI provides embeddings at a (generally very cheap) cost.</p>
        <input type="text" placeholder="sk-proj-test-1234567890" bind:value={displayedOpenAIKey} />
    </div>

    <div class="settings-section">
        <h2>OLlama</h2>
        <p>OLlama lets you run embedding models on your computer. This is free (except for electricity, wear-and-tear, etc.).</p>
        <input type="text" placeholder="mxbai-embed-large" bind:value={oLlamaModelType} />
        <input type="text" placeholder="http://localhost:11434" bind:value={oLlamaBaseURL} />
    </div>

    <button on:click={saveSettings}>Save</button>

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
