import { Document } from "llamaindex";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";

export async function loadDocumentsFromCsv(
  filePath: string,
  textColumnName: string
): Promise<Document[]> {
  const fileContent = readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map((record: any) => {
    const { [textColumnName]: text, ...metadata } = record;
    return new Document({
      text,
      metadata: Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [k, v ?? ""])
      ),
    });
  });
} 