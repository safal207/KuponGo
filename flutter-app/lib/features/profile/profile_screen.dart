import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Профиль'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // Navigate to settings
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Profile header
            const CircleAvatar(
              radius: 50,
              child: Icon(Icons.person, size: 50),
            ),
            const SizedBox(height: 15),
            const Text(
              'Охотник123',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Text(
              'hunter@example.com',
              style: TextStyle(
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 10),

            // Level badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Уровень 12 ⭐⭐⭐',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 30),

            // Stats
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Статистика',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildStatRow('Поймано всего:', '247'),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const SizedBox(width: 20),
                        Expanded(
                          child: Column(
                            children: [
                              _buildStatRow('🟢 Common:', '148'),
                              _buildStatRow('🔵 Rare:', '78'),
                              _buildStatRow('🟣 Epic:', '18'),
                              _buildStatRow('🟠 Legendary:', '3'),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 30),
                    _buildStatRow('Использовано:', '189'),
                    _buildStatRow('Сэкономлено:', '\$1,247'),
                    _buildStatRow('Пройдено:', '42.3 км'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Achievements
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Достижения',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            // Show all achievements
                          },
                          child: const Text('Все →'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 15),
                    _buildAchievement(
                      '🏆',
                      'Первый улов',
                      'Поймать первый купон',
                      true,
                    ),
                    _buildAchievement(
                      '🍔',
                      'Гурман',
                      'Посетить 50 ресторанов',
                      true,
                    ),
                    _buildAchievement(
                      '🛍️',
                      'Шопоголик',
                      'Поймать 100 купонов',
                      true,
                    ),
                    _buildAchievement(
                      '⭐',
                      'Легенда',
                      'Поймать 10 legendary',
                      false,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Actions
            ListTile(
              leading: const Icon(Icons.help_outline),
              title: const Text('Помощь'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.privacy_tip_outlined),
              title: const Text('Конфиденциальность'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.info_outline),
              title: const Text('О приложении'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text(
                'Выйти',
                style: TextStyle(color: Colors.red),
              ),
              onTap: () {
                _showLogoutDialog(context);
              },
            ),
            const SizedBox(height: 20),

            // Version
            Text(
              'KuponGo v1.0.0',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAchievement(String emoji, String title, String description, bool unlocked) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: unlocked ? Colors.amber.withOpacity(0.2) : Colors.grey.withOpacity(0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                emoji,
                style: TextStyle(
                  fontSize: 24,
                  opacity: unlocked ? 1.0 : 0.3,
                ),
              ),
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: unlocked ? Colors.black : Colors.grey,
                  ),
                ),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          if (unlocked)
            const Icon(Icons.check_circle, color: Colors.green)
          else
            const Icon(Icons.lock_outline, color: Colors.grey),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Выйти из аккаунта?'),
        content: const Text('Вы уверены что хотите выйти?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, '/login');
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('Выйти'),
          ),
        ],
      ),
    );
  }
}
