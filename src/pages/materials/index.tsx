import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import MaterialCard from '@/components/MaterialCard';
import SearchBar from '@/components/SearchBar';
import type { MaterialFile } from '@/types';
import styles from './index.module.scss';

const MaterialsPage: React.FC = () => {
  const materials = useAppStore((state) => state.materials);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useDidShow(() => {
    console.log('[MaterialsPage] 页面显示');
  });

  const filters = useMemo(() => [
    { key: 'all', label: '全部', icon: '📁' },
    { key: 'reference', label: '参考图', icon: '🖼️' },
    { key: 'work', label: '作品文件', icon: '🎨' },
    { key: 'delivery', label: '交付文件', icon: '✅' }
  ], []);

  const filteredMaterials = useMemo(() => {
    if (activeFilter === 'all') return materials;
    return materials.filter((m: MaterialFile) => m.type === activeFilter);
  }, [materials, activeFilter]);

  const getFilterCount = (key: string) => {
    if (key === 'all') return materials.length;
    return materials.filter((m: MaterialFile) => m.type === key).length;
  };

  const handleAddMaterial = () => {
    console.log('[MaterialsPage] 上传素材');
    Taro.navigateTo({ url: '/pages/material-edit/index' });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>素材文件</Text>
        <Text className={styles.pageSubtitle}>管理参考图、作品版本与交付文件</Text>
      </View>

      <SearchBar placeholder="搜索素材名称或项目..." />

      <ScrollView scrollX className={styles.filterTabs}>
        {filters.map((filter) => (
          <View
            key={filter.key}
            className={classnames(styles.filterTab, activeFilter === filter.key && styles.active)}
            onClick={() => setActiveFilter(filter.key)}
          >
            <Text className={styles.tabIcon}>{filter.icon}</Text>
            <Text>{filter.label}</Text>
            <Text className={styles.tabCount}>{getFilterCount(filter.key)}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.materialsGrid}>
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((material: MaterialFile) => (
            <View key={material.id} className={styles.materialItem}>
              <MaterialCard material={material} />
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🖼️</Text>
            <Text className={styles.emptyText}>暂无素材</Text>
          </View>
        )}
      </ScrollView>

      <Button className={styles.fabButton} onClick={handleAddMaterial}>
        <Text className={styles.fabIcon}>+</Text>
      </Button>
    </View>
  );
};

export default MaterialsPage;
