import { memo, useMemo, useState } from 'react';
import { Space, Button, Tooltip, Divider } from 'antd';
import {
  SaveOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  UndoOutlined,
  RedoOutlined,
  FileSearchOutlined,
  CompressOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { v4 } from 'uuid';
import { fabric } from 'fabric';
import { PreviewModal, UploadPicture } from './components';
import { circle, bg, rect, text } from '@/components/PlaneEditor/Option';

interface HeaderToolbarProps {
  canvasRef: any;
  onSelect: (e: any) => void;
  zoomRatio: number;
  objects: any;
  onTooltip: (ref: any, target: any) => void;
  onAction?: () => void;
  onClick: (canvas: any, target: any) => void;
  onChangePreview: (c: boolean) => void;
  selectedItem: any;
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
    selectedItem,
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

    const onAddImage = (url: string) => {
      //设置工作区背景图
      canvasRef.handler.workareaHandler.setImage(url);
      // const id = v4();
      // const option = Object.assign({}, bg, { id, src: url });
      // canvasRef.handler.add(option);
    };
    return (
      <>
        <Space>
          <Button type="text" icon={<SaveOutlined style={{ fontSize: 15 }} />}>
            保存
          </Button>
          <Button
            type="text"
            icon={<FileSearchOutlined style={{ fontSize: 15 }} />}
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
            icon={<UndoOutlined style={{ fontSize: 16 }} />}
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
            icon={<RedoOutlined style={{ fontSize: 16 }} />}
            onClick={() => canvasRef.handler?.transactionHandler.redo()}
          >
            重做
          </Button>
          <Divider type="vertical" />
          <Tooltip title="缩小地图">
            <Button
              type="text"
              icon={<ZoomOutOutlined style={{ fontSize: 18 }} />}
              onClick={() => canvasRef.handler.zoomHandler.zoomOut()}
            />
          </Tooltip>
          <div style={{ width: 60, textAlign: 'center' }}>{zoomValue}%</div>
          <Tooltip title="放大地图">
            <Button
              type="text"
              icon={<ZoomInOutlined style={{ fontSize: 18 }} />}
              onClick={() => canvasRef.handler.zoomHandler.zoomIn()}
            />
          </Tooltip>
          <Tooltip title="适应屏幕">
            <Button
              type="text"
              icon={<ExpandOutlined style={{ fontSize: 18 }} />}
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
          <UploadPicture onAdd={onAddImage} />
          <Divider type="vertical" />
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
