import Chicken from "./../object/Chicken";
import Confetties from "../object/Confetties";
import ShareUrl from "share-url";

const gameDimension = Utils.getGameDimension();
const gameScale = gameDimension.width / G_WIDTH;
const CHICK_NAME_FONT_SIZE = 24;
const CHICH_NAME_X = 70;

export default class Winner extends Phaser.Scene {
  constructor() {
    super("Winner");
  }

  preload() {}

  create() {
    this.raceStats = gameInfo.raceStats;

    this.createBackground();
    this.createChickens();
    // this.createConfetti();
    this.createUI();
    this.playSound();
  }

  playSound() {
    // const music = this.sound.add('sfx_finish', {volume: 0.5});
    // music.on('complete', () => {
    //     this.sound.play("m_ending", {loop:true});
    // });
    // music.play();

    const sound = playSound("sfx_finish", 0.5, false);
    sound.on("end", function () {
      this.bgm = playSound("m_ending", 0.5, true);
    });
  }
  createBackground() {
    this.add.sprite(0, 0, "bg_winner").setOrigin(0, 0).setScale(1);

    // flare
    this.flare = this.make
    .spine({
      x: gameDimension.width * 0.53,
      y: gameDimension.height * 0.8,
      key: "flare",
      animationName: "ShineFlare",
      loop: true,
    })
    .setScale(0.4 * gameScale)
    .setAlpha(0.5)

    this.add.sprite(
      (G_WIDTH * gameScale) / 2,
      (G_HEIGHT - 180) * gameScale,
      "pedestal_new"
    );
  }

  createConfetti() {
    this.confetties = new Confetties(this, 0, 0);
    this.confetties.start();
  }

