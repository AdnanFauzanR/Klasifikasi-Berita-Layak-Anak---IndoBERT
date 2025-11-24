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

  const isChildSafe = label === "layak_anak";

  const badge = document.createElement("div");
  badge.className = "layak-anak-badge";
  badge.innerText = isChildSafe ? "KONTEN LAYAK ANAK" : "TIDAK LAYAK ANAK";

  badge.setAttribute(
    "data-score",
    typeof score === "number" ? score.toFixed(2) : "0.00"
  );
  badge.setAttribute("data-label", label);

  // Fallback style inline kalau overlay.css gagal load
  badge.style.position = "fixed";
  badge.style.top = "16px";
  badge.style.right = "16px";
  badge.style.zIndex = "999999";
  badge.style.padding = "10px 16px";
  badge.style.borderRadius = "999px";
  badge.style.background = "#ffffff";
  badge.style.border = "2px solid #00bcd4";
  badge.style.fontFamily =
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  badge.style.fontSize = "12px";
  badge.style.fontWeight = "600";
  badge.style.color = "#000000";
  badge.style.boxShadow = "0 4px 10px rgba(0,0,0,0.18)";

  document.body.appendChild(badge);
  console.log("[LayakAnak] Badge appended to DOM.");
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
