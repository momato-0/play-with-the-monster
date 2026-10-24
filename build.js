// 使い方：node build.js
// articles.json と nav.html をもとに、各ページの head・ナビ・カード一覧・sitemap.xml を書き出す。
// 何回実行しても同じ結果になる（<!-- build:xxx --> 〜 <!-- /build:xxx --> の中だけ書き換える）。

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const SITE_URL = 'https://momato-0.github.io/play-with-the-monster/';
const SITE_NAME = '怪物であそぼう';
const DEFAULT_AUTHOR = 'momato';

// 一覧ページの設定
const LIST_PAGES = {
    'index.html': {
        title: SITE_NAME,
        description: '本とゲームを、じっくり深掘りして楽しむ考察サイト。名作文学の読み解きや、ゲームの全訳・攻略ガイドなど。',
        filter: a => a.priority >= 4,
    },
    'books.html': {
        title: `本 - ${SITE_NAME}`,
        description: '本の記事一覧。名作文学をやわらかく、とことん深掘りして読み解く。',
        filter: a => a.categories.includes('本'),
    },
    'games.html': {
        title: `ゲーム - ${SITE_NAME}`,
        description: 'ゲームの記事一覧。物語の考察、全訳、攻略ガイドなど。',
        filter: a => a.categories.includes('ゲーム'),
    },
};

// 書き換えない・sitemap に載せないもの
const EXCLUDE = [
    /^\.git\//,
    /^img-resize\//,
    /node_modules\//,
    /^books\/_import\//,
    /^books\/HPL\//,      // 下書き
    /^others\/test\.html$/,
    /^nav\.html$/,
    /^template/,
    /^google[0-9a-f]+\.html$/,
    /^games\/norco\.html$/, // 中身が空
];

const esc = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 「🎮【FILAMENT】…」の先頭の絵文字は <title> では外す
const plainTitle = t => t.replace(/^[\p{Extended_Pictographic}️\s]+/u, '');

const year = new Date().getFullYear();
const today = new Date().toISOString().slice(0, 10);

const articles = JSON.parse(fs.readFileSync(path.join(ROOT, 'articles.json'), 'utf8'));
const articleByUrl = Object.fromEntries(articles.map(a => [a.url, a]));
const navSource = fs.readFileSync(path.join(ROOT, 'nav.html'), 'utf8').trim();

function listHtmlFiles(dir = ROOT) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(dir, entry.name);
        const rel = path.relative(ROOT, full).split(path.sep).join('/');
        if (EXCLUDE.some(re => re.test(rel + (entry.isDirectory() ? '/' : '')))) return [];
        if (entry.isDirectory()) return listHtmlFiles(full);
        return entry.name.endsWith('.html') ? [rel] : [];
    });
}

// <!-- build:name --> 〜 <!-- /build:name --> を置き換える。まだなければ fallback の位置に入れる
function replaceBlock(html, name, content, fallback) {
    const block = `<!-- build:${name} -->\n${content}\n<!-- /build:${name} -->`;
    const re = new RegExp(`<!-- build:${name} -->[\\s\\S]*?<!-- /build:${name} -->`);
    if (re.test(html)) return html.replace(re, () => block);
    if (fallback && fallback.test(html)) return html.replace(fallback, m => fallback.keep ? `${m}\n${block}` : block);
    return html;
}

function headBlock(rel, meta) {
    const url = SITE_URL + rel;
    const lines = [
        `<title>${esc(meta.title)}</title>`,
        `<meta name="description" content="${esc(meta.description)}">`,
        `<link rel="canonical" href="${url}">`,
        `<meta property="og:site_name" content="${SITE_NAME}">`,
        `<meta property="og:title" content="${esc(meta.title)}">`,
        `<meta property="og:type" content="${meta.type}">`,
        `<meta property="og:url" content="${url}">`,
        `<meta property="og:description" content="${esc(meta.description)}">`,
        `<meta property="og:locale" content="ja_JP">`,
    ];
    if (meta.image) lines.push(`<meta property="og:image" content="${SITE_URL + meta.image}">`);
    lines.push(`<meta name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}">`);
    if (meta.jsonLd) {
        lines.push(`<script type="application/ld+json">\n${JSON.stringify(meta.jsonLd, null, 2)}\n</script>`);
    }
    return lines.map(l => `    ${l}`).join('\n');
}

