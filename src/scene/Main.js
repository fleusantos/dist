import Chicken from "./../object/Chicken";
import Confetties from "../object/Confetties";
import Feathers from "../object/Feathers";

const gameDimension = Utils.getGameDimension();
const gameScale = gameDimension.width / G_WIDTH;

const GAMESTATUS_IDLE = 0;
const GAMESTATUS_RUN = 1;
const GAMESTATUS_OVER = 3;

const TERRAIN_UL_WIDTH = 450;
const TERRAIN_UNIT = 225;

const TERRAIN_TOP_HEIGHT = 140;
const TERRAIN_BOTTON_HEIGHT = 40;
const TERRAIN_HEIGHT = G_HEIGHT - TERRAIN_TOP_HEIGHT - TERRAIN_BOTTON_HEIGHT;

const LANE_COUNT = 12;
const LANE_HEIGHT = TERRAIN_HEIGHT / LANE_COUNT;

const TERRAIN_OFFSET = 55;
const START_LINE = 150;
const CHICKEN_OFFSET = 50;

const TERRAIN_AFTER_END = 6;

const MARK_DISTANCE = 10; // 1 Mark per 10M

export default class Main extends Phaser.Scene {

  constructor() {
    super("Main");
    const params = new URLSearchParams(window.location.search);
    this.env = params.get("env");
  }

  preload() {
    // plugin
    this.load.plugin(
      "rexoutlinepipelineplugin",
      "src/libs/plugins/rexoutlinepipelineplugin.min.js",
      true
    );
    // optional per Blackhole
    this.load.plugin(
      "rexswirlpipelineplugin",
      "src/libs/plugins/rexswirlpipelineplugin.min.js",
      true
    );
    console.log("isRecorder", this.game.isRecorder);
  }

  create() {
    this.uiScene = this.game.scene.getScene("UI");

    this.outlinePlugins = this.plugins.get("rexoutlinepipelineplugin");
    this.swirlPlugins = this.plugins.get("rexswirlpipelineplugin");

    this.elapsedFrame = 0;
    this.raceStats = gameInfo.raceStats;
    this.gameStatus = GAMESTATUS_IDLE;
    this.totalDistance = G_PIXEL_1M * this.raceStats.distance;
    this.terrain = this.raceStats.terrain.name.toLowerCase();
    this.lanes = this.raceStats.lanes;
    this.lanes.sort((p1, p2) => p1.laneNumber - p2.laneNumber);
    this.commentaries = gameInfo.commentaries;

    this.speedFactor = 1;
    this.isPlaying = true;

    this.isReplay = false;
    this.focusedId = undefined; // INFO: chicken id, camera will follow this chicken

    this.bgMainContainers = [];
    this.bgEdgeContainers = [];
    this.bgMarkContainers = [];

    this.hasLeaderboard = false;

    this.createBackground();

    this.createChickens();

    this.prepareTalents();

    // this.createAnimations();
    this.createParticles();

    this.cameras.main
      .setBounds(
        0,
        0,
        (this.totalDistance + TERRAIN_UNIT * (TERRAIN_AFTER_END - 1)) *
          gameScale,
        G_HEIGHT * gameScale
      )
      .setBackgroundColor("#8fc300");

    this.setupFocusAction();

    this.scene.launch("UI");
    // this.elapsedFrame = 1700; // TODO: remove (test )
  }

  prepareTalents() {
    const animNames = [].concat(
      ...gameInfo.chickens.map((e) =>
        e.segments.map((s) => s.segmentChickenAnimation)
      )
    );

    // Talent: FanGroup
    if (animNames.includes("FanGroup_Run")) {
      this.createFanGroup();
    }

    // Talent: Royal Proccession
    if (animNames.includes("RoyalProcession_Appear")) {
      this.createRedCarpet();
    }

    // Talent: Helicopter
    if (animNames.includes("Helicopter_Shooting")) {
      this.createHelicopter();
    }

    // Talent: Devolution
    if (animNames.includes("Devolution_Transform")) {
      this.createDevolutionLizards();
    }

    // Talent: BlackHole
    if (animNames.includes("BlackHole_Spit")) {
      this.createBlackHole();
    }

    // Talent: Moving Walkway
    if (animNames.includes("MovingWalkway_GetOn")) {
      this.createMovingWalkway();
    }

    // Talent: CK-47
    if (animNames.includes("CK-47_Draw")) {
      this.createCK47Chiken();
    }

    // Talent: Coober
    if (animNames.includes("Coober_GetOut")) {
      this.createCooberCrash();
    }

    // Talent: Dig
    if (animNames.includes("Dig_Dive")) {
      this.createDigTails();
    }
  }

  setupFocusAction() {
    //Hide info when window focus changed
    let inView = false;
    window.onfocus =
      window.onblur =
      window.onpageshow =
      window.onpagehide =
        (e) => {
          if ({ focus: 1, pageshow: 1 }[e.type]) {
            if (inView) return;
            //Visible
            inView = true;
          } else if (inView) {
            //Hidden
            for (let i = 0; i < this.chickens.length; i++) {
              this.chickens[i].hideInfo(this);
            }
            inView = false;
          }
        };

    document.addEventListener(
      "visibilitychange",
      () => {
        for (let i = 0; i < this.chickens.length; i++) {
          this.chickens[i].hideInfo(this);
        }
      },
      false
    );
  }

  toggleCamera(chickenId) {
    const prevChicken = this.chickens.find((e) => e.info.id === this.focusedId);
    if (prevChicken) {
      this.outlinePlugins.remove(prevChicken);
    }

    this.focusedId = this.focusedId === chickenId ? undefined : chickenId;
    const curChicken = this.chickens.find((e) => e.info.id === this.focusedId);
    if (curChicken) {
      this.outlinePlugins.add(curChicken, {
        thickness: 2.5 * gameScale,
        outlineColor: 0xffffff,
        quality: 0.2,
      });
    }
  }

