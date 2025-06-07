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

There might be some platform-specific instruction.

#### Mac-specific instructions:

Install `meaningfully-<version>.arm64.dmg` (with `arm64`) if your Mac has Apple Silicon. Install the `x64` version if your Mac has an Intel chip.

I haven't yet set up code-signing for this app, so once you install the app, you might get an error message that says ""meaningfully" cannot be opened because the developer cannot be verified." (picture below).

![a screenshot of a warning that meaningfully cannot be opened because the developer cannot be verified.](
https://raw.githubusercontent.com/jeremybmerrill/meaningfully/main/docs/img/mac-codesigning-errormessage.png | width=300)

##### Here are the steps to work around this error

1. Install the app as usual, by copying it from the disk image (dmg) to your Applications folder.

![a screenshot of a Finder folder with the meaningfully icon and the Applications folder](https://raw.githubusercontent.com/jeremybmerrill/meaningfully/main/docs/img/mac-codesigning-install.png | width=300)

2. Right-click (or command-click) the app, then click open.

![a screenshot of the right-click menu you get when you right-click on the meaningfully app, with the Open option](https://raw.githubusercontent.com/jeremybmerrill/meaningfully/main/docs/img/mac-codesigning-rightclick-menu.png | width=300)

3. Then click "Open" on the pop-up dialog that says "macOS cannot verify the developer of 'meaningfully'. Are you sure you want to open it?"

![a dialog that says macOS cannot verify the developer of 'meaningfully'. Are you sure you want to open it](https://raw.githubusercontent.com/jeremybmerrill/meaningfully/main/docs/img/mac-codesigning-approval-dialog.png | width=300)

Sometimes you might have to try several times. But once it works, it should stay working until you update the app. If you'd like to eliminate this obstacle, please consider sponsoring this project -- as the code-signing workflow for Macs costs like $100, and I don't want to spend that until I'm sure that this project benefits people.

#### Windows

I couldn't get the Windows builds to work. If you use Windows and want to try meaningfully, please try development mode below, or help me get the Windows builds working.

#### Linux

Snaps coming soon, I hope.

### Development mode
You'll need Node v22 or higher. You might try installing [nvm](https://github.com/nvm-sh/nvm) and then running `nvm install 22` and `nvm use 22` but troubleshooting and other methods are outside the scope of this document.

```
npm install
npm run dev
```

There's a weird bug where sometimes I think the storage directory isn't created right. If you get weird errors like `Error searching document set: Error: ENOENT: no such file or directory`, maybe try running `mkdir ~/Library/Application\ Support/meaningfully/simple_vector_store/` and trying again. I'm trying to fix it. :D

### Testing:

Run the unit tests for the backend with `npm test`. Run the integration tests for the frontend by building (`npm run build:<platform>`) with `npm run wdio`; specify a specific file with `CUCUMBER_TEST_ONLY_FEATURE=upload-process npm run wdio`.

## My documents are PDFs, not spreadsheets. Can I use Meaningfully?

Try [Semantra](https://github.com/freedmand/semantra).