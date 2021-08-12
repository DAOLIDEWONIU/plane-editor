import { memo, useMemo } from 'react';
import { Modal, Button } from 'antd';
import { Canvas } from './canvas';

interface PreviewModalProps {
  visible: boolean;
  value: string[];
  handleModalVisible: (flag?: boolean, value?: string[]) => void;
  onTooltip: (ref: any, target: any) => void;
  onAction?: () => void;
  onClick: (canvas: any, target: any) => void;
  objects: any;
}
const PreviewModal = memo((props: PreviewModalProps) => {
  const {
    visible,
    handleModalVisible,
    value,
    objects,
    onAction,
    onClick,
    onTooltip,
  } = props;

  const width: number = useMemo(() => window.innerWidth - 80, []);
  const height: number = useMemo(() => window.innerHeight - 120, []);
  console.log('objects', objects);
  return (
    <Modal
      title="预览"
      width={width}
      visible={visible}
      onCancel={() => handleModalVisible(false, value)}
      afterClose={() => handleModalVisible()}
      bodyStyle={{ position: 'relative', height }}
      maskClosable={false}
      footer={null}
      centered
    >
      <Canvas
        editable={false}
        className="rde-canvas"
        canvasOption={{
          backgroundColor: '#f3f3f3',
        }}
        onLoad={(handler) => handler.importJSON(objects)}
        onTooltip={onTooltip}
        onClick={onClick}
        maxZoom={500}
      />
    </Modal>
  );
});

export default PreviewModal;
