/*async function loadArticles() {
    const res = await fetch("articles.json"); // JSONのパス
    const articles = await res.json();
    const container = document.getElementById("article-container");

    articles.forEach(article => {
        const displayDate = article.dateModified || article.datePublished;

        const cardHTML = `
    <article class="main-card no-padding border round s12 m6 l4">
        <div class="img-unit">
            <div class="img-unit2">
                <img class="img-unit3" src="${article.thumbnail}" alt="${article.title}">
            </div>
        </div>
        <div class="text-unit">
            <div class="tags-unit">
                ${article.tags.map(tag => `<span class="chip">${tag}</span>`).join(' ')}
            </div>
            <h5>${article.title}</h5>
            <p>
                ${article.excerpt.short}
                <span class="full-text">${article.excerpt.full}</span>
            </p>
            <time datetime="${displayDate}">
                <p>${displayDate}</p>
            </time>
        </div>
        <a class="article-link" href="${article.url}"></a>
    </article>`;

        container.insertAdjacentHTML("beforeend", cardHTML);
    });
}

loadArticles();*/

async function loadArticles(filterOptions) {
    const res = await fetch("articles.json"); // JSONのパス
    const allArticles = await res.json();
    const container = document.getElementById("article-container");
    container.innerHTML = ''; // コンテナを一度空にする

    // フィルタリング処理
    const filteredArticles = allArticles.filter(article => {
        // HOMEページの場合：priorityが指定した値以上なら表示
        if (filterOptions.page === 'home') {
            // 例えば priority 4 以上のものをHOMEに表示する
            return article.priority >= 4;
        }
        // カテゴリページの場合：articleのcategoriesに指定したカテゴリが含まれていれば表示
        if (filterOptions.page === 'category') {
            return article.categories.includes(filterOptions.categoryName);
        }
        // デフォルトはすべて表示（もしくは何も表示しない）
        return true;
    });

    // フィルタリングされた記事だけを表示
    filteredArticles.forEach(article => {
        const displayDate = article.dateModified || article.datePublished;

        const cardHTML = `
    <article class="main-card no-padding border round s12 m6 l4">
        <div class="img-unit">
            <div class="img-unit2">
                <img class="img-unit3" src="${article.thumbnail}" alt="${article.title}">
            </div>
        </div>
        <div class="text-unit">
            <div class="tags-unit">
                ${article.tags.map(tag => `<span class="chip">${tag}</span>`).join(' ')}
            </div>
            <h5>${article.title}</h5>
            <p>
                ${article.excerpt.short}
                <span class="full-text">${article.excerpt.full}</span>
            </p>
            <time datetime="${displayDate}">
                <p>${displayDate}</p>
            </time>
        </div>
        <a class="article-link" href="${article.url}"></a>
    </article>`;

        container.insertAdjacentHTML("beforeend", cardHTML);
    });
}