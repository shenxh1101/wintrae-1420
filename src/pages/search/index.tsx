import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import ClientCard from '@/components/ClientCard';
import ProjectCard from '@/components/ProjectCard';
import QuoteCard from '@/components/QuoteCard';
import type { Client, Project, Quote } from '@/types';
import styles from './index.module.scss';

const SearchPage: React.FC = () => {
  const router = useRouter();
  const initialKeyword = (router.params.keyword as string) || '';
  const [keyword, setKeyword] = useState(initialKeyword);
  const searchAll = useAppStore((state) => state.searchAll);

  const searchResults = useMemo(() => {
    if (!keyword.trim()) return { clients: [], projects: [], quotes: [] };
    return searchAll(keyword);
  }, [keyword, searchAll]);

  useDidShow(() => {
    console.log('[SearchPage] 页面显示，搜索关键词:', keyword);
  });

  const hasResults = searchResults.clients.length > 0 || searchResults.projects.length > 0 || searchResults.quotes.length > 0;

  return (
    <View className={styles.pageContainer}>
      <View className={styles.searchHeader}>
        <View className={styles.searchInputWrap}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索客户、项目、报价..."
            placeholderClass={styles.placeholder}
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            confirmType="search"
            focus
          />
          {keyword && (
            <Text className={styles.clearIcon} onClick={() => setKeyword('')}>✕</Text>
          )}
        </View>
      </View>

      {hasResults ? (
        <ScrollView scrollY>
          {searchResults.clients.length > 0 && (
            <View className={styles.searchSection}>
              <Text className={styles.sectionTitle}>
                客户
                <Text className={styles.sectionCount}>{searchResults.clients.length}</Text>
              </Text>
              {searchResults.clients.map((client: Client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => Taro.navigateTo({ url: `/pages/client-detail/index?id=${client.id}` })}
                />
              ))}
            </View>
          )}

          {searchResults.projects.length > 0 && (
            <View className={styles.searchSection}>
              <Text className={styles.sectionTitle}>
                项目
                <Text className={styles.sectionCount}>{searchResults.projects.length}</Text>
              </Text>
              {searchResults.projects.map((project: Project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => Taro.navigateTo({ url: `/pages/project-detail/index?id=${project.id}` })}
                />
              ))}
            </View>
          )}

          {searchResults.quotes.length > 0 && (
            <View className={styles.searchSection}>
              <Text className={styles.sectionTitle}>
                报价
                <Text className={styles.sectionCount}>{searchResults.quotes.length}</Text>
              </Text>
              {searchResults.quotes.map((quote: Quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onClick={() => Taro.navigateTo({ url: `/pages/quote-detail/index?id=${quote.id}` })}
                />
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View className={styles.placeholderContainer}>
          <Text className={styles.placeholderIcon}>🔍</Text>
          <Text className={styles.placeholderText}>
            {keyword ? '未找到相关结果' : '输入关键词开始搜索'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default SearchPage;
