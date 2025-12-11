
**Foydalanish bo'yicha qo'llanma (File-Based)**

1.  **Request File Yaratish:**
    *   Dasturni oching -> Sozlamalar -> Litsenziya.
    *   `Litsenziya so'rovini yaratish (.hid)` tugmasini bosing.
    *   Dastur papkasida (JustPos root) `JetPOS_XXXX-XXXX...hid` fayli paydo bo'ladi.

2.  **Litsenziya Yaratish (Admin):**
    *   terminalda: `node admin/generate_license.cjs`
    *   Skript `.hid` faylini avtomatik topadi yoki yo'lini so'raydi.
    *   Mijoz ismini va turini kiriting.
    *   Natijada `JetPOS_XXXX-XXXX...license` fayli paydo bo'ladi.

3.  **Faollashtirish:**
    *   `JetPOS_XXXX...license` faylini JustPos dasturi papkasiga (resources yoki exe yoniga) tashlang.
    *   Dasturni yangilang (Refresh) yoki qayta oching.
    *   Sozlamalar -> Litsenziya bo'limida "FAOL" deb chiqishi kerak.