  updateBackground() {
    if (!this.isPlaying) return;
    const camera = this.cameras.main;
    const { scrollX } = camera;

    // Middle main track sprites
    const mainCountPerScreen = this.bgMainContainers.length;
    const mainCycleWidth = TERRAIN_UNIT * mainCountPerScreen * gameScale;
    const mainScreenIndex = Math.floor(scrollX / mainCycleWidth);
    for (let i = 0; i < mainCountPerScreen; i++) {
      this.bgMainContainers[i].x =
        mainScreenIndex * mainCycleWidth + i * TERRAIN_UNIT * gameScale;
      if (this.bgMainContainers[i].x + TERRAIN_UNIT * gameScale < scrollX) {
        this.bgMainContainers[i].x +=
          TERRAIN_UNIT * mainCountPerScreen * gameScale;
      } else if (this.bgMainContainers[i].x > scrollX + mainCycleWidth) {
        this.bgMainContainers[i].x -=
          TERRAIN_UNIT * mainCountPerScreen * gameScale;
      }
    }

    // Edge sprites
    const edgeCountPerScreen = this.bgEdgeContainers.length;
    const edgeCycleWidth = TERRAIN_UL_WIDTH * edgeCountPerScreen * gameScale;
    const edgeScreenIndex = Math.floor(scrollX / edgeCycleWidth);
    for (let i = 0; i < edgeCountPerScreen; i++) {
      this.bgEdgeContainers[i].x =
        edgeScreenIndex * edgeCycleWidth + i * TERRAIN_UL_WIDTH * gameScale;
      if (this.bgEdgeContainers[i].x + TERRAIN_UL_WIDTH * gameScale < scrollX) {
        this.bgEdgeContainers[i].x +=
          TERRAIN_UL_WIDTH * edgeCountPerScreen * gameScale;
      } else if (this.bgEdgeContainers[i].x > scrollX + edgeCycleWidth) {
        this.bgEdgeContainers[i].x -=
          TERRAIN_UL_WIDTH * edgeCountPerScreen * gameScale;
      }
    }

    // Check points (Mark)
    const markCountPerScreen = this.bgMarkContainers.length;
    const markDistance = G_PIXEL_1M * MARK_DISTANCE;
    const markCount = this.totalDistance / markDistance;
    const markCycleWidth = markDistance * markCountPerScreen * gameScale;
    const markScreenIndex = Math.floor(scrollX / markCycleWidth);

    for (let i = 0; i < markCountPerScreen; i++) {
      this.bgMarkContainers[i].x =
        markScreenIndex * markCycleWidth +
        (i + 1) * markDistance * gameScale +
        START_LINE * gameScale;
      if (
        this.bgMarkContainers[i].x + markDistance * gameScale <
        scrollX - 130 * gameScale
      ) {
        this.bgMarkContainers[i].x +=
          markDistance * markCountPerScreen * gameScale;
      } else if (
        this.bgMarkContainers[i].x >
        scrollX + markCycleWidth - 130 * gameScale
      ) {
        this.bgMarkContainers[i].x -=
          markDistance * markCountPerScreen * gameScale;
      }
      const markIndex = Math.floor(
        (this.bgMarkContainers[i].x - START_LINE * gameScale) /
          (markDistance * gameScale)
      );
      const markText = `${(markCount - markIndex) * MARK_DISTANCE}m`;
      this.bgMarkContainers[i].list[1].setText(markText);
    }
  }

  createBackground() {
    this.bgLayer = this.add.layer();

    // Edge sprites
    const edgeCountPerScreen = G_WIDTH / TERRAIN_UL_WIDTH + 1;
    for (let i = 0; i < edgeCountPerScreen; i++) {
      const container = this.add.container(i * TERRAIN_UL_WIDTH * gameScale, 0);
      this.bgLayer.add(container);
      const blockUp = this.add
        .sprite(
          0,
          0,
          `${this.terrain}_u${Math.floor(Math.random() * BORDER_CNT)}`
        )
        .setOrigin(0, 0);
      const blockBottom = this.add
        .sprite(
          0,
          (G_HEIGHT - TERRAIN_BOTTON_HEIGHT) * gameScale,
          `${this.terrain}_l${Math.floor(Math.random() * BORDER_CNT)}`
        )
        .setOrigin(0, 0);

      container.add(blockUp);
      container.add(blockBottom);
      this.bgEdgeContainers.push(container);
    }

    // Middle main track sprites
    const mainCountPerScreen = G_WIDTH / TERRAIN_UNIT + 1;
    for (let i = 0; i < mainCountPerScreen; i++) {
      const container = this.add.container(
        i * TERRAIN_UNIT * gameScale,
        TERRAIN_TOP_HEIGHT * gameScale
      );
      this.bgLayer.add(container);
      for (let j = 0; j < 4; j++) {
        const block = this.add
          .sprite(
            0,
            j * TERRAIN_UNIT * gameScale,
            `${this.terrain}_t${Math.floor(Math.random() * TERRAIN_CNT)}`
          )
          .setOrigin(0, 0);
        // .setScale(gameScale);
        container.add(block);
      }
      this.bgMainContainers.push(container);
    }

    // Start & End line
    const startLine = this.add
      .sprite(
        START_LINE * gameScale,
        TERRAIN_TOP_HEIGHT * gameScale,
        "start_line"
      )
      .setOrigin(0, 0);

    this.bgLayer.add(startLine);
    const finishLine = this.add
      .sprite(
        (this.totalDistance + START_LINE) * gameScale,
        TERRAIN_TOP_HEIGHT * gameScale,
        "finish_line"
      )
      .setOrigin(0.5, 0);
    this.bgLayer.add(finishLine);

    // Check points (Mark)
    const markDistance = G_PIXEL_1M * MARK_DISTANCE;
    const markCount = this.totalDistance / markDistance;
    const markCountPerScreen = G_WIDTH / markDistance + 1;
    const fontStyle = { font: `40px ${Utils.text["FONT"]}`, fill: "#ffffff" };
    for (let i = 0; i < markCountPerScreen; i++) {
      const x = ((i + 1) * markDistance + START_LINE) * gameScale;
      const container = this.add.container(x, 0);
      const panel = this.add
        .sprite(0, 130 * gameScale, "bg_dist")
        .setOrigin(0.5, 1);
      const panelText = this.add
        .text(
          0,
          110 * gameScale,
          `${(markCount - (i + 1)) * MARK_DISTANCE}m`,
          fontStyle
        )
        .setOrigin(0.5, 1)
        .setScale(gameScale);
      container.add(panel);
      container.add(panelText);
      this.bgMarkContainers.push(container);
    }

    this.updateBackground();

    // Black screen for Machete
    this.darkScreen = this.add
      .rectangle(
        0,
        0,
        gameDimension.width * 1.5,
        gameDimension.height,
        0x000000
      )
      .setOrigin(0)
      .setAlpha(0)
      .setVisible(false);
  }

