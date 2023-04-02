(() => {
	/**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener(async (message) => {
    // copy games and store in localStorage of extension
    if (message.command === "copyGames") {
      browser.storage.local.clear();
      const games = [];
      document.querySelectorAll(".container").forEach(node => {
        const numbersGame = [];
        node.querySelectorAll(".circle").forEach(item => {
          numbersGame.push(item.innerHTML);
        });
        games.push(numbersGame);
      });
      browser.storage.local.set({games: JSON.stringify(games)});
      alert(games.length + " jogos copiados");
      return Promise.resolve(games);
    }
    // play stored games in localStorage
    else if (message.command === "playGames") {
      browser.storage.local.get("games")
        .then(async ({ games }) => {
          const allGames = JSON.parse(games);
          for (let game = 0; game < allGames.length; game++) {
            await playGame(allGames[game], game + 1);
          }

          // alert when done
          alert("Sucesso!");
        })
    }
  });
  
  // function that will play each game: find numbers, click on them and add to cart
  async function playGame (game, gameNbr) {
    console.log("play", JSON.stringify(game));
    const divNumbers = document.querySelector(".escolhe-numero.lotofacil");
    
    for (const numb of game) {
      const n = divNumbers.querySelector("#n" + numb);
      n.click();
      await sleep(0.5);
    }
    await sleep(1);
    // add game to cart
    const btnAddToCart = document.querySelector("button#colocarnocarrinho");
    btnAddToCart.click();

    // wait until new game is added to cart
    let gameAdded = false;
    while (!gameAdded) {
      console.log("adicionando no carrinho");
      const cartGamesAdded = Number(document.querySelector("#carrinho").innerText);
      console.log("cartGamesAdded", cartGamesAdded);
      console.log("gameNbr", Number(gameNbr));
      if (cartGamesAdded !== Number(gameNbr)) {
        await sleep(1);
      } else {
        gameAdded = true;
      }
    }

    console.log("adicionado ----------------------");
    return true;
  }

  async function sleep(seconds = 1) {
    return setTimeout(() => Promise.resolve(true), 1000 * seconds);
  }


})();
