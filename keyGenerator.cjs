const crypto = require('crypto');

// 1. SOZLAMALAR
const SECRET_PHRASE = process.env.LICENSE_SECRET || 'MENING_POS_LOYIHAM_MAXFIY_KALITI_2025_ENHANCED';
// AES-256 uchun 32 baytlik kalit yaratamiz
const SECRET_KEY = crypto.createHash('sha256').update(SECRET_PHRASE).digest();
const ALGORITHM = 'aes-256-cbc';

// 2. RSA KEY PAIR (Production da alohida saqlash kerak)
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

console.log('\n🔑 RSA PUBLIC KEY (Bu PUBLIC_KEY ni licenseController.cjs ga qo\'yish kerak):');
console.log('---------------------------------------------------');
console.log(publicKey);
console.log('---------------------------------------------------\n');

// 3. SHIFRLASH FUNKSIYASI
function encrypt(text) {
    const iv = crypto.randomBytes(16); // Random Init Vector
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Natija: IV:EncryptedData
    return iv.toString('hex') + ':' + encrypted;
}

// 4. RSA SIGNATURE
function signKey(data) {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, 'hex');
}

// 5. KALIT GENERATSIYA QILISH (Hardware ID bilan)
const generateKey = (clientName, type, days = null, hardwareId = null) => {
    const payload = {
        client: clientName,
        type: type, // 'lifetime' or 'monthly'
        createdAt: new Date().toISOString(),
        hwid: hardwareId || 'ANY' // Hardware ID (optional)
    };

    if (type === 'monthly' && days) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days); // Kun qo'shish
        payload.expiry = expiryDate.toISOString();
    } else if (type === 'lifetime') {
        payload.expiry = 'NEVER';
    }

    const jsonString = JSON.stringify(payload);
    const encryptedKey = encrypt(jsonString);

    // RSA signature qo'shish
    const signature = signKey(encryptedKey);

    // Final format: ENCRYPTED_DATA::SIGNATURE
    const licenseKey = `${encryptedKey}::${signature}`;

    console.log(`\n🔑 YANGI KALIT (${type.toUpperCase()}${hardwareId ? ' - HARDWARE LOCKED' : ''}):`);
    console.log(`👤 Mijoz: ${clientName}`);
    if (hardwareId) console.log(`🖥️  Hardware ID: ${hardwareId}`);
    if (payload.expiry !== 'NEVER') console.log(`📅 Tugash sanasi: ${payload.expiry}`);
    console.log(`---------------------------------------------------`);
    console.log(licenseKey);
    console.log(`---------------------------------------------------\n`);

    return licenseKey;
};

// 6. GENERATOR FUNKSIYALARI (API)
const generateLifetime = (clientName, hardwareId = null) => {
    return generateKey(clientName, 'lifetime', null, hardwareId);
};

const generateSubscription = (clientName, days, hardwareId = null) => {
    return generateKey(clientName, 'monthly', days, hardwareId);
};

// ==========================================
// TEST QILISH (SKRIPT ISHGA TUSHGANDA)
// ==========================================

console.log("🛠  YANGI - Litsenziya Generatori (RSA + Hardware Locked) ishga tushdi...\n");

// HARDWARE ID haqida ma'lumot
console.log("ℹ️  HARDWARE ID ni olish uchun:");
console.log("   1. Mijoz kompyuterida dasturni ishga tushiring");
console.log("   2. Sozlamalar → Litsenziya → Hardware ID ni ko'ring");
console.log("   3. O'sha ID ni shu scriptga kiriting\n");

// Misol 1: Umrbod Litsenziya (Hardware Lock YO'Q)
console.log("=== TEST 1: Hardware lock'siz (har qanday kompyuterda) ===");
generateLifetime("Restoran Avto Test");

// Misol 2: Umrbod Litsenziya (Hardware LOCKED)
console.log("\n=== TEST 2: Hardware lock bilan (faqat bitta kompyuterda) ===");
generateLifetime("Restoran Secure Test", "abc123def456");

// Misol 3: 30 Kunlik Obuna (Hardware LOCKED)
console.log("\n=== TEST 3: Oylik obuna + Hardware lock ===");
generateSubscription("Kafé Oylik Test", 30, "xyz789uvw321");

console.log("\n✅ Testlar tugadi!");
console.log("\n📝 ESLATMA: Production da RSA kalitlarni muhofaza qiling!");
console.log("   - Private key: Faqat sizda");
console.log("   - Public key: licenseController.cjs ga qo'ying\n");

module.exports = { generateLifetime, generateSubscription };
