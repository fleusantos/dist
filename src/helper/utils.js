const Utils = {};

Utils.fadeOutIn = function (passedCallback, context) {
  context.cameras.main.fadeOut(250);
  context.time.addEvent({
    delay: 250,
    callback: function () {
      context.cameras.main.fadeIn(250);
      passedCallback(context);
    },
    callbackScope: context,
  });
};
Utils.fadeOutScene = function (sceneName, context) {
  context.cameras.main.fadeOut(250);
  context.time.addEvent({
    delay: 250,
    callback: function () {
      context.scene.start(sceneName);
    },
    callbackScope: context,
  });
};

Utils.recordVideo = async (record, meta) => {
  console.log("start Redord...");
  const canvas = document.querySelector("canvas");
  Utils.videoIsRecording = true;
  const video = await record(canvas, {
    // the number of times you want to record per duration
    timeslice: 50,
    // the length of video you would like to record
    duration: 3000,
    mimeType: "video/webm",
    audioBitsPerSecond: 0,
    videoBitsPerSecond: 25000000,
  });
  const videoUrl = URL.createObjectURL(video);
};

Utils.getName = function (info, maxLength = 15) {
  if (info.name.length < maxLength) {
    return info.name
  }

  let name = info.name.substr(0, maxLength - 1).trim()
  return `${name}...`
};

Utils.zeroPad = function (num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
};

Utils.Storage = {
  availability: function () {
    if (!!(typeof window.localStorage === "undefined")) {
      console.log("localStorage not available");
      return null;
    }
  },
  get: function (key) {
    this.availability();
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return window.localStorage.getItem(key);
    }
  },
  set: function (key, value) {
    this.availability();
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      if (e === QUOTA_EXCEEDED_ERR) {
        console.log("localStorage quota exceeded");
      }
    }
  },
  initUnset: function (key, value) {
    if (this.get(key) === null) {
      this.set(key, value);
    }
  },
  getFloat: function (key) {
    return parseFloat(this.get(key));
  },
  setHighscore: function (key, value) {
    if (value > this.getFloat(key)) {
      this.set(key, value);
    }
  },
  remove: function (key) {
    this.availability();
    window.localStorage.removeItem(key);
  },
  clear: function () {
    this.availability();
    window.localStorage.clear();
  },
};

Utils.Lang = {
  current: "en",
  options: ["en", "pl"],
  parseQueryString: function (query) {
    let vars = query.split("&");
    let queryString = {};
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");
      if (typeof queryString[pair[0]] === "undefined") {
        queryString[pair[0]] = decodeURIComponent(pair[1]);
      } else if (typeof queryString[pair[0]] === "string") {
        let arr = [queryString[pair[0]], decodeURIComponent(pair[1])];
        queryString[pair[0]] = arr;
      } else {
        queryString[pair[0]].push(decodeURIComponent(pair[1]));
      }
    }
    return queryString;
  },
  updateLanguage: function (lang) {
    var query = window.location.search.substring(1);
    var qs = Utils.Lang.parseQueryString(query);
    if (qs && qs["lang"]) {
      console.log(`LANG: ${qs["lang"]}`);
      Utils.Lang.current = qs["lang"];
    } else {
      if (lang) {
        Utils.Lang.current = lang;
      } else {
        Utils.Lang.current = navigator.language;
      }
    }
    if (Utils.Lang.options.indexOf(Utils.Lang.current) === -1) {
      Utils.Lang.current = "en";
    }
  },
  text: {
    en: {
      FONT: "roboto",
    },
    pl: {
      FONT: "roboto",
    },
  },
};

Utils.getTwoLines = (text) => text.split(' ').reduce((acc, word) => {
  if ((acc[0] + ' ' + word).length <= 30) {
    acc[0] += ' ' + word;
  } else {
    acc[1] += ' ' + word;
  }
  return acc;
}, ['', '']).map(s => s.trim());

Utils.webglSupport = () => {
  const canvas = document.createElement("canvas");
  let gl;
  let debugInfo;
  let renderer;

  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch (e) { }

  if (gl) {
    debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  }

  return renderer && renderer !== "Google SwiftShader";
};

Utils.isIOSDevice = () =>
  !!navigator.userAgent && /iPad|iPhone|iPod/.test(navigator.userAgent);

Utils.getGameDimension = () => {
  const deviceWidth = Math.max(screen.width, screen.height);

  const num = 4;
  const seg = G_WIDTH / num;
  let i = num;
  while (seg * i > deviceWidth) i--;

  i = Math.max(i < num ? i + 1 : num, 2);

  const width = i * seg;
  const height = (G_HEIGHT * i) / num;

  return {
    width,
    height,
  };
};

Utils.isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

