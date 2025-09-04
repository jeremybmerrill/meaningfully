import { writable } from 'svelte/store';

// Define the interface for file data
export interface FileData {
    name: string;
    size: number;
    lastModified: number;
    availableColumns: string[];
    fileContent: string; // or ArrayBuffer, depending on usage
}

// Define a Svelte writable store for file data
export const fileDataStore = writable<FileData | null>(null);
