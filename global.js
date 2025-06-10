fetch('nav.html')
    .then(res => res.text())
    .then(html => {
        console.log('loaded nav:', html); // ← ここで中身確認
        document.getElementById('global-nav').innerHTML = html;
    });