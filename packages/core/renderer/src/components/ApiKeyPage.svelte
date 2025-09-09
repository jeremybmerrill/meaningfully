<script lang="ts">
    import { navigate } from 'svelte-routing'

    interface Props {
        settings: Settings;
        settingsUpdated: () => void;
    }

    let { settings, settingsUpdated }: Props = $props();
    let openAIKey: string = $state(settings.openAIKey);
    let oLlamaBaseURL: string = $state(settings.oLlamaBaseURL);
    let azureOpenAIKey: string = $state(settings.azureOpenAIKey);
    let azureOpenAIEndpoint: string = $state(settings.azureOpenAIEndpoint);
    let azureOpenAIApiVersion: string = $state(settings.azureOpenAIApiVersion);
    let mistralApiKey: string = $state(settings.mistralApiKey);
    let geminiApiKey: string = $state(settings.geminiApiKey);

    const saveSettings = async () => {
        const newSettings = {
            openAIKey,
            oLlamaBaseURL,
            azureOpenAIKey,
            azureOpenAIEndpoint,
            azureOpenAIApiVersion,
            mistralApiKey,
            geminiApiKey
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
        <label for="openai-key">API Key:</label>
        <input type="text" id="openai-key" data-testid="openai-api-key-input" placeholder="sk-proj-test-1234567890" bind:value={openAIKey} />
    </div>
    <div class="settings-section">
        <h2>OLlama</h2>
        <p>OLlama lets you run embedding models on your computer. This is free (except for electricity, wear-and-tear, etc.).</p>
        <label for="ollama-url">Base URL:</label>
        <input type="text" id="ollama-url" placeholder="http://localhost:11434" bind:value={oLlamaBaseURL} />
    </div>
    <div class="settings-section">
        <h2>Azure OpenAI</h2>
        <p>Azure OpenAI provides the same models as OpenAI through Microsoft's Azure platform.</p>
        <label for="azure-key">API Key:</label>
        <input type="text" id="azure-key" placeholder="API Key" bind:value={azureOpenAIKey} />
        <label for="azure-endpoint">Endpoint:</label>
        <input type="text" id="azure-endpoint" placeholder="https://your-resource-name.openai.azure.com" bind:value={azureOpenAIEndpoint} />
        <label for="azure-version">API Version:</label>
        <input type="text" id="azure-version" placeholder="2024-02-01" bind:value={azureOpenAIApiVersion} />
    </div>
    <div class="settings-section">
        <h2>Mistral AI</h2>
        <p>Mistral AI provides embedding models with competitive pricing.</p>
        <label for="mistral-key">API Key:</label>
        <input type="text" id="mistral-key" placeholder="API Key" bind:value={mistralApiKey} />
    </div>
    <div class="settings-section">
        <h2>Google Gemini</h2>
        <p>Google Gemini provides free embedding models with good performance.</p>
        <label for="gemini-key">API Key:</label>
        <input type="text" id="gemini-key" placeholder="API Key" bind:value={geminiApiKey} />
    </div>

    <button data-testid="save" onclick={saveSettings}>Save</button>

</div>

<style>
    .settings-section {
        margin-bottom: 20px;
        margin-left: 10px;
    }
    .settings-section h2 {
        margin-bottom: 10px;
        margin-left: -10px;
    }
    .settings-section label {
        display: inline-block;
        padding-top: 8px;
        margin-right: 10px;
        font-weight: bold;
        width: 100px;
        vertical-align: top;
    }
    .settings-section input {
        display: inline-block;
        margin-bottom: 10px;
        padding: 8px;
        width: calc(100% - 120px);
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
