import React, { useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import {
  formatMoney,
  formatDate,
  getDaysRemaining,
  calculateProgress,
  getStatusLabel,
  getQuoteTypeLabel
} from '@/utils';
import type { Project, ProjectMilestone, MaterialFile, PaymentStatus } from '@/types';
import StatusTag from '@/components/StatusTag';
import MaterialCard from '@/components/MaterialCard';
import styles from './index.module.scss';

const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const projectId = router.params.id as string;

  const projects = useAppStore((state) => state.projects);
  const allMaterials = useAppStore((state) => state.materials);
  const updateMilestone = useAppStore((state) => state.updateMilestone);
  const updateProject = useAppStore((state) => state.updateProject);
  const toggleMaterialSent = useAppStore((state) => state.toggleMaterialSent);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );
  const materials = useMemo(
    () => allMaterials.filter((m) => m.projectId === projectId),
    [allMaterials, projectId]
  );

  useDidShow(() => {
    console.log('[ProjectDetailPage] 页面显示，项目ID:', projectId);
  });

  if (!project) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>项目不存在</Text>
          <Text className={styles.emptyDesc}>找不到该项目，可能已被删除或链接无效</Text>
        </View>
      </View>
    );
  }

  const progress = calculateProgress(project.milestones);
  const daysRemaining = getDaysRemaining(project.deadline);
  const isOverdue = daysRemaining < 0;

  const getPaymentStatusLabel = (status: PaymentStatus): string => {
    const map: Record<PaymentStatus, string> = {
      unpaid: '未付款',
      deposit_paid: '定金已付',
      paid: '已付清'
    };
    return map[status];
  };

  const getPaymentStatusClass = (status: PaymentStatus): string => {
    const map: Record<PaymentStatus, string> = {
      unpaid: styles.unpaid,
      deposit_paid: styles.deposit,
      paid: styles.paid
    };
    return map[status];
  };

  const handleClientClick = () => {
    console.log('[ProjectDetailPage] 跳转到客户详情:', project.clientId);
    Taro.navigateTo({
      url: `/pages/client-detail/index?id=${project.clientId}`
    });
  };

  const handleMilestoneClick = (milestone: ProjectMilestone) => {
    console.log('[ProjectDetailPage] 点击里程碑:', milestone.name, '当前状态:', milestone.status);
    let nextStatus: 'pending' | 'in_progress' | 'completed' = milestone.status;
    if (milestone.status === 'pending') {
      nextStatus = 'in_progress';
    } else if (milestone.status === 'in_progress') {
      nextStatus = 'completed';
    } else {
      nextStatus = 'pending';
    }

    const update: Partial<ProjectMilestone> = { status: nextStatus };
    if (nextStatus === 'completed' && !milestone.completedAt) {
      update.completedAt = new Date().toISOString().split('T')[0];
    }
    if (nextStatus !== 'completed') {
      update.completedAt = undefined;
    }

    updateMilestone(project.id, milestone.id, update);
    Taro.showToast({
      title: nextStatus === 'completed' ? '已完成' : nextStatus === 'in_progress' ? '进行中' : '待处理',
      icon: 'success',
      duration: 1000
    });
  };

  const getMilestoneStatusText = (status: string): string => {
    const map: Record<string, string> = {
      pending: '待处理',
      in_progress: '进行中',
      completed: '已完成'
    };
    return map[status] || status;
  };

  const handleUploadMaterial = () => {
    console.log('[ProjectDetailPage] 上传素材，项目ID:', projectId);
    Taro.navigateTo({
      url: `/pages/material-edit/index?projectId=${projectId}`
    });
  };

  const handleUploadToMilestone = (milestoneId: string) => {
    console.log('[ProjectDetailPage] 上传到节点:', milestoneId);
    Taro.navigateTo({
      url: `/pages/material-edit/index?projectId=${projectId}&milestoneId=${milestoneId}`
    });
  };

  const getMilestoneMaterials = (milestone: ProjectMilestone) => {
    if (!milestone.attachedFileIds || milestone.attachedFileIds.length === 0) return [];
    return materials.filter((m) => milestone.attachedFileIds!.includes(m.id));
  };

  const handleToggleSent = (materialId: string, e: any) => {
    e.stopPropagation();
    toggleMaterialSent(materialId);
  };

  const handleViewReview = () => {
    console.log('[ProjectDetailPage] 查看项目复盘:', projectId);
    Taro.navigateTo({
      url: `/pages/project-review/index?id=${projectId}`
    });
  };

  const deliveryChecklist = useMemo(() => {
    if (!project) return [];
    return project.milestones.map((milestone) => ({
      milestone,
      files: getMilestoneMaterials(milestone),
      sentCount: getMilestoneMaterials(milestone).filter((m) => m.sentToClient).length
    }));
  }, [project, materials]);

  const handleEditProject = () => {
    console.log('[ProjectDetailPage] 编辑项目:', projectId);
    Taro.navigateTo({
      url: `/pages/project-edit/index?id=${projectId}`
    });
  };

  const handleMarkDeposit = () => {
    console.log('[ProjectDetailPage] 标记定金已收');
    const newDepositReceived = !project.depositReceived;
    let newPaymentStatus: PaymentStatus = project.paymentStatus;
    if (newDepositReceived && project.finalPaymentReceived) {
      newPaymentStatus = 'paid';
    } else if (newDepositReceived) {
      newPaymentStatus = 'deposit_paid';
    } else if (!newDepositReceived && !project.finalPaymentReceived) {
      newPaymentStatus = 'unpaid';
    } else if (!newDepositReceived && project.finalPaymentReceived) {
      newPaymentStatus = 'deposit_paid';
    }
    updateProject(project.id, {
      depositReceived: newDepositReceived,
      paymentStatus: newPaymentStatus
    });
    Taro.showToast({
      title: newDepositReceived ? '定金已标记已收' : '定金已取消标记',
      icon: 'success',
      duration: 1000
    });
  };

  const handleMarkFinalPayment = () => {
    console.log('[ProjectDetailPage] 标记尾款已收');
    const newFinalReceived = !project.finalPaymentReceived;
    let newPaymentStatus: PaymentStatus = project.paymentStatus;
    if (project.depositReceived && newFinalReceived) {
      newPaymentStatus = 'paid';
    } else if (project.depositReceived && !newFinalReceived) {
      newPaymentStatus = 'deposit_paid';
    } else if (!project.depositReceived && newFinalReceived) {
      newPaymentStatus = 'deposit_paid';
    } else {
      newPaymentStatus = 'unpaid';
    }
    updateProject(project.id, {
      finalPaymentReceived: newFinalReceived,
      paymentStatus: newPaymentStatus
    });
    Taro.showToast({
      title: newFinalReceived ? '尾款已标记已收' : '尾款已取消标记',
      icon: 'success',
      duration: 1000
    });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.headerSection}>
        <Text className={styles.projectTitle}>{project.title}</Text>
        <View className={styles.headerMeta}>
          <View className={styles.clientLink} onClick={handleClientClick}>
            <Image
              className={styles.clientAvatar}
              src={project.clientAvatar}
              mode="aspectFill"
              onError={(e) => console.error('[ProjectDetailPage] 客户头像加载失败:', e)}
            />
            <Text className={styles.clientName}>{project.clientName} ›</Text>
          </View>
        </View>
        <View className={styles.headerTags}>
          <View className={styles.typeTag}>
            <Text>{getQuoteTypeLabel(project.type)}</Text>
          </View>
          <StatusTag status={project.status} text={getStatusLabel(project.status)} size="sm" />
        </View>
        <View className={styles.progressRow}>
          <View className={styles.progressInfo}>
            <Text className={styles.progressLabel}>项目进度</Text>
            <View className={styles.progressBar}>
              <View
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>
          <Text className={styles.progressPercent}>{progress}%</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>项目概览</Text>
        </View>
        <View className={styles.overviewGrid}>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewLabel}>项目金额</Text>
            <Text className={classnames(styles.overviewValue, styles.amount)}>
              {formatMoney(project.totalAmount)}
            </Text>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewLabel}>支付状态</Text>
            <View className={classnames(styles.paymentStatus, getPaymentStatusClass(project.paymentStatus))}>
              <Text>{getPaymentStatusLabel(project.paymentStatus)}</Text>
            </View>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewLabel}>修改次数</Text>
            <Text className={styles.overviewValue}>
              {project.revisionCount}/{project.maxRevisions}
            </Text>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewLabel}>剩余天数</Text>
            <Text className={classnames(styles.overviewValue, isOverdue && styles.overdue)}>
              {isOverdue ? `已逾期${Math.abs(daysRemaining)}天` : `${daysRemaining}天`}
            </Text>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewLabel}>开始日期</Text>
            <Text className={styles.overviewValue}>{formatDate(project.startDate)}</Text>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewLabel}>截止日期</Text>
            <Text className={classnames(styles.overviewValue, isOverdue && styles.overdue)}>
              {formatDate(project.deadline)}
            </Text>
          </View>
        </View>
        <View className={styles.paymentRow}>
          <View className={styles.paymentItem}>
            <View className={classnames(styles.paymentDot, project.depositReceived && styles.paid)} />
            <Text className={styles.paymentText}>
              定金 {project.depositReceived ? '已收' : '未收'}
            </Text>
          </View>
          <View className={styles.paymentItem}>
            <View className={classnames(styles.paymentDot, project.finalPaymentReceived && styles.paid)} />
            <Text className={styles.paymentText}>
              尾款 {project.finalPaymentReceived ? '已收' : '未收'}
            </Text>
          </View>
        </View>
      </View>

      <View className={classnames(styles.section, styles.milestonesSection)}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>进度节点</Text>
        </View>
        <Text className={styles.milestoneHint}>点击节点可切换状态：待处理 → 进行中 → 已完成</Text>
        <View className={styles.progressSteps}>
          {project.milestones.map((milestone, index) => (
            <View
              key={milestone.id}
              className={styles.stepItem}
              onClick={() => handleMilestoneClick(milestone)}
            >
              <View className={styles.stepLeft}>
                <View
                  className={classnames(
                    styles.stepDot,
                    milestone.status === 'completed' && styles.completed,
                    milestone.status === 'in_progress' && styles.inProgress,
                    index === project.currentMilestone && milestone.status !== 'completed' && styles.current
                  )}
                >
                  <Text className={styles.dotIcon}>
                    {milestone.status === 'completed' ? '✓' : index + 1}
                  </Text>
                </View>
                {index < project.milestones.length - 1 && (
                  <View
                    className={classnames(
                      styles.stepLine,
                      milestone.status === 'completed' && styles.lineCompleted
                    )}
                  />
                )}
              </View>
              <View className={styles.stepContent}>
                <View className={styles.stepHeader}>
                  <Text
                    className={classnames(
                      styles.stepName,
                      milestone.status === 'completed' && styles.textCompleted
                    )}
                  >
                    {milestone.name}
                  </Text>
                  <View className={styles.stepStatusTag}>
                    <StatusTag status={milestone.status} text={getMilestoneStatusText(milestone.status)} size="sm" />
                  </View>
                </View>
                <Text className={styles.stepDeadline}>截止：{formatDate(milestone.deadline)}</Text>
                <Text className={styles.stepDesc}>{milestone.description}</Text>
                <View className={styles.stepMetaRow}>
                  <Text className={styles.stepMeta}>
                    修改次数：{milestone.revisionCount || 0}
                  </Text>
                  <Text className={styles.stepMeta}>
                    关联文件：{getMilestoneMaterials(milestone).length} 个
                  </Text>
                </View>
                {milestone.completedAt && (
                  <Text className={styles.completedAt}>
                    完成于 {formatDate(milestone.completedAt)}
                  </Text>
                )}
                {getMilestoneMaterials(milestone).length > 0 && (
                  <View className={styles.milestoneFiles}>
                    {getMilestoneMaterials(milestone).map((mat) => (
                      <View key={mat.id} className={styles.milestoneFileItem}>
                        <Text className={styles.milestoneFileName}>📎 {mat.name}</Text>
                        <Text className={styles.milestoneFileVersion}>{mat.version}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View
                  className={styles.uploadToMilestoneBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadToMilestone(milestone.id);
                  }}
                >
                  <Text className={styles.uploadToMilestoneText}>+ 上传到此节点</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.materialsHeader}>
          <Text className={styles.sectionTitle}>素材与交付文件</Text>
          <Button className={styles.uploadBtn} onClick={handleUploadMaterial}>
            + 上传
          </Button>
        </View>
        {materials.length > 0 ? (
          <View className={styles.materialsList}>
            {materials.map((material: MaterialFile) => (
              <View key={material.id} className={styles.materialItem}>
                <MaterialCard material={material} />
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyMaterials}>
            <Text className={styles.emptyMaterialsIcon}>📁</Text>
            <Text className={styles.emptyMaterialsText}>暂无素材和交付文件</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>交付清单</Text>
          <Text className={styles.sectionSubtitle}>
            已发 {materials.filter((m) => m.sentToClient).length} / 共 {materials.length}
          </Text>
        </View>
        {deliveryChecklist.map((group) => (
          <View key={group.milestone.id} className={styles.deliveryGroup}>
            <View className={styles.deliveryGroupHeader}>
              <Text className={styles.deliveryGroupName}>{group.milestone.name}</Text>
              <Text className={styles.deliveryGroupCount}>
                {group.sentCount}/{group.files.length}
              </Text>
            </View>
            {group.files.length > 0 ? (
              <View className={styles.deliveryFileList}>
                {group.files.map((file) => (
                  <View
                    key={file.id}
                    className={classnames(
                      styles.deliveryFileItem,
                      file.sentToClient && styles.deliveryFileSent
                    )}
                  >
                    <View className={styles.deliveryFileInfo}>
                      <Text className={styles.deliveryFileName}>
                        {file.sentToClient ? '✅' : '⏳'} {file.name}
                      </Text>
                      <Text className={styles.deliveryFileMeta}>
                        {file.typeLabel} · {file.version}
                      </Text>
                    </View>
                    <View
                      className={classnames(
                        styles.deliveryToggle,
                        file.sentToClient && styles.deliveryToggleActive
                      )}
                      onClick={(e) => handleToggleSent(file.id, e)}
                    >
                      <Text className={styles.deliveryToggleText}>
                        {file.sentToClient ? '已发送' : '标记发送'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.deliveryEmpty}>
                <Text className={styles.deliveryEmptyText}>暂无交付文件</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(
            styles.barBtn,
            project.depositReceived ? styles.btnSecondary : styles.btnSuccess
          )}
          onClick={handleMarkDeposit}
        >
          {project.depositReceived ? '取消定金' : '定金已收'}
        </Button>
        <Button
          className={classnames(
            styles.barBtn,
            project.finalPaymentReceived ? styles.btnSecondary : styles.btnSuccess
          )}
          onClick={handleMarkFinalPayment}
        >
          {project.finalPaymentReceived ? '取消尾款' : '尾款已收'}
        </Button>
        <Button className={classnames(styles.barBtn, styles.btnPrimary)} onClick={handleEditProject}>
          编辑
        </Button>
        <Button className={classnames(styles.barBtn, styles.btnPurple)} onClick={handleViewReview}>
          复盘
        </Button>
      </View>
    </View>
  );
};

export default ProjectDetailPage;