  updateRedCarpet() {
    if (!this.redCarpetContainers[0].visible) return;
    const camera = this.cameras.main;
    const { scrollX } = camera;
    this.redCarpetContainers.forEach((redCarpetContainer) => {
      if (redCarpetContainer.x + gameDimension.width < scrollX) {
        redCarpetContainer.x +=
          gameDimension.width * this.redCarpetContainers.length;
      }
      if (redCarpetContainer.x > scrollX + gameDimension.width + 17) {
        redCarpetContainer.x -=
          gameDimension.width * this.redCarpetContainers.length;
      }
    });
  }

  createDigTails() {
    this.digTails = [];
    let maxLeng = 0;
    this.chickens.forEach((c) => {
      const leng = Math.max(
        ...c.metas
          .filter((meta) => meta.talent === "Dig")
          .map((meta) => meta.movingAnimations.length)
      );
      maxLeng = Math.max(leng, maxLeng);
    });

    for (let i = 0; i < maxLeng; i++) {
      const digTail = this.make
        .sprite({
          x: i * 100,
          y: 500,
          key: "dig_tails",
          frame: "Dig_Trail_11",
        })
        .setOrigin(0, 1)
        .setScale(gameScale * 1.2)
        .setVisible(false);
      this.digTails.push(digTail);
    }
  }

  playDigTails(chicken) {
    if (chicken) {
      const meta = chicken.metas.find(
        (m) => m.talent === "Dig" && chicken.segIndex + 1 === m.tSA1Segment
      );

      const dD =
        (meta.endPosition - meta.startPosition) / meta.movingAnimations.length;
      const dT = (meta.endTime - meta.startTime) / meta.movingAnimations.length;

      meta.movingAnimations.forEach((anim, index) => {
        this.digTails[index].y = chicken.y + 15 * gameScale;
        this.digTails[index].depth = this.digTails[index].y;
        this.digTails[index].x =
          (meta.startPosition + index * dD) * G_PIXEL_1M * gameScale;
        this.digTails[index].t = dT * index + meta.startTime;
        this.digTails[index].setFrame(anim);
        this.digTails[index].visible = true;
        this.digTails[index].alpha = 0;
        if (anim === "Dig_Start_7") {
          this.digTails[index].setOrigin(0.2, 0.9);
        } else if (anim === "Dig_Trail_11") {
          this.digTails[index].setOrigin(0, 0.9);
          this.digTails[index].t += dT * 2;
          this.digTails[index].x += dD * G_PIXEL_1M * gameScale * 2;
        } else {
          this.digTails[index].setOrigin(0, 0.9);
        }
      });

      this.digTails[0].dirtMoundDisappearDistance =
        meta.dirtMoundDisappearDistance;
      this.digTails[0].endPosition = meta.endPosition;
      this.digTails[0].chicken = chicken;
      this.digTails[0].isDisapearing = false;
    } else {
      this.digTails[0].isDisapearing = true;
      this.tweens.add({
        targets: this.digTails,
        alpha: 0,
        duration: 500 / this.currentSpeedFactor(),
        onComplete: () => {
          // this.digTails.forEach((e) => {
          //   e.visible = false;
          // });
        },
      });
    }
  }

  createDevolutionLizards() {
    const chicken = this.chickens[0];
    this.lizards = [];
    for (let i = 0; i < 2; i++) {
      this.lizards[i] = new Chicken(
        this,
        300,
        200 * i + 200,
        "chicken",
        0.06,
        {
          info: chicken.info,
        },
        0,
        gameScale
      );
      this.lizards[i].chicken.setScale(-0.06 * gameScale, 0.06 * gameScale);
      this.lizards[i].chicken.play("Devolution2/Devolution_Run", true);
      this.lizards[i].setVisible(false);
      this.lizards[i].talentName = "Devolution";
      this.lizards[i].index = i;
      this.lizards[i].isReady = true;
    }
  }

  playDevolutionLizard(chicken) {
    if (chicken) {
      const segIndex = chicken.segIndex;
      const meta = chicken.metas.find(
        (e) => e.tSA1Segment === segIndex + 2 && e.talent === "Devolution"
      );
      const lizardIndex = this.lizards[0].isReady ? 0 : 1;

      this.lizards[lizardIndex].isReady = false;
      this.lizards[lizardIndex].setVisible(true);
      this.lizards[lizardIndex].talentMeta = meta;
      this.lizards[lizardIndex].x = meta.spawnPosition * G_PIXEL_1M * gameScale;
      this.lizards[lizardIndex].y = chicken.y;
      this.lizards[lizardIndex].depth = chicken.y - 1;
      this.lizards[lizardIndex].target = chicken;
      this.lizards[lizardIndex].alpha = 1;
      this.lizards[lizardIndex].segIndex = -1;
    }
  }

  createCK47Chiken() {
    const chicken = this.chickens[0];
    this.ck47Chicken = new Chicken(this, 300, 300, "chicken", 0.1, {
      info: chicken.info,
      isCk47Clone: true,
    })
      .setScale(gameScale)
      .setVisible(false);
  }

