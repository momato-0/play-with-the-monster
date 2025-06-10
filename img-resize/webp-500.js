const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const inputDir = './img-original';
const outputDir = './img-500';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.readdirSync(inputDir).forEach(file => {
    const inputPath = path.join(inputDir, file);
    const outputFile = file.replace('s1000', 's500').replace(/\.[^/.]+$/, ".webp");
    const outputPath = path.join(outputDir, outputFile);

    sharp(inputPath)
        .resize({ width: 500 })
        .webp({ lossless: true })
        .toFile(outputPath)
        .then(() => console.log(`✅ Resized: ${file} → ${outputFile}`))
        .catch(err => console.error(`❌ Error processing ${file}:`, err));
});