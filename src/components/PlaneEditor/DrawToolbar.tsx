import { memo, useState } from 'react';
import { Space, Button, Tooltip, Divider } from 'antd';
import { MinusOutlined, DragOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationArrow,
  faDrawPolygon,
} from '@fortawesome/free-solid-svg-icons';
import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';

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

    return (
      <Space
        className={styles.DrawToolbar}
        direction="vertical"
        split={<Divider type="horizontal" style={{ margin: 0 }} />}
      >
        <Tooltip title="移动" placement="right">
          <Button
            type="text"
            icon={<DragOutlined style={{ fontSize: 18 }} />}
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
            icon={
              <FontAwesomeIcon
                icon={faLocationArrow}
                rotation={270}
                size="10x"
              />
            }
            onClick={handlers.selection}
            className={classnames({ active: interactionMode === 'selection' })}
          />
        </Tooltip>
        <div className={styles.moreMain}>
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faSquare} size="10x" />}
            className="more"
          />
          <div className={styles.menuList}>
            <Space
              className={styles.DrawToolbar}
              direction="vertical"
              split={<Divider type="horizontal" style={{ margin: 0 }} />}
            >
              <Tooltip title="矩形" placement="right">
                <Button
                  type="text"
                  icon={<FontAwesomeIcon icon={faSquare} size="10x" />}
                  onClick={() => {
                    canvasRef.handler.drawingHandler.polygonRect.init();
                  }}
                />
              </Tooltip>
              <Tooltip title="圆形" placement="right">
                <Button
                  type="text"
                  icon={<FontAwesomeIcon icon={faCircle} size="10x" />}
                  onClick={() => {
                    canvasRef.handler.drawingHandler.polygonCircle.init();
                  }}
                />
              </Tooltip>
              <Tooltip title="多边形" placement="right">
                <Button
                  type="text"
                  icon={
                    <FontAwesomeIcon
                      icon={faDrawPolygon}
                      rotate={-45}
                      size="10x"
                    />
                  }
                  onClick={() => {
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
            icon={<MinusOutlined />}
            onClick={() => {
              canvasRef.handler.drawingHandler.line.init();
            }}
          />
        </Tooltip>
        {/*<Tooltip title="标记" placement="right">*/}
        {/*  <Button*/}
        {/*    type="text"*/}
        {/*    icon={<EnvironmentOutlined />}*/}
        {/*    onClick={() => {*/}
        {/*      canvasRef.handler.drawingHandler.line.init();*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</Tooltip>*/}
      </Space>
    );
  }
  return null;
});

export default DrawToolbar;