  playCK47Chicken(chicken) {
    const rate = this.game.loop.actualFps / G_FPS;
    if (chicken) {
      const meta = chicken.metas.find(
        (m) => m.talent === "CK-47" && chicken.segIndex + 2 === m.tSA3Segment
      );
      this.ck47Chicken.originalChicken = chicken;
      this.ck47Chicken.setAttributes(chicken.info);

      let y = 0,
        x = 0,
        fastChicken;
      meta.targetLanes.forEach((ln) => {
        const lane = this.lanes.find((e) => e.laneNumber === ln);
        const targetChicken = this.chickens.find(
          (e) => e.info.id === lane.chickenId
        );
        y += targetChicken.y;

        if (x < targetChicken.x) {
          fastChicken = targetChicken;
          x = targetChicken.x;
        }
      });

      this.ck47Chicken.x = meta.startPosition * G_PIXEL_1M * gameScale;
      this.ck47Chicken.y = y / meta.targetLanes.length;
      this.ck47Chicken.depth = this.ck47Chicken.y;

      let cumulativeSegmentSize =
        chicken.segments[chicken.segIndex].segmentSize +
        meta.duplicateSpawnDelay;
      for (let i = 0; i < meta.segments.length; i++) {
        const seg = meta.segments[i];
        this.time.addEvent({
          callback: () => {
            
            this.ck47Chicken.chicken.play(
              `CK-47/${seg.segmentChickenAnimation}`,
              i === 1
            );
            this.ck47Chicken.setVisible(true);
            this.ck47Chicken.currentSpeed = meta.segments[0].startSpeed;
            this.ck47Chicken.setAttributes(chicken.info);
            this.ck47Chicken.scanAniPlaySound(`CK-47/${seg.segmentChickenAnimation}`, true);
            // force attribute change
            this.time.addEvent({
              callback: () => {
                this.ck47Chicken.setAttributes(chicken.info);
              },
              delay: 50  / this.currentSpeedFactor(),
            });
          },
          delay: cumulativeSegmentSize * 1000 * rate / this.currentSpeedFactor(),
          loop: false,
        });

        cumulativeSegmentSize += seg.segmentSize;
      }

      this.time.addEvent({
        callback: () => {
          this.ck47Chicken.setVisible(false);
        },
        delay: cumulativeSegmentSize * 1000 * rate  / this.currentSpeedFactor(),
        loop: false,
      });
    }
  }

  createCooberCrash() {
    this.cooberCrash = this.add.sprite(300, 500, "coober_crash");
    this.cooberCrash.setScale(0.5).setOrigin(0, 1).setVisible(false);
  }

  playCooberCrash(chicken) {
    if (chicken) {
      const seg = chicken.segments[chicken.segIndex];
      const d = ((seg.startSpeed + seg.endSpeed) / 2) * seg.segmentSize + 1.1;
      this.cooberCrash.depth = chicken.depth - 1;
      this.cooberCrash.x = chicken.x + d * G_PIXEL_1M * gameScale;
      this.cooberCrash.y =
        chicken.y +
        (this.terrain === "dirt" ||
        this.terrain === "grass" ||
        this.terrain === "track"
          ? 50 * gameScale
          : 0);
      this.cooberCrash.setVisible(true);
    } else {
      this.tweens.add({
        targets: this.cooberCrash,
        alpha: 0,
        delay: 1000 / this.currentSpeedFactor(),
        duration: 500 / this.currentSpeedFactor(),
        onComplete: () => {
          this.cooberCrash.setVisible(false);
          this.cooberCrash.alpha = 1;
        },
      });
    }
  }

  createBlackHole() {
    this.blackHole = this.make
      .spine({
        x: this.cameras.main.scrollX + gameDimension.width / 2,
        y: gameDimension.height / 2,
        key: "blackhole",
        animationName: "Black_Hole/BlackHole_Collapse",
        loop: false,
      })
      .setScale(0.4 * gameScale, 0.4 * gameScale)
      .setVisible(false);
    this.blackHole.depth = 0;

    this.swirlContainer = this.add.container();
    this.clonedChickens = [];
    this.chickens.forEach((c, i) => {
      this.clonedChickens[i] = new Chicken(
        this,
        c.x,
        c.y,
        "chicken",
        0.1,
        {
          info: c.info,
        },
        1,
        gameScale
      )
        .setScale(gameScale)
        .setVisible(false);
      this.clonedChickens[i].depth = c.y;
      this.clonedChickens[i].originalChicken = c;
      this.clonedChickens[i].talentName = "Black Hole";
      this.clonedChickens[i].gameDimension = gameDimension;
      this.swirlContainer.add(this.clonedChickens[i]);
    });
    this.swirlContainer.setVisible(false);
    this.swirlFilter = this.swirlPlugins.add(this.swirlContainer);

    this.swirlFilter.setCenter(
      gameDimension.width / 2,
      gameDimension.height / 2
    );

    this.swirlFilter.radius = gameDimension.height / 2;
    this.swirlFilter.angle = 30;
  }

  createMovingWalkway() {
    const count = 40;
    this.movingWalkwayBack = [];
    this.movingWalkwayFront = [];
    for (let i = 0; i < count; i++) {
      const walkwayBack = this.make
        .spine({
          x: 0,
          y: 0,
          key: "walkway",
          animationName: "Moving Walkway/MovingWalkway_MiddleFront",
          loop: false,
        })
        .setScale(0.12 * gameScale)
        .setVisible(false);
      this.movingWalkwayBack.push(walkwayBack);

      const walkwayFront = this.make
        .spine({
          x: 0,
          y: 0,
          key: "walkway",
          animationName: "Moving Walkway/MovingWalkway_MiddleFront",
          loop: false,
        })
        .setScale(0.12 * gameScale)
        .setVisible(false);
      this.movingWalkwayFront.push(walkwayFront);
    }
  }

  createHelicopter() {
    this.helicopter = this.make
      .spine({
        x: 300,
        y: 1300,
        key: "helicopter",
        animationName: "Helicopter_Fly",
        loop: true,
      })
      .setScale(0.12 * gameScale)
      .setVisible(false);
  }

  createRedCarpet() {
    // For the Royal Proccessing
    this.redCarpetContainers = [];
    const RED_CARPET_CENTER_WIDTH = 17 * gameScale;
    const assetScale = 1.487;
    for (let i = 0; i < 3; i++) {
      const container = this.add
        .container(
          (i - 1) * gameDimension.width,
          TERRAIN_TOP_HEIGHT * gameScale
        )
        .setVisible(false);
      for (let j = 0; j < 76; j++) {
        const block = this.add
          .sprite(
            j * RED_CARPET_CENTER_WIDTH * assetScale,
            -1 * gameScale,
            "red_carpet_center"
          )
          .setOrigin(0)
          .setScale(assetScale);
        container.add(block);
      }
      this.redCarpetContainers.push(container);
      this.bgLayer.add(container);
    }
  }

  createAnimations() {
    this.anims.create({
      key: "blink_anim",
      frameRate: 10,
      frames: this.anims.generateFrameNames("blink", {
        prefix: "Blink_effect instance 100",
        start: 0,
        end: 10,
        zeroPad: 2,
      }),
      repeat: 0,
    });

    this.anims.create({
      key: "boost_anim",
      frameRate: 20,
      frames: this.anims.generateFrameNames("boost", {
        prefix: "boost_effect instance 100",
        start: 0,
        end: 13,
        zeroPad: 2,
      }),
      repeat: -1,
    });
  }

