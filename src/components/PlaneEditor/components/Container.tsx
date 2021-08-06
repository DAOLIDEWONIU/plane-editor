import React, { FC, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { BarsOutlined } from '@ant-design/icons';
import DrawerSetting from './DrawerSetting';
import styles from './index.less';

interface IProps {
  title?: React.ReactNode;
  leftSlider?: React.ReactNode;
  content?: React.ReactNode;
  rightSlider?: React.ReactNode;
  className?: string;
  loading?: boolean;
  editing?: boolean;
  onDownload?: () => void;
  onUpload: () => void;
  onSaveImage?: (option?: {
    name?: string;
    format?: 'png';
    quality?: number;
  }) => void;
}

const Container: FC<IProps> = ({
  loading = false,
  className = 'plane-editor-layout-main',
  title,
  content,
  leftSlider,
  rightSlider,
  children,
  ...extra
}) => {
  const [DrawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [DrawerValue, setDrawerValue] = useState<string[]>([]);

  const handleDrawerVisible = (flag?: boolean, value?: string[]) => {
    setDrawerVisible(!!flag);
    setDrawerValue(value || []);
  };

  return (
    <PageContainer
      onBack={() => handleDrawerVisible(true, ['f'])}
      className={styles.PageContainer}
      header={{
        style: {
          padding: '4px 16px',
          width: '100%',
          boxShadow: '0 2px 8px #f0f1f2',
          backgroundColor: '#1F57C3',
        },
      }}
      backIcon={<BarsOutlined style={{ fontSize: 18, color: '#fff' }} />}
      title={
        <div style={{ fontSize: 16, color: '#fff', fontWeight: 'normal' }}>
          绘制
        </div>
      }
      loading={loading}
    >
      {leftSlider}
      {content || children}
      {rightSlider}
      {DrawerValue.length ? (
        <DrawerSetting
          visible={DrawerVisible}
          value={DrawerValue}
          handleDrawerVisible={handleDrawerVisible}
          {...extra}
        />
      ) : null}
    </PageContainer>
  );
};

export default Container;
