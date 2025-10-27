import * as THREE from 'three';

class ARScene {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.coupon = null;
    this.isARActive = false;
    this.userPosition = new THREE.Vector3();
    this.couponPosition = new THREE.Vector3(0, 0, -2);

    this.init();
    this.setupEventListeners();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.6, 0); // Human eye height

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    const container = document.getElementById('canvas-container');
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);

    // Create coupon
    this.createCoupon();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  createCoupon() {
    // Coupon group
    const couponGroup = new THREE.Group();

    // Main holographic card
    const cardGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.02);
    const cardMaterial = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      emissive: 0x0088ff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
      metalness: 0.8,
      roughness: 0.2
    });
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    couponGroup.add(card);

    // Glow effect (outer ring)
    const glowGeometry = new THREE.TorusGeometry(0.35, 0.02, 16, 100);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    couponGroup.add(glow);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 50;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 2;
    }

    particlesGeometry.setAttribute('position',
      new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    couponGroup.add(particlesMesh);

    // Position the coupon
    couponGroup.position.copy(this.couponPosition);

    // Store references
    this.coupon = couponGroup;
    this.couponCard = card;
    this.couponGlow = glow;
    this.couponParticles = particlesMesh;

    this.scene.add(couponGroup);
  }

  setupEventListeners() {
    const arButton = document.getElementById('ar-button');
    const catchButton = document.getElementById('catch-button');

    arButton.addEventListener('click', () => this.startAR());
    catchButton.addEventListener('click', () => this.catchCoupon());
  }

  startAR() {
    this.isARActive = true;

    // Hide landing UI
    document.getElementById('header').classList.add('hidden');
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('ar-button').classList.add('hidden');

    // Show AR UI
    document.getElementById('ar-ui').classList.remove('hidden');

    // Start animation loop
    this.animate();
  }

  animate() {
    if (!this.isARActive) return;

    requestAnimationFrame(() => this.animate());

    // Animate coupon
    if (this.coupon) {
      // Rotation
      this.coupon.rotation.y += 0.01;

      // Float animation
      const time = Date.now() * 0.001;
      this.coupon.position.y = this.couponPosition.y + Math.sin(time) * 0.1;

      // Pulse glow
      if (this.couponGlow) {
        this.couponGlow.material.opacity = 0.4 + Math.sin(time * 2) * 0.2;
      }

      // Rotate particles
      if (this.couponParticles) {
        this.couponParticles.rotation.y += 0.002;
      }

      // Update distance indicator
      this.updateDistance();
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateDistance() {
    const distance = this.camera.position.distanceTo(this.coupon.position);
    const distanceElement = document.getElementById('distance');
    distanceElement.textContent = distance.toFixed(1) + 'м';

    // Change color based on distance
    const indicator = document.getElementById('distance-indicator');
    if (distance < 1.5) {
      indicator.style.borderColor = '#00ff88';
      indicator.style.color = '#00ff88';
    } else if (distance < 3) {
      indicator.style.borderColor = '#ffaa00';
      indicator.style.color = '#ffaa00';
    } else {
      indicator.style.borderColor = '#ff4444';
      indicator.style.color = '#ff4444';
    }
  }

  catchCoupon() {
    const distance = this.camera.position.distanceTo(this.coupon.position);

    if (distance > 3) {
      this.showMessage('Слишком далеко! Подойдите ближе.');
      return;
    }

    // Success animation
    this.animateCatch();
  }

  animateCatch() {
    // Animate coupon flying to camera
    const startPos = this.coupon.position.clone();
    const endPos = this.camera.position.clone();
    const duration = 1000;
    const startTime = Date.now();

    const animateStep = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Update position
      this.coupon.position.lerpVectors(startPos, endPos, easeProgress);

      // Scale down
      const scale = 1 - easeProgress * 0.8;
      this.coupon.scale.set(scale, scale, scale);

      // Increase rotation speed
      this.coupon.rotation.y += 0.1 * (1 + progress * 2);

      if (progress < 1) {
        requestAnimationFrame(animateStep);
      } else {
        this.showSuccessPopup();
      }
    };

    animateStep();
  }

  showSuccessPopup() {
    // Hide AR UI
    document.getElementById('ar-ui').classList.add('hidden');

    // Show success popup
    const popup = document.getElementById('success-popup');
    popup.classList.remove('hidden');

    // Fetch coupon data
    fetch('/api/demo-coupons')
      .then(res => res.json())
      .then(coupons => {
        const coupon = coupons[1]; // Epic coupon for demo
        const titleElement = document.getElementById('coupon-title');
        titleElement.textContent = `${coupon.title}`;
        titleElement.className = `rarity-${coupon.rarity}`;
      });

    // Play success sound (if available)
    this.playSound('success');

    // Reset after 3 seconds
    setTimeout(() => {
      this.resetDemo();
    }, 3000);
  }

  resetDemo() {
    // Reset coupon position and scale
    this.coupon.position.copy(this.couponPosition);
    this.coupon.scale.set(1, 1, 1);
    this.coupon.rotation.set(0, 0, 0);

    // Hide success popup
    document.getElementById('success-popup').classList.add('hidden');

    // Show AR UI again
    document.getElementById('ar-ui').classList.remove('hidden');
  }

  showMessage(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 1.2rem;
      z-index: 1000;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 2000);
  }

  playSound(type) {
    // Placeholder for sound effects
    console.log(`Playing sound: ${type}`);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Initialize AR scene when page loads
window.addEventListener('DOMContentLoaded', () => {
  new ARScene();
});
