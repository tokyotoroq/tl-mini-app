// Заставка показывается при каждом новом открытии мини-приложения.
// Если приложение просто свернули и развернули, страница не перезагружается,
// поэтому заставка повторно не появляется.
(function () {
    const splash = document.getElementById("splash");
    if (!splash) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
        splash.remove();
        document.body.classList.add("app-ready");
        return;
    }

    function hide() {
        if (splash.classList.contains("is-hiding")) return;
        splash.classList.add("is-hiding");
        document.body.classList.add("app-ready");
        setTimeout(() => splash.remove(), 600);
    }

    setTimeout(hide, 2000);
})();
