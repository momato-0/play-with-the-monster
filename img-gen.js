const fs = require('fs');

// ファイル名
const inputFile = 'test.html';
const outputFile = 'output.html';

// 画像URL（id: URL）
const images = {
    "a1": "https://yourbloggerurl.com/path/to/image1.png",
    "a2": "https://yourbloggerurl.com/path/to/image2.png",
    "a3": "https://yourbloggerurl.com/path/to/image3.png",
};

fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
        console.error('読み込みエラー:', err);
        return;
    }

    const result = data.replace(/<img\s+([^>]*?)data-key="(.*?)"(.*?)>/g, (match, before, key, after) => {
        if (images[key]) {
            // srcの中身を消す
            const cleanedBefore = before.replace(/src=".*?"/g, '').trim();
            const cleanedAfter = after.replace(/src=".*?"/g, '').trim();

            return `<img${cleanedBefore ? ' ' + cleanedBefore : ''} src="${images[key]}"${cleanedAfter ? ' ' + cleanedAfter : ''}>`;
        } else {
            return match; // キーがなければ元のまま
        }
    });

    fs.writeFile(outputFile, result, 'utf8', (err) => {
        if (err) {
            console.error('書き込みエラー:', err);
            return;
        }
        console.log('変換完了！output.htmlへ');
    });
});