import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchProducts, likeProduct, clearProducts } from '../store/slices/productsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { ProductCard } from '../components/common/ProductCard';
import { CategoryCard } from '../components/common/CategoryCard';
import { HeroBanner } from '../components/common/HeroBanner';
import { Header } from '../components/common/Header';
import { colors, spacing, typography } from '../theme';

// Mock data for hero banner
const BANNER_ITEMS = [
  { id: '1', imageUrl: 'https://via.placeholder.com/800x400/4DB8AC/FFFFFF?text=Welcome+to+Our+Store' },
  { id: '2', imageUrl: 'https://via.placeholder.com/800x400/4DB8AC/FFFFFF?text=New+Arrivals' },
  { id: '3', imageUrl: 'https://via.placeholder.com/800x400/4DB8AC/FFFFFF?text=Special+Offers' },
];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const { categories, isLoading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = () => {
    dispatch(fetchProducts({ page: 1, limit: 20 }));
  };

  const loadCategories = () => {
    dispatch(fetchCategories());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    dispatch(clearProducts());
    await dispatch(fetchProducts({ page: 1, limit: 20 }));
    await dispatch(fetchCategories());
    setRefreshing(false);
  };

  const handleLike = (productId: string) => {
    dispatch(likeProduct(productId));
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    // Navigate to products filtered by category
    navigation.navigate('Products', { category: categoryName });
  };

  const handleMenuPress = () => {
    // Open drawer or menu
    console.log('Menu pressed');
  };

  const handleSearchPress = () => {
    // Navigate to search screen
    navigation.navigate('Search');
  };

  if ((isLoading || categoriesLoading) && products.length === 0) {
    return (
      <View style={styles.container}>
        <Header onMenuPress={handleMenuPress} onSearchPress={handleSearchPress} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const topProducts = products.slice(0, 4);

  return (
    <View style={styles.container}>
      <Header onMenuPress={handleMenuPress} onSearchPress={handleSearchPress} />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {/* Hero Banner */}
        <HeroBanner items={BANNER_ITEMS} />

      {/* Categories Section */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAll}>See All  ›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                title={category.name}
                imageUrl={category.image}
                onPress={() => handleCategoryPress(category._id, category.name)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Top Products Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={styles.seeAll}>See All  ›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {topProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onPress={() => navigation.navigate('ProductDetail', { productId: product._id })}
              onLike={() => handleLike(product._id)}
              isLiked={user ? product.likes.includes(user._id) : false}
              compact
            />
          ))}
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
    backgroundColor: colors.backgroundSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  seeAll: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
});
