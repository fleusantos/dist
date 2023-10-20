import NoSleep from "nosleep.js";

const noSleep = new NoSleep();
const gameDimension = Utils.getGameDimension();
const gameScale = gameDimension.width / G_WIDTH;

const assetScale = Math.floor(gameScale * 4) + "x";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }
  preload() {
    // let bg = this.add.sprite(Utils.world.centerX, Utils.world.centerY, 'preload_bg').setOrigin(0.5, 0.5);
    // bg.setScale(Utils.world.width / bg.width, Utils.world.height / bg.height);
    const logo = this.add.sprite(
      Utils.world.centerX,
      Utils.world.centerY - 100 * gameScale,
      "logo"
    );
    logo.setOrigin(0.5, 0.5);
    logo.setScale(gameScale);
    const loadingBg = this.add.sprite(
      Utils.world.centerX,
      Utils.world.centerY + 100 * gameScale,
      "preload_bar_bg"
    );
    loadingBg.setOrigin(0.5, 0.5);
    loadingBg.setScale(gameScale);

    const progress = this.add.graphics();
    this.load.on("progress", function (value) {
      progress.clear();
      progress.fillStyle(0xffde00, 1);
      progress.fillRect(
        loadingBg.x - loadingBg.width * 0.5 * gameScale + 20 * gameScale,
        loadingBg.y - loadingBg.height * 0.5 * gameScale + 10 * gameScale,
        540 * value * gameScale,
        25 * gameScale
      );
    });

    this.bLoadImage = false;
    this.bLoadAudio = false;

    const resources = {
      image: [
        ["placeholder", `${assetUrl}/common/1x1.png`],
        ["chat_divide_line", `${assetUrl}/4x/ui/chat_divide_line.png`],
        ["chat_panel", `${assetUrl}/4x/ui/chat_panel.png`],

        ["bg_dist", `${assetUrl}/${assetScale}/game/bg_dist.png`],
        ["start_line", `${assetUrl}/${assetScale}/game/start_line.png`],
        ["finish_line", `${assetUrl}/${assetScale}/game/finish_line.png`],
        ["feather0", `${assetUrl}/4x/game/feather1.png`],
        ["feather1", `${assetUrl}/4x/game/feather2.png`],
        ["feather2", `${assetUrl}/4x/game/feather3.png`],

        ["btn_bg", `${assetUrl}/${assetScale}/ui/btn_bg.png`],
        ["info_panel", `${assetUrl}/${assetScale}/ui/info_panel.png`],

        ["sfx_off", `${assetUrl}/${assetScale}/ui/sfx_off.png`],
        ["sfx_on", `${assetUrl}/${assetScale}/ui/sfx_on.png`],
        ["eye", `${assetUrl}/${assetScale}/ui/cock-eye.png`],

        ["chat_divide_line", `${assetUrl}/4x/ui/chat_divide_line.png`],
        ["chat_panel", `${assetUrl}/4x/ui/chat_panel.png`],

        ["distance_bar", `${assetUrl}/${assetScale}/ui/distance_bar.png`],
        ["distance_bar_frame", `${assetUrl}/${assetScale}/ui/distance_bar_frame.png`],
        ["start", `${assetUrl}/${assetScale}/ui/start.png`],
        ["goal", `${assetUrl}/${assetScale}/ui/goal.png`],
        ["btn_panel", `${assetUrl}/${assetScale}/ui/btn_panel.png`],
        ["btn_play", `${assetUrl}/${assetScale}/ui/btn_play.png`],
        ["btn_pause", `${assetUrl}/${assetScale}/ui/btn_pause.png`],
        ["btn_sound_on", `${assetUrl}/${assetScale}/ui/btn_sound_on.png`],
        ["btn_sound_off", `${assetUrl}/${assetScale}/ui/btn_sound_off.png`],
        ["btn_zoom_in", `${assetUrl}/${assetScale}/ui/btn_zoom_in.png`],
        ["btn_zoom_out", `${assetUrl}/${assetScale}/ui/btn_zoom_out.png`],
        ["btn_reply", `${assetUrl}/${assetScale}/ui/btn_reply.png`],

        // TODO: rename to keep consistency!
        ["x1_icon", `${assetUrl}/${assetScale}/ui/x1_icon.png`],
        ["x1.2_icon", `${assetUrl}/${assetScale}/ui/x1.2_icon.png`],
        ["x1.5_icon", `${assetUrl}/${assetScale}/ui/x1.5_icon.png`],
        ["x2_icon", `${assetUrl}/${assetScale}/ui/x2_icon.png`],
        ["play_icon", `${assetUrl}/${assetScale}/ui/play_icon.png`],
        ["play_speedup_icon", `${assetUrl}/${assetScale}/ui/play_speedup_icon.png`],
        ["play_speedup_icon_2", `${assetUrl}/${assetScale}/ui/play_speedup_icon_2.png`],

        // ["prize_bg", `${assetUrl}/${assetScale}/ui/prize_bg.png`],
        ["eth_icon", `${assetUrl}/${assetScale}/ui/eth_icon.png`],
        ["timer", `${assetUrl}/${assetScale}/ui/timer.png`],
        ["bg_winner", `${assetUrl}/${assetScale}/ui/bg_winner.png`],
        ["winner_panel_primary", `${assetUrl}/${assetScale}/ui/winner_panel_primary.png`],
        ["winner_panel_secondary", `${assetUrl}/${assetScale}/ui/winner_panel_secondary.png`],
        ["pedestal_new", `${assetUrl}/${assetScale}/ui/pedestal.png`],
      ],
      spritesheet: [],
      atlas: [],
      spine: [
        [
          "chicken",
          `${assetUrl}/${assetScale}/spine/ChickenDerby_Animation.json`,
          [`${assetUrl}/${assetScale}/spine/ChickenDerby_Animation.atlas.txt`],
        ],
      ],

      audio: [
        [
          "sfx_countdown",
          [
            "sfx/sfx_countdown.m4a",
            "sfx/sfx_countdown.mp3",
            "sfx/sfx_countdown.ogg",
          ],
        ],
        [
          "grass_intro",
          ["sfx/grass_intro.m4a", "sfx/grass_intro.mp3", "sfx/grass_intro.ogg"],
        ],
        [
          "grass_bgm",
          ["sfx/grass_bgm.m4a", "sfx/grass_bgm.mp3", "sfx/grass_bgm.ogg"],
        ],
        [
          "sfx_finish",
          ["sfx/sfx_finish.m4a", "sfx/sfx_finish.mp3", "sfx/sfx_finish.ogg"],
        ],
        [
          "m_ending",
          ["sfx/m_ending.m4a", "sfx/m_ending.mp3", "sfx/m_ending.ogg"],
        ],
        [
          "replay_crossline",
          [
            "sfx/replay_crossline.m4a",
            "sfx/replay_crossline.mp3",
            "sfx/replay_crossline.ogg",
          ],
        ],
      ],
    };

    const soundInfo = [
      {
        filename: "sfx/sfx_countdown",
        loop: false,
        volume: 0.5,
        ingamename: "sfx_countdown",
      },
      {
        filename: "sfx/grass_intro",
        loop: false,
        volume: 0.5,
        ingamename: "grass_intro",
      },
      {
        filename: "sfx/grass_bgm",
        loop: true,
        volume: 0.5,
        ingamename: "grass_bgm",
      },
      {
        filename: "sfx/sfx_finish",
        loop: false,
        volume: 0.5,
        ingamename: "sfx_finish",
      },
      {
        filename: "sfx/m_ending",
        loop: true,
        volume: 0.5,
        ingamename: "m_ending",
      },
      {
        filename: "sfx/replay_crossline",
        loop: true,
        volume: 0.5,
        ingamename: "replay_crossline",
      },
      ...gameInfo.raceStats.id == 2853 || gameInfo.raceStats.id == 2927 ? [
        // ...gameInfo.soundProfiles,
        ...gameInfo.raceStats.id == 2853 ? [
          'CK-47/CK-47_Draw',
          'CK-47/CK-47_FireBackward',
          'CK-47/CK-47_LandBackwards',
          'CK-47/CK-47_LandForward',
          'CK-47/CK-47_LeapAway',
          'CK-47/CK-47_LeapBack',
          'CK-47/CK-47_Wince',
        ] : [
          'Chickenapult/Chickenapult_Airtime',
          'Chickenapult/Chickenapult_Landing',
          'Chickenapult/Chickenapult_Launch',
          'Chickenapult/Chickenapult_Roll',
          'Chickenapult/Chickenapult_Spawn'
        ]
      ].map((sound) => ({
        filename: `sfx/talents/${sound.split('/')[0]}/${sound.split('/')[1]}`,
        loop: false,
        volume: 0.5,
        ingamename: `${sound.split('/')[1]}`,
      })) : {}
    ];

    const terrain = gameInfo.raceStats.terrain.name.toLowerCase();

    // ADD SPINE & SPRITE ASSETS PER TALENTS
    const animNames = [].concat(
      ...gameInfo.chickens.map((e) =>
        e.segments.map((s) => s.segmentChickenAnimation)
      )
    );
    // Talent: Helicopter
    if (animNames.includes("Helicopter_Shooting")) {
      resources.spine.push([
        "helicopter",
        `${assetUrl}/${assetScale}/spine/Helicopter.json`,
        [`${assetUrl}/${assetScale}/spine/Helicopter.txt`],
      ]);
    }
    // Talent: Moving Walkway
    if (animNames.includes("MovingWalkway_GetOn")) {
      resources.spine.push([
        "walkway",
        `${assetUrl}/${assetScale}/spine/Walkway.json`,
        [`${assetUrl}/${assetScale}/spine/Walkway.txt`],
      ]);
    }
    // Talent: BlackHole
    if (animNames.includes("BlackHole_Spit")) {
      resources.spine.push([
        "blackhole",
        `${assetUrl}/${assetScale}/spine/BlackHole.json`,
        [`${assetUrl}/${assetScale}/spine/BlackHole.txt`],
      ]);
    }
    // Talent: Royal Proccession
    if (animNames.includes("RoyalProcession_Appear")) {
      resources.image.push([
        "red_carpet_center",
        `${assetUrl}/${assetScale}/game/red_carpet_center.png`,
      ]);

    }
    // Talent: ColdSnap
    if (animNames.includes("ColdSnap_GotSnap")) {
      resources.image.push(["frost", `${assetUrl}/${assetScale}/game/frost.png`]);
    }
    // Talent: Coober
    if (animNames.includes("Coober_Call")) {
      resources.image.push([
        "coober_crash",
        `${assetUrl}/${assetScale}/terrain/${terrain}/crash.png`,
      ]);
    }
    // Talent: Dig (TODO)
    if (animNames.includes("Dig_Appear")) {
      resources.atlas.push([
        "dig_tails",
        `${assetUrl}/4x/game/dig_tails.png`,
        `${assetUrl}/4x/game/dig_tails.json`,
      ]);
    }

    for (let j = 0; j < BORDER_CNT; j++) {
      resources.image.push([
        `${terrain}_l${j}`,
        `${assetUrl}/${assetScale}/terrain/${terrain}/l${j + 1}.png`,
      ]);
      resources.image.push([
        `${terrain}_u${j}`,
        `${assetUrl}/${assetScale}/terrain/${terrain}/u${j + 1}.png`,
      ]);
    }

    for (let j = 0; j < TERRAIN_CNT; j++) {
      resources.image.push([
        `${terrain}_t${j}`,
        `${assetUrl}/${assetScale}/terrain/${terrain}/t${j + 1}.png`,
      ]);
    }

    for (let method in resources) {
      resources[method].forEach(function (args) {
        let loader = this.load[method];
        loader && loader.apply(this.load, args);
      }, this);
    }

    soundsStore = new Array();
    for (let i = 0; i < soundInfo.length; i++) {
      soundsStore[soundInfo[i].ingamename] = new Howl({
        src: [
          soundInfo[i].filename + ".ogg",
        ],
        autoplay: false,
        preload: true,
        loop: soundInfo[i].loop,
        volume: soundInfo[i].volume,
        onload: this.fileComplete(),
      });
    }
  }

  fileComplete() {
    this.bLoadAudio = true;
    this.goNextScreen();
  }

  create() {
    this.bLoadImage = true;
    this.goNextScreen();
  }

  goNextScreen() {
    if (this.bLoadAudio && this.bLoadImage) {
      Utils.fadeOutScene("Main", this);
      noSleep.enable();
    }
  }
}
