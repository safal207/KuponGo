import * as THREE from 'three';

/**
 * Генератор процедурных 3D моделей купонов
 * Создает голографические купоны разной редкости
 */

export class CouponModelGenerator {

  /**
   * Создать купон по типу редкости
   */
  static createCoupon(rarity = 'common') {
    const generators = {
      common: this.createCommonCoupon,
      rare: this.createRareCoupon,
      epic: this.createEpicCoupon,
      legendary: this.createLegendaryCoupon
    };

    const generator = generators[rarity] || generators.common;
    return generator.call(this);
  }

  /**
   * Common купон - простой зеленый куб
   */
  static createCommonCoupon() {
    const group = new THREE.Group();

    // Основная карточка
    const cardGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.02);
    const cardMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00aa00,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.7,
      metalness: 0.5,
      roughness: 0.3
    });
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    group.add(card);

    // Простое свечение
    const glowGeometry = new THREE.RingGeometry(0.25, 0.3, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    return group;
  }

  /**
   * Rare купон - синий с вращающимися кольцами
   */
  static createRareCoupon() {
    const group = new THREE.Group();

    // Основная голографическая карточка
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
    group.add(card);

    // Вращающееся кольцо
    const ringGeometry = new THREE.TorusGeometry(0.35, 0.02, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Дополнительное внутреннее кольцо
    const innerRingGeometry = new THREE.TorusGeometry(0.25, 0.015, 16, 100);
    const innerRing = new THREE.Mesh(innerRingGeometry, ringMaterial.clone());
    innerRing.rotation.x = Math.PI / 2;
    group.add(innerRing);

    // Частицы
    const particles = this.createParticles(50, 0x00ffff, 1.5);
    group.add(particles);

    // Сохраняем ссылки для анимации
    group.userData.animatableRing = ring;
    group.userData.animatableInnerRing = innerRing;
    group.userData.animatableParticles = particles;

    return group;
  }

  /**
   * Epic купон - фиолетовый с кристаллами
   */
  static createEpicCoupon() {
    const group = new THREE.Group();

    // Центральный кристалл
    const crystalGeometry = new THREE.OctahedronGeometry(0.3, 0);
    const crystalMaterial = new THREE.MeshStandardMaterial({
      color: 0x9900ff,
      emissive: 0x7700cc,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.85,
      metalness: 0.9,
      roughness: 0.1
    });
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    group.add(crystal);

    // Орбитальные малые кристаллы
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i;
      const radius = 0.5;

      const smallCrystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.08, 0),
        crystalMaterial.clone()
      );

      smallCrystal.position.x = Math.cos(angle) * radius;
      smallCrystal.position.z = Math.sin(angle) * radius;

      group.add(smallCrystal);

      if (!group.userData.orbitCrystals) {
        group.userData.orbitCrystals = [];
      }
      group.userData.orbitCrystals.push({
        mesh: smallCrystal,
        angle: angle,
        radius: radius
      });
    }

    // Энергетические кольца
    for (let i = 0; i < 3; i++) {
      const ringSize = 0.4 + i * 0.15;
      const ringGeometry = new THREE.TorusGeometry(ringSize, 0.01, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xaa00ff,
        transparent: true,
        opacity: 0.4 - i * 0.1
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = i * 0.5;
      group.add(ring);

      if (!group.userData.energyRings) {
        group.userData.energyRings = [];
      }
      group.userData.energyRings.push(ring);
    }

    // Частицы
    const particles = this.createParticles(100, 0xaa00ff, 2);
    group.add(particles);

    group.userData.mainCrystal = crystal;
    group.userData.particles = particles;

    return group;
  }

  /**
   * Legendary купон - золотой с эффектами
   */
  static createLegendaryCoupon() {
    const group = new THREE.Group();

    // Центральная звезда
    const starGeometry = this.createStarGeometry(0.4, 0.2, 5);
    const starMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff8800,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.9,
      metalness: 1.0,
      roughness: 0.1
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    group.add(star);

    // Задняя звезда (больше, вращается в обратную сторону)
    const backStar = new THREE.Mesh(starGeometry, starMaterial.clone());
    backStar.scale.set(1.3, 1.3, 0.1);
    backStar.position.z = -0.05;
    group.add(backStar);

    // Лучи света
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const rayGeometry = new THREE.ConeGeometry(0.02, 0.6, 8);
      const rayMaterial = new THREE.MeshBasicMaterial({
        color: 0xffdd00,
        transparent: true,
        opacity: 0.6
      });
      const ray = new THREE.Mesh(rayGeometry, rayMaterial);

      ray.rotation.z = angle + Math.PI / 2;
      ray.position.x = Math.cos(angle) * 0.5;
      ray.position.y = Math.sin(angle) * 0.5;

      group.add(ray);

      if (!group.userData.rays) {
        group.userData.rays = [];
      }
      group.userData.rays.push(ray);
    }

    // Золотые частицы
    const particles = this.createParticles(200, 0xffaa00, 2.5);
    group.add(particles);

    // Внешнее сияние
    const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    group.userData.star = star;
    group.userData.backStar = backStar;
    group.userData.particles = particles;
    group.userData.glow = glow;

    return group;
  }

  /**
   * Создать систему частиц
   */
  static createParticles(count, color, spread) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * spread;
      positions[i + 1] = (Math.random() - 0.5) * spread;
      positions[i + 2] = (Math.random() - 0.5) * spread;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02,
      color: color,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    return new THREE.Points(geometry, material);
  }

  /**
   * Создать геометрию звезды
   */
  static createStarGeometry(outerRadius, innerRadius, points) {
    const shape = new THREE.Shape();

    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }

    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3
    });

    return geometry;
  }

  /**
   * Анимация купона (вызывать в loop)
   */
  static animate(couponGroup, rarity, deltaTime) {
    if (!couponGroup) return;

    const time = Date.now() * 0.001;

    // Базовое вращение и плавание для всех
    couponGroup.rotation.y += 0.01;
    couponGroup.position.y += Math.sin(time * 2) * 0.002;

    // Специфичные анимации по редкости
    switch (rarity) {
      case 'rare':
        if (couponGroup.userData.animatableRing) {
          couponGroup.userData.animatableRing.rotation.z += 0.02;
        }
        if (couponGroup.userData.animatableInnerRing) {
          couponGroup.userData.animatableInnerRing.rotation.z -= 0.03;
        }
        if (couponGroup.userData.animatableParticles) {
          couponGroup.userData.animatableParticles.rotation.y += 0.005;
        }
        break;

      case 'epic':
        // Вращение центрального кристалла
        if (couponGroup.userData.mainCrystal) {
          couponGroup.userData.mainCrystal.rotation.x += 0.02;
          couponGroup.userData.mainCrystal.rotation.y += 0.02;
        }

        // Орбитальные кристаллы
        if (couponGroup.userData.orbitCrystals) {
          couponGroup.userData.orbitCrystals.forEach((crystal, index) => {
            crystal.angle += 0.02;
            crystal.mesh.position.x = Math.cos(crystal.angle) * crystal.radius;
            crystal.mesh.position.z = Math.sin(crystal.angle) * crystal.radius;
            crystal.mesh.rotation.x += 0.03;
            crystal.mesh.rotation.y += 0.03;
          });
        }

        // Энергетические кольца
        if (couponGroup.userData.energyRings) {
          couponGroup.userData.energyRings.forEach((ring, index) => {
            ring.rotation.z += 0.01 * (index + 1);
          });
        }
        break;

      case 'legendary':
        // Звезды вращаются в разные стороны
        if (couponGroup.userData.star) {
          couponGroup.userData.star.rotation.z += 0.03;
        }
        if (couponGroup.userData.backStar) {
          couponGroup.userData.backStar.rotation.z -= 0.02;
        }

        // Пульсация сияния
        if (couponGroup.userData.glow) {
          const pulse = Math.sin(time * 3) * 0.1 + 0.1;
          couponGroup.userData.glow.material.opacity = pulse;
          couponGroup.userData.glow.scale.setScalar(1 + pulse);
        }

        // Вращение лучей
        if (couponGroup.userData.rays) {
          couponGroup.userData.rays.forEach((ray, index) => {
            ray.material.opacity = 0.4 + Math.sin(time * 2 + index) * 0.2;
          });
        }
        break;
    }
  }
}

export default CouponModelGenerator;
