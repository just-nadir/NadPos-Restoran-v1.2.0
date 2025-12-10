const { contextBridge, ipcRenderer } = require('electron');
const log = require('electron-log');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // Backendga so'rov yuborish va javob kutish (Promise)
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),

    // Backenddan kelgan xabarlarni tinglash
    on: (channel, listener) => {
      const subscription = (event, ...args) => listener(event, ...args);
      ipcRenderer.on(channel, subscription);

      // Listenerni o'chirish uchun funksiya qaytaradi (React useEffect uchun qulay)
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },

    // Barcha listenerlarni o'chirish
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  }
});

// YANGI: Frontend Logging API
contextBridge.exposeInMainWorld('api', {
  log: (level, message) => {
    log[level](message);
  },
  logError: (error, stack) => {
    log.error('Frontend Error:', error);
    if (stack) {
      log.error('Stack:', stack);
    }
  }
});