  createParticles() {
    this.confetties = new Confetties(this, 0, 0);
    this.feathers = new Feathers(this, 0, 0);
  }

  createChickens() {
    const chickensInfo = gameInfo.chickens;

    this.chickens = [];
    this.chickIDs = [];

    const chickenIds = [];

    //--- First arrival time
    this.firstArrivalTime = Math.min.apply(
      null,
      chickensInfo.map(function (item) {
        const rp = item.segments;
        return rp[rp.length - 1].cumulativeSegmentSize;
      })
    );
    //---

    /* closen chickens for replay animation : start */
    let startIndex, endIndex;
    for (let i = 0; i < 3; i++) {
      if (i + 1 > chickensInfo.length - 1) break;
      const chicken1 = chickensInfo[i];
      const segments1 = chicken1.segments;
      const chickenFinishTime1 =
        segments1[segments1.length - 1].cumulativeSegmentSize;
      const chicken2 = chickensInfo[i + 1];
      const segments2 = chicken2.segments;
      const chickenFinishTime2 =
        segments2[segments2.length - 1].cumulativeSegmentSize;
      if (chickenFinishTime2 - chickenFinishTime1 <= G_REPLAY_TRIGGER_TIME) {
        if (!this.replayStartTime) {
          this.replayStartTime = chickenFinishTime1 - G_REPLAY_START_BUFFER;
          startIndex = i;
        }
        this.replayEndTime = chickenFinishTime2 + G_REPLAY_END_BUFFER;
        endIndex = i + 1;
      }
    }

    /* closen chickens for replay animation : end */

    for (let i = 0; i < chickensInfo.length; i++) {
      chickenIds[chickensInfo[i].info.id] = i;
    }

    for (let i = 0; i < this.lanes.length; i++) {
      const lane = this.lanes[i];
      const laneIdx = lane.laneNumber;
      const chickenId = lane.chickenId;
      const chickenInfo = chickensInfo[chickenIds[chickenId]];

      this.chickens[i] = new Chicken(
        this,
        (START_LINE - CHICKEN_OFFSET) * gameScale,
        (TERRAIN_TOP_HEIGHT + (laneIdx - 0.5) * LANE_HEIGHT) * gameScale,
        "chicken",
        0.1,
        chickenInfo,
        chickenIds[chickenId],
        gameScale
      ).setScale(gameScale);
      this.chickIDs[chickenInfo.info.id] = i;
      this.chickens[i].laneIndex = laneIdx;
    }
    this.firstChicken = this.chickens.find(
      (c) => c.info.id === chickensInfo[0].info.id
    );
    this.lastChicken = this.chickens.find(
      (c) => c.info.id === chickensInfo[chickensInfo.length - 1].info.id
    );
  }

  // Frost effect for ColdSnap
  playFreezeEffect(fadeIn) {
    this.uiScene.fadeInFrost(fadeIn);
  }

  // Black hole
  playBlackHole(chicken) {
    const rate = this.game.loop.actualFps / G_FPS;
    this.blackHole.state.timeScale = rate * this.currentSpeedFactor();
    if (chicken) {
      const meta = chicken.metas.find(
        (e) => e.tSA1Segment === chicken.segIndex
      );
      this.blackHole.meta = meta;
      this.blackHole.performingChicken = chicken;
      this.blackHole.setVisible(true);
      this.blackHole.prevAnimation = undefined;
      this.blackHole.isHiding = false;
      this.blackHole.y = chicken.y;

      const spawnTime =
        meta.copyChickens[0].startTime - this.elapsedFrame / G_FPS;
      this.swirlFilter.radius = 1;
      this.tweens.add({
        targets: this.swirlFilter,
        radius: gameDimension.height / 2,
        duration: 700 * rate / this.currentSpeedFactor(),
        delay: spawnTime * 1000 * rate / this.currentSpeedFactor(),
        ease: "Linear",
      });

      this.swirlContainer.segIndex = 0;
      this.swirlContainer.setVisible(true);

      let maxDis = 0,
        hiddenSpeed = 0;
      meta.copyChickens.forEach((cMeta) => {
        const spawnTime = cMeta.startTime - this.elapsedFrame / G_FPS;

        const clonedChicken = this.clonedChickens.find(
          (c) => c.info.id === cMeta.chickenId
        );
        const originalChicken = clonedChicken.originalChicken;

        const disH = meta.blackHole.startPosition - cMeta.startPosition;
        const disV = (originalChicken.laneIndex - 6) * 0.25;
        const dis = Math.sqrt(disH * disH + disV * disV);

        if (maxDis < dis) {
          hiddenSpeed =
            (originalChicken.segments[originalChicken.segIndex + 1].startSpeed +
              originalChicken.segments[originalChicken.segIndex + 1].endSpeed) /
            2;
          maxDis = dis;
        }

        this.time.addEvent({
          delay: spawnTime * 1000 * rate / this.currentSpeedFactor(),
          callback: () => {
            clonedChicken.playAnimation("chicken_run");
            clonedChicken.chicken.state.timeScale = 0.25 * rate * this.currentSpeedFactor();
            clonedChicken.talentMeta = cMeta;
            clonedChicken.setVisible(true);
            clonedChicken.alpha = 1;
            clonedChicken.x = clonedChicken.originalChicken.x; //(cMeta.startPosition * G_PIXEL_1M + 100) * gameScale;
            clonedChicken.y = clonedChicken.originalChicken.y;
            clonedChicken.originalChicken.setVisible(false);
          },
        });
      });

      const talentSeg = chicken.segments[chicken.segIndex + 1];
      const swallowingDuration = meta.copyChickens[0].segments[0].duration;

      const blackholeSpeed = Math.max(
        meta.blackHole.segments[2].startSpeed +
          meta.blackHole.segments[2].endSpeed
      );
      const difSpeed = blackholeSpeed - hiddenSpeed / 2;

      this.blackHole.suckSpeed =
        (maxDis + difSpeed * swallowingDuration) / swallowingDuration; // 2.73
    }
  }

