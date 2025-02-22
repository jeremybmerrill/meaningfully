<script lang="ts">
  import { Router, Route, Link } from "svelte-routing"; // also Link
  import SearchPage from './components/SearchPage.svelte'
  import FrontPage from './components/FrontPage.svelte'
  import ApiKeyPage from './components/ApiKeyPage.svelte'
  import HelpPage from './components/HelpPage.svelte'
//  import electronLogo from './assets/electron.svg'

</script>

<!-- <img alt="logo" class="logo" src={electronLogo} /> -->

<Router>
  <Link to="/">
    <h1 class="text-2xl font-bold">
      Meaningfully
    </h1>
  </Link>

  <h2 class="text-xl font-semibold">
    Semantic search for your spreadsheets
  </h2>

  <main class="container mx-auto px-4 py-8">
    <Route path="/" component={FrontPage} />
    <Route path="/search/:id" component={SearchPage} />
    <Route path="/help" component={HelpPage} />
    <Route path="/settings" component={ApiKeyPage} />
  </main>

  <nav class="navbar">
    <Link to="/" class="nav-link underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Home</Link>
    <Link to="/help" class="nav-link underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Help</Link>
    <Link to="/settings" class="nav-link underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Settings / API Keys</Link>
    <span class="nav-link">Built with ✨ by Jeremy</span>
    <span class="nav-link">© 2025</span>
  </nav>

</Router>


