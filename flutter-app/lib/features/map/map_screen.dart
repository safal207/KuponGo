import 'package:flutter/material.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({Key? key}) : super(key: key);

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Карта купонов'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              _showFilterDialog();
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // Google Maps will be here
          Container(
            color: Colors.grey[300],
            child: const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map, size: 80, color: Colors.grey),
                  SizedBox(height: 20),
                  Text(
                    'Google Maps',
                    style: TextStyle(
                      fontSize: 24,
                      color: Colors.grey,
                    ),
                  ),
                  SizedBox(height: 10),
                  Text(
                    'Карта с маркерами купонов',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom sheet with nearby coupons
          DraggableScrollableSheet(
            initialChildSize: 0.3,
            minChildSize: 0.15,
            maxChildSize: 0.8,
            builder: (context, scrollController) {
              return Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(20),
                    topRight: Radius.circular(20),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Handle
                    Container(
                      margin: const EdgeInsets.symmetric(vertical: 10),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Купоны рядом',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green,
                              borderRadius: BorderRadius.circular(15),
                            ),
                            child: const Text(
                              '12',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Coupons list
                    Expanded(
                      child: ListView.builder(
                        controller: scrollController,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: 10,
                        itemBuilder: (context, index) {
                          return _buildCouponListItem(index);
                        },
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

          // Center on user button
          Positioned(
            bottom: 380,
            right: 20,
            child: FloatingActionButton(
              onPressed: () {
                // Center map on user location
              },
              mini: true,
              child: const Icon(Icons.my_location),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCouponListItem(int index) {
    final coupons = [
      {'title': 'Кофе -25%', 'business': 'Starbucks', 'distance': '125м', 'rarity': 'rare'},
      {'title': 'Пицца -40%', 'business': 'Папа Джонс', 'distance': '340м', 'rarity': 'epic'},
      {'title': 'Одежда -30%', 'business': 'H&M', 'distance': '580м', 'rarity': 'rare'},
    ];

    final coupon = coupons[index % coupons.length];
    Color rarityColor = coupon['rarity'] == 'epic' ? Colors.purple : Colors.blue;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: rarityColor.withOpacity(0.2),
          child: Icon(Icons.card_giftcard, color: rarityColor),
        ),
        title: Text(
          coupon['title']!,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(coupon['business']!),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.directions_walk, color: rarityColor, size: 20),
            Text(coupon['distance']!),
          ],
        ),
        onTap: () {
          Navigator.pushNamed(context, '/ar');
        },
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Фильтры'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CheckboxListTile(
              title: const Text('Common'),
              value: true,
              onChanged: (value) {},
            ),
            CheckboxListTile(
              title: const Text('Rare'),
              value: true,
              onChanged: (value) {},
            ),
            CheckboxListTile(
              title: const Text('Epic'),
              value: true,
              onChanged: (value) {},
            ),
            CheckboxListTile(
              title: const Text('Legendary'),
              value: false,
              onChanged: (value) {},
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Применить'),
          ),
        ],
      ),
    );
  }
}
