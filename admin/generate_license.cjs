const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

// --- PRIVATE KEY (Sizda saqlanadi) ---
const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'private.pem'), 'utf8');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

(async () => {
    console.log("=== JUSTPOS LICENSE GENERATOR ===");

    // 1. Faylni o'qish
    const files = fs.readdirSync('.').filter(f => f.startsWith('JetPOS_') && f.endsWith('.hid'));

    let hidFile;
    if (files.length === 0) {
        console.log("❌ .hid so'rov fayli topilmadi!");
        const inputPath = await question("Menga .hid fayl yo'lini bering: ");
        if (fs.existsSync(inputPath)) {
            hidFile = inputPath;
        } else {
            console.log("Fayl topilmadi.");
            process.exit(1);
        }
    } else if (files.length === 1) {
        hidFile = files[0];
        console.log(`📂 Fayl topildi (Avto): ${hidFile}`);
    } else {
        console.log("📂 Fayllar:");
        files.forEach((f, i) => console.log(`${i + 1}. ${f}`));
        const idx = await question("Qaysi birini tanlaysiz (raqami): ");
        hidFile = files[parseInt(idx) - 1];
    }

    const content = fs.readFileSync(hidFile, 'utf8');
    const requestData = JSON.parse(content);

    console.log(`\n💻 HWID: ${requestData.hwid}`);
    console.log(`📅 Date: ${requestData.date}`);

    // 2. Ma'lumotlarni so'rash
    const clientName = await question("\n👤 Mijoz ismi: ");
    const type = await question("Litsenziya turi (1=Lifetime, 2=Monthly): ");

    let expiry = 'NEVER';
    let typeStr = 'lifetime';

    if (type === '2') {
        typeStr = 'monthly';
        const days = await question("Necha kun (masalan 30): ");
        const date = new Date();
        date.setDate(date.getDate() + parseInt(days));
        expiry = date.toISOString();
    }

    // 3. Payload yaratish
    const payload = {
        client: clientName,
        hwid: requestData.hwid,
        type: typeStr,
        expiry: expiry,
        issuedAt: new Date().toISOString()
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');

    // 4. Imzolash
    const signer = crypto.createSign('SHA256');
    signer.update(payloadBase64);
    signer.end();
    const signature = signer.sign(PRIVATE_KEY, 'hex');

    // 5. Faylga yozish
    const finalContent = `${payloadBase64}.${signature}`;
    const outputFileName = `JetPOS_${requestData.hwid}.license`;

    fs.writeFileSync(outputFileName, finalContent);

    console.log(`\n✅ Litsenziya yaratildi: ${outputFileName}`);
    console.log("Bu faylni mijozga yuboring va dastur papkasiga tashlashni ayting.");

    rl.close();
})();
