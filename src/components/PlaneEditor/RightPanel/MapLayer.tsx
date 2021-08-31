import { memo, useEffect, useMemo, useState } from 'react';
import { Menu, Button, Space, Tooltip } from 'antd';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { LockOutlined, EyeOutlined } from '@ant-design/icons';
import styles from '../index.less';
import classNames from 'classnames';

interface MapLayerProps {
  canvasRef: any;
  selectedItem: any;
}
const SortableItem = sortableElement(
  ({ value, onLock, onShow, visible, locked, id }: any) => (
    <li>
      <div className={styles.listName}>{value}</div>
      <div className="btn-group">
        <Space>
          <Tooltip title="显示" placement="bottom">
            <Button
              disabled={id === 'workarea'}
              className={classNames({ disabled: !visible })}
              type="text"
              icon={<EyeOutlined />}
              onClick={onShow}
            />
          </Tooltip>
          <Tooltip title="锁定" placement="bottom">
            <Button
              disabled={id === 'workarea'}
              type="text"
              className={classNames({ disabled: locked ? false : true })}
              icon={<LockOutlined />}
              onClick={onLock}
            />
          </Tooltip>
        </Space>
      </div>
    </li>
  ),
);

const SortableContainer = sortableContainer(({ children }) => {
  return <ul style={{ width: '100%', height: '100%' }}>{children}</ul>;
});

const MapLayer = memo(({ canvasRef, selectedItem }: MapLayerProps) => {
  const [dataSource, setDataSource] = useState<any[]>([]);

  // const RenderLayer = useMemo(() => {
  //   return canvasRef.canvas
  //     .getObjects()
  //     .filter((obj: any) => {
  //       if (obj.id === 'workarea') {
  //         return false;
  //       }
  //       return !!obj.id;
  //     })
  //     .map((obj: any) => {
  //       let className = 'rde-canvas-list-item';
  //       if (selectedItem && selectedItem?.id === obj.id) {
  //         className += ' selected-item';
  //       }
  //       return (
  //         <Menu
  //           key={obj.id}
  //           className={className}
  //           style={{ cursor: 'pointer' }}
  //         >
  //           <Menu.Item key={obj.id}>{obj.name || obj.type}</Menu.Item>
  //         </Menu>
  //       );
  //     });
  // }, [canvasRef]);

  useEffect(() => {
    if (canvasRef) {
      const data = canvasRef.canvas
        .getObjects()
        .filter((obj: any) => {
          // if (obj.id === 'workarea') {
          //   return false;
          // }
          return !!obj.id;
        })
        .map((e) => ({
          ...e,
          name: e.id === 'workarea' ? '背景底图' : e.name,
        }));
      setDataSource(data);
    }
  }, [canvasRef]);

  const onSortEnd = ({ oldIndex, newIndex }: any) => {
    if (oldIndex !== newIndex) {
      //sendBackwards
      console.log('oldIndex', canvasRef); //getActiveObject
      console.log('oldIndex', oldIndex);
      console.log('newIndex', newIndex);
      const newData = arrayMoveImmutable(
        [].concat(dataSource),
        oldIndex,
        newIndex,
      ).filter((el) => !!el);
      setDataSource(newData);

      if (newIndex < oldIndex) {
        console.log('上移', newData);
        canvasRef.handler.sendObjBackwards(newData[newIndex]?.id);
        //上移
      } else {
        //下移
        console.log('下移');
        //
        canvasRef.handler.bringObjForward(newData[newIndex]?.id);
      }
    }
  };

  const setObjAttr = (Obj: any, locked: boolean) => {
    // lockMovementX: changedValue,
    //   lockMovementY: changedValue,
    //   hasControls: !changedValue,
    //   hoverCursor: changedValue ? 'pointer' : 'move',
    //   editable: !changedValue,
    //   locked: changedValue,
    canvasRef.handler.setByObject(Obj, 'locked', locked);
    canvasRef.handler.setByObject(Obj, 'editable', !locked);
    canvasRef.handler.setByObject(
      Obj,
      'hoverCursor',
      locked ? 'pointer' : 'move',
    );
    canvasRef.handler.setByObject(Obj, 'hasControls', !locked);
    canvasRef.handler.setByObject(Obj, 'lockMovementY', locked);
    canvasRef.handler.setByObject(Obj, 'lockMovementX', locked);
  };

  return (
    <SortableContainer onSortEnd={onSortEnd} helperClass="row-dragging">
      {dataSource.map((value, index) => (
        <SortableItem
          key={`item-${value.id}`}
          index={index}
          value={value.name}
          id={value.id}
          visible={!!value?.visible}
          locked={!!value?.locked}
          onLock={() => {
            const locked = !value?.locked;
            const Obj = canvasRef.handler.findById(value.id);
            setObjAttr(Obj, locked);
            canvasRef.handler.canvas.discardActiveObject();
            canvasRef.handler.canvas.renderAll();
          }}
          onShow={() => {
            const visible = !value?.visible;
            const Obj = canvasRef.handler.findById(value.id);
            canvasRef.handler.setByObject(Obj, 'visible', visible);
            canvasRef.handler.canvas.discardActiveObject();
            canvasRef.handler.canvas.renderAll();
          }}
        />
      ))}
    </SortableContainer>
  );
});

export default MapLayer;