  createUI() {
    const uiScale = gameScale;
    const textScale = gameScale > 0.5 ? gameScale : 0.65;

    const container = this.add.container(0, 10);
    const centerPanel = this.add
      .sprite(-10, 60 * uiScale, "location_name_panel")
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    container.add(centerPanel);

    let fontUI = {
      font: "22px " + Utils.text["FONT"],
      fill: "#FFF",
      stroke: "#000",
      strokeThickness: 2,
    };
    const name = this.add
      .text(60 * uiScale, 22 * uiScale, this.raceStats.name, fontUI)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setScale(textScale);
    const location = this.add
      .text(60 * uiScale, 75 * uiScale, this.raceStats.location, fontUI)
      .setOrigin(0, 0.5)
      .setFontSize(26)
      .setScrollFactor(0)
      .setScale(textScale);

    container.add(name);
    container.add(location);

    // const length = Math.max(name.x + name.width, location.x + location.width);
    centerPanel.scaleX = 1;

    const leaderBoardScale = Math.max(0.65, gameScale);
    this.leaderboard = this.add
      .container(0, 180 * gameScale)
      .setScrollFactor(0)
      .setScale(uiScale);
  
    const panelScale = gameScale > 0.5 ? 1 : 2
    for (let i = 0; i < 3 && i < this.chickensInfo.length; i++) {
      const y = 25 + i * 50 + i;
      const rp = this.chickensInfo[i].segments;
      let time = rp[rp.length - 1][this.timeParameter].toFixed(2);
      if (time >= 60) {
        let min = Math.floor(time / 60);
        let remaining = (time - 60 * min).toFixed(0);
        if (remaining < 10) remaining = "0" + remaining;
        time = `${min}:${remaining}`;
      }
      const rwb = this.add
        .sprite(25, y, "main_chicken_name_panel")
        .setOrigin(0, 0.5)
        .setScale(1.2 * panelScale, panelScale)
      const name = Utils.getName(this.chickensInfo[i]["info"]);

      fontUI["font"] = "24px " + Utils.text["FONT"]
      fontUI["strokeThickness"] = 1
      const rank = this.add
        .text(40, y, `${i + 1}.`, fontUI)
        .setOrigin(0, 0.5)
      const chickenName = this.add
        .text(CHICH_NAME_X, y, name, fontUI)
        .setOrigin(0, 0.5)

      const timer = this.add
        .sprite(270, y, "timer")
        .setOrigin(0, 0.5)

      fontUI["font"] = "22px " + Utils.text["FONT"]
      fontUI["fontStyle"] ="strong"
      const record = this.add
        .text(timer.x + 30 * uiScale, y, time, fontUI)
        .setOrigin(0, 0.5);

      this.leaderboard.add(rwb);
      this.leaderboard.add(rank);
      this.leaderboard.add(chickenName);
      this.leaderboard.add(timer);
      this.leaderboard.add(record);
    }

    fontUI = {
      font: "24px " + Utils.text["FONT"],
      fill: "#FFF",
      stroke: "#000",
      strokeThickness: 1,
    }

    for (let i = 3; i < this.chickensInfo.length; i++) {
      const y = 25 + i * 50 + i + 2;
      const ci = this.chickensInfo[i];
      const rp = ci.segments;
      const lastSeg = rp[rp.length - 1];

      let time =
        lastSeg.segmentChickenAnimation === "DoNotDrawChicken"
          ? "DNF"
          : rp[rp.length - 1][this.timeParameter].toFixed(2);
      if (time >= 60) {
        let min = Math.floor(time / 60);
        let remaining = (time - 60 * min).toFixed(0);
        if (remaining < 10) remaining = "0" + remaining;
        time = `${min}:${remaining}`;
      }
      const rwb = this.add
        .sprite(25, y, "secondary_chicken_name_panel")
        .setOrigin(0, 0.5)
        .setScale(1.2 * panelScale, panelScale)
      const name = Utils.getName(ci.info);

      const rank = this.add
        .text(40, y, `${i + 1}.`, fontUI)
        .setOrigin(0, 0.5)
      const chickenName = this.add
        .text(CHICH_NAME_X, y, name, fontUI)
        .setOrigin(0, 0.5)

      const timer = this.add
        .sprite(270, y, "timer")
        .setOrigin(0, 0.5)

      fontUI["font"] = "22px " + Utils.text["FONT"]
      fontUI["fontStyle"] ="strong"
      const record = this.add
        .text(timer.x + 30 * uiScale, y, time, fontUI)
        .setOrigin(0, 0.5)
        .setFill(time === "DNF" ? "#B00020" : "#fff");

      this.leaderboard.add(rwb);
      this.leaderboard.add(rank);
      this.leaderboard.add(chickenName);
      this.leaderboard.add(timer);
      this.leaderboard.add(record);
    }

//     this.input.on("gameobjectdown", (pointer, gameObject) => {
//       if (gameObject === btnTwitter) {
//         btnLabelContainer.setScale(0.95);
//       }
//     });

//     this.input.on("gameobjectover", (pointer, gameObject) => {
//       if (gameObject === btnTwitter) {
//         btnLabelContainer.setScale(1.05);
//       }
//     });
//     this.input.on("gameobjectup", (pointer, gameObject) => {
//       if (gameObject === btnTwitter) {
//         btnLabelContainer.setScale(1);
//         console.log(this.raceStats.prizePoolUSD);
//         const shareURL = ShareUrl.twitter({
//           text: `🏁🐔 Check out this exciting Chicken Derby race with $${this.raceStats.prizePoolUSD} on the line! 🐔🏁
// Follow @bitlovincom for the latest Chicken Derby news`,
//           url: window.location.href,
//           hashtags: "chickenderby,nft",
//           related: "bitlovincom",
//         });

//         window.open(
//           shareURL,
//           "",
//           "left=0,top=0,width=550,height=450,personalbar=0,toolbar=0,scrollbars=0,resizable=0"
//         );
//       }
//     });
//     this.input.on("gameobjectout", (pointer, gameObject) => {
//       if (gameObject === btnTwitter) {
//         btnLabelContainer.setScale(1);
//       }
//     });
  }

  getNameToSize(name, from) {
    let chLength = name.length;
    let size = 30;
    switch (from) {
      case 1: //Top 3
        if (chLength <= 14) size = 30;
        else if (chLength <= 15) size = 28;
        else if (chLength <= 16) size = 26;
        else if (chLength <= 17) size = 25;
        else if (chLength <= 18) size = 24;
        else if (chLength <= 19) size = 23;
        else if (chLength <= 20) size = 22;
        else size = 20;
        break;

      case 2: // After 3
        if (chLength <= 13) size = 30;
        else if (chLength <= 14) size = 27;
        else if (chLength <= 15) size = 25;
        else if (chLength <= 16) size = 23;
        else if (chLength <= 18) size = 21;
        else if (chLength <= 20) size = 19;
        else size = 20;
        break;

      case 3: // On pedestal
        if (chLength <= 14) size = 48;
        else if (chLength <= 15) size = 46;
        else if (chLength <= 16) size = 44;
        else if (chLength <= 17) size = 42;
        else if (chLength <= 18) size = 40;
        else if (chLength <= 19) size = 38;
        else if (chLength <= 20) size = 37;
        else size = 37;
        break;
    }

    return size;
  }

