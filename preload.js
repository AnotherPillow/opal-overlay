const { contextBridge, ipcRenderer } = require('electron')
const API = {
    send: (channel, data) => {
      ipcRenderer.send(channel, data);  
    },
    receive: (channel, func) => {
      ipcRenderer.on(channel, (event, data) => window[func](event, data))
    },
    toRenderer: () => new Promise((res) => {
      ipcRenderer.on('renderer', (ev, data) => {
        res(data);
      });
    }),
    getConfig: () => new Promise((res) => {
      ipcRenderer.on('conf', (ev, data) => {
        res(data);
      });
    }),
}

contextBridge.exposeInMainWorld('api', API)