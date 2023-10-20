const CONFETTI_COLORS = [
  0xff718d, 0xa864fd, 0x29cdff, 0x78ff44, 0xff718d, 0xfdff6a,
];

const gameDimension = Utils.getGameDimension();
const gameScale = gameDimension.width / G_WIDTH;

export default class Confetties extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config) {
    super(scene, x, y);
    this.maxParticleCount = config?.maxParticleCount || 300; //set max confetti count
    this.particleSpeed = (config?.particleSpeed || 1) * gameScale; //set max confetti count
    this.waveAngle = 0;
    this.particles = [];
    this.streamingConfetti = true;
    this.chicken = config?.chicken;
    while (this.particles.length < this.maxParticleCount) {
      const particle = scene.add.rectangle(
        0,
        0,
        Math.random() * 10 * gameScale + 5,
        Math.random() * 5 * gameScale + 5,
        0x000000
      );
      this.add(particle);
      this.particles.push(particle);
    }
    this.setVisible(true);
    scene.add.existing(this);
  }

  resetParticle(particle, isUpdate) {
    particle.fillColor =
      CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0];
    particle.x =
      this.scene.cameras.main.scrollX +
      Math.random() * gameDimension.width * 2 -
      gameDimension.width / 4;
    particle.y =
      Math.random() * gameDimension.height * 1 - gameDimension.height * 1;
    particle.tiltStep = Math.random() * 0.07 + 0.05;
    particle.tiltAngle = 0;
    particle.diameter = (Math.random() * 10 + 5) * gameScale;
    return particle;
  }

  start() {
    this.streamingConfetti = true;
    for (let i = 0; i < this.maxParticleCount; i++) {
      if (!this.particles[i]) {
        const particle = this.scene.add.rectangle(
          0,
          0,
          Math.random() * 10 * gameScale + 5,
          Math.random() * 5 * gameScale + 5,
          0x000000
        );
        this.add(particle);
        this.particles[i] = particle;
      }
      this.resetParticle(this.particles[i]);
    }
    this.setVisible(true);
  }

  stop() {
    this.streamingConfetti = false;
  }

  toggle() {
    if (this.visible) this.stopConfetti();
    else this.startConfetti();
  }

  update() {
    if (!this.visible || !this.particles.length) return;
    this.waveAngle += 0.01;
    const scrollX = this.scene.cameras.main.scrollX;
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      particle.tiltAngle += particle.tiltStep;
      particle.x =
        particle.y < 0
          ? scrollX + Math.random() * gameDimension.width * 2
          : particle.x + Math.sin(this.waveAngle) * gameScale;
      particle.y +=
        (Math.cos(this.waveAngle) * gameScale +
          particle.diameter +
          this.particleSpeed * this.scene.currentSpeedFactor()) *
        0.5;
      particle.rotation = Math.sin(particle.tiltAngle * 2);
      particle.scaleX = Math.sin(particle.tiltAngle);
      if (particle.y < 0) continue;
      if (particle.y > gameDimension.height) {
        if (
          this.streamingConfetti &&
          this.particles.length <= this.maxParticleCount
        ) {
          this.resetParticle(particle, true);
        } else {
          particle.destroy();
          this.particles.splice(i, 1);
          i--;
        }
      }
    }
  }
}
