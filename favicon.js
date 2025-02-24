export function setFavicon(iconUrl) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
    }
    link.href = iconUrl;
}

// Set default favicon (change the path to your actual favicon)
setFavicon("darkpurpleof.github.io/system/assets/favicon.ico");
