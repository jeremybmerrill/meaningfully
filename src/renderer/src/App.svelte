<script lang="ts">
  import { onMount } from 'svelte';
  import { Router, Route, Link } from "svelte-routing"; // also Link
  import SearchPage from './components/SearchPage.svelte'
  import FrontPage from './components/FrontPage.svelte'
  import ApiKeyPage from './components/ApiKeyPage.svelte'
  import HelpPage from './components/HelpPage.svelte'
  import ApiKeyStatus from './components/ApiKeyStatus.svelte'
//  import electronLogo from './assets/electron.svg'
  let url = $state("");
  let settings: Settings | null = $state(null);
  let frontPageComponent: FrontPage = $state();

  const getSettings = async () => {
      try {
          settings = await window.api.getSettings();
      } catch (error) {
          console.error('Error fetching settings:', error);
      }
  };
  
  const handleHomeClick = () => {
    if (frontPageComponent) {
      frontPageComponent.resetToHome();
    }
  };
  
  let validApiKeysSet = $derived(settings && !!(
    (!!settings.openAIKey) || 
    (settings.oLlamaBaseURL) ||
    (settings.azureOpenAIKey && settings.azureOpenAIEndpoint) ||
    (!!settings.mistralApiKey) ||
    (!!settings.geminiApiKey)
  ));

  onMount(getSettings);

</script>

<!-- <img alt="logo" class="logo" src={electronLogo} /> -->

<Router url={url} >
  <Link to="/" onclick={handleHomeClick}>
    <h1 class="text-2xl font-bold">
      Meaningfully
    </h1>
  </Link>

  <h2 class="text-xl font-semibold">
    Semantic search for your spreadsheets
  </h2>

  {#if settings}
    <ApiKeyStatus settings={settings} validApiKeysSet={validApiKeysSet} />
  {/if}

  <main class="container mx-auto px-4 py-8">
    <Route path="">
      <FrontPage bind:this={frontPageComponent} validApiKeysSet={validApiKeysSet} />
    </Route>
    <Route path="search/:id"><SearchPage validApiKeysSet={validApiKeysSet} /></Route>
    <Route path="help" component={HelpPage} />
    <Route path="settings">
      {#if settings}
        <ApiKeyPage settings={settings} settingsUpdated={() => getSettings() } />
      {/if}
    </Route>
  </main>

  <nav class="navbar">
    <Link to="" class="nav-link underline text-blue-600 hover:text-blue-800 visited:text-purple-600" onclick={handleHomeClick}>Home</Link>
    <Link to="help" class="nav-link underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Help</Link>
    <Link to="settings" class="nav-link underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Settings / API Keys</Link>
    <span class="nav-link">Built with ✨ by Jeremy</span>
    <span class="nav-link">© 2025</span>
  </nav>

</Router>


