import React, { useState } from 'react';
import { View, Input, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (keyword: string) => void;
  showCancel?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索客户、项目、报价...',
  onSearch,
  showCancel = false
}) => {
  const [keyword, setKeyword] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    console.log('[SearchBar] 搜索关键词:', keyword);
    onSearch?.(keyword);
    Taro.navigateTo({
      url: `/pages/search/index?keyword=${encodeURIComponent(keyword)}`
    });
  };

  const handleCancel = () => {
    setKeyword('');
    setIsFocused(false);
  };

  return (
    <View className={classnames(styles.searchBar, isFocused && styles.focused)}>
      <View className={styles.searchInputWrap}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder={placeholder}
          placeholderClass={styles.placeholder}
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onConfirm={handleSearch}
          confirmType="search"
        />
        {keyword && (
          <Text
            className={styles.clearIcon}
            onClick={() => setKeyword('')}
          >
            ✕
          </Text>
        )}
      </View>
      {showCancel && isFocused && (
        <Text className={styles.cancelBtn} onClick={handleCancel}>取消</Text>
      )}
    </View>
  );
};

export default SearchBar;
