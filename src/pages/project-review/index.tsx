import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import type { ProjectMilestone, MaterialFile, Client } from '@/types';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const ProjectReviewPage: React.FC = () => {
  const router = useRouter();
  const projectId = router.params.id as string;

  const projects = useAppStore((state) => state.projects);
  const clients = useAppStore((state) => state.clients);
  const quotes = useAppStore((state) => state.quotes);
  const materials = useAppStore((state) => state.materials);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  const client = useMemo<Client | undefined>(
    () => (project ? clients.find((c) => c.id === project.clientId) : undefined),
    [clients, project]
  );

  const projectQuotes = useMemo(
    () => (project ? quotes.filter((q) => q.clientId === project.clientId) : []),
    [quotes, project]
  );

  const projectMaterials = useMemo(
    () => (project ? materials.filter((m) => m.projectId === project.id) : []),
    [materials, project]
  );

  const financialSummary = useMemo(() => {
    if (!project) return null;
    const totalAmount = project.totalAmount;
    const deposit = totalAmount * 0.5;
    const finalPayment = totalAmount * 0.5;
    const received = (project.depositReceived ? deposit : 0) + (project.finalPaymentReceived ? finalPayment : 0);
    const pending = totalAmount - received;
    return {
      totalAmount,
      deposit,
      finalPayment,
      received,
      pending,
      depositReceived: project.depositReceived,
      finalPaymentReceived: project.finalPaymentReceived
    };
  }, [project]);

  const timeline = useMemo(() => {
    if (!project) return [];
    return project.milestones.map((m: ProjectMilestone) => {
      const deadline = dayjs(m.deadline);
      const completedAt = m.completedAt ? dayjs(m.completedAt) : null;
      let delayDays = 0;
      let isOnTime = true;
      if (completedAt && deadline.isValid()) {
        delayDays = completedAt.diff(deadline, 'day');
        isOnTime = delayDays <= 0;
      }
      return {
        ...m,
        deadlineDate: m.deadline,
        completedDate: m.completedAt,
        delayDays: Math.max(0, delayDays),
        isOnTime: !completedAt ? null : isOnTime,
        attachedFiles: m.attachedFileIds?.length || 0,
        revisionCount: m.revisionCount || 0
      };
    });
  }, [project]);

  const durationStats = useMemo(() => {
    if (!project) return null;
    const start = dayjs(project.startDate);
    const deadline = dayjs(project.deadline);
    const now = dayjs();
    const lastCompleted = project.milestones
      .filter((m) => m.completedAt)
      .sort((a, b) => (a.completedAt! > b.completedAt! ? -1 : 1))[0];
    const actualEnd = lastCompleted ? dayjs(lastCompleted.completedAt!) : now;
    const plannedDays = deadline.diff(start, 'day');
    const actualDays = actualEnd.diff(start, 'day');
    const totalDelay = actualEnd.diff(deadline, 'day');
    return {
      plannedDays,
      actualDays,
      totalDelay: Math.max(0, totalDelay),
      isDelayed: totalDelay > 0,
      startDate: project.startDate,
      deadlineDate: project.deadline,
      actualEndDate: lastCompleted?.completedAt
    };
  }, [project]);

  const materialStats = useMemo(() => {
    if (!project) return null;
    const types = {
      reference: projectMaterials.filter((m) => m.type === 'reference').length,
      work: projectMaterials.filter((m) => m.type === 'work').length,
      delivery: projectMaterials.filter((m) => m.type === 'delivery').length
    };
    const sentCount = projectMaterials.filter((m) => m.sentToClient).length;
    const versions = projectMaterials.map((m) => m.version);
    const uniqueVersions = [...new Set(versions)].sort().reverse();
    const totalRevisionCount = project.milestones.reduce(
      (sum, m) => sum + (m.revisionCount || 0),
      0
    );
    return {
      total: projectMaterials.length,
      types,
      sentCount,
      pendingCount: projectMaterials.length - sentCount,
      latestVersion: uniqueVersions[0] || '-',
      totalRevisionCount
    };
  }, [project, projectMaterials]);

  if (!project) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>项目不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <Text className={styles.projectTitle}>{project.title}</Text>
        <View className={styles.clientInfo}>
          {client?.avatar && (
            <Image className={styles.clientAvatar} src={client.avatar} mode="aspectFill" />
          )}
          <Text className={styles.clientName}>{client?.name || project.clientName}</Text>
        </View>
        <View className={styles.tagsRow}>
          <Text className={styles.tag}>{project.typeLabel}</Text>
          <Text className={styles.tag}>{project.statusLabel}</Text>
          {durationStats?.isDelayed && (
            <Text className={styles.tag}>已延期 {durationStats.totalDelay} 天</Text>
          )}
        </View>
      </View>

      {financialSummary && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>💰 财务汇总</Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>¥{financialSummary.totalAmount.toFixed(0)}</Text>
              <Text className={styles.statLabel}>报价总金额</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={`${styles.statValue} ${styles.success}`}>¥{financialSummary.received.toFixed(0)}</Text>
              <Text className={styles.statLabel}>已收款</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={`${styles.statValue} ${financialSummary.pending > 0 ? styles.warning : styles.success}`}>¥{financialSummary.pending.toFixed(0)}</Text>
              <Text className={styles.statLabel}>待收款</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={`${styles.statValue} ${styles.danger}`}>{project.revisionCount || 0}</Text>
              <Text className={styles.statLabel}>累计修改次数</Text>
            </View>
          </View>
          <View className={styles.subStats}>
            <View className={styles.subStat}>
              <Text className={styles.subStatValue}>
                ¥{financialSummary.deposit.toFixed(0)}
                {financialSummary.depositReceived && ' ✓'}
              </Text>
              <Text className={styles.subStatLabel}>定金 (50%)</Text>
            </View>
            <View className={styles.subStat}>
              <Text className={styles.subStatValue}>
                ¥{financialSummary.finalPayment.toFixed(0)}
                {financialSummary.finalPaymentReceived && ' ✓'}
              </Text>
              <Text className={styles.subStatLabel}>尾款 (50%)</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📅 阶段时间线</Text>
        {durationStats && (
          <View className={styles.statsGrid} style={{ marginBottom: '24rpx' }}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{durationStats.plannedDays}</Text>
              <Text className={styles.statLabel}>计划工期 (天)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={`${styles.statValue} ${durationStats.isDelayed ? styles.danger : styles.success}`}>
                {durationStats.actualDays}
              </Text>
              <Text className={styles.statLabel}>实际工期 (天)</Text>
            </View>
          </View>
        )}
        <View className={styles.timeline}>
          {timeline.map((m) => (
            <View key={m.id} className={styles.timelineItem}>
              <View className={`${styles.timelineDot} ${m.status === 'completed' ? styles.completed : ''}`} />
              <View className={styles.timelineContent}>
                <View className={styles.timelineLeft}>
                  <Text className={styles.timelineName}>{m.name}</Text>
                  <Text className={styles.timelineDate}>
                    截止：{m.deadlineDate}
                  </Text>
                </View>
                <View className={styles.timelineRight}>
                  <Text className={styles.timelineDeadline}>
                    {m.status === 'completed' && m.completedDate
                      ? `完成：${dayjs(m.completedDate).format('YYYY-MM-DD')}`
                      : '进行中'}
                  </Text>
                  {m.status === 'completed' && m.isOnTime !== null && (
                    <Text className={`${styles.timelineDelay} ${m.isOnTime ? styles.ontime : ''}`}>
                      {m.isOnTime ? '✓ 准时' : `延期 ${m.delayDays} 天`}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {materialStats && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📁 素材与版本</Text>
          <View className={styles.versionSummary}>
            <View className={styles.versionRow}>
              <Text className={styles.versionLabel}>素材总数</Text>
              <Text className={styles.versionValue}>{materialStats.total} 个</Text>
            </View>
            <View className={styles.versionRow}>
              <Text className={styles.versionLabel}>参考图 / 作品 / 交付</Text>
              <Text className={styles.versionValue}>
                {materialStats.types.reference} / {materialStats.types.work} / {materialStats.types.delivery}
              </Text>
            </View>
            <View className={styles.versionRow}>
              <Text className={styles.versionLabel}>最新版本</Text>
              <Text className={styles.versionValue}>{materialStats.latestVersion}</Text>
            </View>
            <View className={styles.versionRow}>
              <Text className={styles.versionLabel}>累计修改次数</Text>
              <Text className={styles.versionValue}>{materialStats.totalRevisionCount} 次</Text>
            </View>
          </View>
          <View className={styles.deliverySummary}>
            <Text className={`${styles.deliveryChip} ${styles.done}`}>
              ✓ 已发送 {materialStats.sentCount}
            </Text>
            <Text className={`${styles.deliveryChip} ${styles.pending}`}>
              ⏳ 待发送 {materialStats.pendingCount}
            </Text>
          </View>
        </View>
      )}

      {projectQuotes.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📝 相关报价</Text>
          <View className={styles.versionSummary}>
            {projectQuotes.map((q) => (
              <View key={q.id} className={styles.versionRow}>
                <Text className={styles.versionLabel}>{q.title}</Text>
                <Text className={styles.versionValue}>¥{q.totalAmount.toFixed(0)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default ProjectReviewPage;
