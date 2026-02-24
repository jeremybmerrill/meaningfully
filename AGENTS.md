# Agent Instructions for the `meaningfully` Project

## Project Overview
`meaningfully` is a semantic search tool designed for text data in spreadsheets. It leverages AI embeddings to enable different searches compared to traditional keyword-based methods. The project is intended to be used by journalists, researchers and other semi-technical users. `meaningfully` should do one job very well: allow users to search CSV files using semantic search, so that they can find what they need, and then move on with their tasks in other tools.

### Key Features:
- **Semantic Search**: Uses AI embeddings to "understand" text and find relevant results.
- **Integration with Multiple Embedding Models**: Supports OpenAI, Azure, Ollama, Mistral, and Gemini embedding models.
- **End-to-End Testing**: Utilizes Cucumber.js for frontend integration tests.

## Architecture
The project is structured into several key components in several packages, each with their own repo.

1. **Core Business Logic**:
   - Handles embeddings, searching and storing vectors (and documents) in a storage backend (Postgres, local "embedded" Weaviate, or local JSON)
   - Supports multiple embedding providers (OpenAI, Azure, etc.) and vector stores (Postgres, Weaviate, etc.).
   - located at https://github.com/jeremybmerrill/meaningfully-core and likely at "../meaningfully-core" relative to this file's parent folder.

2. **Frontend**:
   - Built with Svelte (see `svelte.config.mjs`) and uses [svelte-routing](https://www.npmjs.com/package/svelte-routing) for routing.
   - Provides the user interface for uploading CSVs and performing searches.
   - located at https://github.com/jeremybmerrill/meaningfully-ui and likely at "../meaningfully-ui" relative to this file's parent folder.

3. Electron App:
   - located in this repo.
   - Users can install and run this Electron App on Mac, Linux and Windows.
   - The Electron app is open-source and uses embedded Weaviate (falling back to local JSON files on Windows, or if Weaviate fails)

4. Hosted webapp:
   - located at https://github.com/jeremybmerrill/meaningfully-hosted and likely at "../meaningfully-hosted" relative to this file's parent folder.
   - Closed source.
   - The hosted webapp is meant to be installed internally at a company, so that any user can access it. Eventually it'll have user management.
   - Uses Postgres to store vectors and documents.

5. **Testing**:
   - Unit tests for backend logic.
   - End-to-end tests for frontend workflows using WebdriverIO and Cucumber.js.

## Developer Workflows

### Running the App in Development Mode
1. Ensure Node.js v23+ is installed. Use [nvm](https://github.com/nvm-sh/nvm) if needed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Testing
- **Unit Tests**:
  
  Run the unit tests for the backend with `npm test`. 

  ```bash
  npm test
  ```
- **End-to-End Tests**:

  Run the integration tests for the frontend by building (`npm run build:<platform>`) and then running `npm run wdio`.

  Test a specific feature file with `npm run wdio run ./wdio.conf.ts -- --spec ./e2e/features/upload-process.feature` -- again, testing the already-built version.

  You can also run just a single test in a specific file with `npm run wdio run ./wdio.conf.ts -- --spec ./e2e/features/upload-process.feature --cucumberOpts.tags=@largefile`.

  If you want to run against the development code (rather than building a whole artifact, which can be time-consuming), build (`npm run build`) and use the `WDIO_DEV=true` env var.

  E.g. 

  - test everything `npm run build &&  WDIO_DEV=true npm run wdio`
  - test one file `npm run build && WDIO_DEV=true npm run wdio run ./wdio.conf.ts -- --spec ./e2e/features/upload-process.feature`.
  - run one test `npm run build && WDIO_DEV=true npm run wdio run ./wdio.conf.ts -- --spec ./e2e/features/upload-process.feature --cucumberOpts.tags=@largefile`.



### Debugging Common Issues
- If you encounter `ENOENT` errors, ensure the storage directory exists:
  ```bash
  mkdir ~/Library/Application\ Support/meaningfully/simple_vector_store/
  ```

## Project-Specific Conventions
- **Embedding Models**:
  - Defined in `src/main/services/embeddings.ts`.
  - Each model requires specific API keys and configurations.
  - Example:
    ```typescript
    if (config.modelProvider === "openai") {
      embedModel = new OpenAIEmbedding({
        model: config.modelName,
        apiKey: settings.openAIKey,
      });
    }
    ```
- **Vector Stores**:
  - Supported types: `simple`, `postgres`, `weaviate`.
  - Example configuration for Postgres:
    ```typescript
    const pgStore = new PGVectorStore({
      clientConfig: { connectionString: process.env.POSTGRES_CONNECTION_STRING },
      tableName: sanitizeProjectName(config.projectName),
    });
    ```

## External Dependencies
- **Embedding Libraries**:
  - `@llamaindex/openai`, `@llamaindex/azure`, etc.
- **Testing Tools**:
  - WebdriverIO, Cucumber.js.
- **Database Clients**:
  - Postgres, Weaviate.

## Key Files and Directories
- `src/main/services/embeddings.ts`: Core logic for embeddings and vector stores.
- `e2e/features/`: Cucumber.js feature files for end-to-end tests.
- `e2e/step-definitions/`: Step definitions for Cucumber.js tests.
- `README.md`: General project overview and setup instructions.

## Notes for AI Agents
- Follow the existing patterns for embedding model integration and vector store setup.
- Ensure new features are covered by both unit and end-to-end tests.
- When adding a new embedding model or vector store, update `getEmbedModel` and `createVectorStore` in `src/main/services/embeddings.ts`.
- Use the `sanitizeProjectName` utility to ensure consistent naming conventions.

---

For any questions or clarifications, refer to the `README.md` or open an issue in the repository.
