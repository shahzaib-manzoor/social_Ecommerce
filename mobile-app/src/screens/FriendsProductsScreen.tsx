import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchFriendsProducts, likeProduct } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { colors } from '../theme';

export const FriendsProductsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { friendsProducts, isLoading } = useAppSelector((state) => state.products);
  const currentUserId = useAppSelector((state) => state.auth.user?._id);

  useEffect(() => {
    loadFriendsProducts();
  }, []);

  const loadFriendsProducts = () => {
    dispatch(fetchFriendsProducts());
  };

  const handleLike = (productId: string) => {
    dispatch(likeProduct(productId));
  };

  const handleAddToCart = (productId: string) => {
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  const isLikedByMe = (product: any) => {
    return product.likedBy?.includes(currentUserId);
  };

  const renderProduct = ({ item }: any) => {
    const likedByMe = isLikedByMe(item);

    return (
      <View style={styles.productCard}>
        {/* Product Image */}
        {item.images?.[0] ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productCategory}>{item.category}</Text>

          {/* Price and Likes */}
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            <View style={styles.likesContainer}>
              <TouchableOpacity onPress={() => handleLike(item._id)}>
                <Text style={styles.likeIcon}>{likedByMe ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <Text style={styles.likesCount}>{item.likedBy?.length || 0}</Text>
            </View>
          </View>

          {/* Liked by friends info */}
          {item.likedByFriends?.length > 0 && (
            <View style={styles.friendsLiked}>
              <Text style={styles.friendsLikedText}>
                👥 {item.likedByFriends.slice(0, 2).join(', ')}
                {item.likedByFriends.length > 2 &&
                  ` +${item.likedByFriends.length - 2} more`}{' '}
                liked this
              </Text>
            </View>
          )}

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item._id)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Products Yet</Text>
      <Text style={styles.emptyText}>
        Products liked by your friends will appear here.{'\n\n'}
        Add friends and like products to see recommendations!
      </Text>
    </View>
  );

  if (isLoading && friendsProducts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={friendsProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        numColumns={2}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadFriendsProducts}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={
          friendsProducts.length === 0 ? styles.emptyList : styles.listContent
        }
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: colors.lightGray,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.darkGray,
    fontSize: 14,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    minHeight: 40,
  },
  productCategory: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeIcon: {
    fontSize: 20,
  },
  likesCount: {
    fontSize: 13,
    color: colors.darkGray,
  },
  friendsLiked: {
    backgroundColor: colors.lightGreen,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  friendsLikedText: {
    fontSize: 11,
    color: colors.primary,
  },
  addToCartButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyList: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    lineHeight: 22,
  },
});
