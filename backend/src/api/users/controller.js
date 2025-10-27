const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock users database
const mockUsers = [];

/**
 * Регистрация пользователя
 */
async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: username, email, password'
      });
    }

    // Проверка существующего пользователя
    const existingUser = mockUsers.find(
      u => u.email === email || u.username === username
    );

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists'
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      level: 1,
      xp: 0,
      total_caught: 0,
      rare_caught: 0,
      created_at: new Date()
    };

    mockUsers.push(user);

    // Генерация JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    );

    // Убрать пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({
      error: 'Failed to register user'
    });
  }
}

/**
 * Логин пользователя
 */
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password'
      });
    }

    // Найти пользователя
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Генерация JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    );

    // Убрать пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({
      error: 'Failed to login'
    });
  }
}

/**
 * Получить профиль пользователя
 */
async function getUserProfile(req, res) {
  try {
    const { id } = req.params;

    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Убрать пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile'
    });
  }
}

/**
 * Получить статистику пользователя
 */
async function getUserStats(req, res) {
  try {
    const { id } = req.params;

    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Рассчитать детальную статистику
    const stats = {
      level: user.level,
      xp: user.xp,
      xpToNextLevel: calculateXPForNextLevel(user.level),
      totalCaught: user.total_caught,
      byRarity: {
        common: Math.floor(user.total_caught * 0.6),
        rare: Math.floor(user.total_caught * 0.25),
        epic: Math.floor(user.total_caught * 0.12),
        legendary: Math.floor(user.total_caught * 0.03)
      },
      achievements: getUserAchievements(user),
      totalSaved: user.total_caught * 15.5, // среднее значение
      distanceWalked: user.total_caught * 0.5 // км
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({
      error: 'Failed to fetch user stats'
    });
  }
}

/**
 * Вспомогательные функции
 */
function calculateXPForNextLevel(currentLevel) {
  return currentLevel * 500;
}

function getUserAchievements(user) {
  const achievements = [];

  if (user.total_caught >= 1) {
    achievements.push({ id: 'first_catch', name: 'Первый улов', unlocked: true });
  }
  if (user.total_caught >= 50) {
    achievements.push({ id: 'gourmet', name: 'Гурман', unlocked: true });
  }
  if (user.total_caught >= 100) {
    achievements.push({ id: 'shopaholic', name: 'Шопоголик', unlocked: true });
  }

  return achievements;
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUserStats
};