  updateBlackHole(elapsedFrame) {
    const { meta, performingChicken } = this.blackHole;
    const { startPosition, startTime, segments } = meta.blackHole;
    const elapsedTime = elapsedFrame / G_FPS - startTime;

    let position = startPosition,
      segIndex = 0,
      cumulativeSegmentSize = 0;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      cumulativeSegmentSize += seg.duration;
      if (cumulativeSegmentSize > elapsedTime) break;

      const avgSpeed = (seg.startSpeed + seg.endSpeed) / 2;
      position += avgSpeed * seg.duration;
      segIndex = i + 1;
    }
    if (segIndex < segments.length) {
      const seg = segments[segIndex];

      const timeInSeg = seg.duration - (cumulativeSegmentSize - elapsedTime);
      const f = timeInSeg / seg.duration;
      const currentSpeed = (seg.endSpeed - seg.startSpeed) * f + seg.startSpeed;
      const avgSpeed = (seg.startSpeed + currentSpeed) / 2;
      position += avgSpeed * timeInSeg;

      if (this.blackHole.prevAnimation !== seg.animation) {
        this.blackHole.prevAnimation = seg.animation;
        this.blackHole.play(
          `Black_Hole/${seg.animation}`,
          seg.animation === "BlackHole_Suck"
        );
      }

      let offsetX = 0;
      if (segIndex === 0) {
        offsetX = -200 * (1 - f) * gameScale;
        const initialY = this.blackHole.performingChicken.y - 200 * gameScale;
        this.blackHole.y = f * (gameDimension.height / 2 - initialY) + initialY;
      }

      this.blackHole.x = (position * G_PIXEL_1M + 100) * gameScale + offsetX;
    } else {
      this.blackHole.setVisible(false);
    }

