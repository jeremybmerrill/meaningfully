<script lang="ts">
    import { navigate } from 'svelte-routing'

    interface Props {
        settings: Settings;
        settingsUpdated: () => void;
    }

    let { settings, settingsUpdated }: Props = $props();
    let openAIKey: string = $state(settings.openAIKey);
    let oLlamaModelType: string = $state(settings.oLlamaModelType);
    let oLlamaBaseURL: string = $state(settings.oLlamaBaseURL);

    const saveSettings = async () => {
        const newSettings = {
            openAIKey,
            oLlamaModelType,
            oLlamaBaseURL
        };

        try {
            const response = await window.api.setSettings(newSettings);
            if (!response.success) {
                throw new Error('Failed to save settings');
            }
            settingsUpdated();
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
        <input type="text" data-testid="openai-api-key-input" placeholder="sk-proj-test-1234567890" bind:value={openAIKey} />
    </div>
    <div class="settings-section">
        <h2>OLlama</h2>
        <p>OLlama lets you run embedding models on your computer. This is free (except for electricity, wear-and-tear, etc.).</p>
        <input type="text" placeholder="mxbai-embed-large" bind:value={oLlamaModelType} />
        <input type="text" placeholder="http://localhost:11434" bind:value={oLlamaBaseURL} />
    </div>

    <button data-testid="save" onclick={saveSettings}>Save</button>

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
