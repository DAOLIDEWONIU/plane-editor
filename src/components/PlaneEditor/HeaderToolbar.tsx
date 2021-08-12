import { memo, useMemo, useState } from 'react';
import { Space, Button, Tooltip, Divider } from 'antd';
import {
  BuildOutlined,
  SaveOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  UndoOutlined,
  RedoOutlined,
  FileSearchOutlined,
  CompressOutlined,
  SelectOutlined,
} from '@ant-design/icons';
import { PreviewModal } from './components';
import { rect, text } from '@/components/PlaneEditor/Option';
import { v4 } from 'uuid';

interface HeaderToolbarProps {
  canvasRef: any;
  onSelect: (e: any) => void;
  zoomRatio: number;
  objects: any;
  onTooltip: (ref: any, target: any) => void;
  onAction?: () => void;
  onClick: (canvas: any, target: any) => void;
  onChangePreview: (c: boolean) => void;
}
const HeaderToolbar = memo((props: HeaderToolbarProps) => {
  const {
    canvasRef,
    zoomRatio,
    objects,
    onAction,
    onClick,
    onTooltip,
    onChangePreview,
  } = props;

  if (canvasRef?.handler) {
    const [PreviewModalVisible, setPreviewModalVisible] =
      useState<boolean>(false);
    const [PreviewModalValue, setPreviewModalValue] = useState<string[]>([]);

    const handlePreviewModalVisible = (flag?: boolean, value?: string[]) => {
      setPreviewModalVisible(!!flag);
      setPreviewModalValue(value || []);
    };

    const isCropping = useMemo(() => {
      return canvasRef ? canvasRef.handler?.interactionMode === 'crop' : false;
    }, [canvasRef]);

    const zoomValue = useMemo(
      () => parseInt((zoomRatio * 100).toFixed(2), 10),
      [zoomRatio],
    );

    const onAddText = () => {
      const id = v4();
      const rectOption = Object.assign({}, rect, { id });
      const textOption = Object.assign({}, text, { id });
      console.log('获取到的数据', canvasRef);
      console.log('获取到的数据', canvasRef.handler.getActiveObject());
      console.log('获取到的数据canvas', canvasRef.canvas.getActiveObject());

      const getActiveObjectq = canvasRef.handler.getActiveObject();
      console.log('获取选中的', getActiveObjectq);
      // canvasRef.handler.add(rectOption);
      if (getActiveObjectq) {
        canvasRef.handler.setActiveLabel(textOption);
      }
      // canvasRef.handler.setActiveLabel(textOption);
      // canvasRef.current?.handler.toGroup();
      // canvasRef.handler.addGroup({ objects: [rectOption, textOption] });
    };

    return (
      <>
        <Space>
          <Button type="text" icon={<SaveOutlined />}>
            保存
          </Button>
          <Button
            type="text"
            icon={<FileSearchOutlined />}
            // disabled={!objects}
            onClick={() => {
              onChangePreview(true);
              handlePreviewModalVisible(true, ['f']);
            }}
          >
            预览
          </Button>
          <Divider type="vertical" />
          <Button
            type="text"
            disabled={
              isCropping ||
              (canvasRef && !canvasRef.handler?.transactionHandler.undos.length)
            }
            icon={<UndoOutlined />}
            onClick={() => canvasRef.handler?.transactionHandler.undo()}
          >
            撤销
          </Button>
          <Button
            type="text"
            disabled={
              isCropping ||
              (canvasRef && !canvasRef.handler?.transactionHandler.redos.length)
            }
            icon={<RedoOutlined />}
            onClick={() => canvasRef.handler?.transactionHandler.redo()}
          >
            重做
          </Button>
          <Divider type="vertical" />
          <Tooltip title="放大地图">
            <Button
              type="text"
              icon={<ZoomInOutlined />}
              onClick={() => canvasRef.handler.zoomHandler.zoomIn()}
            />
          </Tooltip>
          <div style={{ width: 60, textAlign: 'center' }}>{zoomValue}%</div>
          <Tooltip title="缩小地图">
            <Button
              type="text"
              icon={<ZoomOutOutlined />}
              onClick={() => canvasRef.handler.zoomHandler.zoomOut()}
            />
          </Tooltip>
          <Tooltip title="适应屏幕">
            <Button
              type="text"
              icon={<ExpandOutlined />}
              onClick={() => canvasRef.handler.zoomHandler.zoomToFit()}
            />
          </Tooltip>
          <Tooltip title="还原">
            <Button
              type="text"
              icon={<CompressOutlined />}
              onClick={() => {
                canvasRef.handler.zoomHandler.zoomOneToOne();
              }}
            />
          </Tooltip>
          <Divider type="vertical" />
          <Button icon={<SelectOutlined />} type="text" disabled>
            导入参考图
          </Button>
          <Button type="text" onClick={onAddText}>
            绑定测试
          </Button>
          {/*<Button*/}
          {/*  type="text"*/}
          {/*  disabled={isCropping}*/}
          {/*  icon={<ArrowLeftOutlined />}*/}
          {/*  onClick={() => canvasRef.handler?.bringToFront()}*/}
          {/*>*/}
          {/*  向上提层*/}
          {/*</Button>*/}
          {/*<Button*/}
          {/*  type="text"*/}
          {/*  disabled={isCropping}*/}
          {/*  icon={<ArrowLeftOutlined />}*/}
          {/*  onClick={() => canvasRef.handler?.sendToBack()}*/}
          {/*>*/}
          {/*  向下提层*/}
          {/*</Button>*/}
          {/*<Button*/}
          {/*  type="text"*/}
          {/*  disabled={isCropping}*/}
          {/*  icon={<ArrowLeftOutlined />}*/}
          {/*  onClick={() => canvasRef.handler?.alignmentHandler.left()}*/}
          {/*>*/}
          {/*  左对齐*/}
          {/*</Button>*/}
          {/*<Button*/}
          {/*  type="text"*/}
          {/*  disabled={isCropping}*/}
          {/*  icon={<ArrowLeftOutlined />}*/}
          {/*  onClick={() => canvasRef.handler?.alignmentHandler.center()}*/}
          {/*>*/}
          {/*  居中*/}
          {/*</Button>*/}
          {/*<Button*/}
          {/*  type="text"*/}
          {/*  disabled={isCropping}*/}
          {/*  icon={<ArrowLeftOutlined />}*/}
          {/*  onClick={() => canvasRef.handler?.alignmentHandler.right()}*/}
          {/*>*/}
          {/*  右对齐*/}
          {/*</Button>*/}
          {/*<Button*/}
          {/*  type="text"*/}
          {/*  disabled={isCropping}*/}
          {/*  icon={<BuildOutlined />}*/}
          {/*  onClick={() => canvasRef.handler?.toGroup()}*/}
          {/*>*/}
          {/*  合并组*/}
          {/*</Button>*/}
          {/*<Button*/}
          {/*  type="text"*/}
          {/*  disabled={isCropping}*/}
          {/*  icon={<BlockOutlined />}*/}
          {/*  onClick={() => canvasRef.handler?.toActiveSelection()}*/}
          {/*>*/}
          {/*  拆分组*/}
          {/*</Button>*/}
          {objects && PreviewModalValue.length ? (
            <PreviewModal
              visible={PreviewModalVisible}
              value={PreviewModalValue}
              handleModalVisible={handlePreviewModalVisible}
              objects={objects}
              onClick={onClick}
              onTooltip={onTooltip}
            />
          ) : null}
        </Space>
      </>
    );
  }
  return null;
});

export default HeaderToolbar;
