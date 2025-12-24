import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { addToCart } from '../store/slices/cartSlice';
import { likeProduct } from '../store/slices/productsSlice';
import { colors, spacing, typography } from '../theme';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  likes: string[];
  seller: {
    _id: string;
    username: string;
  };
  rating?: number;
  reviews?: Review[];
  createdAt: string;
}

export const ProductDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      const productData = await apiService.getProduct(productId);
      setProduct(productData);
      setIsLiked(user ? productData.likes.includes(user._id) : false);

      // Check if in wishlist
      if (user) {
        try {
          const inWishlist = await apiService.checkInWishlist(productId);
          setIsInWishlist(inWishlist);
        } catch (err) {
          console.error('Failed to check wishlist status:', err);
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId, user]);

  // Reload product when screen comes into focus (e.g., after submitting a review)
  useFocusEffect(
    useCallback(() => {
      loadProduct();
    }, [loadProduct])
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentImageIndex(index);
  };

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ productId: product._id, quantity: 1 }));
      // TODO: Show success toast notification
    }
  };

  const handleLike = () => {
    if (product) {
      dispatch(likeProduct(product._id));
      setIsLiked(!isLiked);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share product');
  };

  const handleWriteReview = () => {
    if (!user) {
      // TODO: Show login prompt
      alert('Please login to write a review');
      return;
    }
    // Navigate to write review screen
    navigation.navigate('WriteReview', { productId: product?._id, productTitle: product?.title });
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add products to your wishlist');
      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);
      if (isInWishlist) {
        await apiService.removeFromWishlist(productId);
        setIsInWishlist(false);
        Alert.alert('Removed', 'Product removed from wishlist');
      } else {
        await apiService.addToWishlist(productId);
        setIsInWishlist(true);
        Alert.alert('Added', 'Product added to wishlist');
      }
    } catch (error: any) {
      console.error('Failed to toggle wishlist:', error);
      Alert.alert('Error', error.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loading}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const averageRating = product.rating || 4.6;
  const reviewCount = product.reviews?.length || 86;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Product</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-social-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddToCart} style={styles.headerButton}>
            <Ionicons name="cart-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.productImage} resizeMode="contain" />
            ))}
          </ScrollView>
          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>
              {currentImageIndex + 1}/{product.images.length} Images
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.price}>Rs {product.price}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingLeft}>
              <Ionicons name="star" size={16} color="#FFA500" />
              <Text style={styles.ratingText}>{averageRating}</Text>
              <Text style={styles.reviewCount}>{reviewCount} Reviews</Text>
            </View>
            <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
              <Text style={styles.writeReviewText}>Write a Review</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description Product</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>Review ({reviewCount})</Text>
              <View style={styles.reviewRating}>
                <Ionicons name="star" size={16} color="#FFA500" />
                <Text style={styles.reviewRatingText}>{averageRating}</Text>
              </View>
            </View>

            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.slice(0, 3).map((review) => (
                <View key={review._id} style={styles.reviewItem}>
                  <TouchableOpacity
                    style={styles.reviewUser}
                    onPress={() => navigation.navigate('UserProfile', { userId: review.user._id })}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{review.user.username[0].toUpperCase()}</Text>
                    </View>
                    <View style={styles.reviewUserInfo}>
                      <Text style={styles.reviewUsername}>{review.user.username}</Text>
                      <View style={styles.reviewStars}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={12}
                            color="#FFA500"
                          />
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviews}>No reviews yet. Be the first to review!</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={28}
            color={isLiked ? colors.like : colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleToggleWishlist}
          style={styles.wishlistButton}
          disabled={wishlistLoading}
        >
          {wishlistLoading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons
              name={isInWishlist ? 'bookmark' : 'bookmark-outline'}
              size={28}
              color={isInWishlist ? colors.primary : colors.text}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h4,
    fontWeight: '600',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 350,
    backgroundColor: colors.backgroundSecondary,
  },
  productImage: {
    width: width,
    height: 350,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  imageIndicatorText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: spacing.md,
  },
  productTitle: {
    ...typography.h2,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  reviewCount: {
    ...typography.small,
    color: colors.textSecondary,
  },
  writeReviewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
  },
  writeReviewText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reviewRatingText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  reviewItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  reviewUser: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUsername: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noReviews: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  likeButton: {
    width: 56,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistButton: {
    width: 56,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
});
