const os = require('os');
const crypto = require('crypto');

/**
 * Hardware ID ni olish - kompyuterning unikal identifikatori
 * CPU model + MAC Address + Hostname kombinatsiyasi
 */
function getHardwareId() {
    try {
        const cpus = os.cpus();
        const networkInterfaces = os.networkInterfaces();

        // CPU model
        const cpuModel = cpus[0]?.model || 'unknown-cpu';

        // Birinchi ishlaydigan network interface ning MAC addressi
        const macAddress = Object.values(networkInterfaces)
            .flat()
            .find(iface => !iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00')?.mac || 'unknown-mac';

        // Hostname
        const hostname = os.hostname() || 'unknown-host';

        // Kombinatsiya qilib hash
        const combined = `${cpuModel}-${macAddress}-${hostname}`;
        const hash = crypto.createHash('sha256').update(combined).digest('hex');

        // Birinchi 16 ta belgi (qisqaroq ID)
        return hash.substring(0, 16);
    } catch (error) {
        console.error('Hardware ID olishda xato:', error);
        return 'fallback-hardware-id';
    }
}

module.exports = { getHardwareId };
