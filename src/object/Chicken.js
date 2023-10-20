export default class Chicken extends Phaser.GameObjects.Container {
  constructor(scene, x, y, key, scale, chickenData, rank, gameScale) {
    // pass parameters to the class we are extending, call super
    super(scene, x, y);

    const { info, segments, metas, isCk47Clone } = chickenData;

    this.status = C_STATUS_IDLE;
    this.body_type = C_BODY_CHICKEN;
    this.checkArrived = false;
    this.pix1m = G_PIXEL_1M;
    this.fps = G_FPS;
    this.scaleValue = 1;

    let idle_ani = "Idle_Animation"; //(Math.random() > 0.5) ?  : 'idle_clap eyes_animation'
    this.chicken = scene.make.spine({
      x: 0,
      y: 0,
      key: key,
      animationName: idle_ani,
      loop: true,
    });
    this.add(this.chicken);
    this.chicken.setScale(scale);

    this.info = info;
    this.metas = metas;

    this.scaleValue = scale;
    this.gameScale = gameScale;
    this.setAttributes(info);

    this.depth = y;

    if (scene.lanes?.length) {
      this.laneIndex = this.scene.lanes.findIndex(
        (e) => e.chickenId === this.info.id
      );
    }

    // add to scene
    scene.add.existing(this);

    if (!segments) {
      /* fan chickens or something else */

      return;
    }

    /* race chickens */

    this.chicken.setInteractive({ cursor: "pointer" });

    this.rank = rank;
    this.isTalant = false;
    this.isLoop = true;

    // this.isAlienEyes = false; // INFO: teleport anim requires some changes unusally

    this.timer = null;

    this.createInfo(scene);

    this.segments = segments;

    this.updateSegments();

    this.curSeg = 0;
    this.curAniName = "";
    this.accel = 0;
    this.setSpeedBy(this.curSeg);
  }

  updateSegments() {
    const laneIndex = this.laneIndex;
    const landingTime = (laneIndex + 1) / 3 + 1;
    this.segments.forEach((seg, segIndex) => {
      if (seg.segmentChickenAnimation === "Helicopter_Mount_Ladder") {
        let triggerIndex = 0,
          elapsedLandingTime = 0;
        for (let i = segIndex; i > -1; i--) {
          elapsedLandingTime += this.segments[i].segmentSize;
          if (elapsedLandingTime > landingTime) {
            triggerIndex = i;
            break;
          }
        }

        this.segments[triggerIndex].helicopterTriggerTime =
          elapsedLandingTime - landingTime;
        this.segments[triggerIndex].helicopterLandingTime = landingTime;
      } else if (seg.segmentChickenAnimation === "FanGroup_Startle") {
        const meta = this.metas.find(
          (e) => e.talent === "Fan Group" && segIndex + 1 === e.tSA1Segment
        );
        const t0 =
          seg.cumulativeSegmentSize -
          seg.segmentSize -
          meta.fansSpawnDistanceOffset;
        for (let i = segIndex - 1; i > -1; i--) {
          const t1 =
            this.segments[i].cumulativeSegmentSize -
            this.segments[i].segmentSize;
          if (t1 < t0) {
            this.segments[i].fanGroupTriggerTime = t0 - t1;
            this.segments[i].fanGroupMeta = meta;
            break;
          }
        }
      }
    });
  }

  createInfo(scene) {
    this.isInfoShow = false;
    this.infoContainer = scene.make
      .container({
        x: 0,
        y:
          -this.chicken.height * this.scaleValue * 0.6 +
          (this.laneIndex ? 0 : 20 * this.gameScale),
      })
      .setAlpha(0)
      .setScale(0);
    this.add(this.infoContainer);
    const infoPanel = scene.make
      .sprite({ x: 0, y: 0, key: "info_panel" })
      .setOrigin(0.5, 1);
    this.infoContainer.add(infoPanel);

    const font = { font: `22px ${Utils.text["FONT"]}`, fill: "#fff" };
    const name = Utils.getName(this.info);
    const txtName = scene.make
      .text({ x: 0, y: -90, text: name, style: font })
      .setOrigin(0.5, 0)
      .setFontSize(name.length < 18 ? 22 : 18);
    this.infoContainer.add(txtName);

    const ownerName = this.info.username;
    const txtOwnerName = scene.make
      .text({ x: 0, y: -50, text: ownerName, style: font })
      .setOrigin(0.5, 0)
      .setFill("#9a9a9a")
      .setFontSize(ownerName.length < 18 ? 22 : 18);
    this.infoContainer.add(txtOwnerName);

    if (Utils.isMobile()) {
      this.chicken.on("pointerup", () => {
        this.showInfo(scene);
        if (this.scene.toggleCamera) {
          this.scene.toggleCamera(this.info.id);
        }
      });
    } else {
      this.chicken.on("pointerover", () => {
        this.showInfo(scene);
      });
      this.chicken.on("pointerout", () => {
        this.hideInfo(scene);
      });
      this.chicken.on("pointerup", () => {
        if (this.scene.toggleCamera && this.scene.hasLeaderboard) {
          this.scene.toggleCamera(this.info.id);
        }
      });
    }
  }

  createRankText(scene) {
    if (!this.rank > 2) return;
    const font = {
      font: `28px ${Utils.text["FONT"]}`,
      fill: "#ffde00",
      stroke: "#000",
      strokeThickness: 2,
    };
    const rank = ["1st", "2nd", "3rd"][this.rank];
    const rankText = scene.make
      .text({ x: 120, y: -120, text: rank, style: font })
      .setOrigin(0, 1)
      .setScale(3)
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    this.rankTextTween = scene.tweens.add({
      targets: rankText,
      alpha: 1,
      scale: 1,
      duration: 300 / scene.currentSpeedFactor(),
      ease: "Linear",
    });

    this.add(rankText);
  }

  showInfo(scene) {
    if (this.infoContainer == null) {
      return;
    }

    if (this.hideTween != null) {
      this.hideTween.remove();
    }
    if (this.showTween != null) {
      this.showTween.remove();
    }

    this.isInfoShow = true;
    this.showTween = scene.tweens.add({
      targets: this.infoContainer,
      alpha: 1,
      scale: 1,
      ease: "Back", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500 / scene.currentSpeedFactor(),
      repeat: 0, // -1: infinity
      yoyo: false,
    });
  }

  hideInfo(scene) {
    if (this.infoContainer == null || !this.isInfoShow) {
      return;
    }
    if (this.hideTween != null) {
      this.hideTween.remove();
    }
    if (this.showTween != null) {
      this.showTween.remove();
    }
    this.isInfoShow = false;
    this.hideTween = scene.tweens.add({
      targets: this.infoContainer,
      alpha: 0,
      scale: 0,
      ease: "Cubic", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500 / scene.currentSpeedFactor(),
      repeat: 0, // -1: infinity
      yoyo: false,
    });
  }
  setSpeedBy(segIndex) {
    const segment = this.segments[segIndex];
    const nextSegment =
      this.segments[Math.min(segIndex + 1, this.segments.length - 1)];
    this.startSpeed = segment.startSpeed / this.fps; // m/s
    this.endSpeed = segment.endSpeed / this.fps; // m/s
    const segSize = segment.segmentSize;
    this.totalFrame = Math.ceil(segSize * this.fps);
    this.frameElapsed = 0;
    const prevAccel = this.accel;
    this.accel = (this.endSpeed - this.startSpeed) / this.totalFrame;

    if (this.curSeg > 0) {
      if (segment?.segmentChickenAnimation) {
        this.playAnimation(segment.segmentChickenAnimation);
      } else {
        this.accel > prevAccel ? this.aniFastRun() : this.aniNormalRun();
      }
    }
  }

  getSegmentAnimation(elapsedTime) {
    let segIndex = 0;
    let cuTime = 0;
    for (let i = 0; i < this.segments.length; i++) {
      if (cuTime > elapsedTime) {
        segIndex = i;
        break;
      }
      cuTime += this.segments[i].segmentSize;
    }
    return this.segments[segIndex].segmentChickenAnimation;
  }

  setAttributes(attributes) {
    this.setSkin(attributes["baseBody"]);
    this.setStripes(attributes["stripes"]);
    this.setBeakAccessory(attributes["beakAccessory"]);
    this.setEyes(this.isAlienEyes ? "Alien" : attributes["eyesType"]);
    this.setBeak(attributes["beakColor"]);
    this.setComb(attributes["combColor"]);
    this.setWattle(attributes["wattleColor"]);
    this.setLegs(attributes["legs"]);

    if (attributes.clothings) {
      for (const clothing of attributes.clothings) {
        if (clothing.type === "Body") {
          this.setBody(clothing.clothingId);
        } else if (clothing.type === "Head") {
          this.setHair(clothing.clothingId);
        } else if (clothing.type === "Eyes") {
          this.setGlasses(clothing.clothingId);
        } else if (clothing.type === "Neck") {
          this.setNecklace(clothing.clothingId);
        } else if (clothing.type === "Feet") {
          this.setShoes(clothing.clothingId);
        }
      }
    }
  }

  setSkin(name) {
    try {
      if (name !== "" && name != null) {
        this.chicken.setSkinByName(name);
      }
    } catch (e) {
      this.chicken.setSkinByName("Eggshell");
      console.log(`Undefined Skin - ${name}`);
    }
  }

  setAttribute(slotName, attrPath, attrName, defaultValue) {
    if (attrName == "#N/A") {
      this.chicken.setAttachment(slotName, null);
      return;
    }

    try {
      if (attrName !== "" && attrName != null) {
        this.chicken.setAttachment(slotName, attrPath + attrName);
      }
    } catch (e) {
      this.chicken.setAttachment(slotName, attrPath + defaultValue);
      console.log("Undefined attribute" + attrName + "in slot " + slotName);
    }
  }

  setComb(name) {
    this.setAttribute("comb", "comb/", name, "Red");
  }

  setBeak(name) {
    this.setAttribute("beak", "beak/", name, "Gold");
  }

  setEyes(name) {
    this.setAttribute("eyes2", "eyes/", name, "Determined");
  }

  setWattle(name) {
    this.setAttribute("wattle", "wattle/wattle", name, "Red");
  }

  setStripes(name) {
    this.setAttribute("stripes", "Stripes/", name, "Stripes_Empty");
  }

  setBeakAccessory(name) {
    this.setAttribute("beackAccessory/Vampire", "beackAccessory/", name, "");
  }

  setLegs(name) {
    this.setAttribute("foot2", "legs/", name, "legsHen");
    this.setAttribute("foot", "legs/", name, "legsHen");
  }

  setHair(name) {
    this.setAttribute(
      "Hat_Attributes",
      "accessorries and effects/hat_attributes/",
      name,
      ""
    );
  }

  setBody(name) {
    this.setAttribute(
      "Costumes",
      "accessorries and effects/Costumes/",
      name,
      ""
    );
  }

  setNecklace(name) {
    this.setAttribute(
      "Necklaces and Scarfs",
      "accessorries and effects/necklaces and scarfs/",
      name,
      ""
    );
  }

  setGlasses(name) {
    this.setAttribute("Glasses", "accessorries and effects/glasses/", name, "");
  }

  setShoes(name) {
    try {
      this.setAttribute(
        "Costumes/Shoe",
        "accessorries and effects/shoe/",
        name,
        ""
      );
      this.setAttribute(
        "Costumes/Shoe2",
        "accessorries and effects/shoe/",
        name,
        ""
      );


    } catch (e) {
      console.log(name, "setShoes")
      console.log(e)
    }
  }

  startRun() {
    this.status = C_STATUS_RUN;
    const segment = this.segments[this.segIndex];
    if (segment?.segmentChickenAnimation) {
      this.playAnimation(segment?.segmentChickenAnimation);
    } else {
      this.aniNormalRun();
    }
  }

  getAniName(aniName) {
    this.chicken.stateData.defaultMix = this.isTalant
      ? G_MIX_DURATION_FOR_TALANT
      : G_MIX_DURATION;
    this.isLoop = true;

    const rate = this.scene.game.loop.actualFps / this.fps;

    if (!this.visible && aniName !== "DoNotDrawChicken") {
      this.chicken.stateData.defaultMix = 0;
      this.scene.time.addEvent({
        callback: () => {
          this.setVisible(true);
        },
        delay: 200 * rate / this.scene.currentSpeedFactor(),
      });
    }

    let isTalant = false;
    if (this.segments) {
      const nextSegment = this.segments[this.segIndex];
      if (
        nextSegment?.segmentChickenAnimation === "BlackHole_Spit" ||
        nextSegment?.segmentChickenAnimation === "BlueEgg_Impact_1" ||
        nextSegment?.segmentChickenAnimation === "Anvil_Lands_1"
      ) {
        isTalant = true;
        this.chicken.stateData.defaultMix = 0;
      }
    }

    switch (aniName) {
      case "chicken_idle":
        this.isTalant = isTalant;
        return "Idle_Animation";
      case "chicken_tired":
        this.setAttributes(this.info);
        this.isTalant = isTalant;
        return "Tired";
      case "chicken_run":
        this.setAttributes(this.info);
        this.isTalant = isTalant;
        return "Run_Animation";
      case "chicken_fast_run":
        this.setAttributes(this.info);
        this.isTalant = isTalant;
        return "Fast_Run";
      case "chicken_sprint_1":
        this.setAttributes(this.info);
        this.isTalant = isTalant;
        return "Sprint_1";

      /* talents start */
      // Anvil
      case "Anvil_Get_Up":
        this.isTalant = true;
        this.isLoop = false;
        return "Anvil/Anvil_Get_Up";
      case "Anvil_Lands":
        this.isTalant = true;
        this.isLoop = false;
        return "Anvil/Anvil_Lands";
      case "Anvil_Lands_1":
        this.isTalant = true;
        this.isLoop = false;
        return "Anvil/Anvil_Lands_1";
      case "Anvil_Lands_2":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.cameras.main.shake(70, 0.02, true);
        return "Anvil/Anvil_Lands_2";
      case "Anvil_Lands_3":
        this.isTalant = true;
        this.isLoop = false;
        return "Anvil/Anvil_Lands_3";
      case "Anvil_Squashed":
        this.isTalant = true;
        return "Anvil/Anvil_Squashed";
      case "Anvil_Throw":
        this.isTalant = true;
        this.isLoop = false;
        return "Anvil/Anvil_Throw";

      // BlackHole
      case "BlackHole_Spit":
        this.isTalant = true;
        this.isLoop = false;
        return "Black_Hole/BlackHole_Spit";
      case "BlackHole_Fall":
        this.isTalant = true;
        this.isLoop = false;
        return "Black_Hole/BlackHole_Fall";
      case "BlackHole_SpatFly":
        this.isTalant = true;
        return "Black_Hole/BlackHole_SpatFly";

      // Blue Egg
      case "BlueEgg_Impact":
        this.isTalant = true;
        this.isLoop = false;
        return "Blue Egg/BlueEgg_Impact";
      case "BlueEgg_Impact_1":
        this.isTalant = true;
        this.isLoop = false;
        return "Blue Egg/BlueEgg_Impact_1";
      case "BlueEgg_Impact_2":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.cameras.main.shake(70, 0.02, true);
        return "Blue Egg/BlueEgg_Impact_2";
      case "BlueEgg_Impact_3":
        this.isTalant = true;
        return "Blue Egg/BlueEgg_Impact_3";
      case "BlueEgg_Launch":
        this.isTalant = true;
        this.isLoop = true;
        return "Blue Egg/BlueEgg_Launch";

      // Coober
      case "Coober_Call":
        this.isTalant = true;
        this.isLoop = false;
        return "Coober/Coober_Call";
      case "Coober_Drive":
        this.isTalant = true;
        this.scene.playCooberCrash(this);
        return "Coober/Coober_Drive";
      case "Coober_GetIn":
        this.isTalant = true;
        this.isLoop = false;
        return "Coober/Coober_GetIn";
      case "Coober_GetOut":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.cameras.main.shake(70, 0.02, true);
        this.scene.time.addEvent({
          delay: 1000 * rate / this.scene.currentSpeedFactor(),
          callback: () => {
            this.scene.cameras.main.shake(70, 0.02, true);
            this.scene.playCooberCrash();
          },
          loop: false,
        });
        return "Coober/Coober_GetOut";
      case "Coober_Accelerate":
        this.isTalant = true;
        this.isLoop = false;
        return "Coober/Coober_Accelerate";

      // CK-47
      case "CK-47_Draw":
        this.setAttributes(this.info);
        this.isTalant = true;
        this.isLoop = false;
        return "CK-47/CK-47_Draw";
      case "CK-47_LeapAway":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.playCK47Chicken(this);
        return "CK-47/CK-47_LeapAway";
      case "CK-47_LandForward":
        this.isTalant = true;
        this.isLoop = false;
        return "CK-47/CK-47_LandForward";
      case "CK-47_LandBackwards":
        this.isTalant = true;
        this.isLoop = false;
        return "CK-47/CK-47_LandBackwards";
      case "CK-47_FireForward":
        this.isTalant = true;
        return "CK-47/CK-47_FireForward";
      case "CK-47_FireBackward":
        this.isTalant = true;
        return "CK-47/CK-47_FireBackward";
      case "CK-47_PutAway":
        this.isTalant = true;
        this.isLoop = false;
        return "CK-47 v2/CK-47_PutAway";
      case "CK-47_Wince":
        this.isTalant = true;
        return "CK-47/CK-47_Wince";
      case "CK-47_Run":
        this.isTalant = true;
        return "CK-47 v2/CK-47_Run";
      case "CK-47_Shooting":
        this.isTalant = true;
        return "CK-47 v2/CK-47_Shooting";
      case "CK-47_LeapBack":
        this.isTalant = true;
        this.isLoop = false;
        return "CK-47/CK-47_LeapBack";

      // BlueRooster
      case "BlueRooster_Drink":
        this.isTalant = true;
        this.isLoop = false;
        return "Blue Rooster/BlueRooster_Drink";
      case "BlueRooster_Sprint":
        this.isTalant = true;
        return "Blue Rooster/BlueRooster_Sprint";

      // Chickenapult
      case "Chickenapult_Airtime":
        this.isTalant = true;
        return "Chickenapult/Chickenapult_Airtime";
      case "Chickenapult_Landing":
        this.isTalant = true;
        this.isLoop = false;
        return "Chickenapult/Chickenapult_Landing";
      case "Chickenapult_Launch":
        this.isTalant = true;
        this.isLoop = false;
        return "Chickenapult/Chickenapult_Launch";
      case "Chickenapult_Roll":
        this.isTalant = true;
        return "Chickenapult/Chickenapult_Roll";
      case "Chickenapult_Spawn":
        this.isTalant = true;
        this.isLoop = false;
        return "Chickenapult/Chickenapult_Spawn";

      // Cold Snap
      case "ColdSnap_BackRun":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.playFreezeEffect(false);
        return "Cold Snap/ColdSnap_BackRun";
      case "ColdSnap_GotSnap":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.playFreezeEffect(true);
        return "Cold Snap/ColdSnap_GotSnap";
      case "ColdSnap_Manta":
        this.isTalant = true;
        this.isLoop = false;
        return "Cold Snap/ColdSnap_Mantra";
      case "ColdSnap_Manta_Outfit":
        this.isTalant = true;
        this.isLoop = false;
        return "Cold Snap/ColdSnap_Mantra_Outfit";
      case "ColdSnap_Run":
        this.isTalant = true;
        return "Cold Snap/ColdSnap_Run";

      // Devolution
      case "Devolution_Bit":
        this.isTalant = true;
        this.isLoop = false;
        return "Devolution/Devolution_Bit";
      case "Devolution_Bite":
        this.isTalant = true;
        this.isLoop = false;
        return "Devolution/Devolution_Bite";
      case "Devolution_Return":
        this.isTalant = true;
        this.isLoop = false;
        return "Devolution2/Devolution_Return";
      case "Devolution_Run":
        this.isTalant = true;
        return "Devolution2/Devolution_Run";
      case "Devolution_Transform":
        this.isTalant = true;
        this.isLoop = false;
        return "Devolution2/Devolution_Transform";
      case "Devolution_Roar":
        this.isTalant = true;
        this.isLoop = false;
        return "Devolution2/Devolution_Roar";
      case "Devolution_FightCloud":
        this.isTalant = true;
        return "Devolution2/Devolution_FightCloud";
      case "Devolution_Leap":
        this.isTalant = true;
        this.isLoop = false;
        return "Devolution2/Devolution_Leap";

      // Dig
      case "Dig_Appear":
        this.isTalant = true;
        this.isLoop = false;
        return "Dig/Dig_Appear";
      case "Dig_DirtMounds":
        this.isTalant = true;
        return "Dig/Dig_DirtMounds";
      case "Dig_Dive":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.playDigTails(this);
        return "Dig/Dig_Dive";

      // Fan Group
      case "FanGroup_Startle":
        this.isTalant = true;
        this.isLoop = false;
        return "Fan Group/FanGroup_Startle";
      case "FanGroup_Run":
        this.isTalant = true;
        return "Fan Group/FanGroup_Run";
      case "FanGroup_Run2":
      case "FanGroup_Relief":
        this.isTalant = true;
        return "Fan Group/FanGroup_Relief";
      case "FanGroup_Cheer":
        this.isTalant = true;
        return "Fan Group/FanGroup_Cheer";
      case "FanGroup_Fan_Autograph":
        return "Fan Group/FanGroup_Fan_Autograph";
      case "FanGroup_Fan_Camera":
        return "Fan Group/FanGroup_Fan_Camera";
      case "FanGroup_Fan_TVCamera":
        return "Fan Group/FanGroup_Fan_TVCamera";
      case "FanGroup_Fan_Kiss":
        return "Fan Group/FanGroup_Fan_Kiss";
      case "FanGroup_Fan_Cheer":
        return "Fan Group/FanGroup_Fan_Cheer";

      // Flight?
      case "Flight_Flapping":
        this.isTalant = true;
        return "Flight?/Flight_Flapping";
      case "Flight_Land_Crash":
        this.isTalant = true;
        this.isLoop = false;
        return "Flight?/Flight_Land_Crash";
      case "Flight_Land_Safe":
        this.isTalant = true;
        this.isLoop = false;
        return "Flight?/Flight_Land_Safe";
      case "Flight_TakeOff":
        this.isTalant = true;
        this.isLoop = false;
        return "Flight?/Flight_TakeOff";

      // Growth
      case "Growth_Grow":
        this.isTalant = true;
        this.isLoop = false;
        this.stepCounter = 0;

        if (this.timer) {
          this.timer.remove();
        }

        this.scene.time.addEvent({
          callback: () => {
            this.timer = this.scene.time.addEvent({
              callback: () => {
                this.stepCounter++;
                this.scene.cameras.main.shake(100, 0.007, true);
              },
              delay: 770 * 0.5 * rate / this.scene.currentSpeedFactor(),
              loop: true,
            });
          },
          delay: (5000 - 770 * 0.5) * rate / this.scene.currentSpeedFactor(),
          loop: false,
        });

        return "Growth/Growth_Grow";
      case "Growth_Run":
        this.isTalant = true;
        return "Growth/Growth_Run";
      case "Growth_Shrink":
        this.isTalant = true;
        this.isLoop = false;

        this.scene.time.addEvent({
          delay: (500 + 770 * 0.5) * rate / this.scene.currentSpeedFactor(),
          callback: () => {
            this.timer.remove();
          },
          loop: false,
        });

        return "Growth/Growth_Shrink";

      // Helicopter
      case "Helicopter_Dismount_Ladder":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.playHelicopter();
        return "Helicopter/Helicopter_Dismount_Ladder";
      case "Helicopter_Holding_Ladder_Fired":
        this.isTalant = true;
        return "Helicopter/Helicopter_Holding_Ladder_Fired";
      case "Helicopter_Holding_Ladder_Loaded":
        this.isTalant = true;
        return "Helicopter/Helicopter_Holding_Ladder_Loaded";
      case "Helicopter_Missile_Hit_1":
        this.isTalant = true;
        this.isLoop = false;
        return "Helicopter/Helicopter_Missile_Hit_1";
      case "Helicopter_Missile_Hit_2":
        this.isTalant = true;
        this.isLoop = false;
        return "Helicopter/Helicopter_Missile_Hit_2";
      case "Helicopter_Missile_Hit_3":
        this.isTalant = true;
        this.isLoop = false;
        return "Helicopter/Helicopter_Missile_Hit_3";
      case "Helicopter_Mount_Ladder":
        this.isTalant = true;
        this.isLoop = false;
        return "Helicopter/Helicopter_Mount_Ladder";
      case "Helicopter_Mount_Ladder2":
        this.isTalant = true;
        this.isLoop = false;
        return "Helicopter/Helicopter_Mount_Ladder2";
      case "Helicopter_Shooting":
        this.isTalant = true;
        return "Helicopter/Helicopter_Shooting";

      // Jetpack
      case "Jetpack_Fly":
        this.isTalant = true;
        return "Jetpack/Jetpack_Fly";
      case "Jetpack_Transition":
        this.isTalant = true;
        this.isLoop = false;
        return "Jetpack/Jetpack_Transition";
      case "Jetpack_Landing":
        this.isTalant = true;
        this.isLoop = false;
        return "Jetpack/Jetpack_Landing";
      case "Jetpack_SafeLanding":
        this.isTalant = true;
        this.isLoop = false;
        return "Jetpack/Jetpack_SafeLanding";

      case "Jetpack_FlyRed":
        this.isTalant = true;
        return "Jetpack_RedFire/Jetpack_FlyRed";
      case "Jetpack_TransitionRed":
        this.isTalant = true;
        this.isLoop = false;
        return "Jetpack_RedFire/Jetpack_TransitionRed";
      case "Jetpack_SafeLandingRed":
        this.isTalant = true;
        this.isLoop = false;
        return "Jetpack_RedFire/Jetpack_SafeLandingRed";

      // Machete
      case "Machete_Air":
        this.isTalant = true;
        return "Machete/Flight_Flapping";
      case "Machete_Decapitate":
        this.isTalant = true;
        this.isLoop = false;
        return "Machete/Machete_Decapitate";
      case "Machete_Draw":
        this.isTalant = true;
        this.isLoop = false;
        return "Machete/Machete_Draw";
      case "Machete_Fall":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.playDarkEffect(false);
        return "Machete/Machete_Fall";
      case "Machete_HeadRegrow":
        this.isTalant = true;
        this.isLoop = false;
        return "Machete/Machete_HeadRegrow";
      case "Machete_HeadlessRun":
        this.isTalant = true;
        return "Machete/Machete_HeadlessRun";
      case "Machete_Leap":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.playDarkEffect(true);
        return "Machete/Machete_Leap";
      case "Machete_Slash":
        this.isTalant = true;
        this.isLoop = false;
        return "Machete/Machete_Slash";

      // MovingWalkway
      case "MovingWalkway_GetOn":
        this.isTalant = true;
        this.isLoop = false;
        return "Moving Walkway/MovingWalkway_GetOn";
      case "MovingWalkway_GetOff":
        this.isTalant = true;
        this.isLoop = false;

        this.scene.playMovingWalkway();

        return "Moving Walkway/MovingWalkway_GetOff";

      case "MovingWalkway_Stand":
        this.isTalant = true;
        return "Moving Walkway/MovingWalkway_Stand";

      // Rollerblades
      case "Rollerblades_jump":
        this.isTalant = true;
        this.isLoop = false;
        return "Rollerblades/Rollerblades_jump";
      case "Rollerblades_Roll":
        this.isTalant = true;
        return "Rollerblades/Rollerblades_Roll";
      case "Rollerblades_Spawn":
        this.isTalant = true;
        this.isLoop = false;
        return "Rollerblades/Rollerblades_Spawn";
      case "Rollerblades_TrickAwesome":
        this.isTalant = true;
        this.isLoop = false;
        return "Rollerblades/Rollerblades_TrickAwesome";
      case "Rollerblades_TrickGood":
        this.isTalant = true;
        this.isLoop = false;
        return "Rollerblades/Rollerblades_TrickGood";

      // Royal Procession
      case "RoyalProcession_Appear":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.time.addEvent({
          callback: () => {
            this.scene.playConffeti(this);
            this.scene.playRedCarpet(this);
          },
          delay: 1000 * rate / this.scene.currentSpeedFactor(),
          loop: false,
        });
        return "Royal Procession/RoyalProcession_Appear";
      case "RoyalProcession_Dissapear":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.time.addEvent({
          callback: () => {
            this.scene.playRedCarpet(null);
          },
          delay: 500 * rate * rate / this.scene.currentSpeedFactor(),
          loop: false,
        });
        return "Royal Procession/RoyalProcession_Dissapear";
      case "RoyalProcession_Idle":
        this.isTalant = true;
        this.scene.playConffeti(null);
        return "Royal Procession/RoyalProcession_Idle";

      // Feature Rain
      case "FeatherRain_Call":
        this.isTalant = true;
        this.isLoop = false;
        this.scene.time.addEvent({
          callback: () => {
            this.scene.playFeathersRain(this);
          },
          delay: 3000 * rate / this.scene.currentSpeedFactor(), // 3s after
          loop: false,
        });
        return "Feather Rain/FeatherRain_Call";
      case "FeatherRain_Struck":
        this.isTalant = true;
        this.isLoop = true;
        return "Feather Rain/FeatherRain_Struck";

      // RunicBlink
      case "RunicBlink_Disappear":
        this.isTalant = true;
        this.isLoop = false;
        return "Runic Blink Talent/RunicBlink_Disappear";
      case "RunicBlink_Dash":
        this.isTalant = true;
        this.isLoop = false;
        return "Runic Blink Talent/RunicBlink_Dash";
      case "RunicBlink_Loop":
        this.isTalant = true;
        this.isLoop = true;
        return "Runic Blink Talent/RunicBlink_Loop";
      case "RunicBlink_Appear":
        this.isTalant = true;
        this.isLoop = false;
        return "Runic Blink Talent/RunicBlink_Appear";

      // Teleport
      case "Teleporter_Button_Press":
        this.isTalant = true;
        this.isLoop = false;
        return "Teleport/Teleporter_Button_Press";
      case "Teleporter_Button_Press_Dematerialising":
        this.isTalant = true;
        this.isLoop = false;
        return "Teleport/Teleporter_Button_Press_Dematerialising";
      case "Teleporter_Dematerialising":
        this.isTalant = true;
        this.isLoop = false;
        return "Teleport/Teleporter_Dematerialising";
      case "Teleporter_Rematerialising":
        this.isTalant = true;
        this.isLoop = false;

        return "Teleport/Teleporter_Rematerialising";
      case "DoNotDrawChicken":
        this.isTalant = true;
        // const isAlienEyes = this.segments[this.segIndex]?.isAlienEyes;
        // if (isAlienEyes !== undefined) {
        //   this.isAlienEyes = isAlienEyes;
        // }
        this.setVisible(false);
        return "";

      /* talents end */
      default:
        this.isTalant = false;
        return aniName;
    }
  }

  scanAniPlaySound (aniName, isTalent = false) {
    if (isTalent) {
      const talentName = aniName;
      playSound(talentName, 0.5, false);
    }
  }

  playAnimation(aniName, isLoop) {
    /* for black hole start */
    if (this.byCopyChiken) {
      this.curAniName = "";
      return;
    }
    /* for black hole end */

    if (this.curAniName !== aniName) {
      this.prevAnim = this.curAniName;
      this.curAniName = aniName;
      const ani = this.getAniName(aniName);
      if (this.chicken.findAnimation(ani) != null) {
        this.chicken.play(ani, isLoop === undefined ? this.isLoop : isLoop);
        this.scanAniPlaySound(aniName, this.isTalant);
      } else {
        if (this.scene.env === "dev") {
          console.log("animName: ", aniName);
        }
        this.aniNormalRun();
      }
      // this.setAttributes(this.info);
      /* reset attributes per anim changes */
      // this.setAttributes(this.info);
      // this.scene.time.addEvent({
      //   callback: () => {
      //     this.setAttributes(this.info);
      //   },
      //   delay: 40,
      //   loop: false,
      // });
    } else if (
      this.curAniName === "Devolution_Return" ||
      this.curAniName === "Devolution_FightCloud" ||
      this.curAniName === "Dizzy_running" ||
      this.prevAnim === "Devolution_Return"
    ) {
      this.setAttributes(this.info);
    }
  }

  aniNormalRun() {
    let aniName = "Run_Animation";
    if (this.curAniName != aniName) {
      this.chicken.play(this.curAniName, true);
    }
  }

  aniFastRun() {
    let aniName = "Fast_Run";
    if (this.curAniName != aniName) {
      this.curAniName = aniName;
      this.chicken.play(this.curAniName, true);
    }
  }

  arrived() {
    if (this.status != C_STATUS_ARRIVED) {
      this.status = C_STATUS_ARRIVED;
      let idle_ani = "Idle_Animation"; //(Math.random() > 0.5) ? 'idle_animation' : 'idle_clap eyes_animation'
      this.chicken.play(idle_ani, true);
    }
  }

  setAniSpeed(value) {
    const rate = (this.scene.game.loop.actualFps / this.fps) * 0.98;
    this.chicken.state.timeScale = value * rate;
  }

  update(elapsedFrame, speedFactor) {
    if (this.talentName === "Devolution") {
      this.setPositionByFrameForLizard(elapsedFrame);
    } else if (this.talentName === "Fan Group") {
      this.setPositionByFrameForFan(elapsedFrame);
    } else if (this.talentName === "Black Hole") {
      this.setPositionByFrameForClonedChicken(elapsedFrame);
    } else if (this.status != C_STATUS_IDLE) {
      this.setPositionByFrame(elapsedFrame, speedFactor);
    }
  }

  // Black Hole Copy Chicken
  setPositionByFrameForClonedChicken(elapsedFrame) {
    const meta = this.talentMeta;
    const elapsedTime = elapsedFrame / this.fps;
    const blackHole = this.scene.blackHole;

    let index = meta.segments.length,
      cumulativeSegmentSize = meta.startTime;

    for (let i = 0; i < meta.segments.length; i++) {
      cumulativeSegmentSize += meta.segments[i].duration;
      if (cumulativeSegmentSize > elapsedTime) {
        index = i;
        break;
      }
    }

    if (index === 0) {
      // suck
      /* suck effect */
      const disX = this.x - blackHole.x;
      const disY = this.y - blackHole.y;
      const dis = Math.sqrt(disX * disX + disY * disY);
      if (dis < 50) {
        this.chicken.alpha = 0;
        this.setVisible(!meta.isDnfChicken);
        return;
      }

      const scale = Math.min(dis / (this.gameDimension.height / 6), 1);
      this.setScale(scale * this.gameScale);

      const originalChicken = this.originalChicken;
      const segIndex = originalChicken.segIndex;
      const seg = originalChicken.segments[segIndex];
      const speed = (seg.startSpeed + seg.endSpeed) / 2;

      const suckSpeed =
        (this.scene.blackHole.suckSpeed / this.fps) *
        this.pix1m *
        this.gameScale;
      const alpha = Math.atan2(disY, disX);
      const sX = Math.cos(alpha) * suckSpeed;
      const sY = Math.sin(alpha) * suckSpeed;
      this.x += (speed / this.fps) * this.pix1m * this.gameScale - sX;
      this.y += -sY;
      this.segIndex = index;
    } else if (index === 1) {
      this.segIndex = index;
      // Do no draw
    } else if (index === 2) {
      // spat
      if (this.segIndex !== index) {
        this.segIndex = index;
        this.chicken.alpha = 1;
        this.chicken.state.timeScale = 1;
        this.setScale(this.gameScale / 4);
        this.x = blackHole.x;
        this.y = blackHole.y;
        const tY = this.y - this.gameDimension.height / 2;
        const offsetX =
          Math.tan((meta.spitAngle * Math.PI) / 180) *
          this.gameDimension.height;
        const blackHoleOffsetX =
          blackHole.meta.blackHole.segments[3].endSpeed *
          meta.segments[index].duration *
          this.pix1m *
          this.gameScale;
        this.playAnimation(meta.segments[index].animation);
        const rate = this.scene.game.loop.actualFps / this.fps;

        this.spatAnim = this.scene.tweens.add({
          targets: this,
          y: tY,
          x: blackHole.x + offsetX + blackHoleOffsetX,
          scale: this.gameScale,
          duration: meta.segments[index].duration * rate * 1000 / this.scene.currentSpeedFactor(),
          ease: "Cubic.easeOut",
        });
      }
      this.originalChicken.setVisible(false);
    } else if (index === 3) {
      // fall
      if (this.segIndex !== index) {
        this.chicken.alpha = 0;
        this.segIndex = index;
        this.spatAnim.remove();
        this.originalChicken.playAnimation(meta.segments[index].animation);
        this.originalChicken.setVisible(!meta.isDnfChicken);

        this.originalChicken.byCopyChiken = true;
        const originalY = this.originalChicken.y;
        this.originalChicken.y -= this.gameDimension.height;
        const rate = this.scene.game.loop.actualFps / this.fps;
        this.scene.tweens.add({
          targets: this.originalChicken,
          y: originalY,
          duration: meta.segments[index].duration * rate * 1000 / this.scene.currentSpeedFactor(),
          // ease: "Cubic.easeOut",
        });
      }
    } else if (index === 4) {
      // land
      if (this.segIndex !== index) {
        this.originalChicken.chicken.play(
          `Black_Hole/${meta.segments[index].animation}`
        );
        this.originalChicken.setVisible(!meta.isDnfChicken);
        this.segIndex = index;
      }
    } else {
      this.originalChicken.byCopyChiken = false;
      const originalSeg =
        this.originalChicken.segments[this.originalChicken.segIndex];
      this.originalChicken.playAnimation(originalSeg.segmentChickenAnimation);
      this.setVisible(false);
      this.chicken.alpha = 1;
      this.originalChicken.setVisible(!meta.isDnfChicken);
      this.segIndex = index;
    }
    this.scene.swirlContainer.segIndex = index;
  }

  // Fan chicken
  setPositionByFrameForFan(elapsedFrame) {
    const meta = this.talentMeta;
    const elapsedTime = elapsedFrame / this.fps - meta.fansSpawnTime;

    let position = meta.fansSpawnPosition,
      segIndex = 0;
    for (let i = 0; i < 3; i++) {
      const seg = meta.segments[i];
      if (seg.cumulativeSegmentSize < elapsedTime) {
        const avgSpeed = (seg.startSpeed + seg.endSpeed) / 2;
        position += avgSpeed * seg.segmentSize;
        segIndex = i + 1;
      }
    }
    if (segIndex < 3) {
      const seg = meta.segments[segIndex];
      const timeInSeg =
        seg.segmentSize - (seg.cumulativeSegmentSize - elapsedTime);
      const f = timeInSeg / seg.segmentSize;
      const currentSpeed = (seg.endSpeed - seg.startSpeed) * f + seg.startSpeed;
      const avgSpeed = (seg.startSpeed + currentSpeed) / 2;
      position += avgSpeed * timeInSeg;

      this.segIndex = segIndex;
      this.x =
        (position * this.pix1m + 100 + this.offsetPosition) * this.gameScale;
    } else {
      const dis =
        (this.performingChicken.x -
          this.x +
          this.offsetPosition * this.gameScale) /
        (this.pix1m * this.gameScale);
      if (dis > this.disapearingDistance && !this.isDisapearing) {
        this.isDisapearing = true;

        this.segIndex = -1;

        this.tween = this.scene.tweens.add({
          targets: this.chicken,
          alpha: 0,
          duration: 300 / this.scene.currentSpeedFactor(),
          onComplete: () => {
            this.visible = false;
          },
        });
      } else {
        const speed = this.performingChicken.currentSpeed * 0.4; // TODO: confirm
        this.x += (speed * this.pix1m * this.gameScale) / this.fps;
      }
    }
  }

  // Devolution targen chicken's lizard
  setPositionByFrameForLizard(elapsedFrame) {
    const meta = this.talentMeta;
    const elapsedTime = elapsedFrame / this.fps - meta.spawnTime;

    let position = meta.spawnPosition,
      segIndex = 0;
    for (let i = 0; i < meta.segments.length; i++) {
      const seg = meta.segments[i];
      if (seg.cumulativeSegmentSize < elapsedTime) {
        const avgSpeed = (seg.startSpeed + seg.endSpeed) / 2;
        position += avgSpeed * seg.segmentSize;
        segIndex = i + 1;
      }
    }

    if (segIndex < meta.segments.length) {
      const seg = meta.segments[segIndex];
      const timeInSeg =
        seg.segmentSize - (seg.cumulativeSegmentSize - elapsedTime);
      const f = timeInSeg / seg.segmentSize;
      const currentSpeed = (seg.endSpeed - seg.startSpeed) * f + seg.startSpeed;
      const avgSpeed = (seg.startSpeed + currentSpeed) / 2;
      position += avgSpeed * timeInSeg;

      if (this.segIndex !== segIndex) {
        if (seg.segmentChickenAnimation === "DoNotDrawChicken") {
          this.visible = false;
        } else {
          this.visible = true;
          this.chicken.play(
            `Devolution2/${seg.segmentChickenAnimation}`,
            seg.segmentChickenAnimation !== "Devolution_Leep"
          );
          this.setAttributes(this.info);
        }
      }

      this.segIndex = segIndex;
      this.x = (position * this.pix1m + 100) * this.gameScale;
    } else if (!this.isDisapearing) {
      this.isDisapearing = true;
      this.talentMeta = null;
      this.visible = false;
    }

    this.isReady = segIndex > 1;
  }

  setPositionByFrame(elapsedFrame, speedFactor = 1) {
    const elapsedTime = elapsedFrame / this.fps;
    this.setAniSpeed(speedFactor);

    let position = 0,
      segIndex = 0;
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      if (segment.cumulativeSegmentSize < elapsedTime) {
        this.startSpeed = segment.startSpeed;
        this.endSpeed = segment.endSpeed;
        const avgSpeed = (this.startSpeed + this.endSpeed) / 2;
        position += avgSpeed * segment.segmentSize;
        segIndex = i + 1;
      }
    }
    if (segIndex < this.segments.length) {
      const segment = this.segments[segIndex];
      const nextSegment =
        this.segments[Math.min(segIndex + 1, this.segments.length - 1)];
      this.nextAnimName = nextSegment?.segmentChickenAnimation;
      const prevSegment = this.segments[segIndex > 0 ? segIndex - 1 : 0];
      this.startSpeed = segment.startSpeed;
      this.endSpeed = segment.endSpeed;
      const timeInSeg =
        segment.segmentSize - (segment.cumulativeSegmentSize - elapsedTime);
      const f = timeInSeg / segment.segmentSize;
      const currentSpeed =
        (this.endSpeed - this.startSpeed) * f + this.startSpeed;
      const avgSpeed = (this.startSpeed + currentSpeed) / 2;
      position += avgSpeed * timeInSeg;
      this.currentSpeed = currentSpeed;

      /* special taletns triggers */
      if (this.segIndex !== segIndex) {
        this.segIndex = segIndex;
        if (prevSegment?.segmentChickenAnimation === "FeatherRain_Struck") {
          this.scene.playFeathersRain(null);
        } else if (prevSegment?.segmentChickenAnimation === "BlackHole_Spit") {
          this.scene.playBlackHole(this);
        } else if (segment?.helicopterLandingTime) {
          // Appear Helicopter
          this.scene.playHelicopter(this);
        } else if (segment?.fanGroupTriggerTime) {
          this.scene.playFanGroup(this);
        } else if (
          nextSegment?.segmentChickenAnimation === "MovingWalkway_GetOn"
        ) {
          this.scene.playMovingWalkway(this);
        } else if (
          nextSegment?.segmentChickenAnimation === "Devolution_FightCloud"
        ) {
          this.scene.playDevolutionLizard(this);
        }
      }

      if (segment?.segmentChickenAnimation) {
        this.playAnimation(segment.segmentChickenAnimation);
      } else {
        const prevSegment = this.segments[segIndex > 0 ? segIndex - 1 : 0];
        const prevAccel = prevSegment.endSpeed / prevSegment.startSpeed;
        this.accel = this.endSpeed / this.startSpeed;
        this.accel > prevAccel ? this.aniFastRun() : this.aniNormalRun();
      }
    } else {
      const lastSegment = this.segments[this.segments.length - 1];
      const restTime = elapsedTime - lastSegment.cumulativeSegmentSize;
      position += restTime * lastSegment.endSpeed;
    }

    this.x = (position * this.pix1m + 100) * this.gameScale;
  }
}