// Sounds
Utils.Sfx = {
  manage: function (type, mode, game, button, label) {
    switch (mode) {
      case "init": {
        Utils.Storage.initUnset(`Utils-${type}`, true);
        Utils.Sfx.status = Utils.Sfx.status || [];
        Utils.Sfx.status[type] = Utils.Storage.get(`Utils-${type}`);
        if (type === "sound") {
          Utils.Sfx.sounds = [];
          Utils.Sfx.sounds["click"] = game.sound.add("sound-click");
        } else {
          // music
          if (!Utils.Sfx.music || !Utils.Sfx.music.isPlaying) {
            Utils.Sfx.music = game.sound.add("music-theme");
            Utils.Sfx.music.volume = 0.5;
          }
        }
        break;
      }
      case "on": {
        Utils.Sfx.status[type] = true;
        break;
      }
      case "off": {
        Utils.Sfx.status[type] = false;
        break;
      }
      case "switch": {
        Utils.Sfx.status[type] = !Utils.Sfx.status[type];
        break;
      }
      default: {
      }
    }
    Utils.Sfx.update(type, button, label);

    if (type === "music" && Utils.Sfx.music) {
      if (Utils.Sfx.status["music"]) {
        if (!Utils.Sfx.music.isPlaying) {
          Utils.Sfx.music.play({ loop: true });
        }
      } else {
        Utils.Sfx.music.stop();
      }
    }

    Utils.Storage.set(`Utils-${type}`, Utils.Sfx.status[type]);
  },
  play: function (audio) {
    if (audio === "music") {
      if (
        Utils.Sfx.status["music"] &&
        Utils.Sfx.music &&
        !Utils.Sfx.music.isPlaying
      ) {
        Utils.Sfx.music.play({ loop: true });
      }
    } else {
      // sound
      if (
        Utils.Sfx.status["sound"] &&
        Utils.Sfx.sounds &&
        Utils.Sfx.sounds[audio]
      ) {
        Utils.Sfx.sounds[audio].play();
      }
    }
  },
  update: function (type, button, label) {
    if (button) {
      if (Utils.Sfx.status[type]) {
        button.setTexture(`button-${type}-on`);
      } else {
        button.setTexture(`button-${type}-off`);
      }
    }
    if (label) {
      if (Utils.Sfx.status[type]) {
        label.setText(Utils.Lang.text[Utils.Lang.current][`${type}-on`]);
      } else {
        label.setText(Utils.Lang.text[Utils.Lang.current][`${type}-off`]);
      }
    }
  },
};

Utils.getDocumentDimension = () => {
  // const isFullscreen = !window.screenTop && !window.screenY;
  // if (isFullscreen) {
  //   return {
  //     width: window.screen.availWidth,
  //     height: window.screen.availHeight,
  //   };
  // } else {
  //   return { width: widnow.innerWidth, height: window.innerHeight };
  // }
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  }
};

let soundsStore = {};
let soundInfoDetail = {};
let gameMusicOn = true;
let sfxIsOn = true;
let currentTalentSound = { chickenId: -1, category: '', sound: null, soundId: null };
let threadId = 0

const playSound = (szSound, iVolume, bLoop) => {
  if (!soundsStore[szSound]) return

  soundsStore[szSound].play();
  soundsStore[szSound].volume(iVolume);

  soundsStore[szSound].loop(bLoop);

  return soundsStore[szSound];
};

const playTalentSound = (chickenId, category, szSound, iVolume, bLoop) => {
  if (!soundsStore[szSound]) return

  threadId++

  // console.log('show currentTalentSound Before play new sound', threadId, currentTalentSound)
  if (soundInfoDetail[szSound].serial) {
    currentTalentSound.sound?.stop()
    for (let key in soundsStore) {
      if (key != szSound && key.indexOf(category) != -1)
        soundsStore[key].stop()
    }
  }

  const soundId = soundsStore[szSound].play();
  if (soundsStore[szSound].loop() && soundInfoDetail[szSound].repeat > 0)
    soundsStore[szSound].on('play', () => {
      console.log('duration', szSound, soundsStore[szSound].duration())
      setTimeout(() => {
        soundsStore[szSound].stop()
      }, soundsStore[szSound].duration() * soundInfoDetail[szSound].repeat * 1000);
    })
  soundsStore[szSound].volume(iVolume);

  // soundsStore[szSound].loop(bLoop);

  currentTalentSound = { chickenId, category, sound: soundsStore[szSound], soundId, szSound }
  // console.log('show currentTalentSound after play new sound', threadId, currentTalentSound)

  return soundsStore[szSound];
}

const stopTalentSound = (chickenId) => {
  console.log('when stop', chickenId, currentTalentSound)
  if (chickenId == currentTalentSound.chickenId)
    currentTalentSound.sound?.stop()
}

// Usage tracking - remember to replace with your own!
const head = document.getElementsByTagName("head")[0];
const script = document.createElement("script");
script.type = "text/javascript";
script.onload = function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "UA-30485283-26");
};
script.src = "https://www.googletagmanager.com/gtag/js?id=UA-30485283-26";
head.appendChild(script);
