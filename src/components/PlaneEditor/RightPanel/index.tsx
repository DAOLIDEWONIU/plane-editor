import { memo, useMemo, useState } from 'react';
import { Space, Button, Tooltip } from 'antd';
import { DatabaseOutlined, DoubleRightOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import MapLayer from './MapLayer';
import MapAttr from './MapAttr';

import styles from '../index.less';

interface RightPanelProps {
  canvasRef: any;
  selectedItem: any;
}
const RightPanel = memo((props: RightPanelProps) => {
  const { canvasRef, selectedItem } = props;
  if (!canvasRef?.handler) return null;
  const [selected, setSelected] = useState<number[]>([]);
  const getSelected = (type: number, oldType: number[]) => {
    switch (type) {
      case 1:
        if (oldType.includes(1)) {
          return oldType.filter((e) => e !== 1);
        }
        return [...oldType, 1];
      case 2:
      default:
        if (oldType.includes(2)) {
          return oldType.filter((e) => e !== 2);
        }
        return [...oldType, 2];
    }
  };

  const modeOnClick = (type: number) => {
    setSelected((old) => getSelected(type, old));
  };

  const onClose = (type: number) => {
    setSelected((old) => old.filter((e) => e !== type));
  };

  const height = useMemo(() => {
    return {
      pHeight: selected.length === 0 ? 0 : '100%',
      cHeight: selected.length === 2 ? '50%' : '100%',
    };
  }, [selected]);

  return (
    <div className={styles.RightPanelMain}>
      <Space className={styles.RightPanel} direction="vertical">
        <Tooltip title="属性" placement="left">
          <Button
            type="text"
            icon={<DatabaseOutlined />}
            className={classnames({ active: selected.includes(1) })}
            onClick={() => modeOnClick(1)}
          />
        </Tooltip>
        <Tooltip title="图层" placement="left">
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faLayerGroup} size="10x" />}
            className={classnames({ active: selected.includes(2) })}
            onClick={() => modeOnClick(2)}
          />
        </Tooltip>
      </Space>
      <div className={styles.floatPanel} style={{ height: height.pHeight }}>
        <div
          className={classnames(styles.panel, {
            [styles.open]: selected.includes(1),
          })}
          style={{ height: height.cHeight }}
        >
          <div className={styles.panelHead}>
            <span>属性</span>
            <DoubleRightOutlined title="点击关闭" onClick={() => onClose(1)} />
          </div>
          <div className={styles.content}>
            <MapAttr canvasRef={canvasRef} selectedItem={selectedItem} />
          </div>
        </div>
        <div
          className={classnames(styles.panel, {
            [styles.open]: selected.includes(2),
          })}
          style={{ height: height.cHeight }}
        >
          <div className={styles.panelHead}>
            <span>图层</span>
            <DoubleRightOutlined title="点击关闭" onClick={() => onClose(2)} />
          </div>
          <div className={styles.content}>
            <MapLayer canvasRef={canvasRef} selectedItem={selectedItem} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default RightPanel;