  createChickens() {
    const container = this.add.container(0, 0).setScale(gameScale);
    const chickensInfo = gameInfo.chickens;
    // let chickIDs = [];
    this.chickens = [];
    // for(let i = 0; i < chickensInfo.length; i++){
    //     chickIDs[chickensInfo[i]['info']['id']] = i;
    // }

    // let gameResult = Utils.Storage.get("gameResult");
    this.timeParameter = "time";
    if (
      chickensInfo[0].segments[0].time == null &&
      chickensInfo[0].segments[0].cumulativeSegmentSize != null
    ) {
      this.timeParameter = "cumulativeSegmentSize";
    }

    chickensInfo.sort((c1, c2) => {
      const rp1 = c1.segments;
      const rp2 = c2.segments;
      return (
        rp1[rp1.length - 1][this.timeParameter] -
        rp2[rp2.length - 1][this.timeParameter]
      );
    });

    this.chickensInfo = chickensInfo;
    const pos = [
      [1000, 680],
      [700, 750],
      [1290, 830],
    ];

    const prizes = ["first", "second", "third"];

    const panelScale = gameScale > 0.5 ? 1 : 2
    for (let i = 0; i < Math.min(chickensInfo.length, 3); i++) {
      const chicken = chickensInfo[i]; //[chickIDs[gameResult[i]]];

      this.chickens[i] = new Chicken(
        this,
        pos[i][0],
        pos[i][1],
        "chicken",
        0.2,
        {
          info: chicken.info,
        }
      );
      const lastSegment = chicken.segments[chicken.segments.length - 1];

      if (["Jetpack_Fly", "Jetpack_FlyRed"].includes(lastSegment.segmentChickenAnimation)) {
        this.chickens[i].playAnimation("Idle_JetpackGear");
      }

      // const teleportAlienEyeChanges = (
      //   chicken.segments?.filter((e) => e.isAlienEyes !== undefined) || []
      // ).map((e) => e.isAlienEyes);

      // if (
      //   teleportAlienEyeChanges.length &&
      //   teleportAlienEyeChanges[teleportAlienEyeChanges.length - 1]
      // ) {
      //   this.chickens[i].setEyes("Alien");
      // }

      const chickInfoPanel = this.add
        .container(pos[i][0], pos[i][1] - 400)
        .setScrollFactor(0)

      const chickenInfoBg = this.add
        .sprite(0, 0, i === 0 ? "winner_panel_primary" : "winner_panel_secondary")
        .setOrigin(0.5, 0.5)
        .setScale(panelScale)

      let fontUI = {
        font: "26px " + Utils.text["FONT"],
        fill: "#FFF",
        stroke: "#000",
        strokeThickness: 2,
      };

      const name = Utils.getName(chicken.info);
      const ownerName = chicken.info.username;

      const money = this.add
        .text(
          0,
          40,
          `$ ${this.raceStats[prizes[i] + "PrizeUSD"]}`,
          fontUI
        )
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0)
        .setFill('#7efc10')
        .setFontSize(48);

      const chickenNameText = this.add
        .text(0, -40, name, fontUI)
        .setScrollFactor(0)
        .setOrigin(0.5, 0.5);

      const ownerText = this.add
        .text(0, 0, ownerName, fontUI)
        .setOrigin(0.5, 0.5)
        .setFontSize(20);

      chickInfoPanel.add(chickenInfoBg);
      chickInfoPanel.add(chickenNameText);
      chickInfoPanel.add(ownerText);
      chickInfoPanel.add(money);

      if (i === 2) {
        this.chickens[i].chicken.setScale(-0.2, 0.2)
      }
      container.add(chickInfoPanel)
      container.add(this.chickens[i]);
    }
  }

  // update() {
  //   this.confetties.update();
  // }
}
