import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchConversations } from '../store/slices/messagesSlice';
import { colors } from '../theme';

export const MessagesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { conversations, isLoading } = useAppSelector((state) => state.messages);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    dispatch(fetchConversations());
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  const renderConversation = ({ item }: any) => {
    const otherUser = item.participants?.[0];
    const lastMessage = item.lastMessage;
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity style={styles.conversationItem}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {otherUser?.username?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          {hasUnread && <View style={styles.unreadBadge} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.username, hasUnread && styles.boldText]}>
              {otherUser?.username || 'Unknown'}
            </Text>
            {lastMessage && (
              <Text style={styles.timestamp}>
                {formatTime(lastMessage.createdAt)}
              </Text>
            )}
          </View>

          <Text
            style={[styles.lastMessage, hasUnread && styles.boldText]}
            numberOfLines={1}
          >
            {lastMessage?.content || 'No messages yet'}
          </Text>

          {hasUnread && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Messages</Text>
      <Text style={styles.emptyText}>
        Start a conversation with your friends to see messages here
      </Text>
    </View>
  );

  if (isLoading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderConversation}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadConversations}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={
          conversations.length === 0 ? styles.emptyList : undefined
        }
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
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.white,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: colors.text,
  },
  boldText: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: colors.darkGray,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 2,
  },
  unreadCountBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCountText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});
