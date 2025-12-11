# Active Context

## Hozirgi Fokus
Loyiha uchun "Memory Bank" (Xotira Banki) tizimini o'rnatish va sozlash. Bu AI yordamchisi loyiha kontekstini to'liq tushunishi uchun zarur.

## Yaqinda Bajarilgan Ishlar
1.  **Litsenziya Tizimi (File-Based):**
    *   `request.hid` va `license.key` (JetPOS_...license) almashinuvi orqali ishlaydigan OFFLINE tizim yaratildi.
    *   Admin uchun `admin/generate_license.cjs` generatori yaratildi.
    *   Backend (`licenseManager.cjs`) fayllarni tekshirishga o'tkazildi.
    *   Frontend (`Settings.jsx`) litsenziya holatini ko'rsatuvchi va so'rov file yaratuvchi UI bilan yangilandi.
2.  **Tozalash:** Eski online/db-based litsenziya tizimi o'chirildi.

## Hozirgi Holat
*   Loyiha yangi **Fayl Litsenziya Tizimi** bilan ishlamoqda.
*   Admin vositalari (`admin` papkasida) tayyor.

## Keyingi Qadamlar
1.  Memory Bank fayllarini to'ldirib bo'lish (`systemPatterns`, `techContext`, `progress`).
2.  Litsenziya tekshiruvi tizimini to'liq testdan o'tkazish.
3.  Loyiha barqarorligini tekshirish uchun regressiya testlarini o'tkazish (ayniqsa printer va tarmoq funksiyalari).
