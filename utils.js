export const Spells = {
  FLASH: 4,
  SMITE: 11,
  HEAL: 7,
  EXHAUST: 3,
  IGNITE: 14,
  TELEPORT: 12,
};

export async function createQuickplayLobby() {
  const resp = await fetch("/lol-lobby/v2/lobby", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-riot-source": "rcp-fe-lol-parties",
      accept: "application/json",
    },
    body: JSON.stringify({
      queueId: 490,
    }),
  });

  const jsonResp = await resp.json();

  return jsonResp;
}

export async function getSummoner() {
  const res = await fetch("/lol-summoner/v1/current-summoner");
  const data = await res.json();
  return data;
}

export async function getGameVersion() {
  const res = await fetch("/lol-patch/v1/game-version");
  const data = await res.json();
  return data.split(".")[0] + "." + data.split(".")[1];
}

export async function getRunesAndSpell(champ_id, position) {
  const game_version = await getGameVersion();
  const res = await fetch(
    `https://b2c-api-cdn.deeplol.gg/champion/build?platform_id=KR&champion_id=${champ_id}&game_version=${game_version}&tier=Emerald%2B`
  );
  const data = (await res.json()).data;
  const cleanData = data.filter((detail) => detail.lane !== "Aram");
  console.log(cleanData);
  const currentLane = cleanData.find(
    (data) => data.lane.toLowerCase() === position.toLowerCase()
  );

  if (!currentLane) {
    const mostPopularLane = cleanData.reduce((prev, current) =>
      prev.game > current.game ? prev : current
    );

    const mostPopularLaneBuild = mostPopularLane.build_detail.reduce(
      (prev, current) => (prev.pick_rate > current.pick_rate ? prev : current)
    );

    const mosPopularSpell = mostPopularLaneBuild.spell.reduce((prev, current) =>
      prev.pick_rate > current.pick_rate ? prev : current
    );

    let spell1 = mosPopularSpell.spell[0];
    let spell2 = mosPopularSpell.spell[1];
    if (position.toLowerCase() === "jungle") {
      if (spell1 !== Spells.SMITE && spell2 !== Spells.SMITE) {
        if (spell1 === Spells.FLASH) {
          spell2 = Spells.SMITE;
        } else {
          spell1 = Spells.SMITE;
        }
      }
    } else {
      /**
       * If the player has smite, remove it and replace it by
       *
       * TOP : Teleport
       * MID : Ignite
       * ADC : Heal
       * SUP : Exhaust
       */
      if (spell1 === Spells.SMITE || spell2 === Spells.SMITE) {
        if (position.toLowerCase() === "top") {
          if (spell1 === Spells.SMITE) {
            spell1 = Spells.TELEPORT;
          } else {
            spell2 = Spells.TELEPORT;
          }
        } else if (position.toLowerCase() === "mid") {
          if (spell1 === Spells.SMITE) {
            spell1 = Spells.IGNITE;
          } else {
            spell2 = Spells.IGNITE;
          }
        } else if (position.toLowerCase() === "adc") {
          if (spell1 === Spells.SMITE) {
            spell1 = Spells.HEAL;
          } else {
            spell2 = Spells.HEAL;
          }
        } else if (position.toLowerCase() === "sup") {
          if (spell1 === Spells.SMITE) {
            spell1 = Spells.EXHAUST;
          } else {
            spell2 = Spells.EXHAUST;
          }
        }
      }
    }

    return {
      runes: {
        perkIds: [
          ...mostPopularLaneBuild.rune.rune_main.slice(1),
          ...mostPopularLaneBuild.rune.rune_sub.slice(1),
          ...mostPopularLaneBuild.rune.rune_stat.reverse(),
        ],
        perkStyle: mostPopularLaneBuild.rune.rune_main[0],
        perkSubStyle: mostPopularLaneBuild.rune.rune_sub[0],
      },
      spell1,
      spell2,
    };
  } else {
    const mostPopularLaneBuild = currentLane.build_detail.reduce(
      (prev, current) => (prev.pick_rate > current.pick_rate ? prev : current)
    );

    const mosPopularSpell = mostPopularLaneBuild.spell.reduce((prev, current) =>
      prev.pick_rate > current.pick_rate ? prev : current
    );

    return {
      runes: {
        perkIds: [
          ...mostPopularLaneBuild.rune.rune_main.slice(1),
          ...mostPopularLaneBuild.rune.rune_sub.slice(1),
          ...mostPopularLaneBuild.rune.rune_stat.reverse(),
        ],
        perkStyle: mostPopularLaneBuild.rune.rune_main[0],
        perkSubStyle: mostPopularLaneBuild.rune.rune_sub[0],
      },
      spell1: mosPopularSpell.spell[0],
      spell2: mosPopularSpell.spell[1],
    };
  }
}

export async function getChampOwnedChamp(summoner_id) {
  const res = await fetch(
    `/lol-champions/v1/inventories/${summoner_id}/champions`
  );
  const data = await res.json();
  return data.filter((champ) => champ.ownership.owned);
}

export async function isFlashOnF() {
  const res = await fetch("/lol-settings/v2/account/LCUPreferences/lol-perks");
  const data = await res.json();
  return data.data.playerFlashOnFPreference;
}

export async function changePlayButtonText(newText) {
  const classToWatch = "button-text";

  const buttonWatcher = setInterval(() => {
    const button = document.querySelector(`.${classToWatch}`);

    if (button) {
      button.innerHTML = newText;
      clearInterval(buttonWatcher);
    }
  }, 1000);
}

export async function selectRdmChamp(position) {
  const { summonerId } = await getSummoner();

  const champs = await getChampOwnedChamp(summonerId);
  const champ = champs[Math.floor(Math.random() * champs.length)];

  const skins = champ.skins.filter((skin) => skin.ownership.owned);
  const skin = skins[Math.floor(Math.random() * skins.length)];

  const runesAndSpell = await getRunesAndSpell(champ.id, position);

  const flashOnF = await isFlashOnF();

  if (flashOnF && runesAndSpell.spell1 === Spells.FLASH) {
    runesAndSpell.spell1 = runesAndSpell.spell2;
    runesAndSpell.spell2 = Spells.FLASH;
  } else if (!flashOnF && runesAndSpell.spell2 === Spells.FLASH) {
    runesAndSpell.spell2 = runesAndSpell.spell1;
    runesAndSpell.spell1 = Spells.FLASH;
  }

  return {
    championId: champ.id,
    perks: JSON.stringify(runesAndSpell.runes),
    positionPreference: position,
    skinId: skin.id,
    spell1: runesAndSpell.spell1,
    spell2: runesAndSpell.spell2,
  };
}

export function showLoadingPage(text = "Creating LoL Cooking Lobby...") {
  const loading = document.createElement("div");

  const loading_img = document.createElement("div");
  loading_img.className = "loading-img";
  loading.className = "loading-wrapper";
  loading.appendChild(loading_img);

  const loading_text = document.createElement("h1");
  loading_text.innerHTML = text;
  loading.appendChild(loading_text);

  document.body.appendChild(loading);

  setTimeout(() => {
    const stuckText = "Stuck ? Click here to reload the client";
    const stuckButton = document.createElement("button");
    stuckButton.innerHTML = stuckText;
    stuckButton.className = "stuck-button";
    loading.appendChild(stuckButton);

    stuckButton.addEventListener("click", () => {
      location.reload();
    });
  }, 15000);

  return loading;
}