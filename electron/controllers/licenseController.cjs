const { db } = require('../database.cjs');
const log = require('electron-log');
const crypto = require('crypto');
const { getHardwareId } = require('../utils/hardwareId.cjs');

// --- XAVFSIZLIK SOZLAMALARI ---
const SECRET_PHRASE = process.env.LICENSE_SECRET || 'MENING_POS_LOYIHAM_MAXFIY_KALITI_2025_ENHANCED';
// AES-256 uchun 32 baytlik kalit (Generator bilan bir xil bo'lishi SHART)
const SECRET_KEY = crypto.createHash('sha256').update(SECRET_PHRASE).digest();
const ALGORITHM = 'aes-256-cbc';

// RSA PUBLIC KEY (keyGenerator.cjs dan olish kerak)
// MUHIM: Bu public key ni keyGenerator.cjs ishga tushganda console ga chiqadi
const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAputqUHPiV+WQcwC7Rkpe
vqWzI8LQqKqE0g3Dv8IxYrbnGQJh9nIOhRjhKVyf6fPnJ+7r8DNGV1FJF6vsIQ7i
Rh/xR3qmnNvW0z9wKN8d5FFfY9nkUDqx7h8t+yH3wqE8SjKC5dNvGqKrLwYQ0HJe
r9kV4P8eX6mB8V1zQj7K9hLwN3vD2fYwI5rJqE8tH6dN7xVwP9wQ3nF5rK8vL2yT
w9X7qH5nV8K6pL3wE9rY5tJ8H7qN6wL9vK8Y3rJ5wE8tH9wQ6pL3wV9rY8tK6pH3
w9X7qH5nV8K6pL3wE9rY5tJ8H7qN6wL9vK8Y3rJ5wE8tH9wQ6pL3wV9rY8tK6pH3
wQIDAQAB
-----END PUBLIC KEY-----`;

// DEKODER FUNKSIYASI
function decrypt(text) {
    try {
        const textParts = text.split(':');
        if (textParts.length !== 2) return null;

        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);

        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    } catch (error) {
        return null;
    }
}

// RSA SIGNATURE VERIFICATION
function verifySignature(data, signature) {
    try {
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        verify.end();
        return verify.verify(RSA_PUBLIC_KEY, signature, 'hex');
    } catch (error) {
        log.error('Signature verification error:', error);
        return false;
    }
}

const formatInfo = (info) => {
    return {
        active: info.is_active === 1,
        type: info.type,
        expiry: info.expiry_date,
        lastOnline: info.last_login
    };
};

const licenseController = {

    // 1. Litsenziya holatini tekshirish
    checkLicense: () => {
        try {
            const license = db.prepare("SELECT * FROM license_data LIMIT 1").get();

            if (!license) {
                return { active: false, reason: 'no_license' };
            }

            if (license.is_active !== 1) {
                return { active: false, reason: 'blocked' };
            }

            // Vaqt manipulyatsiyasini tekshirish
            const currentTime = new Date();
            const lastLoginTime = new Date(license.last_login);

            if (currentTime < lastLoginTime && (lastLoginTime - currentTime) > 3600000) {
                log.warn(`⚠️ Vaqt manipulyatsiyasi aniqlandi!`);
                return { active: false, reason: 'time_tampered', lastOnline: license.last_login };
            }

            // Muddatni tekshirish (Oylik obuna uchun)
            if (license.type === 'monthly') {
                const expiryDate = new Date(license.expiry_date);
                if (currentTime > expiryDate) {
                    return { active: false, reason: 'expired', expiry: license.expiry_date };
                }
            }

            // Muvaffaqiyatli: Vaqtni yangilash
            const nowISO = currentTime.toISOString();
            db.prepare("UPDATE license_data SET last_login = ? WHERE id = ?").run(nowISO, license.id);

            return { active: true, type: license.type, expiry: license.expiry_date };

        } catch (error) {
            log.error('Litsenziya tekshirishda xato:', error);
            return { active: false, reason: 'error' };
        }
    },

    // 2. Litsenziyani faollashtirish (Hardware ID + RSA validation)
    activateLicense: (key) => {
        try {
            const result = validateKeyReal(key);

            if (!result.valid) {
                return { success: false, message: result.message || 'Kalit yaroqsiz yoki shikastlangan!' };
            }

            const activeDate = new Date();

            // Bazani tozalash
            db.prepare("DELETE FROM license_data").run();

            // Yangi litsenziyani saqlash
            const stmt = db.prepare(`
                INSERT INTO license_data (key, type, expiry_date, last_login, is_active)
                VALUES (?, ?, ?, ?, 1)
            `);

            stmt.run(key, result.type, result.expiryDate, activeDate.toISOString());
            log.info(`✅ Yangi litsenziya faollashtirildi: ${result.client} (${result.type})`);

            return { success: true, type: result.type };

        } catch (error) {
            log.error('Litsenziya faollashtirishda xato:', error);
            return { success: false, message: 'Server xatosi' };
        }
    },

    // 3. Hardware ID ni olish
    getHardwareId: () => {
        try {
            return { success: true, hardwareId: getHardwareId() };
        } catch (error) {
            log.error('Hardware ID olishda xato:', error);
            return { success: false, message: 'Xato yuz berdi' };
        }
    }
};

// --- REAL VALIDATION LOGIC (RSA + Hardware ID) ---
function validateKeyReal(key) {
    key = key.trim();

    // 1. Format tekshirish: ENCRYPTED::SIGNATURE
    const parts = key.split('::');
    if (parts.length !== 2) {
        return { valid: false, message: 'Noto\'g\'ri format!' };
    }

    const [encryptedKey, signature] = parts;

    // 2. RSA Signature tekshirish
    if (!verifySignature(encryptedKey, signature)) {
        log.warn('⚠️ RSA signature noto\'g\'ri - kalit o\'zgartirilgan!');
        return { valid: false, message: 'Kalit shikastlangan yoki o\'zgartirilgan!' };
    }

    // 3. Dekodlash
    const jsonString = decrypt(encryptedKey);
    if (!jsonString) {
        return { valid: false, message: 'Dekodlash xatosi!' };
    }

    try {
        const payload = JSON.parse(jsonString);

        // 4. Ma'lumotlarni tekshirish
        if (!payload.client || !payload.type) {
            return { valid: false, message: 'Noto\'g\'ri ma\'lumot!' };
        }

        // 5. Hardware ID tekshirish (agar mavjud bo'lsa)
        if (payload.hwid && payload.hwid !== 'ANY') {
            const currentHwid = getHardwareId();
            if (currentHwid !== payload.hwid) {
                log.warn(`⚠️ Hardware ID mos kelmadi! Kerak: ${payload.hwid}, Joriy: ${currentHwid}`);
                return {
                    valid: false,
                    message: 'Bu kalit boshqa kompyuter uchun yaratilgan!'
                };
            }
        }

        // 6. Muddatni tekshirish
        if (payload.type === 'monthly' && payload.expiry) {
            const expiryDate = new Date(payload.expiry);
            if (new Date() > expiryDate) {
                return { valid: false, message: 'Kalit muddati tugagan!' };
            }
            return {
                valid: true,
                type: 'monthly',
                expiryDate: payload.expiry,
                client: payload.client
            };
        }

        if (payload.type === 'lifetime') {
            return {
                valid: true,
                type: 'lifetime',
                expiryDate: null,
                client: payload.client
            };
        }

        return { valid: false };

    } catch (e) {
        return { valid: false, message: 'JSON parse xatosi!' };
    }
}

module.exports = licenseController;
