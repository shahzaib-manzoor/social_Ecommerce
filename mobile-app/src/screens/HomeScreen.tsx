import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchProducts, likeProduct, clearProducts } from '../store/slices/productsSlice';
import { ProductCard } from '../components/common/ProductCard';
import { colors, spacing } from '../theme';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { products, isLoading, hasMore, page } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    dispatch(fetchProducts({ page: 1, limit: 20 }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    dispatch(clearProducts());
    await dispatch(fetchProducts({ page: 1, limit: 20 }));
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      dispatch(fetchProducts({ page: page + 1, limit: 20 }));
    }
  };

  const handleLike = (productId: string) => {
    dispatch(likeProduct(productId));
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
            onLike={() => handleLike(item._id)}
            isLiked={user ? item.likes.includes(user._id) : false}
          />
        )}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  list: {
    padding: spacing.md,
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});
