# Meaningfully (is still in pre-alpha but you can try it!)

Meaningfully is a semantic search tool for text data in spreadsheets. 

Keyword searching in Excel or Google Sheets is painful because text data is displayed awkwardly and because keywords miss circumlocutions, typos, unexpected wording and foreign-language data. Semantic search solves all of that. Meaningfully works best for *semi-structured* data, where you have thousands of instances of a type and want to find certain instances.

For example:

  - consumer complaints about a product or business
  - credit card transactions
  - descriptions of government contracts
  - responses to a survey

## Who is this for?

Journalists, researchers, academics, people who do surveys or solicit submissions, anybody.

## What is semantic search?

It's a middle-ground between AI chatbot search and keyword search. It uses the smarts of AI to 'understand' human language, but doesn't risk making stuff up like AI.

## Is Meaningfully ready to use?

Not really, but you can try it! It is kind of the minimum viable semantic search app. If people like it, I hope to sand down the rough edges and build extra features. Right now, I make zero promises about whether it will work. **Please email me or open a ticket to tell me about how Meaningfully worked (or didn't work) for you.**

In particular, Meaningfully is _slow_ and can't handle large document sets (>10,000 rows, let's say) yet.

## How do I search with meaningfully?

Once you've uploaded a CSV with a text column, search is simple.

![a screenshot of the search page, with a query "he got fired" and a result saying "There are no modifications to Mr. Smith's compensation arrangements in connection with his departure.  He will not receive severance and will forfeit all equity that has not vested as of his termination date."](https://raw.githubusercontent.com/jeremybmerrill/meaningfully/main/docs/img/search-result.png)


1. 🤔 Just imagine what you're looking for, then imagine a phrase or sentence from that perfect result. Like, "he got fired."
2. Type the imagined phrase or sentence in the search box, and then click search.
3. Hopefully the closest results from the CSV will appear at the top of the search results.

You can also filter by metadata attributes.

<!-- 
## How do I upload a CSV to meaningfully?

1. 
2.  -->

## Is meaningfully free?

Mostly. Semantic search requires "embedding" snippets of your document into numbers. You can do this on your computer, but it's very slow, but free (but for your electric bill). I recommend you get an OpenAI API key, put it into meaningfully, and use that; you'll be responsible for the OpenAI charges, but meaningfully doesn't cost any extra on top of that. (And it's generally very cheap. Most spreadsheets, even with tens of thousands of rows, will cost a few pennies.)

Eventually, meaningfully may include some paid options.

## How can I run this app myself?

### Install

Visit meaningfully's [release page](https://github.com/jeremybmerrill/meaningfully/releases), download the appropriate installer for your platform, and install it. 

For Macs, use the x64 binary if you have an Intel chip and arm64 if you have Apple Silicon. See "About This Mac" in the Apple menu on the top left of your screen to determine which kind of processor you have; computers manufactured before late 2020 generally have Intel chips.

#### Windows

I don't have a Windows computer, so I can't test the Windows builds.

If you use Windows and want to try `meaningfully`, please try development mode below. It works fine, at least for smaller CSVs, although it will be slower and the file-sizes larger than on Mac and Linux, because the Weaviate database binary isn't available for Windows.

Alternatively, you can set up [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install), run `export DISPLAY=:0`, then install and run Meaningfully as described below, in the [Linux instructions](#Linux).

#### Linux

`snap install meaningfully` or install the `.deb` file listed in meaningfully's [release page](https://github.com/jeremybmerrill/meaningfully/releases).

### Development mode
You'll need Node v23 or higher. You might try installing [nvm](https://github.com/nvm-sh/nvm) and then running `nvm install 23` and `nvm use 23` but troubleshooting and other methods are outside the scope of this document.

```
npm install
npm run dev
```

There's a weird bug where sometimes I think the storage directory isn't created right. If you get weird errors like `Error searching document set: Error: ENOENT: no such file or directory`, maybe try running `mkdir ~/Library/Application\ Support/meaningfully/simple_vector_store/` and trying again. I'm trying to fix it. :D

### Testing:

meaningfully has both unit tests and end-to-end integration tests.

Run the unit tests for the backend with `npm test`. Run the integration tests for the frontend by building (`npm run build:<platform>`) and then running `npm run wdio`.

Test a specific feature file with `npm run wdio run ./wdio.conf.ts -- --spec ./e2e/features/upload-process.feature` -- again, testing the already-built version.

You can also run just a single test in a specific file with `npm run wdio run ./wdio.conf.ts -- --spec ./e2e/features/upload-process.feature --cucumberOpts.tags=@largefile`.

If you want to run against the development code (rather than building a whole artifact, which can be time-consuming), build (`npm run build`) and use the `WDIO_DEV=true` env var.

E.g. 

 - test everything `npm run build &&  WDIO_DEV=true npm run wdio`
 - test one file `npm run build && WDIO_DEV=true npm run wdio run ./wdio.conf.ts -- --spec ./e2e/features/upload-process.feature`.
 - run one test `npm run build && WDIO_DEV=true npm run wdio run ./wdio.conf.ts -- --spec ./e2e/features/upload-process.feature --cucumberOpts.tags=@largefile`.

## My documents are PDFs, not spreadsheets. Can I use Meaningfully?

Try [Semantra](https://github.com/freedmand/semantra).
