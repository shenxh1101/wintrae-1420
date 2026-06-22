import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Button, Picker } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import MaterialCard from '@/components/MaterialCard';
import SearchBar from '@/components/SearchBar';
import type { MaterialFile } from '@/types';
import styles from './index.module.scss';

const MaterialsPage: React.FC = () => {
  const router = useRouter();
  const { projectId: urlProjectId, autoSelect: urlAutoSelect } = router.params;

  const materials = useAppStore((state) => state.materials);
  const projects = useAppStore((state) => state.projects);

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>('all');
  const [showAutoSelectHint, setShowAutoSelectHint] = useState(false);
  const [autoSelectInfo, setAutoSelectInfo] = useState<{ type: string; project: string } | null>(null);

  useDidShow(() => {
    console.log('[MaterialsPage] 页面显示', { urlProjectId, urlAutoSelect });
    if (urlProjectId) {
      const p = projects.find((proj) => proj.id === urlProjectId);
      if (p) {
        setActiveProjectFilter(urlProjectId);
      }
    }
  });

  useEffect(() => {
    if (urlAutoSelect === 'true') {
      const lastMaterial = materials[materials.length - 1];
      if (lastMaterial) {
        setActiveProjectFilter(lastMaterial.projectId);
        setActiveTypeFilter(lastMaterial.type);
        setAutoSelectInfo({
          type: lastMaterial.type,
          project: lastMaterial.projectId
        });
        setShowAutoSelectHint(true);
        const p = projects.find((proj) => proj.id === lastMaterial.projectId);
        setTimeout(() => setShowAutoSelectHint(false), 3000);
      }
    }
  }, [urlAutoSelect, materials, projects]);

  const typeFilters = useMemo(() => [
    { key: 'all', label: '全部类型', icon: '📁' },
    { key: 'reference', label: '参考图', icon: '🖼️' },
    { key: 'work', label: '作品文件', icon: '🎨' },
    { key: 'delivery', label: '交付文件', icon: '✅' }
  ], []);

  const projectFilterOptions = useMemo(() => {
    const options = ['全部项目'];
    projects.forEach((p) => options.push(p.title));
    return options;
  }, [projects]);

  const activeProjectTitle = useMemo(() => {
    if (activeProjectFilter === 'all') return '全部项目';
    const p = projects.find((proj) => proj.id === activeProjectFilter);
    return p ? p.title : '全部项目';
  }, [activeProjectFilter, projects]);

  const filteredMaterials = useMemo(() => {
    let result = [...materials];
    if (activeProjectFilter !== 'all') {
      result = result.filter((m) => m.projectId === activeProjectFilter);
    }
    if (activeTypeFilter !== 'all') {
      result = result.filter((m) => m.type === activeTypeFilter);
    }
    return result;
  }, [materials, activeProjectFilter, activeTypeFilter]);

  const getTypeCount = (key: string) => {
    let m = materials;
    if (activeProjectFilter !== 'all') {
      m = m.filter((mat) => mat.projectId === activeProjectFilter);
    }
    if (key === 'all') return m.length;
    return m.filter((mat) => mat.type === key).length;
  };

  const handleProjectChange = (e: any) => {
    const idx = Number(e.detail.value);
    if (idx === 0) {
      setActiveProjectFilter('all');
    } else {
      const p = projects[idx - 1];
      if (p) {
        setActiveProjectFilter(p.id);
      }
    }
  };

  const getProjectIndex = () => {
    if (activeProjectFilter === 'all') return 0;
    const idx = projects.findIndex((p) => p.id === activeProjectFilter);
    return idx >= 0 ? idx + 1 : 0;
  };

  const handleAddMaterial = () => {
    const params = activeProjectFilter !== 'all' ? `?projectId=${activeProjectFilter}` : '';
    console.log('[MaterialsPage] 上传素材', params);
    Taro.navigateTo({ url: `/pages/material-edit/index${params}` });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>素材文件</Text>
        <Text className={styles.pageSubtitle}>
          管理参考图、作品版本与交付文件
        </Text>
      </View>

      <SearchBar placeholder="搜索素材名称或项目..." />

      <View className={styles.filterRow}>
        <View className={styles.projectFilter}>
          <Picker
            mode="selector"
            range={projectFilterOptions}
            value={getProjectIndex()}
            onChange={handleProjectChange}
          >
            <View className={styles.projectPicker}>
              <Text className={styles.projectPickerText}>
                项目：{activeProjectTitle}
              </Text>
              <Text className={styles.projectPickerArrow}>›</Text>
            </View>
          </Picker>
        </View>
      </View>

      <ScrollView scrollX className={styles.filterTabs}>
        {typeFilters.map((filter) => (
          <View
            key={filter.key}
            className={classnames(styles.filterTab, activeTypeFilter === filter.key && styles.active)}
            onClick={() => setActiveTypeFilter(filter.key)}
          >
            <Text className={styles.tabIcon}>{filter.icon}</Text>
            <Text>{filter.label}</Text>
            <Text className={styles.tabCount}>{getTypeCount(filter.key)}</Text>
          </View>
        ))}
      </ScrollView>

      {showAutoSelectHint && autoSelectInfo && (
        <View className={styles.autoHint}>
          <Text className={styles.autoHintText}>
            已自动筛选到刚添加的素材
          </Text>
        </View>
      )}

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
