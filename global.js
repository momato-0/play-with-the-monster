fetch('https://momato-0.github.io/play-with-the-monster/nav.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('global-nav').innerHTML = html;
    });

// <details> close
document.addEventListener("click", (event) => {
    const target = event.target.closest(".close-details");
    if (target) {
        event.preventDefault();
        target.closest("details")?.removeAttribute("open");
    }
});
// <summary> visited
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("details").forEach(details => {
        details.addEventListener("toggle", () => {
            details.setAttribute("data-visited", "true");
        });
    });
});
// thumb click -> loading Youtube
document.querySelectorAll(".thumb").forEach(thumb =>
    thumb.addEventListener("click", () => {
        const player = thumb.nextElementSibling;
        if (player?.tagName === "IFRAME") {
            player.src = player.dataset.src;
            thumb.style.display = "none";
        }
    })
);
// Link Gradation
const gradients = {
    ".mkj": [154, 89.4, 18.4, 309, 22.5, 44.5, "+"],
    ".mzm": [275, 45.6, 31, 313, 22.5, 37.5, "+"],
    ".zz": [152, 79.6, 44, 197, 63.4, 16.1, "+"]
};
Object.entries(gradients).forEach(([selector, [hs, ss, ls, he, se, le, mode]]) => {
    document.querySelectorAll(`${selector} .btn`).forEach((btn, index, arr) => {
        const step = index / (arr.length - 1);
        const h = mode === "+"
            ? hs + step * ((he - hs + 360) % 360)
            : hs - step * ((hs - he + 360) % 360);
        const s = ss + step * (se - ss);
        const l = ls + step * (le - ls);
        btn.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
    });
});
// boya txt and img
document.querySelectorAll('.boya').forEach(boya => {
    const imgSibling = boya.parentElement.parentElement.nextElementSibling;

    let isOverBoya = false;
    let isOverImg = false;

    function updateActive() {
        const isActive = isOverBoya || isOverImg;
        boya.classList.toggle('active', isActive);
        imgSibling?.classList.toggle('active', isActive);
    }

    boya.addEventListener('mouseenter', () => {
        isOverBoya = true;
        updateActive();
    });
    boya.addEventListener('mouseleave', () => {
        isOverBoya = false;
        updateActive();
    });

    if (imgSibling) {
        imgSibling.addEventListener('mouseenter', () => {
            isOverImg = true;
            updateActive();
        });
        imgSibling.addEventListener('mouseleave', () => {
            isOverImg = false;
            updateActive();
        });
    }
});