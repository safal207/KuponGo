import 'package:flutter/material.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({Key? key}) : super(key: key);

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Мои купоны'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Активные'),
            Tab(text: 'Использованные'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildActiveCoupons(),
          _buildUsedCoupons(),
        ],
      ),
    );
  }

  Widget _buildActiveCoupons() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _buildCouponCard(
          'Пицца -40%',
          'Папа Джонс',
          '2д 5ч',
          '500м',
          'epic',
          true,
        ),
        _buildCouponCard(
          'Кофе -25%',
          'Starbucks',
          '18:30',
          '1.2км',
          'rare',
          true,
        ),
        _buildCouponCard(
          'Бургер -10%',
          'McDonald\'s',
          'завтра',
          '3.5км',
          'common',
          true,
        ),
      ],
    );
  }

  Widget _buildUsedCoupons() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _buildCouponCard(
          'Десерт -20%',
          'KFC',
          'Использован',
          '',
          'rare',
          false,
        ),
        _buildCouponCard(
          'Обувь -15%',
          'Nike Store',
          'Использован',
          '',
          'common',
          false,
        ),
      ],
    );
  }

  Widget _buildCouponCard(
    String title,
    String business,
    String expires,
    String distance,
    String rarity,
    bool isActive,
  ) {
    Color rarityColor;
    switch (rarity) {
      case 'common':
        rarityColor = Colors.green;
        break;
      case 'rare':
        rarityColor = Colors.blue;
        break;
      case 'epic':
        rarityColor = Colors.purple;
        break;
      case 'legendary':
        rarityColor = Colors.orange;
        break;
      default:
        rarityColor = Colors.grey;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 15),
      child: Column(
        children: [
          ListTile(
            leading: CircleAvatar(
              backgroundColor: rarityColor.withOpacity(0.2),
              child: Icon(Icons.card_giftcard, color: rarityColor),
            ),
            title: Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(business),
                const SizedBox(height: 5),
                Row(
                  children: [
                    Icon(Icons.timer, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 5),
                    Text('Истекает: $expires'),
                  ],
                ),
                if (distance.isNotEmpty)
                  Row(
                    children: [
                      Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 5),
                      Text(distance),
                    ],
                  ),
              ],
            ),
          ),
          if (isActive)
            Padding(
              padding: const EdgeInsets.all(10),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        // Show directions
                      },
                      icon: const Icon(Icons.directions),
                      label: const Text('Маршрут'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        _showQRCode();
                      },
                      icon: const Icon(Icons.qr_code),
                      label: const Text('Использовать'),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  void _showQRCode() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: Padding(
          padding: const EdgeInsets.all(30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Покажите кассиру',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),

              // QR Code placeholder
              Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Center(
                  child: Icon(
                    Icons.qr_code,
                    size: 200,
                    color: Colors.grey,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'KUPON-ABC12345',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                ),
              ),
              const SizedBox(height: 30),

              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                ),
                child: const Text('Закрыть'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
