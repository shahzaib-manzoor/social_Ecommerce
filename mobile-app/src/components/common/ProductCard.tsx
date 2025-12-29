import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../../types';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onLike?: () => void;
  showLikeButton?: boolean;
  isLiked?: boolean;
  compact?: boolean;
  onWishlistToggle?: () => void;
  isInWishlist?: boolean;
  showWishlistButton?: boolean;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);

  for (let i = 0; i < 5; i++) {
    stars.push(
      <Text key={i} style={styles.star}>
        {i < fullStars ? '★' : '☆'}
      </Text>
    );
  }

  return <View style={styles.ratingContainer}>{stars}</View>;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onLike,
  showLikeButton = true,
  isLiked = false,
  compact = false,
  onWishlistToggle,
  isInWishlist = false,
  showWishlistButton = true,
}) => {
  const rating = product.rating || 7.5;

  return (
    <TouchableOpacity style={[styles.card, compact && styles.cardCompact]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.images[0] }}
          style={[styles.image, compact && styles.imageCompact]}
          resizeMode="cover"
        />
        {showWishlistButton && onWishlistToggle && (
          <TouchableOpacity onPress={onWishlistToggle} style={styles.heartButton}>
            <Text style={styles.heartIcon}>
              {isInWishlist ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.price}>Rs {product.price}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={rating} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCompact: {
    width: '100%',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundSecondary,
  },
  imageCompact: {
    height: 150,
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  heartIcon: {
    fontSize: 18,
  },
  content: {
    padding: spacing.sm,
  },
  price: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginRight: spacing.xs,
  },
  star: {
    color: '#FFA500',
    fontSize: 12,
  },
  ratingText: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  title: {
    ...typography.small,
    color: colors.text,
  },
});