    if (
      this.swirlContainer.visible &&
      this.swirlContainer.segIndex < 1 // 3 (if we need swirl)
    ) {
      this.swirlFilter.setCenter(
        this.blackHole.x - this.cameras.main.scrollX,
        gameDimension.height / 2
      );
    } else {
      this.swirlFilter.setCenter(
        gameDimension.width * 2,
        gameDimension.height * 2
      );
    }
  }

  // Black screen for Machete
  playDarkEffect(fadeIn) {
    if (fadeIn) {
      this.darkScreen.setVisible(true);

      const elapsedTime = this.elapsedFrame / G_FPS + 1.34;
      const otherChickens = this.chickens.filter((chicken) => {
        const animationName = chicken.getSegmentAnimation(elapsedTime);
        return (
          animationName !== "Machete_HeadlessRun" &&
          animationName !== "Machete_Fall"
        );
      });

      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 870 / this.currentSpeedFactor(),
        onUpdate: (tween) => {
          const value = tween.getValue();
          this.darkScreen.setAlpha(value);
          otherChickens.forEach((container) => {
            container.chicken.red = 1 - value;
            container.chicken.green = 1 - value;
            container.chicken.blue = 1 - value;
          });
        },
      });
    } else {
      const elapsedTime = this.elapsedFrame / G_FPS - 1;
      const otherChickens = this.chickens.filter((chicken) => {
        const animationName = chicken.getSegmentAnimation(elapsedTime);
        return (
          animationName !== "Machete_HeadlessRun" &&
          animationName !== "Machete_Fall"
        );
      });

      this.tweens.addCounter({
        from: 1,
        to: 0,
        duration: 1130 / this.currentSpeedFactor(),
        onComplete: () => {
          this.darkScreen.setVisible(false);
          otherChickens.forEach((container) => {
            container.chicken.red = 1;
            container.chicken.green = 1;
            container.chicken.blue = 1;
          });
        },
        onUpdate: (tween) => {
          const value = tween.getValue();
          this.darkScreen.setAlpha(value);
          otherChickens.forEach((container) => {
            container.chicken.red = 1 - value;
            container.chicken.green = 1 - value;
            container.chicken.blue = 1 - value;
          });
        },
      });
    }
  }

  // Feathers rain
  playFeathersRain(chicken) {
    if (chicken) {
      this.feathers.chicken = chicken;
      this.feathers.start();
    } else {
      this.feathers.stop();
    }
  }

  // Conffeti effect for RoyalProcession
  playConffeti(chicken) {
    if (chicken) {
      this.confetties.chicken = chicken;
      this.confetties.start();
    } else {
      this.confetties.stop();
    }
  }

  // Red Carpet for RoyalProcession
  playRedCarpet(chicken) {
    if (chicken) {
      this.redCarpetContainers.forEach((redCarpetContainer, i) => {
        redCarpetContainer.x = scrollX + i * gameDimension.width;
        redCarpetContainer.y = chicken.y - 45 * gameScale;
        redCarpetContainer.setVisible(true);
        redCarpetContainer.setAlpha(0);
      });
      this.tweens.add({
        targets: this.redCarpetContainers,
        alpha: 1,
        duration: 1000 / this.currentSpeedFactor(),
        ease: "Linear",
      });
    } else {
      this.tweens.add({
        targets: this.redCarpetContainers,
        alpha: 0,
        duration: 1000 / this.currentSpeedFactor(),
        ease: "Linear",
        onComplete: () => {
          this.redCarpetContainers.forEach((redCarpetContainer) => {
            redCarpetContainer.setVisible(false);
          });
        },
      });
    }
  }

  // Chicken Fans for FanGroup
  createFanGroup() {
    const offsets = [50, 0, 100, 50]; // px

    this.fanChickens = [];
    for (let i = 0; i < 4; i++) {
      this.fanChickens[i] = new Chicken(
        this,
        500,
        500,
        "chicken",
        0.1,
        {
          info: this.chickens[0].info,
        },
        0,
        gameScale
      )
        .setVisible(false)
        .setScale(gameScale);

      this.fanChickens[i].talentName = "Fan Group";
      this.fanChickens[i].index = i;
      this.fanChickens[i].offsetPosition = offsets[i];
    }
  }

  playFanGroup(chicken) {
    if (chicken) {
      const rate = this.game.loop.actualFps / G_FPS;
      const segIndex = chicken.segIndex;
      const curSeg = chicken.segments[segIndex];
      const meta = curSeg.fanGroupMeta;
      if (meta) {
        // create fan chickens
        const spawnDeplay = curSeg.fanGroupTriggerTime;

        this.time.addEvent({
          callback: () => {
            meta.chickens.forEach((attributes, index) => {
              const fanChicken = this.fanChickens[index];

              if (fanChicken.tween) {
                fanChicken.tween.remove();
              }
              fanChicken.isDisapearing = false;
              fanChicken.disapearingDistance = 4; // 4M

              fanChicken.setAttributes(attributes);
              fanChicken.x = chicken.x;
              fanChicken.y = chicken.y + (index - 1) * 30 * gameScale;
              fanChicken.depth = fanChicken.y;
              fanChicken.performingChicken = chicken;
              fanChicken.talentMeta = meta;
              fanChicken.chicken.alpha = 0;
              fanChicken.chicken.play(
                `Fan Group/${attributes.animation}`,
                true
              );
              fanChicken.setVisible(true);
            });
            this.tweens.add({
              targets: this.fanChickens.map((c) => c.chicken),
              alpha: 1,
              duration: 500 / this.currentSpeedFactor(),
              ease: "Linear",
            });
          },
          delay: spawnDeplay * 1000 * rate / this.currentSpeedFactor(),
          loop: false,
        });
      }
    }
  }

  // Appear / Disappear a Helicopter
  playHelicopter(chicken) {
    const rate = this.game.loop.actualFps / G_FPS;
    if (chicken) {
      const topY = chicken.y - (gameDimension.height + 400) * gameScale;

      const seg = chicken.segments[chicken.segIndex];
      this.helicopter.chicken = chicken;
      this.helicopter.y = topY;
      this.helicopter.depth = chicken.depth - 1;
      this.helicopter.setVisible(true);

      this.tweens.add({
        targets: this.helicopter,
        y: chicken.y,
        duration: seg.helicopterLandingTime * 1000 * rate / this.currentSpeedFactor(),
        delay:
          seg.helicopterTriggerTime > 0
            ? seg.helicopterTriggerTime * 1000 * rate / this.currentSpeedFactor()
            : 0,
        ease: "Cubic.easeOut",
      });
    } else {
      const topY = this.helicopter.y - (gameDimension.height + 400) * gameScale;

      this.tweens.add({
        targets: this.helicopter,
        y: topY,
        duration: 5000 * rate / this.currentSpeedFactor(),
        ease: "Cubic.easeIn",
        onComplete: () => {
          this.helicopter.setVisible(false);
        },
      });
    }
  }

  // Movingwalkway
  playMovingWalkway(chicken) {
    if (chicken) {
      const rate = this.game.loop.actualFps / G_FPS;
      const currentSeg = chicken.segments[chicken.segIndex];

      const startSegIndex = chicken.segIndex + 2;
      const endSegIndex =
        chicken.segments
          .filter((_e, i) => i > startSegIndex)
          .findIndex(
            (e) => e.segmentChickenAnimation === "MovingWalkway_GetOff"
          ) +
        startSegIndex +
        1;

      let distance = 0;
      for (let i = startSegIndex; i <= endSegIndex; i++) {
        const seg = chicken.segments[i];
        const avgSpeed = (seg.endSpeed + seg.startSpeed) / 2;
        distance += seg.segmentSize * avgSpeed;
      }

      let distanceStart = 0;
      for (let i = 0; i < startSegIndex; i++) {
        const seg = chicken.segments[i];
        const avgSpeed = (seg.endSpeed + seg.startSpeed) / 2;
        distanceStart += seg.segmentSize * avgSpeed;
      }

      const startW = 250,
        midW = 200,
        endW = 200;

      const startX =
        distanceStart * G_PIXEL_1M * gameScale - startW * 0.3 * gameScale;

      const distanceInPixel = distance * G_PIXEL_1M * gameScale;

      this.time.addEvent({
        callback: () => {
          let wX = 0,
            count = 0;
          while (
            wX + endW * gameScale < distanceInPixel &&
            count < this.movingWalkwayBack.length - 1
          ) {
            const isStart = count === 0;
            this.movingWalkwayBack[count].depth = chicken.y - 1;
            this.movingWalkwayBack[count].x = startX + wX;
            this.movingWalkwayBack[count].y = chicken.y;
            this.movingWalkwayBack[count].play(
              isStart
                ? "Moving Walkway/MovingWalkway_Start_Appear"
                : "Moving Walkway/MovingWalkway_Middle_Appear",
              false
            );

            wX += (isStart ? startW : midW) * gameScale;
            this.movingWalkwayBack[count].visible = true;
            this.movingWalkwayBack[count].alpha = 0;
            this.movingWalkwayBack[count].state.timeScale = rate * this.currentSpeedFactor();
            count++;
          }
          this.movingWalkwayBack[count].depth = chicken.y - 1;
          this.movingWalkwayBack[count].x = startX + wX + 15 * gameScale;
          this.movingWalkwayBack[count].y = chicken.y;
          this.movingWalkwayBack[count].play(
            "Moving Walkway/MovingWalkway_End_Appear",
            false
          );
          this.movingWalkwayBack[count].alpha = 0;
          this.movingWalkwayBack[count].visible = true;
          this.movingWalkwayBack[count].state.timeScale = rate * this.currentSpeedFactor();

          // Delay to prevent flicking when spawnning
          this.time.addEvent({
            callback: () => {
              this.movingWalkwayBack.forEach((e) => {
                e.alpha = 1;
              });
            },
            delay: 100 * rate / this.currentSpeedFactor(),
            loop: false,
          });

          const standSeg = chicken.segments[chicken.segIndex + 2];
          this.time.addEvent({
            callback: () => {
              const rate = this.game.loop.actualFps / G_FPS;
              this.movingWalkwayBack.forEach((e, i) => {
                if (e.visible) {
                  e.play(
                    i === 0
                      ? "Moving Walkway/MovingWalkway_Start"
                      : i === count
                      ? "Moving Walkway/MovingWalkway_EndFron"
                      : "Moving Walkway/MovingWalkway_Middle",
                    true
                  );
                  e.state.timeScale = standSeg.startSpeed * rate * 2.15 * this.currentSpeedFactor();

                  this.movingWalkwayFront[i].depth = chicken.y + 1;
                  this.movingWalkwayFront[i].x = e.x;
                  this.movingWalkwayFront[i].y = e.y;
                  this.movingWalkwayFront[i].play(
                    i === 0
                      ? "Moving Walkway/MovingWalkway_StartFront"
                      : i === count
                      ? "Moving Walkway/MovingWalkway_End2"
                      : "Moving Walkway/MovingWalkway_MiddleFront",
                    false
                  );
                  this.movingWalkwayFront[i].visible = true;
                }
              });
            },
            delay: 2100 * rate / this.currentSpeedFactor(),
            loop: false,
          });
        },
        delay: (currentSeg.segmentSize - 2.5) * 1000 * rate / this.currentSpeedFactor(),
        loop: false,
      });
    } else {
      this.tweens.add({
        targets: [...this.movingWalkwayBack, ...this.movingWalkwayFront],
        alpha: 0,
        duration: 500 / this.currentSpeedFactor(),
        ease: "Linear",
        delay: 1000 / this.currentSpeedFactor(),
        onComplete: () => {
          for (let i = 0; i < this.movingWalkwayBack.length; i++) {
            this.movingWalkwayFront[i].visible = false;
            this.movingWalkwayFront[i].alpha = 1;
            this.movingWalkwayBack[i].visible = false;
            this.movingWalkwayBack[i].alpha = 1;
          }
        },
      });
    }
  }

  run() {
    this.gameStatus = GAMESTATUS_RUN;
    for (let i = 0; i < this.chickens.length; i++) {
      this.chickens[i].startRun();
    }
  }

  setGameOver() {
    try {
      Howler.stop();
    } catch (e) {}
    // Utils.Storage.set("gameResult", this.arrivedList);
    Utils.fadeOutScene("Winner", this);
  }

  update() {
    if (
      this.gameStatus === GAMESTATUS_RUN ||
      this.gameStatus === GAMESTATUS_OVER
    ) {
      this.updateBackground();
      this.updateGame();
    }
  }

  setChickenAniSpeed(val) {
    for (let i = 0; i < this.chickens.length; i++) {
      this.chickens[i].setAniSpeed(val);
    }
  }

  currentSpeedFactor() {
    return this.isReplay ? G_REPLAY_MOTION_RATE : this.speedFactor;
  }

  updateGame() {
    const speedFactor = this.currentSpeedFactor();
    this.elapsedFrame += this.isPlaying ? speedFactor : 0;
    const crossLinePos =
      (this.totalDistance + START_LINE - 100 + 15) * gameScale; // TODO: adjust / define in constants
    for (let i = 0; i < this.chickens.length; i++) {

      if (
        this.isReplay &&
        this.chickens[i].rank < 3 &&
        !this.chickens[i].checkArrived &&
        this.chickens[i].x >= crossLinePos
      ) {
        this.chickens[i].checkArrived = true;
        this.chickens[i].createRankText(this);
        playSound("replay_crossline", 0.5, false);
      }
      this.chickens[i].update(this.elapsedFrame, this.isPlaying ? speedFactor : 0);
    }

    // Fan chickens for FanGroup
    if (this.fanChickens && this.fanChickens[0].talentMeta) {
      for (let i = 0; i < this.fanChickens.length; i++) {
        if (this.fanChickens[i].visible) {
          this.fanChickens[i].update(this.elapsedFrame, this.isPlaying ? speedFactor : 0);
        }
      }
    }

    // Devolution
    if (this.lizards) {
      for (let i = 0; i < this.lizards.length; i++) {
        if (this.lizards[i].talentMeta) {
          this.lizards[i].update(this.elapsedFrame, this.isPlaying ? speedFactor : 0);
        }
      }
    }

    // Dig tails
    if (this.digTails && this.digTails.length && this.digTails[0].chicken) {
      const elapsedTime = this.elapsedFrame / G_FPS; // TODO: confirm
      this.digTails.forEach((dt) => {
        if (dt.visible && dt.t <= elapsedTime && elapsedTime - dt.t < 3) {
          dt.alpha = 1;
        }
      });
      if (
        !this.digTails[0].isDisapearing &&
        this.digTails[0].chicken.x / gameScale / G_PIXEL_1M -
          this.digTails[0].endPosition >
          this.digTails[0].dirtMoundDisappearDistance
      ) {
        this.playDigTails();
      }
    }

    // Helicopter
    if (this.helicopter && this.helicopter.chicken && this.helicopter.visible) {
      this.helicopter.x = this.helicopter.chicken.x;
    }

    // CK-47
    if (this.ck47Chicken && this.ck47Chicken.visible) {
      this.ck47Chicken.x +=
        (this.ck47Chicken.currentSpeed / G_FPS) * G_PIXEL_1M * gameScale * speedFactor;
    }

    // BlackHole
    if (this.blackHole && this.blackHole.visible) {
      this.updateBlackHole(this.elapsedFrame);
    }
    if (this.clonedChickens && this.clonedChickens.length) {
      this.clonedChickens.forEach((c) => {
        if (c.visible) {
          c.update(this.elapsedFrame, speedFactor);
        }
      });
    }

    this.uiScene.updateTime(this.elapsedFrame);
    this.uiScene.updateRank(this.elapsedFrame);

    if (this.redCarpetContainers) {
      this.confetties.update(speedFactor);
      this.updateRedCarpet();
    }

    if (this.feathers && this.feathers.chicken) {
      this.feathers.update(speedFactor);
    }
    if (this.darkScreen.visible) {
      this.darkScreen.x =
        this.cameras.main.scrollX - gameDimension.width * 0.25;
    }
    if (
      this.gameStatus !== GAMESTATUS_OVER &&
      ((!this.isReplay &&
        this.lastChicken.x > this.cameras.main.getBounds().width) ||
        (this.isReplay && this.elapsedFrame / G_FPS > this.replayEndTime))
    ) {
      this.gameStatus = GAMESTATUS_OVER;

      if (this.isReplay || !this.replayStartTime) {
        this.setGameOver();
      } else {
        this.cameras.main.on("camerafadeinstart", () => {
          this.elapsedFrame = this.replayStartTime * G_FPS;
          this.gameStatus = GAMESTATUS_RUN;
          this.isReplay = true;
          if (this.uiScene.counter) {
            this.uiScene.counter.remove();
          }
          this.focusedId = undefined;
          this.cameras.main.stopFollow();
          this.cameras.main.scrollX = this.totalDistance * gameScale;
          this.cameras.main.off("camerafadeinstart");
        });
        this.cameras.main.fadeIn(900, 255, 255, 255);
        if (this.uiScene.bgm) {
          this.uiScene.bgm.rate(G_REPLAY_MOTION_RATE);
        }
      }
    }
  }
}
