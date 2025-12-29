import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchProducts, likeProduct } from '../store/slices/productsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { ProductCard } from '../components/common/ProductCard';
import { colors, spacing, typography } from '../theme';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

interface AllProductsScreenProps {
  navigation: any;
  route: any;
}

export const AllProductsScreen: React.FC<AllProductsScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { products, isLoading, hasMore } = useAppSelector((state) => state.products);
  const { categories, isLoading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { user } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    route.params?.category || null
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({});

  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Load categories on mount
    dispatch(fetchCategories());
    loadWishlistStatus();
  }, []);

  useEffect(() => {
    // Reset and load products when category changes
    setPage(1);
    loadProducts(1, true);
  }, [selectedCategory]);

  const loadWishlistStatus = async () => {
    if (!user) return;

    try {
      const wishlist = await apiService.getMyWishlist();
      const statusMap: Record<string, boolean> = {};
      wishlist.forEach((item: any) => {
        statusMap[item.product._id] = true;
      });
      setWishlistStatus(statusMap);
    } catch (error) {
      console.error('Failed to load wishlist status:', error);
    }
  };

  const loadProducts = async (pageNum: number, reset: boolean = false) => {
    if (reset) {
      setLoadingMore(false);
    }

    const params: any = { page: pageNum, limit: 20 };
    if (selectedCategory) {
      params.category = selectedCategory;
    }

    await dispatch(fetchProducts(params));
  };

  const handleLoadMore = () => {
    if (!loadingMore && !isLoading && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage, false).finally(() => setLoadingMore(false));
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const handleLike = (productId: string) => {
    dispatch(likeProduct(productId));
  };

  const handleWishlistToggle = async (productId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add items to your wishlist');
      return;
    }

    const isCurrentlyInWishlist = wishlistStatus[productId];

    try {
      if (isCurrentlyInWishlist) {
        await apiService.removeFromWishlist(productId);
        setWishlistStatus(prev => ({ ...prev, [productId]: false }));
        Alert.alert('Removed', 'Product removed from wishlist');
      } else {
        await apiService.addToWishlist(productId);
        setWishlistStatus(prev => ({ ...prev, [productId]: true }));
        Alert.alert('Added', 'Product added to wishlist');
      }
    } catch (error: any) {
      console.error('Wishlist toggle error:', error);
      Alert.alert('Error', error.message || 'Failed to update wishlist');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>All Products</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderCategoryFilters = () => (
    <View style={styles.filtersSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        <TouchableOpacity
          style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.filterText, !selectedCategory && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category._id}
            style={[
              styles.filterChip,
              selectedCategory === category.name && styles.filterChipActive,
            ]}
            onPress={() => handleCategoryPress(category.name)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === category.name && styles.filterTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productWrapper}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
        onWishlistToggle={() => handleWishlistToggle(item._id)}
        isInWishlist={wishlistStatus[item._id] || false}
        compact
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No products found</Text>
      {selectedCategory && (
        <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderCategoryFilters()}
      {isLoading && page === 1 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  filtersSection: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.textInverse,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  productWrapper: {
    width: (width - spacing.md * 3) / 2,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  clearButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  clearButtonText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
});
