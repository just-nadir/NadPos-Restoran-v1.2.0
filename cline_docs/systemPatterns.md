# System Patterns

## Arxitektura
Loyiha **Electron** + **React** (Vite) arxitekturasida qurilgan.

*   **Main Process (Electron):** Tizim darajasidagi operatsiyalar bilan shug'ullanadi (oynalarni boshqarish, printer, fayl tizimi, ma'lumotlar bazasi).
*   **Renderer Process (React):** Foydalanuvchi interfeysi (UI).
*   **Server (Express):** Elektron ichida ishga tushadigan lokal server. Bu asosan `Waiter App` (ofitsiantlar ilovasi) xizmati va printer buyruqlari uchun ishlatiladi.

## Aloqa (IPC)
Main va Renderer jarayonlari orasidagi ma'lumot almashinuvi `ipcMain` va `ipcRenderer` (Context Bridge orqali `window.api`) yordamida amalga oshiriladi.

*   **Handlerlar:** `electron/ipcHandlers.cjs` faylida joylashgan.
*   **Preload:** `electron/preload.cjs` xavfsiz API ko'prigi.

## Ma'lumotlar Bazasi
*   **DBMS:** SQLite (`better-sqlite3`).
*   **Joylashuvi:** `pos.db` fayli.
*   **ORM/Query Builder:** To'g'ridan-to'g'ri SQL so'rovlar yoki yordamchi funksiyalar orqali ishlatiladi.

## Dizayn (UI/UX)
*   **Framework:** Tailwind CSS.
*   **Komponentlar:** React funksional komponentlari (Hooks).
*   **Routing:** React Router DOM (Single Page Application).

## Xavfsizlik
*   **Context Isolation:** Yoqilgan.
*   **Node Integration:** O'chirilgan (Renderer jarayonida).
*   **Litsenziya:** AES-256-CBC shifrlash usuli orqali himoyalangan.
