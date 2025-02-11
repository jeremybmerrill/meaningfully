import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { DocumentService } from './DocumentSetService'
import { writeFileSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join as pathJoin } from 'path'

const docService = new DocumentService()

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
    mainWindow.show()
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
  ipcMain.handle('list-document-sets', async () => {
    try {
      return await docService.listDocumentSets();
    } catch (error) {
      console.error('Error listing document sets:', error);
      throw error;
    }
  });

  ipcMain.handle('search-document-set', async (_, params: { documentSetId: number, query: string, n_results: number}) => {
    try {
      return await docService.searchDocumentSet(params.documentSetId, params.query, params.n_results);
    } catch (error) {
      console.error('Error searching document set:', error, params.documentSetId, params.query, params.n_results);
      throw error;  
    }
  });

  ipcMain.handle('upload-csv', async (_, formData: {
    file: { path: string, name: string },
    datasetName: string,
    description: string,
    textColumns: string[],
    metadataColumns: string[]
  }) => {
    try {
      // For files from renderer, we need to handle the Buffer data
      const tempPath = pathJoin(tmpdir(), `${Date.now()}-${formData.file.name}`)
      await writeFileSync(tempPath, readFileSync(formData.file.path))
      return await docService.uploadCsv({
        ...formData,
        filePath: tempPath
      });
    } catch (error) {
      console.error('Error uploading CSV:', error);
      throw error;
    }
  });

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
