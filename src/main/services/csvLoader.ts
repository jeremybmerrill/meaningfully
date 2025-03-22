import { Document } from "llamaindex";
import { readFileSync } from "fs";
import Papa from "papaparse";

export async function loadDocumentsFromCsv(
  filePath: string,
  textColumnName: string
): Promise<Document[]> {
  const fileContent = readFileSync(filePath, "utf-8");
  const { data: records } = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
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