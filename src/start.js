import Phaser from "phaser";

import Boot from "./scene/Boot";
import Preloader from "./scene/Preloader";
import Main from "./scene/Main";
import UI from "./scene/UI";
import Winner from "./scene/Winner";

import gitInfo from "../gitInfo.json";

const spineVersion = 103;
const supportsWebGL = Utils.webglSupport();
const gameDimension = Utils.getGameDimension();

Phaser.Core.TimeStep.prototype.resetDelta = Phaser.Utils.NOOP;

const gameConfig = {
  type: supportsWebGL ? Phaser.WEBGL : Phaser.CANVAS,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: gameDimension.width,
    height: gameDimension.height,
  },
  fps: {
    target: 50,
    smoothStep: true,
    forceSetTimeOut: true,
  },
  // physics: {
  //     default: 'arcade',
  // },
  scene: [Boot, Preloader, Main, UI, Winner],
  plugins: {
    scene: [
      { key: "SpinePlugin", plugin: window.SpinePlugin, mapping: "spine" },
    ],
  },
};

const game = new Phaser.Game(gameConfig);
window.focus();

window.addEventListener("load", async () => {
  console.log(`${gitInfo.gitBranch} / ${gitInfo.gitCommitHash}`);
  const gitInfoDiv = document.getElementById("git-info");
  gitInfoDiv.innerHTML = `${gitInfo.gitBranch} / ${gitInfo.gitCommitHash} [${spineVersion}]`;
});

// Usage tracking
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "UA-30485283-26");
