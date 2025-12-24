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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/common/Header';
import { useAppSelector } from '../hooks/useAppDispatch';
import { colors, spacing, typography } from '../theme';
import { apiService } from '../services/api';

interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    images: string[];
    price: number;
    category: string;
  };
  owner: {
    _id: string;
    username: string;
    avatar?: string;
  };
  isOwn: boolean;
  sharedWith: any[];
  createdAt: string;
}

export const WishlistScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'own' | 'combined'>('combined'); // Toggle between own and combined view

  useEffect(() => {
    loadWishlist();
  }, [view]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const items = view === 'own'
        ? await apiService.getMyWishlist()
        : await apiService.getCombinedWishlist();

      setWishlistItems(items);
    } catch (error: any) {
      console.error('Failed to load wishlist:', error);
      Alert.alert('Error', error.message || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await apiService.removeFromWishlist(productId);
      Alert.alert('Success', 'Product removed from wishlist');
      loadWishlist();
    } catch (error: any) {
      console.error('Failed to remove from wishlist:', error);
      Alert.alert('Error', error.message || 'Failed to remove from wishlist');
    }
  };

  const handleShareWithFriends = async (productId: string) => {
    navigation.navigate('ShareProduct', { productId, from: 'wishlist' });
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleOwnerPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const ownItems = wishlistItems.filter(item => item.isOwn);
  const friendsItems = wishlistItems.filter(item => !item.isOwn);

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Wishlist</Text>

            {/* View Toggle */}
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, view === 'own' && styles.toggleButtonActive]}
                onPress={() => setView('own')}
              >
                <Text style={[styles.toggleText, view === 'own' && styles.toggleTextActive]}>
                  My Items
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, view === 'combined' && styles.toggleButtonActive]}
                onPress={() => setView('combined')}
              >
                <Text style={[styles.toggleText, view === 'combined' && styles.toggleTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {wishlistItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {view === 'own' ? 'Your wishlist is empty' : 'No wishlist items yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {view === 'own'
                  ? 'Start adding products you love!'
                  : 'Add items or wait for your friends to share theirs'}
              </Text>
            </View>
          ) : (
            <>
              {/* My Items Section */}
              {view === 'combined' && ownItems.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>My Items ({ownItems.length})</Text>
                  <View style={styles.itemsGrid}>
                    {ownItems.map((item) => (
                      <WishlistItemCard
                        key={item._id}
                        item={item}
                        onPress={() => handleProductPress(item.product._id)}
                        onRemove={() => handleRemoveFromWishlist(item.product._id)}
                        onShare={() => handleShareWithFriends(item.product._id)}
                        onOwnerPress={() => {}}
                        isOwn={true}
                      />
                    ))}
                  </View>
                </>
              )}

              {/* Own Items View */}
              {view === 'own' && (
                <View style={styles.itemsGrid}>
                  {ownItems.map((item) => (
                    <WishlistItemCard
                      key={item._id}
                      item={item}
                      onPress={() => handleProductPress(item.product._id)}
                      onRemove={() => handleRemoveFromWishlist(item.product._id)}
                      onShare={() => handleShareWithFriends(item.product._id)}
                      onOwnerPress={() => {}}
                      isOwn={true}
                    />
                  ))}
                </View>
              )}

              {/* Friends' Items Section */}
              {view === 'combined' && friendsItems.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Friends' Items ({friendsItems.length})</Text>
                  <View style={styles.itemsGrid}>
                    {friendsItems.map((item) => (
                      <WishlistItemCard
                        key={item._id}
                        item={item}
                        onPress={() => handleProductPress(item.product._id)}
                        onRemove={() => {}}
                        onShare={() => {}}
                        onOwnerPress={() => handleOwnerPress(item.owner._id)}
                        isOwn={false}
                      />
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Wishlist Item Card Component
const WishlistItemCard: React.FC<{
  item: WishlistItem;
  onPress: () => void;
  onRemove: () => void;
  onShare: () => void;
  onOwnerPress: () => void;
  isOwn: boolean;
}> = ({ item, onPress, onRemove, onShare, onOwnerPress, isOwn }) => {
  return (
    <TouchableOpacity style={styles.itemCard} onPress={onPress}>
      {/* Product Image */}
      <Image
        source={{ uri: item.product.images[0] || 'https://via.placeholder.com/150' }}
        style={styles.itemImage}
      />

      {/* Actions (only for own items) */}
      {isOwn && (
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onShare();
            }}
          >
            <Ionicons name="share-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert(
                'Remove from Wishlist',
                'Are you sure you want to remove this item?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', onPress: onRemove, style: 'destructive' },
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {/* Product Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.product.title}
        </Text>
        <Text style={styles.itemPrice}>${item.product.price.toFixed(2)}</Text>
        <Text style={styles.itemCategory} numberOfLines={1}>
          {item.product.category}
        </Text>
      </View>

      {/* Owner Info (for friends' items) */}
      {!isOwn && (
        <TouchableOpacity style={styles.ownerInfo} onPress={onOwnerPress}>
          {item.owner.avatar ? (
            <Image source={{ uri: item.owner.avatar }} style={styles.ownerAvatar} />
          ) : (
            <View style={styles.ownerAvatarPlaceholder}>
              <Text style={styles.ownerAvatarText}>
                {item.owner.username[0].toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.ownerName} numberOfLines={1}>
            {item.owner.username}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
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
  header: {
    marginBottom: spacing.lg,
  },
  pageTitle: {
    ...typography.h2,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.textInverse,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: 150,
    backgroundColor: colors.backgroundSecondary,
  },
  itemActions: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemInfo: {
    padding: spacing.sm,
  },
  itemTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...typography.h3,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  itemCategory: {
    ...typography.small,
    color: colors.textSecondary,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingTop: 0,
    gap: spacing.xs,
  },
  ownerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  ownerAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerAvatarText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
  ownerName: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
