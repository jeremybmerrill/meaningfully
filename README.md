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

## Is Meaningfully free?

Mostly. Semantic search requires "embedding" snippets of your document into numbers. You can do this on your computer, but it's very slow, but free (but for your electric bill). I recommend you get an OpenAI API key, put it into Meaningfully, and use that; you'll be responsible for the OpenAI charges, but Meaningfully doesn't cost any extra on top of that. (And it's generally very cheap. Most spreadsheets, even with tens of thousands of rows, will cost a few pennies.)

Eventually, Meaningfully may include some paid options.

## How can I run this app myself?

You'll need Node v22 or higher. You might try installing [nvm](https://github.com/nvm-sh/nvm) and then running `nvm install 22` and `nvm use 22` but troubleshooting and other methods are outside the scope of this document.

```
npm install
npm run dev
```

There's a weird bug where sometimes I think the storage directory isn't created right. If you get weird errors like `Error searching document set: Error: ENOENT: no such file or directory`, maybe try running `mkdir ~/Library/Application\ Support/meaningfully/simple_vector_store/` and trying again. I'm trying to fix it. :D


## My documents are PDFs, not spreadsheets. Can I use Meaningfully?

Try [Semantra](https://github.com/freedmand/semantra).