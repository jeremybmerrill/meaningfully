export interface DocumentSet {
  documentSetId: number;
  name: string;
  uploadDate: Date;
  parameters: Record<string, unknown>;
  totalDocuments: number;
}
