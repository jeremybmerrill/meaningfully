<script lang="ts">
</script>


<div class="container mx-auto px-4 space-y-8">
    <h1>Help</h1>
    <section>
        <h2>What is Semantic Search?</h2>
        <p>
            Keyword search has been the only kind of search for decades. Sometimes it fails:
        </p>

            <ul>
                <li>Ambiguity and synonyms (people getting fired and things catching on fire, cars and automobiles)</li>
                <li>Circumlocutions and legalese</li>
                <li>Documents written by laypeople describing complex situations in widely-varied language</li>
                <li>Typos</li>
                <li>Multilingual documents</li>
            </ul>
        <p>
            Semantic search works better in these situations, by finding results that <i>mean</i> something
            similar to the query. Even if the words are completely different, semantic search can still
            surface the results you need.
        </p>
    </section>
    <section>
        <h2> a CSV</h2>
        <p>
            You can select a CSV from your computer to "upload" it to Meaningfully. Then, select one column
            from the CSV to search semantically, and any number of other columns to be shown alongside it in results.
        </p>
        <p>
            Once you upload the CSV, each entry in the chosen column will be embedded, with the results stored on your
            computer. If you choose a remote embedding API -- like OpenAI's text-embedding-small or text-embedding-large --
            then the entries in your column will be sent
            to that service; if you choose a local one, then the data will not leave your computer.
        </p>
        <p>
            Meaningfully provides additional options:
        </p>
        <ul>
            <li>Split long text into sentences. When a single row contains many ideas, splitting it by sentence helps the search surface 
                results that match a single idea.
            </li>
            <li>Combine short sentences into chunks. You can adjust how large the chunks are and how much overlap exists between chunks.</li>
        </ul>
        <p>
            Embedding can take a while, especially for large CSVs with 10,000 or more rows. Once it finishes, you'll
            be able to search your CSV.
        </p>
    </section>
    <section>
        <h2>How should I write my search query?</h2>
        <p>
            <strong>Do: </strong> Imagine the perfect version of what you're looking for, that you wish exists in your spreadsheet. <span class="block whitespace-pre overflow-x-scroll">My car caught on fire as I was driving on the highway.</span>
        </p>
        <p>
            <strong>Don't: </strong> Just write keywords. <span class="block whitespace-pre overflow-x-scroll">crash OR fire OR aflame</span>
        </p>
        <p>
            <strong>Don't: </strong> Ask a question, like you would to a chatbot. <span class="block whitespace-pre overflow-x-scroll">Please find me examples about cars catching on fire.</span>
        </p>

    </section>
    <section>
        <h2>How much does it cost?</h2>
        <p>
            Generally less than a dollar per document set, but you're paying OpenAI, not me, and you're responsible for all costs, no matter what.
        </p>
        <p>
            Eventually, some Meaningfully features may require payment.
        </p>
    </section>
    <section>
        <h2>How can I support development of Meaningfully??</h2>
        <p>
            You can <a href="https://buymeacoffee.com/jeremybmerrill">Buy Me A Coffee</a>.
        </p>

    </section>
</div>
  
<style>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    h2 {
        font-size: 1.5rem;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
    }

    p {
        margin-bottom: 0.5rem;
        margin-top: 0.5rem;
    }

    /* ol {
        margin-left: 20px;
    }       
    ol li {
        list-style-type: decimal;
        list-style-position: inside;
        padding-left: 0.5rem;
    } */
    ul li {
        list-style-type: disc;
        list-style-position: inside;
        padding-left: 0.5rem;
    }
</style>
