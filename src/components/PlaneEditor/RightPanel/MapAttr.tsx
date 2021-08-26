import { memo } from 'react';
import styles from '../index.less';

interface MapAttrProps {
  canvasRef: any;
  selectedItem: any;
}
const MapAttr = memo(({ canvasRef, selectedItem }: MapAttrProps) => {
  if (!selectedItem) {
    return (
      <div style={{ padding: '12px 16px' }}>
        <p style={{ textAlign: 'center', lineHeight: '30px' }}>
          选择元素后，可在这里查看或者修改元素属性
        </p>
      </div>
    );
  }
  // console.log('selectedItem', selectedItem);
  return (
    <div className={styles.mapAttr}>
      <ul>
        <li>
          <div className="label">ID</div>
          <div className="field-res">
            <p className="ellipsis-text" title={selectedItem.id}>
              {selectedItem.id}
            </p>
          </div>
        </li>
        <li>
          <div className="label">图形</div>
          <div className="field-res">
            <p className="ellipsis-text">{selectedItem.name}</p>
          </div>
        </li>
        <li>
          <div className="label">坐标X</div>
          <div className="field-res">{selectedItem.left}</div>
        </li>
        <li>
          <div className="label">坐标Y</div>
          <div className="field-res">{selectedItem.top}</div>
        </li>
        <li>
          <div className="label">绑定状态</div>
          <div className="field-res">未绑定</div>
        </li>
        {/*<li>*/}
        {/*  <div className="label">锁定</div>*/}
        {/*  <div className="field-res">未绑定</div>*/}
        {/*</li>*/}
        {/*<li>*/}
        {/*  <div className="label">显示</div>*/}
        {/*  <div className="field-res">未绑定</div>*/}
        {/*</li>*/}
      </ul>
    </div>
  );
});

export default MapAttr;
