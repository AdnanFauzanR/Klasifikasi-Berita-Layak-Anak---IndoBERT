// File: contentScript.js

console.log("[LayakAnak] content script loaded on:", window.location.href);

const SITE_CONFIG = [
  {
    hostIncludes: "detik.com",
    selectors: ["article.detail", "div.detail__body-text.itp_bodycontent"],
  },
  { hostIncludes: "kompas.com", selectors: ["div.detail__content"] },
  {
    hostIncludes: "tribunnews.com",
    selectors: ["div.side-article.txt-article.multi-fontsize"],
  },
  { hostIncludes: "yahoo.com", selectors: ["div.caas-body"] },
  {
    hostIncludes: "kumparan.com",
    selectors: ["div.StoryRenderer__EditorWrapper-sc-1f9fbz3-0.cpOFyA"],
  },
  {
    hostIncludes: "cnnindonesia.com",
    selectors: [
      "div.detail-text.text-cnn_black.text-sm.grow.min-w-0",
      ".detail_text",
    ],
  },
  { hostIncludes: "tempo.co", selectors: ["div[data-v-632dd689]"] },
  {
    hostIncludes: "liputan6.com",
    selectors: [
      "div.article-content-body__item-page[data-page]",
      "div.article-content-body__item-content[data-component-name*='article-content-body']",
    ],
  },
  { hostIncludes: "cnbcindonesia.com", selectors: ["div.detail-text"] },
];

function getArticleText() {
  const hostname = window.location.hostname;
  const config = SITE_CONFIG.find((c) => hostname.includes(c.hostIncludes));

  if (!config) {
    console.log("[LayakAnak] No config for host:", hostname);
    return null;
  }

  let collectedText = "";
  let totalNodes = 0;

  for (const selector of config.selectors) {
    const nodes = document.querySelectorAll(selector);
    totalNodes += nodes.length;
    nodes.forEach((n) => {
      const text = n.innerText || n.textContent || "";
      collectedText += " " + text;
    });
  }

  collectedText = collectedText.trim();
  console.log(
    "[LayakAnak] Found nodes:",
    totalNodes,
    "Text length:",
    collectedText.length
  );

  if (!collectedText) {
    return null;
  }
  return collectedText;
}

function injectBadge(result) {
  console.log("[LayakAnak] injectBadge called with:", result);

  const { label, score } = result || {};
  if (!label) {
    console.warn("[LayakAnak] No label in result, aborting.");
    return;
  }

  // Tentukan path gambar berdasarkan klasifikasi
  const imgSrc = label === "layak_anak"
    ? chrome.runtime.getURL("board_LA.svg")
    : chrome.runtime.getURL("board_TLA.svg");

  // Hapus badge lama jika ada (agar tidak dobel)
  const old = document.querySelector(".layak-anak-badge");
  if (old) old.remove();

  // Wrapper container
  const badge = document.createElement("div");
  badge.className = "layak-anak-badge";

  // Hanya menampilkan GAMBAR
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = label;
  img.style.width = "300px";      // ukuran besar
  img.style.height = "auto";
  img.style.display = "block";

  // Styling dasar (kalau CSS gagal load)
  badge.style.position = "fixed";
  badge.style.top = "16px";
  badge.style.right = "16px";
  badge.style.zIndex = "999999";
  badge.style.padding = "0";
  badge.style.borderRadius = "12px";
  badge.style.border = "none";

  badge.appendChild(img);
  document.body.appendChild(badge);

  console.log("[LayakAnak] Large image badge appended to DOM.");
}


function classifyArticle() {
  const text = getArticleText();
  if (!text || text.length < 30) {
    console.log("[LayakAnak] Not enough article text, aborting.");
    return;
  }

  console.log("[LayakAnak] Sending text to background, length:", text.length);

  chrome.runtime.sendMessage(
    { type: "CLASSIFY_ARTICLE", payload: { text } },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[LayakAnak] Runtime error:",
          chrome.runtime.lastError.message
        );
        return;
      }
      console.log("[LayakAnak] Response from background:", response);
      if (!response) {
        console.warn("[LayakAnak] Empty response from background.");
        return;
      }
      injectBadge(response);
    }
  );
}

window.addEventListener("load", () => {
  console.log("[LayakAnak] window load event fired, scheduling classify...");
  setTimeout(classifyArticle, 1500);
});
