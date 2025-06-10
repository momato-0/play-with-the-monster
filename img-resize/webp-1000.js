const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const inputDir = './img-original';
const outputDir = './img-500';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.readdirSync(inputDir).forEach(file => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace(/\.[^/.]+$/, ".webp"));

    sharp(inputPath)
        .webp({
            lossless: false,
            quality: 100,
            alphaQuality: 100,
            nearLossless: true,
            smartSubsample: true,
            effort: 6
        })
        .toFile(outputPath)
        .then(() => console.log(`✅ Resized: ${file}`))
        .catch(err => console.error(`❌ Error processing ${file}:`, err));
});