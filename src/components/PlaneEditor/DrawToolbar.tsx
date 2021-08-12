import { memo, useMemo, useState } from 'react';
import { Space, Button, Tooltip, Divider } from 'antd';
import {
  LeftOutlined,
  FullscreenOutlined,
  BorderOutlined,
  SyncOutlined,
  GatewayOutlined,
  LineOutlined,
} from '@ant-design/icons';
import { getRect, circle, text, rect1 } from './Option';
import { v4 } from 'uuid';
import classnames from 'classnames';
import styles from './index.less';

interface DrawToolbarProps {
  canvasRef: any;
  onSelect: (e: any) => void;
  zoomRatio: number;
}
const DrawToolbar = memo((props: DrawToolbarProps) => {
  const [interactionMode, setInteractionMode] = useState('selection');
  const { canvasRef } = props;
  if (canvasRef?.handler) {
    const handlers = {
      selection: () => {
        if (canvasRef.handler.interactionHandler.isDrawingMode()) {
          return;
        }
        canvasRef.handler.interactionHandler.selection();
        setInteractionMode('selection');
      },
      grab: () => {
        if (canvasRef.handler.interactionHandler.isDrawingMode()) {
          return;
        }
        canvasRef.handler.interactionHandler.grab();
        setInteractionMode('grab');
      },
    };

    const onAddRect = () => {
      const id = v4();
      const textOption = Object.assign({}, getRect(), { id });
      // const text1Option = Object.assign({}, text, { id });
      // const option = Object.assign({}, group([textOption, text1Option]), {
      //   id,
      // });
      canvasRef.handler.add(textOption);

      // const textOption = Object.assign({}, text, { id });
      // canvasRef.handler.add(textOption);
      // console.log('canvasRef.handler', canvasRef.handler);
    };

    const onAddCircle = () => {
      const id = v4();
      const option = Object.assign({}, circle, { id });
      canvasRef.handler.add(option);
    };

    return (
      <Space
        className={styles.DrawToolbar}
        direction="vertical"
        split={<Divider type="horizontal" style={{ margin: 0 }} />}
      >
        <Tooltip title="移动" placement="right">
          <Button
            type="text"
            icon={<FullscreenOutlined />}
            onClick={handlers.grab}
            className={classnames({ active: interactionMode === 'grab' })}
          />
        </Tooltip>
        <Tooltip
          title="鼠标左键单击时点选，按住ctrl键可进行点选和框选"
          placement="right"
        >
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={handlers.selection}
            className={classnames({ active: interactionMode === 'selection' })}
          />
        </Tooltip>
        <div className={styles.moreMain}>
          <Button type="text" icon={<BorderOutlined />} className="more" />
          <div className={styles.menuList}>
            <Space
              className={styles.DrawToolbar}
              direction="vertical"
              split={<Divider type="horizontal" style={{ margin: 0 }} />}
            >
              <Tooltip title="矩形" placement="right">
                <Button
                  type="text"
                  icon={<BorderOutlined />}
                  onClick={onAddRect}
                />
              </Tooltip>
              <Tooltip title="矩形1" placement="right">
                <Button
                  type="text"
                  icon={<BorderOutlined />}
                  onClick={() => {
                    const id = v4();
                    const textOption = Object.assign({}, rect1, { id });
                    // const text1Option = Object.assign({}, text, { id });
                    // const option = Object.assign({}, group([textOption, text1Option]), {
                    //   id,
                    // });
                    console.log(textOption);
                    canvasRef.handler.add(textOption);
                  }}
                />
              </Tooltip>
              <Tooltip title="圆形" placement="right">
                <Button
                  type="text"
                  icon={<SyncOutlined />}
                  onClick={onAddCircle}
                />
              </Tooltip>
              <Tooltip title="多边形" placement="right">
                <Button
                  type="text"
                  icon={<GatewayOutlined />}
                  onClick={() => {
                    console.log(
                      '多边形参数：',
                      canvasRef.handler.drawingHandler.polygon,
                    );
                    canvasRef.handler.drawingHandler.polygon.init();
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        </div>
        <Tooltip title="直线" placement="right">
          <Button
            type="text"
            icon={<LineOutlined />}
            onClick={() => {
              canvasRef.handler.drawingHandler.line.init();
            }}
          />
        </Tooltip>
      </Space>
    );
  }
  return null;
});

export default DrawToolbar;
