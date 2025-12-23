import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Header } from '../components/common/Header';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { colors, spacing, typography } from '../theme';
import { api } from '../services/api';

interface WishlistCategory {
  id: string;
  name: string;
  products: WishlistProduct[];
}

interface WishlistProduct {
  _id: string;
  title: string;
  image: string;
  price: number;
  seller: {
    _id: string;
    username: string;
    avatar?: string;
  };
}

export const WishlistScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [wishlists, setWishlists] = useState<WishlistCategory[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockWishlists: WishlistCategory[] = [
        {
          id: '1',
          name: 'Chocolate',
          products: [
            {
              _id: '1',
              title: 'iPhone 13',
              image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Phone',
              price: 999,
              seller: { _id: '1', username: 'John', avatar: '' },
            },
          ],
        },
        {
          id: '2',
          name: 'Drinks',
          products: [
            {
              _id: '2',
              title: 'Laptop',
              image: 'https://via.placeholder.com/150/000000/FFFFFF?text=Laptop',
              price: 1299,
              seller: { _id: '2', username: 'Sarah', avatar: '' },
            },
          ],
        },
        {
          id: '3',
          name: 'Ice Cream',
          products: [
            {
              _id: '3',
              title: 'Tablet',
              image: 'https://via.placeholder.com/150/666666/FFFFFF?text=Tablet',
              price: 599,
              seller: { _id: '3', username: 'Mike', avatar: '' },
            },
          ],
        },
        {
          id: '4',
          name: 'Snacks',
          products: [
            {
              _id: '4',
              title: 'Headphones',
              image: 'https://via.placeholder.com/150/CCCCCC/000000?text=Audio',
              price: 299,
              seller: { _id: '4', username: 'Lisa', avatar: '' },
            },
          ],
        },
      ];

      setWishlists(mockWishlists);

      // Mock friends data
      const mockFriends = [
        { _id: '1', username: 'Anna', avatar: '' },
        { _id: '2', username: 'Bob', avatar: '' },
        { _id: '3', username: 'Carol', avatar: '' },
        { _id: '4', username: 'David', avatar: '' },
      ];
      setFriends(mockFriends);
    } catch (error) {
      console.error('Failed to load wishlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWishlists();
    setRefreshing(false);
  };

  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleShowAll = () => {
    console.log('Show all wishlists');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header onMenuPress={handleMenuPress} onSearchPress={handleSearchPress} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onMenuPress={handleMenuPress} onSearchPress={handleSearchPress} />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Wishlists</Text>

          {/* Wishlist Grid */}
          <View style={styles.wishlistGrid}>
            {wishlists.map((category) => (
              <View key={category.id} style={styles.categoryContainer}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.categoryProducts}>
                  {category.products.map((product) => (
                    <TouchableOpacity
                      key={product._id}
                      style={styles.productCard}
                      onPress={() => handleProductPress(product._id)}
                    >
                      <Image source={{ uri: product.image }} style={styles.productImage} />
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Seller Avatar */}
                <View style={styles.sellerAvatar}>
                  {category.products[0]?.seller && (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {category.products[0].seller.username[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Show All Button */}
          <TouchableOpacity style={styles.showAllButton} onPress={handleShowAll}>
            <Text style={styles.showAllText}>Show All</Text>
          </TouchableOpacity>

          {/* Friends Section */}
          <View style={styles.friendsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {friends.map((friend) => (
                <TouchableOpacity key={friend._id} style={styles.friendAvatar}>
                  <View style={styles.friendAvatarCircle}>
                    <Text style={styles.friendAvatarText}>{friend.username[0].toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
  },
  pageTitle: {
    ...typography.h2,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  wishlistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  categoryContainer: {
    width: '48%',
    marginBottom: spacing.lg,
  },
  categoryName: {
    ...typography.small,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  categoryProducts: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
    minHeight: 100,
    marginBottom: spacing.xs,
  },
  productCard: {
    marginBottom: spacing.xs,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  sellerAvatar: {
    alignItems: 'flex-start',
    marginTop: spacing.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: 'bold',
  },
  showAllButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  showAllText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
  friendsSection: {
    marginTop: spacing.md,
  },
  friendAvatar: {
    marginRight: spacing.md,
  },
  friendAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  friendAvatarText: {
    color: colors.textInverse,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
