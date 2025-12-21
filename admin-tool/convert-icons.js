const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

const files = [
    {
        input: path.join(__dirname, 'resources', 'icon.png'),
        output: path.join(__dirname, 'resources', 'icon.ico')
    },
    {
        input: path.join(__dirname, '..', 'resources', 'icon.png'),
        output: path.join(__dirname, '..', 'resources', 'icon.ico')
    }
];

(async () => {
    for (const file of files) {
        try {
            console.log(`Reading ${file.input}...`);
            const input = fs.readFileSync(file.input);
            console.log(`Converting to .ico...`);

            // to-ico accepts an array of buffers and returns a promise resolving to a buffer
            const buf = await toIco([input], {
                sizes: [256, 128, 64, 48, 32, 24, 16], // Standard Windows sizes
                resize: true
            });

            fs.writeFileSync(file.output, buf);
            console.log(`Success! Created ${file.output}`);
        } catch (e) {
            console.error(`Error processing ${file.input}:`, e);
        }
    }
})();
