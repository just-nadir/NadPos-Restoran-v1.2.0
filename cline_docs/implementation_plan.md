# Implementation Plan - File-Based License System

## Maqsad
Foydalanuvchi talabiga binoan, fayl almashinuvi orqali ishlaydigan OFFLINE litsenziyalash tizimini yaratish.
**Jarayon:**
1.  Mijoz dasturdan `request.hid` faylini oladi (ichida kompyuterning unikal ID si bo'ladi).
2.  Bu faylni dasturchiga yuboradi.
3.  Dasturchi maxsus vosita yordamida `request.hid` ni o'qiydi va `license.key` faylini generatsiya qiladi.
4.  Mijoz `license.key` faylini dastur papkasiga qo'yadi va dastur ishga tushadi.

## User Review Required
> [!IMPORTANT]
> **Xavfsizlik:** Tizim **RSA (Asimmetrik shifrlash)** dan foydalanadi.
> *   **Private Key (Maxfiy Kalit):** Faqat sizda (dasturchida) bo'ladi. Bu kalit bilan litsenziya yaratasiz.
> *   **Public Key (Ochiq Kalit):** Dastur ichiga ko'mib yuboriladi. Bu faqat litsenziyani tekshirish uchun ishlaydi, yangisini yarata olmaydi.

## Proposed Changes

### 1. Electron Backend (Main Process)
#### [NEW] [electron/utils/licenseManager.cjs](file:///d:/Justpos/JustPos/electron/utils/licenseManager.cjs)
*   **HWID olish:** Kompyuterning unikal raqamini aniqlash (CPU + MAC).
*   **Request File yaratish:** `request.hid` faylini generatsiya qilish.
*   **License File tekshirish:** `license.key` faylini o'qish, RSA imzorni tekshirish va HWID mosligini aniqlash.
*   **API:** Frontend uchun `ipcMain` handlerlari.

#### [MODIFY] [electron/ipcHandlers.cjs](file:///d:/Justpos/JustPos/electron/ipcHandlers.cjs)
*   Yangi litsenziya funksiyalarini ulash (`license-get-info`, `license-create-request`).

### 2. Developer Tools (Siz uchun)
#### [NEW] [admin/generate_license.cjs](file:///d:/Justpos/JustPos/admin/generate_license.cjs)
*   Bu skript alohida papkada bo'ladi (dastur bilan birga tarqatilmaydi).
*   `request.hid` faylini o'qiydi.
*   Muddati (Expiry) va turini (Lifetime/Monthly) so'raydi.
*   Private Key yordamida `license.key` faylini yaratib beradi.

### 3. Frontend (UI)
#### [MODIFY] [src/components/Settings.jsx](file:///d:/Justpos/JustPos/src/components/Settings.jsx)
*   **Litsenziya Tabi:**
    *   "Litsenziya so'rovini olish" (Generate Request File) tugmasi.
    *   Hozirgi litsenziya holatini ko'rsatish (Masalan: "Faollashtirilgan" yoki "Litsenziya fayli topilmadi").
*   Agar litsenziya bo'lmasa, dastur kirishni bloklashi yoki ogohlantirish berishi kerak (Buni `App.jsx` yoki `Login` da qo'shish mumkin).

## Verification Plan

### Automated Tests
*   **Unit Test:** RSA kalitlari to'g'ri ishlayotganini (Sign/Verify) tekshirish.
*   **HWID Test:** Har xil vaziyatda HWID o'zgarmasligini tekshirish.

### Manual Verification
1.  **Request:** Dasturdan `request.hid` olish.
2.  **Generate:** Admin skript orqali `license.key` yaratish.
3.  **Activate:** `license.key` ni papkaga tashlab, dasturni qayta ishga tushirish va litsenziya faollashganini ko'rish.
4.  **Fail Case:** `request.hid` ni boshqa kompyuterdan olib, shu kompyuterda ishlatib ko'rish (Ishlamasligi kerak).
