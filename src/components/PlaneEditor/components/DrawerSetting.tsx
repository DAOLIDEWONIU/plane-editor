import { memo } from 'react';
import { Drawer, Button, Space, Avatar } from 'antd';
import {
  CloudUploadOutlined,
  FileImageOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';
import styles from './index.less';

interface DrawerSettingProps {
  visible: boolean;
  value: string[];
  handleDrawerVisible: (flag?: boolean, value?: string[]) => void;
  editing?: boolean;
  onDownload?: () => void;
  onUpload: () => void;
  onSaveImage?: (option?: {
    name?: string;
    format?: 'png';
    quality?: number;
  }) => void;
}
const DrawerSetting = memo((props: DrawerSettingProps) => {
  const {
    visible,
    handleDrawerVisible,
    value,
    editing,
    onDownload,
    onSaveImage,
    onUpload,
  } = props;

  return (
    <Drawer
      visible={visible}
      title={null}
      placement="left"
      closable={false}
      onClose={() => handleDrawerVisible(false, value)}
      afterVisibleChange={(visible) => {
        if (!visible) {
          handleDrawerVisible();
        }
      }}
    >
      <Space
        className={styles.DrawerSetting}
        direction="vertical"
        style={{ width: '100%' }}
      >
        {/*<Avatar*/}
        {/*  size={64}*/}
        {/*  style={{ margin: '30px auto' }}*/}
        {/*  src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"*/}
        {/*/>*/}
        <Button
          type="text"
          block
          icon={<CloudDownloadOutlined />}
          disabled={!editing}
          onClick={() => onDownload && onDownload()}
        >
          文件下载
        </Button>
        <Button
          type="text"
          block
          icon={<CloudUploadOutlined />}
          onClick={() => {
            onUpload();
            handleDrawerVisible(false, value);
          }}
        >
          文件上传
        </Button>
        <Button
          type="text"
          block
          icon={<FileImageOutlined />}
          onClick={() => onSaveImage && onSaveImage({ name: '楼层平面图' })}
        >
          另存为图片
        </Button>
      </Space>
    </Drawer>
  );
});

export default DrawerSetting;
