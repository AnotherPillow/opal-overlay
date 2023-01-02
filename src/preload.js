const { contextBridge, ipcRenderer } = require('electron')

const API = {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);  
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, data) => window[func](event, data))
    },
    toRenderer: (a,b) => ipcRenderer.on(a,(e,d)=>{b(e,d)}),
    getConfig: (a,b) => ipcRenderer.on(a,(e,d)=>{b(e,d)}),
}

contextBridge.exposeInMainWorld('api', API)