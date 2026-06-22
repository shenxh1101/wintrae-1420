import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import ProjectCard from '@/components/ProjectCard';
import SearchBar from '@/components/SearchBar';
import type { Project } from '@/types';
import styles from './index.module.scss';

const ProjectsPage: React.FC = () => {
  const projects = useAppStore((state) => state.projects);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useDidShow(() => {
    console.log('[ProjectsPage] 页面显示');
  });

  const filters = useMemo(() => [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待开始' },
    { key: 'draft', label: '草稿' },
    { key: 'lineart', label: '线稿' },
    { key: 'coloring', label: '上色' },
    { key: 'revision', label: '修改' },
    { key: 'delivered', label: '已交付' }
  ], []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter((p: Project) => p.status === activeFilter);
  }, [projects, activeFilter]);

  const getFilterCount = (key: string) => {
    if (key === 'all') return projects.length;
    return projects.filter((p: Project) => p.status === key).length;
  };

  const handleAddProject = () => {
    console.log('[ProjectsPage] 新建项目');
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>项目进度</Text>
        <Text className={styles.pageSubtitle}>管理你的约稿项目全流程</Text>
      </View>

      <SearchBar placeholder="搜索项目名称或客户..." />

      <ScrollView scrollX className={styles.filterTabs}>
        {filters.map((filter) => (
          <View
            key={filter.key}
            className={classnames(styles.filterTab, activeFilter === filter.key && styles.active)}
            onClick={() => setActiveFilter(filter.key)}
          >
            <Text>{filter.label}</Text>
            <Text className={styles.tabCount}>{getFilterCount(filter.key)}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.projectsList}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project: Project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无项目</Text>
          </View>
        )}
      </ScrollView>

      <Button className={styles.fabButton} onClick={handleAddProject}>
        <Text className={styles.fabIcon}>+</Text>
      </Button>
    </View>
  );
};

export default ProjectsPage;
