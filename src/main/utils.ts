import { 
  Document, 
  NodeWithScore,
  BaseNode
} from "llamaindex";

export function sanitizeProjectName(projectName: string) {
  return projectName.replace(/[^a-zA-Z0-9]/g, "_");
}
export function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function escapeKey(key: string): string {
  const validKeyRegex = /^[_A-Za-z][_0-9A-Za-z]*$/;
  const ESCAPE_PREFIX = "__ESC__";
  if (validKeyRegex.test(key)) {
    return key;
  } else {
    // Replace each invalid character with _X<hex>_
    let escaped = "";
    for (let i = 0; i < key.length; i++) {
      const char = key[i];
      if (
        (i === 0 && !/[A-Za-z_]/.test(char)) ||
        (i > 0 && !/[A-Za-z0-9_]/.test(char))
      ) {
        escaped += `_X${char.charCodeAt(0).toString(16).toUpperCase()}_`;
      } else {
        escaped += char;
      }
    }
    return ESCAPE_PREFIX + escaped;
  }
}

function unescapeKey(key: string): string {
  const ESCAPE_PREFIX = "__ESC__";
  if (key.startsWith(ESCAPE_PREFIX)) {
    // Replace all _X<hex>_ with the corresponding character
    return key
      .slice(ESCAPE_PREFIX.length)
      .replace(/_X([0-9A-F]+)_/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      );
  } else {
    return key;
  }
}

// Escapes metadata keys that don't match /^[_A-Za-z][_0-9A-ZaZ]*$/ using URI encoding with a prefix
export function escapeDocumentMetadataKeys(document: Document): Document {
  const newMetadata: Record<string, any> = {};

  for (const key in document.metadata) {
    newMetadata[escapeKey(key)] = document.metadata[key];
  }
  document.metadata = newMetadata;
  return document;
}

// Reverses the escaping done by escapeMetadataKeys
export function unescapeDocumentMetadataKeys(document: Document): Document {
  const ESCAPE_PREFIX = "__ESC__";
  const newMetadata: Record<string, any> = {};

  for (const key in document.metadata) {
    if (key.startsWith(ESCAPE_PREFIX)) {
      const originalKey = unescapeKey(key)
      newMetadata[originalKey] = document.metadata[key];
    } else {
      newMetadata[key] = document.metadata[key];
    }
  }
  document.metadata = newMetadata;
  return document;
}


// Reverses the escaping done by escapeMetadataKeys
export function unescapeNodeWithScoreMetadataKeys(node_with_score: NodeWithScore): NodeWithScore {
  const ESCAPE_PREFIX = "__ESC__";
  const newMetadata: Record<string, any> = {};

  for (const key in node_with_score.node.metadata) {
    if (key.startsWith(ESCAPE_PREFIX)) {
      const originalKey = unescapeKey(key)
      newMetadata[originalKey] = node_with_score.node.metadata[key];
    } else {
      newMetadata[key] = node_with_score.node.metadata[key];
    }
  }
  node_with_score.node.metadata = newMetadata;
  return node_with_score
}

// Reverses the escaping done by escapeMetadataKeys
export function unescapeNodeMetadataKeys(node: BaseNode): BaseNode {
  const ESCAPE_PREFIX = "__ESC__";
  const newMetadata: Record<string, any> = {};

  for (const key in node.metadata) {
    if (key.startsWith(ESCAPE_PREFIX)) {
      const originalKey = unescapeKey(key)
      newMetadata[originalKey] = node.metadata[key];
    } else {
      newMetadata[key] = node.metadata[key];
    }
  }
  node.metadata = newMetadata;
  return node
}