import gamemode from "./gamemode";
import "./custom-lobby.css";
import {
  createQuickplayLobby,
  changePlayButtonText,
  showLoadingPage,
  selectRdmChamp
} from "./utils";

const AllPositions = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];

export function init() {
  Toast.success("LoL Cooking is active !");
  initCustomGamemode();
  listenButtonConfirmGamemode();
}

const listenButtonConfirmGamemode = () => {
  const buttonConfirmWatcher = setInterval(() => {
    const button = document.querySelector(".confirm");

    if (button) {
      button.addEventListener("click", async () => {
        const selectedGamemode = document.querySelector("#custom_gamemode");

        if (
          selectedGamemode &&
          selectedGamemode.classList.contains("selected")
        ) {
          const loading_page = showLoadingPage();
          await leaveLobby();
          setTimeout(async () => {
            const lobby = await createQuickplayLobby();

            Toast.success("LoL Cooking Lobby created !");

            changePlayButtonText("Good luck !");

            setTimeout(async () => {
              await rollRandomChampsAndRoles(lobby);

              await lobbyPage(lobby, loading_page);
            }, 1000);
          }, 2500);
        }
      });
      clearInterval(buttonConfirmWatcher);
    }
  });
};

async function rollRandomChampsAndRoles(lobby) {
  const position1 =
    lobby.scarcePositions[
      Math.floor(Math.random() * lobby.scarcePositions.length)
    ];

  const position2 = AllPositions.filter((position) => position !== position1)[
    Math.floor(Math.random() * 4)
  ];

  const prioChamp = await selectRdmChamp(position1);
  const rdmChamp = await selectRdmChamp(position2);

  await fetch("/lol-lobby/v1/lobby/members/localMember/player-slots", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "x-riot-source": "rcp-fe-lol-parties",
      accept: "application/json",
    },
    body: JSON.stringify([rdmChamp, prioChamp]),
  });
}

const lobbyPage = (lobby, loading_page) => {
  const partielistWatcher = setInterval(() => {
    const element = document.querySelector(".parties-content");
    const lobbyBannerContents = document.querySelector(
      ".lobby-banner-contents"
    );

    if (element && lobbyBannerContents) {
      clearInterval(partielistWatcher);

      const champ_select_watcher = setInterval(() => {
        const champ_select = document.querySelector(
          ".quick-play-selections-container-component"
        );

        if (champ_select) {
          const rerollButton = document.createElement("div");
          rerollButton.className = "roll-button";
          rerollButton.innerHTML = "Reroll";

          const hideShowButton = document.createElement("div");
          hideShowButton.className = "hide-show-button";
          hideShowButton.innerHTML = "Show";

          const buttonsContainer = document.createElement("div");
          buttonsContainer.className = "buttons-wrapper";
          buttonsContainer.appendChild(hideShowButton);
          buttonsContainer.appendChild(rerollButton);

          lobbyBannerContents.appendChild(buttonsContainer);

          rerollButton.addEventListener("click", async () => {
            const loading = showLoadingPage("Rerolling champions...");
            await rollRandomChampsAndRoles(lobby);
            document.body.removeChild(loading);
          });

          champ_select.style.display = "none";

          hideShowButton.addEventListener("click", () => {
            if (champ_select.style.display === "none") {
              champ_select.style.display = "block";
              hideShowButton.innerHTML = "Hide";
            } else {
              champ_select.style.display = "none";
              hideShowButton.innerHTML = "Show";
            }
          });
          document.body.removeChild(loading_page);

          clearInterval(champ_select_watcher);
        }
      }, 1000);
    }
  }, 1000);
};

const leaveLobby = () => {
  return new Promise((resolve, reject) => {
    const lobbyClassName = "parties-content";

    const lobbyWatcher = setInterval(async () => {
      const lobby = document.querySelector(`.${lobbyClassName}`);

      if (lobby) {
        await fetch("/lol-lobby/v2/lobby", {
          method: "DELETE",
        });

        clearInterval(lobbyWatcher);

        resolve();
      }
    }, 1000);
  });
};

const initCustomGamemode = () => {
  const gamemodeListWatcher = setInterval(() => {
    const element = document.querySelector(
      ".parties-game-type-card-categories"
    );

    if (element) {
      const gameMode = new gamemode(element);
      gameMode.setText("LoL Cooking");
      gameMode.setSubtitle("Random champions, random roles (quick play)");

      clearInterval(gamemodeListWatcher);
    }
  }, 1000);
};