function articleMeta(rel, a) {
    const description = a.description || `${a.excerpt.short}${a.excerpt.full}`;
    const author = a.author || DEFAULT_AUTHOR;
    return {
        title: `${plainTitle(a.title)} - ${SITE_NAME}`,
        description,
        type: 'article',
        image: a.thumbnail,
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: plainTitle(a.title),
            description,
            image: a.thumbnail ? SITE_URL + a.thumbnail : undefined,
            datePublished: a.datePublished,
            dateModified: a.dateModified || a.datePublished,
            inLanguage: 'ja',
            mainEntityOfPage: SITE_URL + rel,
            keywords: a.tags.join(', '),
            author: { '@type': 'Person', name: author, url: SITE_URL + 'about.html' },
            publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        },
    };
}

function cardsHtml(list) {
    return list.map((a, i) => {
        const date = a.dateModified || a.datePublished;
        const lazy = i >= 3 ? ' loading="lazy"' : '';
        return `
            <article class="main-card no-padding border round s12 m6 l4">
                <div class="img-unit">
                    <div class="img-unit2">
                        <img class="img-unit3" src="${esc(a.thumbnail)}" alt="${esc(plainTitle(a.title))}"${lazy}>
                    </div>
                </div>
                <div class="text-unit">
                    <div class="tags-unit">
                        ${a.tags.map(tag => `<span class="chip">${esc(tag)}</span>`).join(' ')}
                    </div>
                    <h5>${esc(a.title)}</h5>
                    <p>
                        ${esc(a.excerpt.short)}
                        <span class="full-text">${esc(a.excerpt.full)}</span>
                    </p>
                    <time datetime="${date}">
                        <p>${date}</p>
                    </time>
                </div>
                <a class="article-link" href="${esc(a.url)}" aria-label="${esc(plainTitle(a.title))}"></a>
            </article>`;
    }).join('\n');
}

// 既存の title / description / og / twitter / canonical を消す（build:head の外にあるものだけ）
function stripOldHead(html) {
    if (html.includes('<!-- build:head -->')) return html;
    return html
        .replace(/^[ \t]*<title>[\s\S]*?<\/title>[ \t]*\r?\n/m, '')
        .replace(/^[ \t]*<meta (name="description"|property="og:[^"]*"|name="twitter:[^"]*")[^>]*>[ \t]*\r?\n/gm, '')
        .replace(/^[ \t]*<link rel="canonical"[^>]*>[ \t]*\r?\n/gm, '');
}

function lastmod(rel, article) {
    if (article) return article.dateModified || article.datePublished;
    try {
        return execFileSync('git', ['log', '-1', '--format=%cs', '--', rel], { cwd: ROOT, encoding: 'utf8' }).trim() || today;
    } catch {
        return today;
    }
}

const viewportMeta = /<meta name="viewport"[^>]*>/;
viewportMeta.keep = true;
const navFallback = /<div id="global-nav"><\/div>/;
const cardsFallback = /<section id="article-container" class="grid"><\/section>/;
const yearFallback = /<script>document\.write\(new Date\(\)\.getFullYear\(\)\);<\/script>/;

const files = listHtmlFiles();
const sitemap = [];

for (const rel of files) {
    const file = path.join(ROOT, rel);
    const before = fs.readFileSync(file, 'utf8');
    let html = before;

    // ナビ：サイト内リンクはページの深さに合わせて相対パスにする（ローカルでも動くように）
    const nav = navSource.split(SITE_URL).join('../'.repeat(rel.split('/').length - 1));
    html = replaceBlock(html, 'nav', `<div id="global-nav">\n${nav}\n</div>`, navFallback);

    // フッターの年
    html = html.replace(yearFallback, `<!-- build:year -->${year}<!-- /build:year -->`)
        .replace(/<!-- build:year -->\d+<!-- \/build:year -->/, `<!-- build:year -->${year}<!-- /build:year -->`);

    const article = articleByUrl[rel];
    const listPage = LIST_PAGES[rel];
    if (article) {
        html = replaceBlock(stripOldHead(html), 'head', headBlock(rel, articleMeta(rel, article)), viewportMeta);
    } else if (listPage) {
        html = replaceBlock(stripOldHead(html), 'head', headBlock(rel, { ...listPage, type: 'website' }), viewportMeta);
        html = replaceBlock(html, 'cards',
            `<section id="article-container" class="grid">${cardsHtml(articles.filter(listPage.filter))}\n        </section>`,
            cardsFallback);
    }

    // 改行コードは元のファイルに合わせる
    if (before.includes('\r\n')) html = html.replace(/\r?\n/g, '\r\n');

    if (html !== before) fs.writeFileSync(file, html, 'utf8');
    sitemap.push({ loc: SITE_URL + (rel === 'index.html' ? '' : rel), lastmod: lastmod(rel, article) });
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(u => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml, 'utf8');

console.log(`${files.length} ページを処理、sitemap.xml に ${sitemap.length} 件`);
