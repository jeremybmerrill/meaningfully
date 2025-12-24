# Copilot Instructions for the `meaningfully` Project

## Project Overview
`meaningfully` is a semantic search tool designed for text data in spreadsheets. It leverages AI embeddings to enable more intuitive and effective searches compared to traditional keyword-based methods. The project is intended to be used by journalists, researchers and other semi-technical users. `meaningfully` should do one job very well: allow users to search CSV files using semantic search, so that they can find what they need, and then move on with their tasks in other tools.

### Key Features:
- **Semantic Search**: Uses AI embeddings to "understand" text and find relevant results.
- **Integration with Multiple Embedding Models**: Supports OpenAI, Azure, Ollama, Mistral, and Gemini embedding models.
- **End-to-End Testing**: Utilizes Cucumber.js for frontend integration tests.

## Architecture
The project is structured into several key components:

1. **Embedding Services**:
   - Located in `src/main/services/embeddings.ts`.
   - Handles embedding model selection and vector store integration.
   - Supports multiple embedding providers (OpenAI, Azure, etc.) and vector stores (Postgres, Weaviate, etc.).

2. **Frontend**:
   - Built with Svelte (see `svelte.config.mjs`) and uses svelte-routing for routing.
   - Provides the user interface for uploading CSVs and performing searches.

3. **Testing**:
   - Unit tests for backend logic.
   - End-to-end tests for frontend workflows using WebdriverIO and Cucumber.js.

4. **Data Storage**:
   - All data is stored locally, with vectors stored in weaviate (with fallback to simple_vector_store for Windows or if weaviate fails to start) and documents stored in JSON in LlamaIndex's simple_doc_store.
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
  ```bash
  npm test
  ```
- **End-to-End Tests**:
  Build the app and run WebdriverIO tests:
  ```bash
  npm run build && npm run wdio
  ```
  To run a specific feature file:
  ```bash
  npm run build && CUCUMBER_TEST_ONLY_FEATURE=upload-process npm run wdio
  ```

  To run a specific test (in this case, the one tagged with `@resultmodal` in the `search-page.feature` file):
  ```bash
  WDIO_DEV=true npm run wdio -- --spec ./e2e/features/search-page.feature --cucumberOpts.tags="@resultmodal"
  ```

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
