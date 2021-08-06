import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { fabric } from 'fabric';
import { v4 } from 'uuid';
import ResizeObserver from 'resize-observer-polyfill';

import Handler, { HandlerOptions } from './handlers/Handler';
import { canvasOption } from './constants';

import './styles/core/canvas.less';
import './styles/core/tooltip.less';
import './styles/core/contextmenu.less';
import './styles/fabricjs/fabricjs.less';

//自定义控制项样式
fabric.Object.prototype.set({
  borderColor: '#69C0FF',
  cornerColor: '#1890FF', //激活状态角落图标的填充颜色
  cornerStrokeColor: '', //激活状态角落图标的边框颜色
  borderOpacityWhenMoving: 1,
  borderScaleFactor: 1,
  cornerSize: 8,
  cornerStyle: 'circle', //rect,circle
  centeredScaling: false, //角落放大缩小是否是以图形中心为放大原点
  centeredRotation: true, //旋转按钮旋转是否是左上角为圆心旋转
  transparentCorners: false, //激活状态角落的图标是否透明
  rotatingPointOffset: 20, //旋转距旋转体的距离
  originX: 'center',
  originY: 'center',
  lockUniScaling: false, //只显示四角的操作
  hasRotatingPoint: true, //是否显示旋转按钮
  selectionDashArray: [5, 5],
});

fabric.Object.prototype.resizeToScale = function () {
  console.log('调整监听-----------------', this);
  // if (this.type !== 'group') {
  //   this.strokeWidth =
  //     this._origStrokeWidth / Math.max(this.scaleX, this.scaleY);
  // } else {
  //   this._objects.forEach(function (obj) {
  //     obj.strokeWidth =
  //       obj._origStrokeWidth / Math.max(obj.group.scaleX, obj.group.scaleY);
  //   });
  // }
};

export type CanvasProps = HandlerOptions & {
  responsive?: boolean;
  style?: React.CSSProperties;
  ref?: React.RefAttributes<Handler>;
  container: any;
};

const Canvas = (props: any) => {
  const {
    id = v4(),
    editable = true,
    zoomEnabled = true,
    height = 0,
    width = 0,
    minZoom = 30,
    maxZoom = 300,
    responsive = true,
    onLoad,
    style,
    activeSelectionOption,
    propertiesToInclude,
    gridOption,
    objectOption,
    guidelineOption,
    workareaOption,
    fabricObjects,
    keyEvent,
    myRef,
  } = props;

  let canvas: any = useRef(null);
  let handler: any = useRef(null);
  const _innerCont: any = useRef(null);
  let resizeObserver: any = useRef(null);

  const [uuid] = useState<string>(v4());
  const [loaded, setLoaded] = useState<boolean>(false);

  useImperativeHandle(myRef, () => ({
    handler: handler.current,
    canvas: canvas.current,
  }));

  useEffect(() => {
    const mergedCanvasOption = Object.assign(
      {},
      canvasOption,
      props.canvasOption || {},
      {
        width,
        height,
        selection: editable,
      },
    );
    canvas.current = new fabric.Canvas(`canvas_${uuid}`, mergedCanvasOption);
    canvas.current.setBackgroundColor(
      mergedCanvasOption.backgroundColor,
      canvas.current.renderAll.bind(canvas.current),
    );
    canvas.current.selectionColor = 'rgba(149,195,238,0.3)'; //拖曳区块背景顏色
    canvas.current.selectionBorderColor = '#1890FF'; //设定拖曳区块边框顏色
    canvas.current.selectionLineWidth = '2'; //拖曳区块边框粗度
    canvas.current.renderAll();

    handler.current = new Handler({
      ...props,
      id,
      width,
      height,
      editable,
      canvas: canvas.current,
      container: _innerCont.current,
      canvasOption: mergedCanvasOption,
      zoomEnabled,
      minZoom,
      maxZoom,
    });

    if (responsive) {
      createObserver();
    } else {
      handleLoad();
    }
  }, []);

  //尺寸调整
  useEffect(() => {
    handler.current && handler.current.eventHandler.resize(width, height);
  }, [width, height]);

  useEffect(() => {
    if (handler.current) {
      handler.current.editable = editable;
    }
  }, [editable]);

  useEffect(() => {
    if (!responsive) {
      destroyObserver();
    } else {
      destroyObserver();
      createObserver();
    }
  }, [responsive]);

  useEffect(() => {
    handler.current &&
      handler.current.setActiveSelectionOption(activeSelectionOption);
  }, [activeSelectionOption]);

  useEffect(() => {
    handler.current && handler.current.setObjectOption(objectOption);
  }, [objectOption]);

  useEffect(() => {
    handler.current && handler.current.setCanvasOption(canvasOption);
  }, [canvasOption]);

  useEffect(() => {
    handler.current && handler.current.setKeyEvent(keyEvent);
  }, [keyEvent]);

  useEffect(() => {
    handler.current && handler.current.setFabricObjects(fabricObjects);
  }, [fabricObjects]);

  useEffect(() => {
    handler.current && handler.current.setGuidelineOption(guidelineOption);
  }, [guidelineOption]);

  useEffect(() => {
    handler.current && handler.current.setWorkareaOption(workareaOption);
  }, [workareaOption]);

  useEffect(() => {
    handler.current && handler.current.setGridOption(gridOption);
  }, [gridOption]);

  useEffect(() => {
    handler.current &&
      handler.current.setPropertiesToInclude(propertiesToInclude);
  }, [propertiesToInclude]);

  useEffect(() => {
    return () => {
      destroyObserver();
      handler.current?.destroy();
    };
  }, []);

  const createObserver = () => {
    resizeObserver.current = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        const { width = 0, height = 0 } =
          (entries[0] && entries[0].contentRect) || {};
        handler.current.eventHandler.resize(width, height);
        if (!loaded) {
          handleLoad();
        }
      },
    );
    resizeObserver.current.observe(_innerCont.current);
  };

  const destroyObserver = () => {
    if (resizeObserver.current) {
      resizeObserver.current?.disconnect();
      resizeObserver.current = null;
    }
  };

  const handleLoad = () => {
    setLoaded(true);
    onLoad && onLoad(handler.current, canvas.current);
  };

  return (
    <div
      ref={_innerCont}
      id={uuid}
      className="rde-canvas"
      style={{ width: '100%', height: '100%', ...style }}
    >
      <canvas id={`canvas_${uuid}`} />
    </div>
  );
};

export default Canvas;
