const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const inputDir = './img-original';
const outputDir = './img-500';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.readdirSync(inputDir).forEach(file => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    sharp(inputPath)
        .resize({ width: 500 })
        .toFile(outputPath)
        .then(() => console.log(`✅ Resized: ${file}`))
        .catch(err => console.error(`❌ Error processing ${file}:`, err));
});