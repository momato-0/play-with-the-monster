fetch('https://momato-0.github.io/play-with-the-monster/nav.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('global-nav').innerHTML = html;
    });