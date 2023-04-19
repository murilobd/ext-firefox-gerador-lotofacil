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
          const allGames = JSON.parse(games).filter(game => {
            // filter out games that don't have 15 different numbers
            const setGame = new Set(game);
            return setGame.size === 15;
          });
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
      await sleep(0.2);
    }
    await sleep(0.5);
    // add game to cart
    const btnAddToCart = document.querySelector("button#colocarnocarrinho");
    btnAddToCart.click();

    // wait until new game is added to cart
    let gameAdded = false;
    let attempts = 30;
    while (!gameAdded && attempts > 0) {
      const cartGamesAdded = Number(document.querySelector("#carrinho").innerText);
      console.log("cartGamesAdded", cartGamesAdded, "gameNbr", Number(gameNbr));
      if (Number(cartGamesAdded) !== Number(gameNbr)) {
        await sleep(1);
      } else {
        gameAdded = true;
      }
      attempts--;
    }

    if (!gameAdded || attempts <= 0) {
      alert("Erro ao adicionar jogo: " + JSON.stringify(game));
      window.location.reload();
      return false;
    }

    alert("jogo adicionado: " + JSON.stringify(game));
    console.log("adicionado ----------------------");
    return true;
  }

  async function sleep(seconds = 1) {
    return new Promise(resolve => setTimeout(resolve, 1000 * seconds));
  }



})();
