fetch('/momato-0/play-with-the-monster/nav.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('global-nav').innerHTML = html;
    });