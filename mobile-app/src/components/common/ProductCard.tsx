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
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onLike,
  showLikeButton = true,
  isLiked = false,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: product.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <Text style={styles.category}>{product.category}</Text>

        {showLikeButton && onLike && (
          <TouchableOpacity onPress={onLike} style={styles.likeButton}>
            <Text style={styles.likeText}>
              {isLiked ? '❤️' : '🤍'} {product.likes.length > 0 && product.likes.length}
            </Text>
          </TouchableOpacity>
        )}
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
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.small,
    color: colors.textSecondary,
  },
  likeButton: {
    marginTop: spacing.sm,
  },
  likeText: {
    fontSize: 16,
  },
});
