// File: background.js
// Tujuan: Terima pesan dari content script, panggil API lokal FastAPI, dan
// kembalikan hasilnya ke content script.

const API_URL = "http://127.0.0.1:8000/classify";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CLASSIFY_ARTICLE") {
    const { text } = message.payload;

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    })
      .then((res) => res.json())
      .then((data) => {
        sendResponse(data);
      })
      .catch((err) => {
        console.error("[LayakAnak] API error:", err);
        sendResponse(null);
      });

    // return true agar sendResponse bisa dipakai async
    return true;
  }
});
