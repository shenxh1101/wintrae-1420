import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Project } from '@/types';
import { formatMoney, formatDate, getDaysRemaining, calculateProgress } from '@/utils';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const progress = calculateProgress(project.milestones);
  const daysRemaining = getDaysRemaining(project.deadline);
  const isOverdue = daysRemaining < 0;

  const handleClick = () => {
    console.log('[ProjectCard] 点击项目:', project.title);
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/project-detail/index?id=${project.id}`
      });
    }
  };

  return (
    <View className={styles.projectCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.headerLeft}>
          <Image
            className={styles.clientAvatar}
            src={project.clientAvatar}
            mode="aspectFill"
            onError={(e) => console.error('[ProjectCard] 图片加载失败:', e)}
          />
          <View className={styles.headerInfo}>
            <Text className={styles.projectTitle}>{project.title}</Text>
            <Text className={styles.clientName}>{project.clientName}</Text>
          </View>
        </View>
        <StatusTag status={project.status} text={project.statusLabel} size="sm" />
      </View>

      <View className={styles.cardBody}>
        <View className={styles.typeTag}>
          <Text className={styles.typeText}>{project.typeLabel}</Text>
        </View>

        <View className={styles.progressSection}>
          <View className={styles.progressHeader}>
            <Text className={styles.progressLabel}>项目进度</Text>
            <Text className={styles.progressPercent}>{progress}%</Text>
          </View>
          <View className={styles.progressBar}>
            <View
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>项目金额</Text>
            <Text className={classnames(styles.infoValue, styles.amount)}>
              {formatMoney(project.totalAmount)}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>修改次数</Text>
            <Text className={styles.infoValue}>
              {project.revisionCount}/{project.maxRevisions}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>截止日期</Text>
            <Text className={classnames(styles.infoValue, isOverdue && styles.overdue)}>
              {formatDate(project.deadline)}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>剩余天数</Text>
            <Text className={classnames(styles.infoValue, isOverdue && styles.overdue)}>
              {isOverdue ? `已逾期${Math.abs(daysRemaining)}天` : `${daysRemaining}天`}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.paymentBar}>
        <View className={styles.paymentItem}>
          <View className={classnames(styles.paymentDot, project.depositReceived && styles.paid)} />
          <Text className={styles.paymentText}>
            定金 {formatMoney(project.totalAmount * 0.5)}
          </Text>
        </View>
        <View className={styles.paymentItem}>
          <View className={classnames(styles.paymentDot, project.finalPaymentReceived && styles.paid)} />
          <Text className={styles.paymentText}>
            尾款 {formatMoney(project.totalAmount * 0.5)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ProjectCard;
