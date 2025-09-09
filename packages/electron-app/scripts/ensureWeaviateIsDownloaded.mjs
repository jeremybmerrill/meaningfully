/*
 the weaviate binary is too big to put into git.
 but we need to have it locally when we build the mac distribution
 so that we can sign it.

 this script, to be run as part of npm run build
 ensures weaviate is downloaded to the resources folder.

*/

import { EmbeddedOptions, EmbeddedDB } from 'weaviate-ts-embedded';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function downloadWeaviate() {
    const embeddedOptions = new EmbeddedOptions({
      host: '127.0.0.1',
      port: 9898,
      binaryPath: path.join(__dirname, "..", "resources", "weaviate", "weaviate-embedded-latest"),
    });

    const embedded_db = new EmbeddedDB(embeddedOptions);
    await embedded_db.resolveWeaviateVersion().then(async () => {
      await embedded_db.ensureWeaviateBinaryExists();
    });

}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
    downloadWeaviate().then(() => {
        console.log("Weaviate download complete.");
    }).catch((err) => {
        console.error("Error downloading Weaviate:", err);
    });
}