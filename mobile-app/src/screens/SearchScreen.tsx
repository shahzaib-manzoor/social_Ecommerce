import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '../components/common/ProductCard';
import { colors, spacing, typography } from '../theme';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  likes: string[];
  rating?: number;
}

export const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors', 'Books', 'Toys', 'Beauty'];

  // Auto-search when query changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else if (selectedCategory !== 'All') {
        handleCategoryFilter(selectedCategory);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim() && selectedCategory === 'All') {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (searchQuery.trim()) {
        // Use semantic search with hybrid mode (combines semantic + keyword)
        const category = selectedCategory !== 'All' ? selectedCategory : undefined;
        const response = await apiService.searchProducts(searchQuery, 'hybrid', 50);

        // Filter by category if selected
        let filteredResults = response.products || [];
        if (category) {
          filteredResults = filteredResults.filter(p => p.category === category);
        }

        setResults(filteredResults);
      } else {
        // Just category filter
        const response = await apiService.getProducts(1, 50, selectedCategory);
        setResults(response.products || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to search products. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category);

    if (category === 'All') {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (searchQuery.trim()) {
        // Search with category filter
        const response = await apiService.searchProducts(searchQuery, 'hybrid', 50);
        const filteredResults = (response.products || []).filter(p => p.category === category);
        setResults(filteredResults);
      } else {
        // Just get products by category
        const response = await apiService.getProducts(1, 50, category);
        setResults(response.products || []);
      }
    } catch (error) {
      console.error('Category filter failed:', error);
      setError('Failed to load products. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <View style={styles.productWrapper}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
        compact
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryFilter(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      {!isLoading && results.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {results.length} {results.length === 1 ? 'product' : 'products'} found
          </Text>
          {searchQuery && (
            <Text style={styles.searchQuery}>for "{searchQuery}"</Text>
          )}
        </View>
      )}

      {/* Results */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      ) : searchQuery || selectedCategory !== 'All' ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? 'Try different keywords or browse categories'
              : 'No products in this category yet'}
          </Text>
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Start Searching</Text>
          <Text style={styles.emptySubtext}>Enter keywords or select a category</Text>
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Try searching for:</Text>
            <View style={styles.suggestions}>
              {['laptop', 'phone', 'jacket', 'shoes'].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => setSearchQuery(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    ...typography.body,
    color: colors.text,
    fontSize: 15,
  },
  clearButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  categoryChipTextActive: {
    color: colors.textInverse,
  },
  resultsHeader: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultsCount: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  searchQuery: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
  resultsContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  productWrapper: {
    flex: 1,
    maxWidth: '48.5%',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  suggestionsTitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontSize: 12,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '500',
    fontSize: 13,
  },
});
