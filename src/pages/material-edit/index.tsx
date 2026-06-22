import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Picker, Image } from '@tarojs/components';
import { useRouter, useDidShow, Taro } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import type { MaterialFile } from '@/types';
import { generateId } from '@/utils';
import styles from './index.module.scss';

type MaterialType = 'reference' | 'work' | 'delivery';

const TYPE_LABEL_MAP: Record<MaterialType, string> = {
  reference: '参考图',
  work: '作品文件',
  delivery: '交付文件'
};

const TYPE_OPTIONS: { key: MaterialType; label: string; icon: string }[] = [
  { key: 'reference', label: '参考图', icon: '🖼️' },
  { key: 'work', label: '作品文件', icon: '🎨' },
  { key: 'delivery', label: '交付文件', icon: '✅' }
];

const getRandomPicsumUrl = (): string => {
  const id = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/id/${id}/750/500`;
};

const MaterialEditPage: React.FC = () => {
  const router = useRouter();
  const { id, projectId, milestoneId } = router.params;

  const projects = useAppStore((state) => state.projects);
  const addMaterial = useAppStore((state) => state.addMaterial);
  const updateMaterial = useAppStore((state) => state.updateMaterial);
  const attachMaterialToMilestone = useAppStore((state) => state.attachMaterialToMilestone);
  const materials = useAppStore((state) => state.materials);

  const isEditMode = !!id;

  const existingMaterial = useMemo(() => {
    if (!id) return null;
    return materials.find((m) => m.id === id) || null;
  }, [id, materials]);

  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number>(() => {
    if (existingMaterial) {
      const idx = projects.findIndex((p) => p.id === existingMaterial.projectId);
      return idx >= 0 ? idx : 0;
    }
    if (projectId) {
      const idx = projects.findIndex((p) => p.id === projectId);
      return idx >= 0 ? idx : 0;
    }
    return projects.length > 0 ? 0 : -1;
  });

  const selectedProject = useMemo(() => {
    if (selectedProjectIndex >= 0 && selectedProjectIndex < projects.length) {
      return projects[selectedProjectIndex];
    }
    return null;
  }, [selectedProjectIndex, projects]);

  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number>(() => {
    if (!selectedProject) return -1;
    if (milestoneId) {
      const idx = selectedProject.milestones.findIndex((m) => m.id === milestoneId);
      return idx >= 0 ? idx : -1;
    }
    if (selectedProject && selectedProject.currentMilestone !== undefined) {
      return selectedProject.currentMilestone;
    }
    return -1;
  });

  const [type, setType] = useState<MaterialType>(existingMaterial?.type || 'reference');
  const [name, setName] = useState<string>(existingMaterial?.name || '');
  const [url, setUrl] = useState<string>(existingMaterial?.url || getRandomPicsumUrl());
  const [version, setVersion] = useState<string>(existingMaterial?.version || 'v1.0');
  const [revisionMark, setRevisionMark] = useState<string>(existingMaterial?.revisionMark || '');
  const [description, setDescription] = useState<string>(existingMaterial?.description || '');

  const projectPickerRange = useMemo(() => projects.map((p) => p.title), [projects]);
  const milestonePickerRange = useMemo(() => {
    if (!selectedProject) return [];
    return selectedProject.milestones.map((m) => m.name);
  }, [selectedProject]);

  const selectedMilestone = useMemo(() => {
    if (!selectedProject) return null;
    if (selectedMilestoneIndex >= 0 && selectedMilestoneIndex < selectedProject.milestones.length) {
      return selectedProject.milestones[selectedMilestoneIndex];
    }
    return null;
  }, [selectedProject, selectedMilestoneIndex]);

  useDidShow(() => {
    console.log('[MaterialEditPage] 页面显示', { id, projectId, isEditMode });
  });

  useEffect(() => {
    if (selectedProject) {
      if (milestoneId) {
        const idx = selectedProject.milestones.findIndex((m) => m.id === milestoneId);
        setSelectedMilestoneIndex(idx >= 0 ? idx : (selectedProject.currentMilestone || 0));
      } else if (selectedMilestoneIndex === -1 || selectedMilestoneIndex >= selectedProject.milestones.length) {
        setSelectedMilestoneIndex(selectedProject.currentMilestone || 0);
      }
    } else {
      setSelectedMilestoneIndex(-1);
    }
  }, [selectedProject, milestoneId]);

  const handleRandomImage = () => {
    setUrl(getRandomPicsumUrl());
  };

  const handleSubmit = () => {
    if (!selectedProject) {
      Taro.showToast({ title: '请选择关联项目', icon: 'none' });
      return;
    }
    if (!name.trim()) {
      Taro.showToast({ title: '请输入素材名称', icon: 'none' });
      return;
    }
    if (!version.trim()) {
      Taro.showToast({ title: '请输入版本号', icon: 'none' });
      return;
    }

    const materialData: MaterialFile = {
      id: existingMaterial?.id || generateId(),
      projectId: selectedProject.id,
      projectTitle: selectedProject.title,
      type,
      typeLabel: TYPE_LABEL_MAP[type],
      name: name.trim(),
      url: url.trim() || getRandomPicsumUrl(),
      version: version.trim(),
      revisionMark: revisionMark.trim() || undefined,
      description: description.trim(),
      createdAt: existingMaterial?.createdAt || new Date().toISOString()
    };

    if (isEditMode && existingMaterial) {
      updateMaterial(existingMaterial.id, materialData);
    } else {
      addMaterial(materialData);
      if (selectedMilestone) {
        attachMaterialToMilestone(selectedProject.id, selectedMilestone.id, materialData.id);
      }
    }

    Taro.showToast({
      title: isEditMode ? '修改成功' : '保存成功',
      icon: 'success'
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 800);
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>
            {isEditMode ? '编辑素材' : '新建素材'}
          </Text>
        </View>
        <View className={styles.cardBody}>
          <View className={styles.imagePreviewSection}>
            <Text className={styles.imagePreviewLabel}>图片预览</Text>
            <View className={styles.imagePreviewWrap}>
              {url ? (
                <Image
                  className={styles.imagePreview}
                  src={url}
                  mode="aspectFill"
                  onError={(e) => console.error('[MaterialEditPage] 图片加载失败:', e)}
                />
              ) : (
                <View className={styles.imagePlaceholder}>
                  <Text className={styles.placeholderIcon}>🖼️</Text>
                  <Text className={styles.placeholderText}>暂无图片</Text>
                </View>
              )}
            </View>
            <Text className={styles.formHint}>点击下方"随机图片"按钮可生成随机预览图</Text>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>关联项目</Text>
            {projectPickerRange.length > 0 ? (
              <Picker
                mode="selector"
                range={projectPickerRange}
                value={selectedProjectIndex >= 0 ? selectedProjectIndex : 0}
                onChange={(e) => setSelectedProjectIndex(Number(e.detail.value))}
              >
                <View className={styles.pickerWrap}>
                  <Text
                    className={classnames(
                      selectedProject ? styles.pickerText : styles.pickerPlaceholder
                    )}
                  >
                    {selectedProject ? selectedProject.title : '请选择关联项目'}
                  </Text>
                  <Text className={styles.pickerArrow}>›</Text>
                </View>
              </Picker>
            ) : (
              <View className={styles.pickerWrap}>
                <Text className={styles.pickerPlaceholder}>暂无可用项目</Text>
              </View>
            )}
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>关联节点（选填）</Text>
            {milestonePickerRange.length > 0 ? (
              <Picker
                mode="selector"
                range={milestonePickerRange}
                value={selectedMilestoneIndex >= 0 ? selectedMilestoneIndex : 0}
                onChange={(e) => setSelectedMilestoneIndex(Number(e.detail.value))}
              >
                <View className={styles.pickerWrap}>
                  <Text
                    className={classnames(
                      selectedMilestone ? styles.pickerText : styles.pickerPlaceholder
                    )}
                  >
                    {selectedMilestone ? selectedMilestone.name : '请选择关联的阶段节点'}
                  </Text>
                  <Text className={styles.pickerArrow}>›</Text>
                </View>
              </Picker>
            ) : (
              <View className={styles.pickerWrap}>
                <Text className={styles.pickerPlaceholder}>请先选择关联项目</Text>
              </View>
            )}
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>素材类型</Text>
            <View className={styles.typeOptions}>
              {TYPE_OPTIONS.map((option) => (
                <View
                  key={option.key}
                  className={classnames(
                    styles.typeOption,
                    type === option.key && styles.typeOptionActive
                  )}
                  onClick={() => setType(option.key)}
                >
                  <Text
                    className={classnames(
                      styles.typeOptionText,
                      type === option.key && styles.typeOptionTextActive
                    )}
                  >
                    {option.icon} {option.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>素材名称</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入素材名称"
              value={name}
              onInput={(e) => setName(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>图片URL</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入图片URL"
              value={url}
              onInput={(e) => setUrl(e.detail.value)}
            />
            <Text className={styles.formHint} onClick={handleRandomImage}>
              🎲 随机图片
            </Text>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>版本号</Text>
            <Input
              className={styles.formInput}
              placeholder="例如：v1.0"
              value={version}
              onInput={(e) => setVersion(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>修改标记</Text>
            <Input
              className={styles.formInput}
              placeholder="例如：第2次修改（选填）"
              value={revisionMark}
              onInput={(e) => setRevisionMark(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>描述/备注</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="请输入描述或备注信息（选填）"
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.submitSection}>
        <Button className={styles.submitButton} onClick={handleSubmit}>
          {isEditMode ? '保存修改' : '保存素材'}
        </Button>
      </View>
    </View>
  );
};

export default MaterialEditPage;
