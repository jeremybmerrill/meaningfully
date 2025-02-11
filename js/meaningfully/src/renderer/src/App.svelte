<script lang="ts">
  import { Router, Route } from "svelte-routing"; // also Link
  import SearchPage from './components/SearchPage.svelte'
  import FrontPage from './components/FrontPage.svelte'
//  import electronLogo from './assets/electron.svg'

</script>

<!-- <img alt="logo" class="logo" src={electronLogo} /> -->
<div class="creator">Built with ❤️ at The Eclectic Company</div>
<h1>Meaningfully</h1>
<div class="text">
  Semantic search for your spreadsheets
</div>
<p class="tip">Please try pressing <code>F12</code> to open the devTool</p>

<Router>
  <main class="container mx-auto px-4 py-8">
    <Route path="/" component={FrontPage} />
    <Route path="/search/:id" component={SearchPage} />
  </main>
</Router>
