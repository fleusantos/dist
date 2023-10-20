const gameDimension = Utils.getGameDimension();
const gameScale = gameDimension.width / G_WIDTH;

const FEATHER_SCALE = 0.5;

export default class Feathers extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config) {
    super(scene, x, y);
    this.maxParticleCount = config?.maxParticleCount || 300; //set max confetti count
    this.waveAngle = 0;
    this.particles = [];
    this.rainningFeatures = true;
    this.depth = gameDimension.height;
    while (this.particles.length < this.maxParticleCount) {
      const orgScale = 0.2 + (FEATHER_SCALE - 0.2) * Math.random() * gameScale;
      const index = Math.floor(Math.random() * 3);
      const particle = scene.add
        .sprite(0, 0, `feather${index}`)
        .setScale(orgScale);

      particle.originalScale = orgScale;

      this.add(particle);
      this.particles.push(particle);
    }
    this.setVisible(true);
    scene.add.existing(this);
  }

  resetParticle(particle, isUpdate) {
    particle.x =
      this.scene.cameras.main.scrollX +
      Math.random() * gameDimension.width * 2 -
      gameDimension.width / 4;
    particle.y =
      Math.random() * gameDimension.height * 1 - gameDimension.height * 1;
    particle.tiltStep = Math.random() * 0.07 + 0.05;
    particle.tiltAngle = 0;
    particle.diameter = particle.originalScale * 10 + 5; //(Math.random() * 10 + 5) * gameScale;

    return particle;
  }

  start() {
    this.rainningFeatures = true;
    for (let i = 0; i < this.maxParticleCount; i++) {
      if (!this.particles[i]) {
        const orgScale =
          0.2 + (FEATHER_SCALE - 0.2) * Math.random() * gameScale;
        const index = Math.floor(Math.random() * 3);
        const particle = this.scene.add
          .sprite(0, 0, `feather${index}`)
          .setScale(orgScale);
        particle.originalScale = orgScale;

        this.add(particle);
        this.particles[i] = particle;
      }
      this.resetParticle(this.particles[i]);
    }
    this.setVisible(true);
  }

  stop() {
    this.rainningFeatures = false;
  }

  update() {
    if (!this.visible || !this.particles.length) return;
    this.waveAngle += 0.01;
    const scrollX = this.scene.cameras.main.scrollX;
    const particleSpeed = 50 * gameScale * (this.scene.currentSpeedFactor() || 1);
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      particle.tiltAngle += particle.tiltStep * 2;
      particle.x =
        particle.y < 0
          ? scrollX + Math.random() * gameDimension.width * 2
          : particle.x + Math.sin(this.waveAngle) * gameScale;
      particle.y +=
        (Math.cos(this.waveAngle) * gameScale +
          particle.diameter +
          particleSpeed) *
        0.5;
      particle.rotation = Math.PI / 20;
      particle.scaleX = Math.sin(particle.tiltAngle) * particle.originalScale;
      if (particle.y < 0) continue;
      if (particle.y > gameDimension.height) {
        if (
          this.rainningFeatures &&
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
