import * as THREE from 'three';

/**
 * Генератор 3D моделей купонов по категориям
 * Дополнительные модели для разнообразия
 */

export class CategoryModels {

  /**
   * Купон для еды (Burger/Pizza/Food)
   */
  static createFoodCoupon(rarity = 'common') {
    const group = new THREE.Group();
    const color = this._getRarityColor(rarity);

    // Форма: чашка/бокал
    const cupGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.3, 16);
    const cupMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
      metalness: 0.7,
      roughness: 0.3
    });
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    group.add(cup);

    // Пар над чашкой (particles)
    const steamGeometry = new THREE.BufferGeometry();
    const steamCount = 30;
    const steamPositions = new Float32Array(steamCount * 3);

    for (let i = 0; i < steamCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.1;
      steamPositions[i * 3] = Math.cos(angle) * radius;
      steamPositions[i * 3 + 1] = 0.2 + Math.random() * 0.3;
      steamPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    steamGeometry.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));

    const steamMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });

    const steam = new THREE.Points(steamGeometry, steamMaterial);
    group.add(steam);

    group.userData.steam = steam;
    group.userData.steamPositions = steamPositions;

    return group;
  }

  /**
   * Купон для одежды (Shopping/Fashion)
   */
  static createFashionCoupon(rarity = 'common') {
    const group = new THREE.Group();
    const color = this._getRarityColor(rarity);

    // Форма: бирка с ленточкой
    const tagShape = new THREE.Shape();
    tagShape.moveTo(0, 0.3);
    tagShape.lineTo(0.2, 0.3);
    tagShape.lineTo(0.2, -0.3);
    tagShape.lineTo(-0.2, -0.3);
    tagShape.lineTo(-0.2, 0.3);
    tagShape.lineTo(0, 0.3);

    // Вырез для ленточки
    const hole = new THREE.Path();
    hole.moveTo(0, 0.25);
    hole.arc(0, 0, 0.03, 0, Math.PI * 2, false);
    tagShape.holes.push(hole);

    const extrudeSettings = {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2
    };

    const tagGeometry = new THREE.ExtrudeGeometry(tagShape, extrudeSettings);
    const tagMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
      metalness: 0.8,
      roughness: 0.2
    });

    const tag = new THREE.Mesh(tagGeometry, tagMaterial);
    group.add(tag);

    // Ленточка
    const ribbonGeometry = new THREE.TorusGeometry(0.03, 0.01, 8, 16);
    const ribbonMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.9
    });
    const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbon.position.y = 0.25;
    ribbon.rotation.x = Math.PI / 2;
    group.add(ribbon);

    // Блестки
    const sparkles = this._createSparkles(40, color, 1.2);
    group.add(sparkles);

    group.userData.tag = tag;
    group.userData.ribbon = ribbon;

    return group;
  }

  /**
   * Купон для электроники (Tech/Gadgets)
   */
  static createTechCoupon(rarity = 'common') {
    const group = new THREE.Group();
    const color = this._getRarityColor(rarity);

    // Форма: футуристический кристалл/чип
    const chipGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.05);
    const chipMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.9,
      metalness: 1.0,
      roughness: 0.1
    });

    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    group.add(chip);

    // Схема на чипе (линии)
    const lines = [];
    for (let i = 0; i < 5; i++) {
      const points = [];
      points.push(new THREE.Vector3(-0.15 + Math.random() * 0.3, -0.1 + i * 0.05, 0.03));
      points.push(new THREE.Vector3(-0.15 + Math.random() * 0.3, -0.1 + i * 0.05, 0.03));

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);
      lines.push(line);
    }

    // Светящиеся точки (контакты)
    const contactsGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const contactsMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 1.0
    });

    for (let i = 0; i < 8; i++) {
      const contact = new THREE.Mesh(contactsGeometry, contactsMaterial.clone());
      const angle = (i / 8) * Math.PI * 2;
      contact.position.x = Math.cos(angle) * 0.18;
      contact.position.y = Math.sin(angle) * 0.11;
      contact.position.z = 0.03;
      group.add(contact);

      if (!group.userData.contacts) group.userData.contacts = [];
      group.userData.contacts.push(contact);
    }

    group.userData.chip = chip;
    group.userData.lines = lines;

    return group;
  }

  /**
   * Купон для развлечений (Cinema/Events)
   */
  static createEntertainmentCoupon(rarity = 'common') {
    const group = new THREE.Group();
    const color = this._getRarityColor(rarity);

    // Форма: билет/карточка с перфорацией
    const ticketShape = new THREE.Shape();
    ticketShape.moveTo(-0.3, -0.15);
    ticketShape.lineTo(0.3, -0.15);
    ticketShape.lineTo(0.3, 0.15);
    ticketShape.lineTo(-0.3, 0.15);
    ticketShape.lineTo(-0.3, -0.15);

    const ticketGeometry = new THREE.ExtrudeGeometry(ticketShape, {
      depth: 0.02,
      bevelEnabled: false
    });

    const ticketMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.85,
      metalness: 0.6,
      roughness: 0.4
    });

    const ticket = new THREE.Mesh(ticketGeometry, ticketMaterial);
    group.add(ticket);

    // Перфорация (маленькие дырочки)
    for (let i = 0; i < 10; i++) {
      const holeGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.03, 8);
      const holeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.5
      });

      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.position.x = 0.25;
      hole.position.y = -0.12 + i * 0.027;
      hole.rotation.z = Math.PI / 2;
      group.add(hole);
    }

    // Звездочки (для развлечений)
    const stars = this._createStars(8, 0xffff00, 1.5);
    group.add(stars);

    group.userData.ticket = ticket;

    return group;
  }

  /**
   * Купон для фитнеса/спорта (Fitness/Sports)
   */
  static createFitnessCoupon(rarity = 'common') {
    const group = new THREE.Group();
    const color = this._getRarityColor(rarity);

    // Форма: гантель
    const barGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 16);
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      metalness: 0.9,
      roughness: 0.2
    });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.rotation.z = Math.PI / 2;
    group.add(bar);

    // Веса
    const weightGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16);
    const weightMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.3
    });

    const weight1 = new THREE.Mesh(weightGeometry, weightMaterial);
    weight1.rotation.z = Math.PI / 2;
    weight1.position.x = -0.15;
    group.add(weight1);

    const weight2 = new THREE.Mesh(weightGeometry, weightMaterial);
    weight2.rotation.z = Math.PI / 2;
    weight2.position.x = 0.15;
    group.add(weight2);

    // Энергетические частицы
    const energy = this._createSparkles(50, color, 1.8);
    group.add(energy);

    return group;
  }

  /**
   * Вспомогательные методы
   */

  static _getRarityColor(rarity) {
    const colors = {
      common: 0x00ff00,
      rare: 0x00aaff,
      epic: 0x9900ff,
      legendary: 0xffaa00
    };
    return colors[rarity] || 0x00ff00;
  }

  static _createSparkles(count, color, spread) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * spread;
      positions[i + 1] = (Math.random() - 0.5) * spread;
      positions[i + 2] = (Math.random() - 0.5) * spread;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.015,
      color: color,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    return new THREE.Points(geometry, material);
  }

  static _createStars(count, color, spread) {
    const group = new THREE.Group();

    for (let i = 0; i < count; i++) {
      const starGeometry = this._createStarGeometry(0.05, 0.02, 5);
      const starMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7
      });

      const star = new THREE.Mesh(starGeometry, starMaterial);

      const angle = (i / count) * Math.PI * 2;
      const radius = Math.random() * spread;
      star.position.x = Math.cos(angle) * radius;
      star.position.y = Math.sin(angle) * radius;
      star.position.z = (Math.random() - 0.5) * 0.5;

      star.rotation.z = Math.random() * Math.PI * 2;

      group.add(star);
    }

    return group;
  }

  static _createStarGeometry(outerRadius, innerRadius, points) {
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

    return new THREE.ShapeGeometry(shape);
  }

  /**
   * Анимации для категорий
   */
  static animateCategory(couponGroup, category, deltaTime) {
    const time = Date.now() * 0.001;

    // Базовая анимация для всех
    couponGroup.rotation.y += 0.01;

    switch (category) {
      case 'food':
        // Пар поднимается
        if (couponGroup.userData.steam && couponGroup.userData.steamPositions) {
          const positions = couponGroup.userData.steamPositions;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += 0.005;
            if (positions[i + 1] > 0.6) {
              positions[i + 1] = 0.2;
              positions[i] = (Math.random() - 0.5) * 0.2;
              positions[i + 2] = (Math.random() - 0.5) * 0.2;
            }
          }
          couponGroup.userData.steam.geometry.attributes.position.needsUpdate = true;
        }
        break;

      case 'fashion':
        // Ленточка покачивается
        if (couponGroup.userData.ribbon) {
          couponGroup.userData.ribbon.rotation.y = Math.sin(time * 2) * 0.3;
        }
        break;

      case 'tech':
        // Контакты мигают
        if (couponGroup.userData.contacts) {
          couponGroup.userData.contacts.forEach((contact, i) => {
            const phase = (time * 3 + i * 0.5) % (Math.PI * 2);
            contact.material.opacity = 0.5 + Math.sin(phase) * 0.5;
          });
        }
        break;

      case 'entertainment':
        // Билет слегка вращается
        if (couponGroup.userData.ticket) {
          couponGroup.userData.ticket.rotation.y = Math.sin(time) * 0.1;
        }
        break;

      case 'fitness':
        // Энергичное покачивание
        couponGroup.position.y += Math.sin(time * 4) * 0.003;
        couponGroup.rotation.z = Math.sin(time * 2) * 0.05;
        break;
    }
  }
}

export default CategoryModels;
