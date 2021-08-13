import { Container, RefCanvas } from './components';
import {
  useRef,
  useReducer,
  useCallback,
  createRef,
  useMemo,
  useEffect,
} from 'react';
import { fabric } from 'fabric';
import { debounce } from 'lodash';
import { Button, Badge, Menu } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { defaultOption, propertiesToInclude, initValues } from './Option';
import HeaderToolbar from './HeaderToolbar';
import DrawToolbar from './DrawToolbar';
import styles from './index.less';

const PlaneEditor = () => {
  const canvasRef = useRef(null);
  const itemsRef = useRef(null);

  const reducer = useCallback(
    (state: any, action: { type: string; data: Partial<any> }) => {
      let preState = { ...state };
      switch (action.type) {
        case 'UPDATE': {
          preState = { ...preState, ...action.data };
          return Object.assign({}, state, preState);
        }
        default:
          return { ...state };
      }
    },
    [],
  );
  const [state, dispatch] = useReducer(reducer, initValues);

  //数据更新
  const onUpdate = (value: Partial<any>) => {
    if (value) {
      dispatch({ type: 'UPDATE', data: { ...value } });
    }
  };

  useEffect(() => {
    onUpdate({ loading: true });
    import('./config.json').then((descriptors) => {
      onUpdate({ descriptors, loading: false });
    });
    onUpdate({ selectedItem: null });
    // shortcutHandlers.esc();
  }, []);

  const transformList = () => {
    return (
      Object.values(state.descriptors).reduce(
        (prev: any, curr) => prev.concat(curr),
        [],
      ) || []
    );
  };

  const anchorWrapper = (anchorIndex, fn) => {
    return function (eventData, transform, x, y) {
      const fabricObject = transform.target,
        absolutePoint = fabric.util.transformPoint(
          {
            x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
            y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
          },
          fabricObject.calcTransformMatrix(),
        ),
        actionPerformed = fn(eventData, transform, x, y),
        newDim = fabricObject._setPositionDimensions({}),
        polygonBaseSize = fabricObject._getNonTransformedDimensions(),
        newX =
          (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) /
          polygonBaseSize.x,
        newY =
          (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) /
          polygonBaseSize.y;
      fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
      return actionPerformed;
    };
  };

  const polygonPositionHandler = (
    dim,
    finalMatrix,
    fabricObject,
    pointIndex,
  ) => {
    const x = fabricObject.points[pointIndex].x - fabricObject.pathOffset.x,
      y = fabricObject.points[pointIndex].y - fabricObject.pathOffset.y;
    return fabric.util.transformPoint(
      { x: x, y: y },
      fabric.util.multiplyTransformMatrices(
        fabricObject.canvas.viewportTransform,
        fabricObject.calcTransformMatrix(),
      ),
    );
  };

  const actionHandler = (eventData, transform, x, y) => {
    const polygon = transform.target,
      currentControl = polygon.controls[polygon.__corner],
      mouseLocalPosition = polygon.toLocalPoint(
        new fabric.Point(x, y),
        'center',
        'center',
      ),
      polygonBaseSize = polygon._getNonTransformedDimensions(),
      size = polygon._getTransformedDimensions(0, 0),
      finalPointPosition = {
        x:
          (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
          polygon.pathOffset.x,
        y:
          (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
          polygon.pathOffset.y,
      };
    polygon.points[currentControl.pointIndex] = finalPointPosition;
    return true;
  };

  // canvas 操作方法
  const canvasHandlers: any = {
    //添加
    onAdd: (target: any) => {
      const { editing } = state;
      if (!editing) {
        onUpdate({ editing: true });
      }
      if (target.type === 'activeSelection') {
        canvasHandlers.onSelect(null);
        return;
      }
      canvasRef.current?.handler.select(target);
    },
    onSelect: (target: any) => {
      const { selectedItem } = state;
      if (
        target &&
        target.id &&
        target.id !== 'workarea' &&
        target.type !== 'activeSelection'
      ) {
        if (selectedItem && target.id === selectedItem.id) {
          return;
        }
        canvasRef.current?.handler.getObjects().forEach((obj: any) => {
          if (obj) {
            canvasRef.current.handler.animationHandler.resetAnimation(
              obj,
              true,
            );
          }
        });
        onUpdate({
          selectedItem: target,
        });
        return;
      }
      canvasRef.current?.handler.getObjects().forEach((obj: any) => {
        if (obj) {
          canvasRef.current?.handler.animationHandler.resetAnimation(obj, true);
        }
      });
      onUpdate({
        selectedItem: null,
      });
    },
    onRemove: () => {
      const { editing } = state;
      if (!editing) {
        onUpdate({
          editing: true,
        });
      }
      canvasHandlers.onSelect(null);
    },
    onModified: debounce(() => {
      const { editing } = state;
      if (!editing) {
        onUpdate({
          editing: true,
        });
      }
    }, 300),
    onZoom: (zoom: number) => {
      onUpdate({
        zoomRatio: zoom,
      });
    },
    onChange: (selectedItem: any, changedValues: any, allValues: any) => {
      console.log('我改变了', selectedItem, changedValues, allValues);
      const { editing } = state;
      if (!editing) {
        onUpdate({
          editing: true,
        });
      }
      const changedKey = Object.keys(changedValues)[0];
      const changedValue = changedValues[changedKey];
      if (allValues?.workarea) {
        canvasHandlers.onChangeWokarea(
          changedKey,
          changedValue,
          allValues.workarea,
        );
        return;
      }
      if (changedKey === 'width' || changedKey === 'height') {
        canvasRef.current?.handler.scaleToResize(
          allValues.width,
          allValues.height,
        );
        return;
      }
      if (changedKey === 'angle') {
        canvasRef.current?.handler.rotate(allValues.angle);
        return;
      }
      if (changedKey === 'locked') {
        canvasRef.current?.handler.setObject({
          lockMovementX: changedValue,
          lockMovementY: changedValue,
          hasControls: !changedValue,
          hoverCursor: changedValue ? 'pointer' : 'move',
          editable: !changedValue,
          locked: changedValue,
        });
        return;
      }
      if (
        changedKey === 'file' ||
        changedKey === 'src' ||
        changedKey === 'code'
      ) {
        if (selectedItem.type === 'image') {
          canvasRef.current?.handler.setImageById(
            selectedItem.id,
            changedValue,
          );
        } else if (selectedItem.superType === 'element') {
          canvasRef.current?.handler.elementHandler.setById(
            selectedItem.id,
            changedValue,
          );
        }
        return;
      }
      if (changedKey === 'link') {
        const link = Object.assign({}, defaultOption.link, allValues.link);
        canvasRef.current.handler.set(changedKey, link);
        return;
      }
      if (changedKey === 'tooltip') {
        const tooltip = Object.assign(
          {},
          defaultOption.tooltip,
          allValues.tooltip,
        );
        canvasRef.current?.handler.set(changedKey, tooltip);
        return;
      }
      if (changedKey === 'animation') {
        const animation = Object.assign(
          {},
          defaultOption.animation,
          allValues.animation,
        );
        canvasRef.current?.handler.set(changedKey, animation);
        return;
      }
      if (changedKey === 'icon') {
        const { unicode, styles } = changedValue[Object.keys(changedValue)[0]];
        const uni = parseInt(unicode, 16);
        if (styles[0] === 'brands') {
          canvasRef.current?.handler.set('fontFamily', 'Font Awesome 5 Brands');
        } else if (styles[0] === 'regular') {
          canvasRef.current?.handler.set(
            'fontFamily',
            'Font Awesome 5 Regular',
          );
        } else {
          canvasRef.current?.handler.set('fontFamily', 'Font Awesome 5 Free');
        }
        canvasRef.current?.handler.set('text', String.fromCodePoint(uni));
        canvasRef.current?.handler.set('icon', changedValue);
        return;
      }
      if (changedKey === 'shadow') {
        if (allValues.shadow.enabled) {
          if ('blur' in allValues.shadow) {
            canvasRef.current?.handler.setShadow(allValues.shadow);
          } else {
            canvasRef.current?.handler.setShadow({
              enabled: true,
              blur: 15,
              offsetX: 10,
              offsetY: 10,
            });
          }
        } else {
          canvasRef.current?.handler.setShadow(null);
        }
        return;
      }
      if (changedKey === 'fontWeight') {
        canvasRef.current?.handler.set(
          changedKey,
          changedValue ? 'bold' : 'normal',
        );
        return;
      }
      if (changedKey === 'fontStyle') {
        canvasRef.current?.handler.set(
          changedKey,
          changedValue ? 'italic' : 'normal',
        );
        return;
      }
      if (changedKey === 'textAlign') {
        canvasRef.current?.handler.set(
          changedKey,
          Object.keys(changedValue)[0],
        );
        return;
      }
      if (changedKey === 'trigger') {
        const trigger = Object.assign(
          {},
          defaultOption.trigger,
          allValues.trigger,
        );
        canvasRef.current?.handler.set(changedKey, trigger);
        return;
      }
      if (changedKey === 'filters') {
        const filterKey = Object.keys(changedValue)[0];
        const filterValue = allValues.filters[filterKey];
        if (filterKey === 'gamma') {
          const rgb = [filterValue.r, filterValue.g, filterValue.b];
          canvasRef.current?.handler.imageHandler.applyFilterByType(
            filterKey,
            changedValue[filterKey].enabled,
            {
              gamma: rgb,
            },
          );
          return;
        }
        if (filterKey === 'brightness') {
          canvasRef.current?.handler.imageHandler.applyFilterByType(
            filterKey,
            changedValue[filterKey].enabled,
            {
              brightness: filterValue.brightness,
            },
          );
          return;
        }
        if (filterKey === 'contrast') {
          canvasRef.current?.handler.imageHandler.applyFilterByType(
            filterKey,
            changedValue[filterKey].enabled,
            {
              contrast: filterValue.contrast,
            },
          );
          return;
        }
        if (filterKey === 'saturation') {
          canvasRef.current?.handler.imageHandler.applyFilterByType(
            filterKey,
            changedValue[filterKey].enabled,
            {
              saturation: filterValue.saturation,
            },
          );
          return;
        }
        if (filterKey === 'hue') {
          canvasRef.current?.handler.imageHandler.applyFilterByType(
            filterKey,
            changedValue[filterKey].enabled,
            {
              rotation: filterValue.rotation,
            },
          );
          return;
        }
        if (filterKey === 'noise') {
          canvasRef.current?.handler.imageHandler.applyFilterByType(
            filterKey,
            changedValue[filterKey].enabled,
            {
              noise: filterValue.noise,
            },
          );
          return;
        }
        if (filterKey === 'pixelate') {
          canvasRef.current?.handler.imageHandler.applyFilterByType(
            filterKey,
            changedValue[filterKey].enabled,
            {
              blocksize: filterValue.blocksize,
            },
          );
          return;
        }
        if (filterKey === 'blur') {
          canvasRef.current?.handler.imageHandler.applyFilterByType(
            filterKey,
            changedValue[filterKey].enabled,
            {
              value: filterValue.value,
            },
          );
          return;
        }
        canvasRef.current?.handler.imageHandler.applyFilterByType(
          filterKey,
          changedValue[filterKey],
        );
        return;
      }
      canvasRef.current?.handler.set(changedKey, changedValue);
    },
    onChangeWokarea: (changedKey: any, changedValue: any, allValues: any) => {
      if (changedKey === 'layout') {
        canvasRef.current?.handler.workareaHandler.setLayout(changedValue);
        return;
      }
      if (changedKey === 'file' || changedKey === 'src') {
        canvasRef.current?.handler.workareaHandler.setImage(changedValue);
        return;
      }
      if (changedKey === 'width' || changedKey === 'height') {
        canvasRef.current?.handler.originScaleToResize(
          canvasRef.current?.handler.workarea,
          allValues.width,
          allValues.height,
        );
        canvasRef.current?.canvas.centerObject(
          canvasRef.current?.handler.workarea,
        );
        return;
      }
      canvasRef.current?.handler.workarea.set(changedKey, changedValue);
      canvasRef.current?.canvas.requestRenderAll();
    },
    onTooltip: (ref: any, target: any) => {
      const value = Math.random() * 10 + 1;
      // const { animations, styles } = data;
      // const { code } = target.trigger;
      // const compile = SandBox.compile(code);
      // const result = compile(value, animations, styles, target.userProperty);
      // console.log(result);
      return (
        <div>
          <div>
            <div>
              <Button>{target.id}</Button>
            </div>
            <Badge count={value} />
          </div>
        </div>
      );
    },
    onClick: (canvas: any, target: any) => {
      console.log('点击了', canvas, target);
      const { link } = target;
      if (link.state === 'current') {
        document.location.href = link.url;
        return;
      }
      window.open(link.url);
    },
    onContext: (ref: any, event: any, target: any) => {
      console.log('ref:', ref);
      console.log('event:', event);
      console.log('target:', target);
      if ((target && target.id === 'workarea') || !target) {
        // const { layerX: left, layerY: top } = event;
        return null;
        // return (
        //   <Menu>
        //     <Menu.SubMenu key="add" style={{ width: 120 }} title="添加">
        //       {transformList()?.map((item: any) => {
        //         const option = Object.assign({}, item.option, { left, top });
        //         const newItem = Object.assign({}, item, { option });
        //         return (
        //           <Menu.Item style={{ padding: 0 }} key={item.name}>
        //             {itemsRef.current?.renderItem(newItem, false)}
        //           </Menu.Item>
        //         );
        //       })}
        //     </Menu.SubMenu>
        //   </Menu>
        // );
      }
      // if (target.type === 'activeSelection') {
      //   return (
      //     <Menu>
      //       <Menu.Item
      //         style={{ margin: 0 }}
      //         onClick={() => {
      //           canvasRef.current?.handler.toGroup();
      //           ref.className = 'rde-contextmenu contextmenu-hidden';
      //         }}
      //       >
      //         合并组
      //       </Menu.Item>
      //       <Menu.Divider style={{ margin: 0 }} />
      //       <Menu.Item
      //         style={{ margin: 0 }}
      //         onClick={() => {
      //           canvasRef.current?.handler.duplicate();
      //           ref.className = 'rde-contextmenu contextmenu-hidden';
      //         }}
      //       >
      //         复制
      //       </Menu.Item>
      //       <Menu.Divider style={{ margin: 0 }} />
      //       <Menu.Item
      //         style={{ margin: 0 }}
      //         onClick={() => {
      //           canvasRef.current?.handler.remove();
      //           ref.className = 'rde-contextmenu contextmenu-hidden';
      //         }}
      //       >
      //         删除
      //       </Menu.Item>
      //     </Menu>
      //   );
      // }
      // if (target.type === 'group') {
      //   return (
      //     <Menu>
      //       <Menu.Item
      //         style={{ margin: 0 }}
      //         onClick={() => {
      //           canvasRef.current?.handler.toActiveSelection();
      //           ref.className = 'rde-contextmenu contextmenu-hidden';
      //         }}
      //       >
      //         拆分组
      //       </Menu.Item>
      //       <Menu.Divider style={{ margin: 0 }} />
      //       <Menu.Item
      //         style={{ margin: 0 }}
      //         onClick={() => {
      //           canvasRef.current?.handler.duplicate();
      //           ref.className = 'rde-contextmenu contextmenu-hidden';
      //         }}
      //       >
      //         复制
      //       </Menu.Item>
      //       <Menu.Divider style={{ margin: 0 }} />
      //       <Menu.Item
      //         style={{ margin: 0 }}
      //         onClick={() => {
      //           canvasRef.current?.handler.remove();
      //           ref.className = 'rde-contextmenu contextmenu-hidden';
      //         }}
      //       >
      //         删除
      //       </Menu.Item>
      //     </Menu>
      //   );
      // }
      //多边形
      if (target.type === 'LabeledPolygon') {
        return (
          <Menu style={{ width: 138 }} selectable={false}>
            <Menu.Item
              key="1"
              style={{ margin: 0 }}
              onClick={() => {
                const lastControl = target.points.length - 1;
                target.set({
                  // edit: true,
                  hasBorders: false,
                  cornerStyle: 'circle',
                  cornerColor: '#1890FF',
                  lockUniScaling: false,
                  controls: target.points.reduce(function (acc, point, index) {
                    acc['p' + index] = new fabric.Control({
                      positionHandler: (dim, finalMatrix, fabricObject) =>
                        polygonPositionHandler(
                          dim,
                          finalMatrix,
                          fabricObject,
                          index,
                        ),
                      actionHandler: anchorWrapper(
                        index > 0 ? index - 1 : lastControl,
                        actionHandler,
                      ),
                      actionName: 'modifyPolygon',
                      pointIndex: index,
                    });
                    return acc;
                  }, {}),
                });

                canvasRef.current.canvas.renderAll();
                ref.className = 'rde-contextmenu contextmenu-hidden';
              }}
            >
              编辑节点
            </Menu.Item>
            <Menu.Divider style={{ margin: 0 }} />
            <Menu.Item
              key="2"
              style={{ margin: 0 }}
              onClick={() => {
                canvasRef.current?.handler.duplicate();
                ref.className = 'rde-contextmenu contextmenu-hidden';
              }}
            >
              复制
            </Menu.Item>
            <Menu.Divider style={{ margin: 0 }} />
            <Menu.Item
              key="3"
              style={{ margin: 0 }}
              onClick={() => {
                canvasRef.current?.handler.remove();
                ref.className = 'rde-contextmenu contextmenu-hidden';
              }}
            >
              删除
            </Menu.Item>
            <Menu.SubMenu key="4" title="高级编辑">
              <Menu.Item
                key="4-1"
                onClick={() => {
                  // canvasRef.current?.handler.remove();
                  target.set({
                    hasBorders: true,
                    borderColor: '#69C0FF',
                    cornerColor: '#1890FF',
                    cornerStyle: 'circle',
                    controls: fabric.Object.prototype.controls,
                  });
                  canvasRef.current.canvas.renderAll();
                  ref.className = 'rde-contextmenu contextmenu-hidden';
                }}
              >
                拉伸/旋转
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>
        );
      }

      console.log('canvasRef.current', canvasRef.current);
      return (
        <Menu style={{ width: 138 }}>
          <Menu.Item
            onClick={() => {
              canvasRef.current?.handler.duplicateById(target.id);
              ref.className = 'rde-contextmenu contextmenu-hidden';
            }}
            style={{ margin: 0 }}
          >
            复制
          </Menu.Item>
          <Menu.Divider style={{ margin: 0 }} />
          <Menu.Item
            onClick={() => {
              canvasRef.current?.handler.removeById(target.id);
              ref.className = 'rde-contextmenu contextmenu-hidden';
            }}
            style={{ margin: 0 }}
          >
            删除
          </Menu.Item>
        </Menu>
      );
    },
    onTransaction: (transaction: any) => {},
  };

  // 方法
  const handlers = {
    onChangePreview: (checked: boolean) => {
      let data;
      if (canvasRef.current) {
        console.log(
          'canvasRef.current?.handler.exportJSON()',
          canvasRef.current?.handler.exportJSON(),
        );
        data = canvasRef.current?.handler.exportJSON().filter((obj) => {
          return !!obj.id;
        });
      }
      onUpdate({
        preview: typeof checked === 'object' ? false : checked,
        objects: data,
      });
    },
    onProgress: (progress: any) => {
      onUpdate({ progress });
    },
    onImport: (files: any) => {
      if (files) {
        onUpdate({ loading: true });
        setTimeout(() => {
          const reader = new FileReader();
          reader.onprogress = (e) => {
            if (e.lengthComputable) {
              const progress = parseInt(
                (Number(e.loaded) / Number(e.total)) * 100,
                10,
              );
              handlers.onProgress(progress);
            }
          };
          reader.onload = (e) => {
            const { objects, animations, styles, dataSources } = JSON.parse(
              e.target.result,
            );
            onUpdate({ animations, styles, dataSources });
            if (objects) {
              canvasRef.current?.handler.clear(true);
              const data = objects.filter((obj) => {
                if (!obj.id) {
                  return false;
                }
                return true;
              });
              canvasRef.current?.handler.importJSON(data);
            }
          };
          reader.onloadend = () => {
            onUpdate({ loading: false });
          };
          reader.onerror = () => {
            onUpdate({ loading: false });
          };
          reader.readAsText(files[0]);
        }, 500);
      }
    },
    onUpload: () => {
      const inputEl = document.createElement('input');
      inputEl.accept = '.json';
      inputEl.type = 'file';
      inputEl.hidden = true;
      inputEl.onchange = (e) => {
        handlers.onImport(e.target.files);
      };
      document.body.appendChild(inputEl); // required for firefox
      inputEl.click();
      inputEl.remove();
    },
    onDownload: () => {
      onUpdate({ loading: true });
      const objects = canvasRef.current?.handler.exportJSON().filter((obj) => {
        return obj.id;
      });
      const { animations, styles, dataSources } = state;
      const exportDatas = {
        objects,
        animations,
        styles,
        dataSources,
      };
      const anchorEl = document.createElement('a');
      anchorEl.href = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportDatas, null, '\t'),
      )}`;
      anchorEl.download = `${
        canvasRef.current?.handler.workarea.name || 'floor-plan'
      }.json`;
      document.body.appendChild(anchorEl); // required for firefox
      anchorEl.click();
      anchorEl.remove();
      onUpdate({ loading: false });
    },
    onChangeAnimations: (animations: any[]) => {
      if (!state.editing) {
        onUpdate({ editing: true });
      }
      onUpdate({ animations });
    },
    onChangeStyles: (styles: any[]) => {
      if (!state.editing) {
        onUpdate({ editing: true });
      }
      onUpdate({ styles });
    },
    onChangeDataSources: (dataSources: any[]) => {
      if (!state.editing) {
        onUpdate({ editing: true });
      }
      onUpdate({ dataSources });
    },
    onSaveImage: (option?: {
      name?: string;
      format?: 'png';
      quality?: number;
    }) => {
      canvasRef.current?.handler.saveCanvasImage({ ...option });
    },
  };

  return (
    <div className={styles.pEditorMain}>
      <Container
        loading={false}
        editing={state.editing}
        onDownload={handlers.onDownload}
        onSaveImage={handlers.onSaveImage}
        onUpload={handlers.onUpload}
      >
        <div className="p-editor">
          <div className="p-editor-header-toolbar">
            <HeaderToolbar
              canvasRef={canvasRef.current}
              onSelect={canvasHandlers.onSelect}
              zoomRatio={state.zoomRatio}
              objects={state.objects}
              onTooltip={canvasHandlers.onTooltip}
              onClick={canvasHandlers.onClick}
              onChangePreview={handlers.onChangePreview}
            />
          </div>
          <div className="p-editor-container">
            <div className="left-map-item">
              <DrawToolbar
                canvasRef={canvasRef.current}
                onSelect={canvasHandlers.onSelect}
                zoomRatio={state.zoomRatio}
              />
            </div>
            <div className="p-editor-canvas">
              <RefCanvas
                ref={canvasRef}
                className="rde-canvas"
                minZoom={50}
                maxZoom={500}
                objectOption={defaultOption}
                propertiesToInclude={propertiesToInclude}
                onModified={canvasHandlers.onModified}
                onAdd={canvasHandlers.onAdd}
                onRemove={canvasHandlers.onRemove}
                onSelect={canvasHandlers.onSelect}
                onZoom={canvasHandlers.onZoom}
                onTooltip={canvasHandlers.onTooltip}
                onClick={canvasHandlers.onClick}
                onContext={canvasHandlers.onContext}
                onTransaction={canvasHandlers.onTransaction}
                keyEvent={{
                  transaction: true,
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PlaneEditor;
