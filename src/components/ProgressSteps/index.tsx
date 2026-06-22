import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { ProjectMilestone } from '@/types';
import { formatDate } from '@/utils';
import styles from './index.module.scss';

interface ProgressStepsProps {
  milestones: ProjectMilestone[];
  currentIndex: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ milestones, currentIndex }) => {
  return (
    <View className={styles.progressSteps}>
      {milestones.map((milestone, index) => (
        <View key={milestone.id} className={styles.stepItem}>
          <View className={styles.stepLeft}>
            <View
              className={classnames(
                styles.stepDot,
                milestone.status === 'completed' && styles.completed,
                milestone.status === 'in_progress' && styles.inProgress,
                index === currentIndex && styles.current
              )}
            >
              <Text className={styles.dotIcon}>
                {milestone.status === 'completed' ? '✓' : index + 1}
              </Text>
            </View>
            {index < milestones.length - 1 && (
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
              <Text className={styles.stepDeadline}>
                {formatDate(milestone.deadline)}
              </Text>
            </View>
            <Text className={styles.stepDesc}>{milestone.description}</Text>
            {milestone.completedAt && (
              <Text className={styles.completedAt}>
                完成于 {formatDate(milestone.completedAt)}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

export default ProgressSteps;
