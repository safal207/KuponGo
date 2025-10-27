/**
 * Coupon Spawner Service
 * Автоматически генерирует купоны в зависимости от времени суток и локации
 */

const SPAWN_INTERVAL = parseInt(process.env.COUPON_SPAWN_INTERVAL) || 300000; // 5 минут

let spawnerInterval = null;

/**
 * Запустить сервис генерации купонов
 */
function startCouponSpawner() {
  console.log('[Spawner] Starting coupon spawner service...');

  // Сразу запустить один раз
  spawnCoupons();

  // Затем запускать периодически
  spawnerInterval = setInterval(() => {
    spawnCoupons();
  }, SPAWN_INTERVAL);

  return spawnerInterval;
}

/**
 * Остановить сервис
 */
function stopCouponSpawner() {
  if (spawnerInterval) {
    clearInterval(spawnerInterval);
    spawnerInterval = null;
    console.log('[Spawner] Coupon spawner service stopped');
  }
}

/**
 * Основная логика генерации купонов
 */
function spawnCoupons() {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();

  console.log(`[Spawner] Spawning coupons... Hour: ${hour}, Day: ${dayOfWeek}`);

  // Определить приоритетные категории в зависимости от времени
  const priorities = getTimePriorities(hour, dayOfWeek);

  // Генерировать купоны для каждой категории
  priorities.forEach(priority => {
    const count = calculateSpawnCount(priority);
    console.log(`[Spawner] Spawning ${count} coupons for category: ${priority.category}`);

    // Здесь будет логика создания купонов в БД
    // spawnCouponsByCategory(priority.category, count, priority.rarityBoost);
  });
}

/**
 * Определить приоритеты по времени
 */
function getTimePriorities(hour, dayOfWeek) {
  const priorities = [];

  // Завтрак (7-10)
  if (hour >= 7 && hour < 10) {
    priorities.push(
      { category: 'cafe', boost: 1.5, rarityBoost: 0.1 },
      { category: 'bakery', boost: 1.3, rarityBoost: 0.05 }
    );
  }

  // Обед (12-14)
  if (hour >= 12 && hour < 14) {
    priorities.push(
      { category: 'restaurant', boost: 1.7, rarityBoost: 0.15 },
      { category: 'fastfood', boost: 1.4, rarityBoost: 0.1 }
    );
  }

  // Ужин (18-21)
  if (hour >= 18 && hour < 21) {
    priorities.push(
      { category: 'restaurant', boost: 1.6, rarityBoost: 0.12 },
      { category: 'bar', boost: 1.3, rarityBoost: 0.08 }
    );
  }

  // Выходные
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    priorities.push(
      { category: 'shopping', boost: 1.8, rarityBoost: 0.2 },
      { category: 'entertainment', boost: 1.5, rarityBoost: 0.15 }
    );
  }

  // Базовые категории всегда активны
  if (priorities.length === 0) {
    priorities.push({ category: 'general', boost: 1.0, rarityBoost: 0 });
  }

  return priorities;
}

/**
 * Рассчитать количество купонов для спавна
 */
function calculateSpawnCount(priority) {
  const baseCount = 5;
  return Math.floor(baseCount * priority.boost);
}

/**
 * Выбрать редкость купона с учетом буста
 */
function selectRarity(rarityBoost = 0) {
  const rand = Math.random();

  const chances = {
    legendary: 0.03 + rarityBoost,
    epic: 0.12 + rarityBoost,
    rare: 0.25 + rarityBoost,
    common: 1.0
  };

  if (rand < chances.legendary) return 'legendary';
  if (rand < chances.epic) return 'epic';
  if (rand < chances.rare) return 'rare';
  return 'common';
}

/**
 * Получить статистику спавнера
 */
function getSpawnerStats() {
  return {
    isRunning: spawnerInterval !== null,
    interval: SPAWN_INTERVAL,
    nextSpawn: spawnerInterval ? new Date(Date.now() + SPAWN_INTERVAL) : null
  };
}

module.exports = {
  startCouponSpawner,
  stopCouponSpawner,
  getSpawnerStats,
  selectRarity
};
