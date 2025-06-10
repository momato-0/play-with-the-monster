async function loadArticles() {
    const res = await fetch("articles.json"); // JSONのパス
    const articles = await res.json();
    const container = document.getElementById("article-container");

    articles.forEach(article => {
        const displayDate = article.dateModified || article.datePublished;

        const cardHTML = `
    <article class="no-padding border round s12 m6 l4">
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

loadArticles();