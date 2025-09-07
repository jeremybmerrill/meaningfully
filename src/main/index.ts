import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { MeaningfullyAPI } from './Meaningfully'
import { writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join as pathJoin } from 'path'
import { DocumentSetParams, MetadataFilter } from './types';
import { create_weaviate_database, teardown_weaviate_database } from './services/weaviateService';
import { ProgressManager } from './services/progressManager';

const storageArg = process.argv.find(arg => arg.startsWith('--storage-path='));
const storagePath = storageArg ? storageArg.split('=')[1] : app.getPath('userData');;

const docService = new MeaningfullyAPI({ 
  storagePath,
  weaviateClient: null // Initially set to null, will be updated after DB service is init'ec.
});

create_weaviate_database(storagePath).then((weaviateClient) => {
  docService.setClients({ weaviateClient, postgresClient: null });
  // weaviateClient.collections.listAll().then((res) => console.log(res)).catch((error) => {
  //   console.error('Error listing Weaviate collections:', error);
  // });
}).catch((error) => {
  console.error('Error creating Weaviate database:', error);
  // fall back to not using weaviate (using SimpleVectorstore)
});

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'), // was index.js, but this caused it to note work. maybe related to package.json's type: module
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  //ipc stuff could go in its own file.
  ipcMain.handle('list-document-sets', async (_, page: number = 1, pageSize: number = 10) => {
    try {
      return await docService.listDocumentSets(page, pageSize);
    } catch (error) {
      console.error('Error listing document sets:', error);
      throw error;
    }
  });

  ipcMain.handle('get-document-set', async (_, documentSetId: number) => {
    try {
      return await docService.getDocumentSet(documentSetId);
    } catch (error) {
      console.error('Error getting document set:', error);
      throw error;
    }
  });
  ipcMain.handle('delete-document-set', async (_, documentSetId: number) => {
    try {
      return await docService.deleteDocumentSet(documentSetId);
    } catch (error) {
      console.error('Error deleting document set:', error); 
      throw error;
    }
  });

  ipcMain.handle('search-document-set', async (_, params: { documentSetId: number, query: string, n_results: number, filters?: MetadataFilter[]}) => {
    try {
      return await docService.searchDocumentSet(params.documentSetId, params.query, params.n_results, params.filters);
    } catch (error) {
      console.error('Error searching document set:', error, params.documentSetId, params.query, params.n_results, params.filters);
      throw error;  
    }
  });

  ipcMain.handle('get-document', async (_, params: { documentSetId: number, documentId: string}) => {
    try {
      return await docService.getDocument(params.documentSetId, params.documentId);
    } catch (error) {
      console.error('Error searching document set:', error, params.documentSetId, params.documentId);
      throw error;  
    }
  });

  ipcMain.handle('upload-csv', async (_, formData: (DocumentSetParams & { fileContent: string, fileName: string })) => {
    try {
      let tempPath: string;
      
      // New content-based approach
      tempPath = pathJoin(tmpdir(), `${Date.now()}-${formData.fileName}`)
      // Decode base64 fileContent before writing; data:text/csv;base64,Y2Fz...
      // split by comma removes 
      const base64Data = formData.fileContent.split(',')[1] || formData.fileContent;
      const buffer = Buffer.from(base64Data, 'base64');
      await writeFileSync(tempPath, buffer);
      
      return await docService.uploadCsv({
        ...formData,
        filePath: tempPath
      });
    } catch (error) {
      console.error('Error uploading CSV:', error);
      throw error;
    }
  });

  ipcMain.handle('generate-preview-data', async (_, formData: (DocumentSetParams & { fileContent: string, fileName: string })) => {
    try {
      let tempPath: string;
      
      // Handle both file-based and content-based uploads  
      // New content-based approach
      tempPath = pathJoin(tmpdir(), `${Date.now()}-${formData.fileName}`)
      
      // Decode base64 fileContent before writing; data:text/csv;base64,Y2Fz...
      // split by comma removes 
      const base64Data = formData.fileContent.split(',')[1] || formData.fileContent;
      const buffer = Buffer.from(base64Data, 'base64');
      await writeFileSync(tempPath, buffer);

      return await docService.generatePreviewData({
        ...formData,
        filePath: tempPath
      });

    } catch (error) {
      console.error('Error generating preview data:', error);
      throw error;
    }
  });

  ipcMain.handle('get-settings', async () => {   
    try {
      return await docService.getMaskedSettings();
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }
  );

  ipcMain.handle('set-settings', async (_, settings) => {
    try {
      return await docService.setMaskedSettings(settings);
    } catch (error) {
      console.error('Error setting settings:', error);
      throw error;
    }
  });

  ipcMain.handle('get-upload-progress', async () => {
    return ProgressManager.getInstance().getCurrentProgress();
  });

  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', async (event) => {
  if (docService.getClients().weaviateClient) {
    event.preventDefault() // Prevent quitting until cleanup is done
    console.log('Cleaning up Weaviate database before quitting...');
    await teardown_weaviate_database(docService.getClients().weaviateClient);
    console.log('Weaviate database cleaned up.');
    docService.setClients({weaviateClient: null, postgresClient: null}); // Clear clients
    app.quit() // Now actually quit
  }
})
