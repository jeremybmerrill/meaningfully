<script lang="ts">
  import { Router, Route } from "svelte-routing"; // also Link
  import SearchPage from './components/SearchPage.svelte'
  import FrontPage from './components/FrontPage.svelte'
  import HelpPage from './components/HelpPage.svelte'

//  import electronLogo from './assets/electron.svg'

</script>

<!-- <img alt="logo" class="logo" src={electronLogo} /> -->
<h1 class="text">
  Meaningfully
</h1>
<h2 class="text">
  Semantic search for your spreadsheets
</h2>

<Router>
  <main class="container mx-auto px-4 py-8">
    <Route path="/" component={FrontPage} />
    <Route path="/search/:id" component={SearchPage} />
    <Route path="/help" component={HelpPage} />
  </main>
</Router>

<div class="creator">Built with ❤️ at The Eclectic Company</div>

