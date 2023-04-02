// tutorial: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_second_WebExtension
// github example: https://github.com/mdn/webextensions-examples/tree/main/beastify

function listenForClicks() {
  document.addEventListener("click", (e) => {

    /**
     * Copy all games and send a "copyGames" message to the content script in the active tab.
     */
    function copyGames() {
      browser.tabs.query({active: true, currentWindow: true})
        .then(res => {
            browser.tabs.sendMessage(res[0].id, {
              command: "copyGames"
            });
        })
    }

    /**
     * Play saved games
     */
    function playGames() {
      browser.tabs.query({active: true, currentWindow: true})
        .then(res => {
            browser.tabs.sendMessage(res[0].id, {
                command: "playGames",
            })
        });
    }

    /**
     * For each button inside #popup-container, add action
     */
    if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
      // Ignore when click is not on a button within <div id="popup-content">.
      return;
    }

    if (e.target.id === "copyGames") {
      copyGames();
    } else if (e.target.id === "playGames") {
      playGames();
    }
  });
}


/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  console.error(`Failed to execute beastify content script: ${error.message}`);
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: "/content_scripts/lotofacil.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);

