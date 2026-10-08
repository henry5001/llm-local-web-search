(async function () {
  const result = await browser.storage.local.get("settings");
  const settings = result.settings || DEFAULT_SETTINGS;
  const maxResults = settings.maxResults;
  const extractDelay = settings.extractDelay ?? DEFAULT_SETTINGS.extractDelay;

  function extractResults() {
    const links = [];
    const results = document.querySelectorAll("#b_results li.b_algo h2 a");

    results.forEach((a, i) => {
      if (i < maxResults && a.href) {
        links.push({
          title: a.textContent.trim(),
          url: a.href,
        });
      }
    });

    return links;
  }

  let sent = false;

  function trySend() {
    if (sent) return;
    const results = extractResults();
    if (results.length > 0) {
      console.log("[BING] Found", results.length, "results");
      browser.runtime.sendMessage({
        type: "searchResults",
        results: results,
      });
      sent = true;
    }
  }

  const observer = new MutationObserver(trySend);
  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(trySend, extractDelay);

  console.log("[BING] Loaded, maxResults:", maxResults);
})();
