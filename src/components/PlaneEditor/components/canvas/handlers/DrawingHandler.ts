import { fabric } from 'fabric';
import { v4 } from 'uuid';

import Handler from './Handler';
import { FabricEvent, FabricObject } from '../utils';
import { Arrow, Line } from '../objects';
import CanvasObject from '../CanvasObject';
import {
  actionHandler,
  anchorWrapper,
  distanceOfPointAndLine,
  getDistanceBetweenTwoPoints,
  insertFictitiousPoints,
  polygonPositionHandler,
  MousePointer,
  fictitiousFunc,
} from '@/utils';

class DrawingHandler {
  handler: Handler;
  constructor(handler: Handler) {
    this.handler = handler;
  }

  polygon = {
    init: () => {
      this.handler.interactionHandler.drawing('polygon');
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
    },
    finish: () => {
      this.handler.pointArray.forEach((point) => {
        this.handler.canvas.remove(point);
      });
      this.handler.lineArray.forEach((line) => {
        this.handler.canvas.remove(line);
      });
      this.handler.canvas.remove(this.handler.activeLine);
      this.handler.canvas.remove(this.handler.activeShape);
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      this.handler.canvas.renderAll();
      this.handler.interactionHandler.selection();
    },
    addPoint: (opt: FabricEvent) => {
      const { e, absolutePointer } = opt;
      const { x, y } = absolutePointer;
      const circle = new fabric.Circle({
        radius: 3,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 0.5,
        left: x,
        top: y,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        originX: 'center',
        originY: 'center',
        hoverCursor: 'pointer',
      }) as FabricObject<fabric.Circle>;
      circle.set({
        id: v4(),
      });
      if (!this.handler.pointArray.length) {
        circle.set({
          fill: 'red',
        });
      }
      const points = [x, y, x, y];
      //点击线配置
      const line = new fabric.Line(points, {
        strokeWidth: 2,
        fill: '#E3F1FF',
        stroke: '#1089ff',
        originX: 'center',
        originY: 'center',
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
      }) as FabricObject<fabric.Line>;
      line.set({
        class: 'line',
      });
      if (this.handler.activeShape) {
        const position = this.handler.canvas.getPointer(e);
        const activeShapePoints = this.handler.activeShape.get(
          'points',
        ) as Array<{ x: number; y: number }>;
        activeShapePoints.push({
          x: position.x,
          y: position.y,
        });
        const polygon = new fabric.Polygon(activeShapePoints, {
          stroke: '#333333',
          strokeWidth: 0.5,
          fill: '#8c8c8c',
          opacity: 0.1,
          selectable: true,
          hasBorders: true,
          hasControls: false,
          evented: false,
        });
        this.handler.canvas.remove(this.handler.activeShape);
        this.handler.canvas.add(polygon);
        this.handler.activeShape = polygon;
        this.handler.canvas.renderAll();
      } else {
        const polyPoint = [{ x, y }];
        const polygon = new fabric.Polygon(polyPoint, {
          stroke: '#333333',
          strokeWidth: 0.5,
          fill: '#cccccc',
          opacity: 0.1,
          selectable: true,
          hasBorders: true,
          hasControls: false,
          evented: false,
        });
        this.handler.activeShape = polygon;
        this.handler.canvas.add(polygon);
      }
      this.handler.activeLine = line;
      this.handler.pointArray.push(circle);
      this.handler.lineArray.push(line);
      this.handler.canvas.add(line);
      this.handler.canvas.add(circle);
    },
    generate: (pointArray: FabricObject<fabric.Circle>[]) => {
      console.log('多边形绘制数据,', pointArray);
      const points = [] as any[];
      const id = v4();
      pointArray.forEach((point) => {
        points.push({
          x: point.left,
          y: point.top,
        });
        this.handler.canvas.remove(point);
      });
      this.handler.lineArray.forEach((line) => {
        this.handler.canvas.remove(line);
      });
      this.handler.canvas
        .remove(this.handler.activeShape)
        .remove(this.handler.activeLine);
      const option = {
        id,
        points,
        type: 'LabeledPolygon',
        stroke: '#7A97CC',
        strokeWidth: 1,
        fill: '#E3F1FF',
        // opacity: 1,
        // text: '12',
        objectCaching: !this.handler.editable,
        name: '多边形',
        superType: 'drawing',
        visible: true,
        locked: false,
        backgroundColor: 'rgba(255,255,255,.1)',
        opacity: 0.7,
      };
      this.handler.add(option, false);
      this.handler.pointArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      this.handler.interactionHandler.selection();
    },
    // TODO... polygon resize
    // createResize: (target, points) => {
    //   points.forEach((point, index) => {
    //     const { x, y } = point;
    //     const circle = new fabric.Circle({
    //       name: index,
    //       radius: 3,
    //       fill: '#ffffff',
    //       stroke: '#333333',
    //       strokeWidth: 0.5,
    //       left: x,
    //       top: y,
    //       hasBorders: false,
    //       hasControls: false,
    //       originX: 'center',
    //       originY: 'center',
    //       hoverCursor: 'pointer',
    //       parentId: target.id,
    //     });
    //     this.handler.pointArray.push(circle);
    //   });
    //   const group = [target].concat(this.pointArray);
    //   this.handler.canvas.add(
    //     new fabric.Group(group, { type: 'polygon', id: v4() }),
    //   );
    // },
    // removeResize: () => {
    //   if (this.handler.pointArray) {
    //     this.handler.pointArray.forEach((point) => {
    //       this.handler.canvas.remove(point);
    //     });
    //     this.handler.pointArray = [];
    //   }
    // },
    // movingResize: (target, e) => {
    //   const points = target.diffPoints || target.points;
    //   const diffPoints = [];
    //   points.forEach((point) => {
    //     diffPoints.push({
    //       x: point.x + e.movementX,
    //       y: point.y + e.movementY,
    //     });
    //   });
    //   target.set({
    //     diffPoints,
    //   });
    //   this.handler.canvas.renderAll();
    // },
  };

  polygonRect = {
    init: () => {
      this.handler.interactionHandler.drawing('polygonRect');
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      this.handler.canvas.add(MousePointer);
      this.handler.mouseShape = MousePointer;
      this.handler.canvas.renderAll();
    },
    finish: () => {
      this.handler.pointArray.forEach((point) => {
        this.handler.canvas.remove(point);
      });
      this.handler.lineArray.forEach((line) => {
        this.handler.canvas.remove(line);
      });
      this.handler.canvas.remove(this.handler.activeLine);
      this.handler.canvas.remove(this.handler.activeShape);
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      this.handler.canvas.renderAll();
      this.handler.interactionHandler.selection();
    },
    addPoint: (opt: FabricEvent) => {
      // console.log('opt===========', opt);
      const { e, absolutePointer } = opt;
      const { x, y } = absolutePointer;
      const circle = new fabric.Circle({
        radius: 3,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 0.5,
        left: x,
        top: y,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        originX: 'center',
        originY: 'center',
        hoverCursor: 'pointer',
      }) as FabricObject<fabric.Circle>;
      circle.set({
        id: v4(),
      });
      if (!this.handler.pointArray?.length) {
        circle.set({
          fill: '#ffffff',
        });
      }
      const points = [x, y, x, y];
      //点击线配置
      const line = new fabric.Line(points, {
        strokeWidth: 2,
        fill: '#E3F1FF',
        stroke: '#1089ff',
        originX: 'center',
        originY: 'center',
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
      }) as FabricObject<fabric.Line>;
      line.set({
        class: 'line',
      });
      if (this.handler.activeShape) {
        // console.log('我被渲染了');
        // const pointArray = this.handler.pointArray;
        // if (pointArray?.length === 2) {
        //   const Distance = getDistanceBetweenTwoPoints(
        //     pointArray[0].left,
        //     pointArray[0].top,
        //     pointArray[1].left,
        //     pointArray[1].top,
        //   );
        //
        //   const xDiff = pointArray[1].left - pointArray[0].left;
        //   const yDiff = pointArray[1].top - pointArray[0].top;
        //   const angle1 = Math.atan2(yDiff, xDiff);
        //   const re = (angle1 * 180) / Math.PI;
        //
        //   this.handler.activeShape?.set({
        //     width: Distance,
        //     height: 100,
        //     left: pointArray[0].left,
        //     top: pointArray[0].top,
        //     angle: re,
        //     originX: 'left',
        //     originY: 'bottom',
        //   });
        // }
        // this.handler.canvas.remove(this.handler.activeLine);
        // this.handler.canvas.requestRenderAll();
      } else {
        // const xDiff = pointArray[1].left - pointArray[0].left;
        // const yDiff = pointArray[1].top - pointArray[0].top;
        // const angle1 = Math.atan2(yDiff, xDiff);
        // const re = (angle1 * 180) / Math.PI;

        const polygon = new fabric.Rect({
          stroke: '#1089ff',
          strokeWidth: 2,
          fill: 'rgba(255,255,255,.7)',
          opacity: 1,
          selectable: true,
          hasBorders: true,
          hasControls: false,
          evented: false,
          lockUniScaling: false,
          centeredScaling: false,
        });
        this.handler.activeShape = polygon;
        this.handler.canvas.add(polygon);
      }
      this.handler.activeLine = line;
      this.handler.pointArray.push(circle);
      this.handler.lineArray.push(line);
      this.handler.canvas.add(line);
      this.handler.canvas.add(circle);
    },
    generate: (pointArray: any[]) => {
      const id = v4();

      this.handler.pointArray?.forEach((point) => {
        this.handler.canvas.remove(point);
      });
      this.handler.lineArray?.forEach((line) => {
        this.handler.canvas.remove(line);
      });
      this.handler.canvas
        .remove(this.handler.activeShape)
        .remove(this.handler.mouseShape)
        .remove(this.handler.activeLine);

      const option = {
        id,
        points: pointArray,
        type: 'LabeledPolygon',
        // type: 'polygon',
        stroke: '#7A97CC',
        strokeWidth: 1,
        // fill: '#E3F1FF',
        fill: 'rgba(10,114,211,0.6)',
        objectCaching: !this.handler.editable,
        name: '多边形',
        superType: 'drawing',
        visible: true,
        locked: false,
        backgroundColor: 'rgba(255,255,255,.1)',
        opacity: 1,
        hoverCursor: 'pointer',
        label: '我就是测试文字显示的',
      };

      this.handler.add(option, false);
      this.handler.pointArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      this.handler.mouseShape = null;
      this.handler.interactionHandler.selection();
    },
  };

  polygonCircle = {
    init: () => {
      this.handler.interactionHandler.drawing('polygonCircle');
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.activeShape = null;
    },
    finish: () => {
      this.handler.pointArray?.forEach((point) => {
        this.handler.canvas.remove(point);
      });
      this.handler.lineArray?.forEach((line) => {
        this.handler.canvas.remove(line);
      });
      this.handler.canvas.remove(this.handler.activeShape);
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.activeShape = null;
      this.handler.canvas.renderAll();
      this.handler.interactionHandler.selection();
    },
    addPoint: (opt: FabricEvent) => {
      const { absolutePointer } = opt;
      const { x, y } = absolutePointer;
      const circle = new fabric.Circle({
        radius: 3,
        fill: '#1089ff',
        stroke: '#333333',
        strokeWidth: 0.5,
        left: x,
        top: y,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        originX: 'center',
        originY: 'center',
        hoverCursor: 'pointer',
      }) as FabricObject<fabric.Circle>;
      circle.set({
        id: v4(),
      });
      // if (!this.handler.pointArray?.length) {
      //   circle.set({
      //     fill: '#ffffff',
      //   });
      // }
      const points = [x, y, x, y];
      //点击线配置
      const line = new fabric.Line(points, {
        strokeWidth: 2,
        fill: '#E3F1FF',
        stroke: '#1089ff',
        originX: 'center',
        originY: 'center',
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
      }) as FabricObject<fabric.Line>;
      line.set({
        class: 'line',
      });
      if (this.handler.activeShape) {
      } else {
        // const xDiff = pointArray[1].left - pointArray[0].left;
        // const yDiff = pointArray[1].top - pointArray[0].top;
        // const angle1 = Math.atan2(yDiff, xDiff);
        // const re = (angle1 * 180) / Math.PI;
        const polygon = new fabric.Circle({
          stroke: '#1089ff',
          strokeWidth: 2,
          fill: 'rgba(255,255,255,.7)',
          opacity: 1,
          selectable: true,
          hasBorders: true,
          hasControls: false,
          evented: false,
          radius: 10,
        });
        this.handler.activeShape = polygon;
        this.handler.canvas.add(polygon);
      }
      this.handler.activeLine = line;
      this.handler.pointArray.push(circle);
      this.handler.lineArray.push(line);
      this.handler.canvas.add(line);
      this.handler.canvas.add(circle);
    },
    generate: (pointArray: any[]) => {
      const id = v4();

      this.handler.pointArray?.forEach((point) => {
        this.handler.canvas.remove(point);
      });
      this.handler.lineArray?.forEach((line) => {
        this.handler.canvas.remove(line);
      });
      this.handler.canvas.remove(this.handler.activeShape);

      const option = {
        id,
        points: pointArray,
        type: 'polygon',
        stroke: '#7A97CC',
        strokeWidth: 1,
        fill: 'rgba(226,240,253,0.6)',
        objectCaching: !this.handler.editable,
        name: '多边形',
        superType: 'drawing',
        visible: true,
        locked: false,
        backgroundColor: 'rgba(255,255,255,.1)',
        opacity: 1,
      };
      this.handler.add(option, false);
      this.handler.pointArray = [];
      this.handler.activeShape = null;
      this.handler.interactionHandler.selection();
    },
  };

  line = {
    init: () => {
      this.handler.interactionHandler.drawing('line');
      this.handler.pointArray = [];
      this.handler.activeLine = null;
    },
    finish: () => {
      this.handler.pointArray.forEach((point) => {
        this.handler.canvas.remove(point);
      });
      this.handler.canvas.remove(this.handler.activeLine);
      this.handler.pointArray = [];
      this.handler.activeLine = null;
      this.handler.canvas.renderAll();
      this.handler.interactionHandler.selection();
    },
    addPoint: (opt: FabricEvent) => {
      const { absolutePointer } = opt;
      const { x, y } = absolutePointer;
      const circle = new fabric.Circle({
        radius: 4,
        fill: '#1089FF',
        stroke: '#fff',
        strokeWidth: 1,
        left: x,
        top: y,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        originX: 'center',
        originY: 'center',
        hoverCursor: 'pointer',
      });
      if (!this.handler.pointArray.length) {
        circle.set({
          fill: '#1089FF',
        });
      }
      const points = [x, y, x, y];
      this.handler.activeLine = new Line(points, {
        strokeWidth: 2,
        fill: '#1089FF',
        stroke: '#1089FF',
        originX: 'center',
        originY: 'center',
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
      });
      this.handler.activeLine.set({
        class: 'line',
      });
      this.handler.pointArray.push(circle);
      this.handler.canvas.add(this.handler.activeLine);
      this.handler.canvas.add(circle);
    },
    generate: (opt: FabricEvent) => {
      const { absolutePointer } = opt;
      const { x, y } = absolutePointer;
      let points = [] as number[];
      const id = v4();
      this.handler.pointArray.forEach((point) => {
        points = points.concat(point.left, point.top, x, y);
        this.handler.canvas.remove(point);
      });
      console.log('points', points);
      this.handler.canvas.remove(this.handler.activeLine);
      const option = {
        id,
        points,
        type: 'line',
        stroke: '#082E76',
        strokeWidth: 2,
        opacity: 0.7,
        objectCaching: !this.handler.editable,
        name: '路径',
        superType: 'drawing',
        visible: true,
        locked: false,
        backgroundColor: 'rgba(255,255,255,.1)',
      };
      this.handler.add(option, false);
      this.handler.pointArray = [];
      this.handler.activeLine = null;
      this.handler.interactionHandler.selection();
    },
  };

  arrow = {
    init: () => {
      this.handler.interactionHandler.drawing('arrow');
      this.handler.pointArray = [];
      this.handler.activeLine = null;
    },
    finish: () => {
      this.handler.pointArray.forEach((point) => {
        this.handler.canvas.remove(point);
      });
      this.handler.canvas.remove(this.handler.activeLine);
      this.handler.pointArray = [];
      this.handler.activeLine = null;
      this.handler.canvas.renderAll();
      this.handler.interactionHandler.selection();
    },
    addPoint: (opt: FabricEvent) => {
      const { absolutePointer } = opt;
      const { x, y } = absolutePointer;
      const circle = new fabric.Circle({
        radius: 3,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 0.5,
        left: x,
        top: y,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        originX: 'center',
        originY: 'center',
        hoverCursor: 'pointer',
      });
      if (!this.handler.pointArray.length) {
        circle.set({
          fill: 'red',
        });
      }
      const points = [x, y, x, y];
      this.handler.activeLine = new Arrow(points, {
        strokeWidth: 1,
        fill: '#999999',
        stroke: '#999999',
        class: 'line',
        originX: 'center',
        originY: 'center',
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
      });
      this.handler.pointArray.push(circle);
      this.handler.canvas.add(this.handler.activeLine);
      this.handler.canvas.add(circle);
    },
    generate: (opt: FabricEvent) => {
      const { absolutePointer } = opt;
      const { x, y } = absolutePointer;
      let points = [] as number[];
      this.handler.pointArray.forEach((point) => {
        points = points.concat(point.left, point.top, x, y);
        this.handler.canvas.remove(point);
      });
      this.handler.canvas.remove(this.handler.activeLine);
      const option = {
        id: v4(),
        points,
        type: 'arrow',
        stroke: 'rgba(0, 0, 0, 1)',
        strokeWidth: 3,
        opacity: 1,
        objectCaching: !this.handler.editable,
        name: 'New line',
        superType: 'drawing',
      };
      this.handler.add(option, false);
      this.handler.pointArray = [];
      this.handler.activeLine = null;
      this.handler.interactionHandler.selection();
    },
  };

  bezier = {
    init: (points: any[], activeObject: any, Context: any) => {
      this.handler.interactionHandler.drawing('bezier');
      const po = activeObject.get('points');
      console.log('获取的', activeObject);

      this.handler.ctx = activeObject;
      this.handler.targetContext = Context;
      this.handler.pointIndex = -1;
      this.handler.cachePointsArr = po || [];
      this.handler.isMousedown = false;
      this.handler.isInPolygon = false;
      this.handler.startPos = { x: 0, y: 0 };
      this.handler.pointArray = insertFictitiousPoints(
        po,
        this.handler.isMousedown,
      );
      this.handler.activeShape = null;
      this.handler.mouseShape = null;
      //鼠标样式添加
      this.handler.tmpPointArray = [];
      // this.bezier.createTempPoint();
      this.handler.tmpPoint = null;

      this.bezier.render();
    },
    createTempPoint: () => {
      const tempPoint: any[] = [];
      this.handler.pointArray = this.handler.pointArray?.map((e) => {
        if (e?.fictitious) {
          const id = v4();
          const point = new fabric.Circle({
            id,
            radius: 7,
            fill: '#ea2de7',
            stroke: '#fff',
            strokeWidth: 2,
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false,
            originX: 'center',
            originY: 'center',
            left: e.x,
            top: e.y,
          });
          tempPoint.push(point);
          this.handler.canvas.add(point);
          return { ...e, id };
        }
        const id = v4();
        const point = new fabric.Circle({
          id,
          radius: 7,
          fill: '#08318e',
          stroke: '#fff',
          strokeWidth: 2,
          selectable: false,
          hasBorders: false,
          hasControls: false,
          evented: false,
          originX: 'center',
          originY: 'center',
          left: e.x,
          top: e.y,
        });
        tempPoint.push(point);
        this.handler.canvas.add(point);
        return e;
      });

      // 更新;
      this.handler.tmpPointArray = tempPoint;
      this.handler.canvas.renderAll();
    },
    finish: () => {
      const pointArray = this.handler.pointArray?.filter((item) => {
        return !item.fictitious;
      });
      this.handler.ctx.set({
        points: pointArray?.map((e) => ({ x: e.x, y: e.y })),
        controls: this.bezier.updateControls(pointArray || []),
      });

      // this.handler.pointArray?.forEach((point) => {
      //   this.handler.canvas.remove(point);
      // });

      this.handler.tmpPointArray?.forEach((point) => {
        this.handler.canvas.remove(point);
      });
      this.handler.canvas
        .remove(this.handler.activeShape)
        .remove(this.handler.mouseShape);
      this.handler.pointArray = [];
      this.handler.activeShape = null;
      this.handler.tmpPoint = null;
      this.handler.mouseShape = null;

      this.handler.interactionHandler.selection();
      this.handler.canvas.renderAll();
    },
    addTempPoint: (opt: { x: number; y: number }) => {
      const { x, y } = opt;
      const circle = new fabric.Circle({
        radius: 4,
        fill: '#1089ff',
        stroke: '#fff',
        strokeWidth: 0.5,
        left: x,
        top: y,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        originX: 'center',
        originY: 'center',
        hoverCursor: 'pointer',
      }) as FabricObject<fabric.Circle>;
      circle.set({
        id: v4(),
      });

      if (this.handler.activeShape) {
        const activeShapePoints: any[] =
          this.handler.tmpPointArray?.map((_) => ({
            x: _.left,
            y: _.top,
          })) || [];

        activeShapePoints.push({
          x,
          y,
        });
        const polygon = new fabric.Polyline(activeShapePoints, {
          stroke: '#d81a1a',
          strokeWidth: 1,
          fill: 'rgba(255,255,255,0.0001)',
          opacity: 1,
          selectable: true,
          hasBorders: true,
          hasControls: false,
          evented: false,
          width: 1000,
          height: 1000,
        });
        this.handler.canvas.remove(this.handler.activeShape);
        this.handler.canvas.add(polygon);
        this.handler.activeShape = polygon;
        this.handler.canvas.renderAll();
      } else {
        const polyPoint = [{ x, y }];
        const polygon = new fabric.Polyline(polyPoint, {
          stroke: '#1089ff',
          strokeWidth: 2,
          fill: 'rgba(255,255,255,.7)',
          selectable: true,
          hasBorders: true,
          hasControls: false,
          evented: false,
        });
        this.handler.activeShape = polygon;
        this.handler.canvas.add(polygon);
      }

      this.handler.tmpPointArray.push(circle);
      this.handler.canvas.add(circle);
      this.handler.canvas.renderAll();
    },
    //插入虚拟顶点
    insertFictitiousPoints: () => {
      if (this.handler.isMousedown) {
        return;
      }
      if (!this.handler.pointArray) return;
      // 生成虚拟顶点，跟创建线段一样的逻辑，只是计算的是线段的中点位置
      let points = [];
      let arr = this.handler.pointArray;
      let len = arr.length;
      for (let i = 0; i < len - 1; i++) {
        let p1 = arr[i];
        let p2 = arr[i + 1];
        points.push({
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
          fictitious: true, // 这个字段标志是否是虚拟顶点
        });
      }
      points.push({
        x: (arr[len - 1].x + arr[0].x) / 2,
        y: (arr[len - 1].y + arr[0].y) / 2,
        fictitious: true,
      });
      // 插入到顶点数组里
      let newArr = [];
      for (let i = 0; i < this.handler.pointArray.length; i++) {
        newArr.push(this.handler.pointArray[i]);
        newArr.push(points.shift());
      }
      this.handler.pointArray = newArr;
    },
    updateControls: (pointsArr: any[]) => {
      if (pointsArr && pointsArr.length > 0) {
        const lastControl = pointsArr.length - 1;
        const AccessListArr = pointsArr.map((e, i) => {
          return [
            'p' + i,
            new fabric.Control({
              positionHandler: (dim, finalMatrix, fabricObject) =>
                polygonPositionHandler(dim, finalMatrix, fabricObject, i),
              actionHandler: anchorWrapper(
                i > 0 ? i - 1 : lastControl,
                actionHandler,
              ),
              actionName: 'modifyPolygon',
              pointIndex: i,
              visible: true,
              render: function (ctx, left, top, styleOverride, fabricObject) {
                styleOverride = {
                  cornerStyle: 'circle',
                  cornerColor: e?.fictitious ? '#1890FF' : '#fff',
                };
                fabric.controlsUtils.renderCircleControl.call(
                  this,
                  ctx,
                  left,
                  top,
                  styleOverride,
                  fabricObject,
                );
              },
            }),
          ];
        });
        return Object.fromEntries(AccessListArr);
      }
      return {};
    },
    render: () => {
      // 先去掉之前插入的虚拟顶点
      this.handler.pointArray = this.handler.pointArray?.filter((item) => {
        return !item.fictitious;
      });
      if (!this.handler.isMousedown) {
        // 插入虚拟顶点
        this.bezier.insertFictitiousPoints();
      }

      let pointsArr = this.handler.pointArray;
      this.handler.ctx.set({
        points: pointsArr?.map((e) => ({ x: e.x, y: e.y })),
        controls: this.bezier.updateControls(pointsArr || []),
      });

      console.log('this.handler.ctx', this.handler.ctx);
      console.log('this.handler.ctx', this.handler.ctx.get('width'));
      // console.log('this.handler.ctx', this.handler.ctx.getBoundingRectWidth());
      console.log('this.handler.ctx111', this.handler.ctx.calcOwnMatrix());

      // this.handler.ctx.calcOwnMatrix();
      // this.handler.ctx.setPositionDimensions();
      const { width, height, left, top } = this.handler.ctx._calcDimensions();
      console.log('重新设置', width, height, left, top);

      this.handler.ctx
        .set({
          width,
          height,
          // pathOffset: new fabric.Point(left + width / 2, top + height / 2),
        })
        .setCoords();
      // this.handler.ctx.setCoords();

      this.handler.canvas.setActiveObject(this.handler.ctx);
      this.handler.canvas.renderAll();
    },
    generate: (pointArray: any[]) => {
      console.log('this对象：', this);
      console.log('pointArray', pointArray);
      const points = [...pointArray];

      // const currPoints = points.map((_) => new fabric.Point(_.x, _.y));
      let NewPointsArr = pointArray.concat(
        this.handler.tmpPoint ? [this.handler.tmpPoint] : [],
      );
      const pointsArr = NewPointsArr.filter((item) => {
        return !item.fictitious;
      });

      const lastControl = pointsArr.length - 1;

      this.handler.ctx.set({
        points: pointsArr,
        controls: pointsArr.reduce(function (acc, point, index) {
          acc['p' + index] = new fabric.Control({
            positionHandler: (dim, finalMatrix, fabricObject) =>
              polygonPositionHandler(dim, finalMatrix, fabricObject, index),
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

      this.handler.ctx.setCoords();

      this.handler.tmpPointArray?.forEach((point) => {
        this.handler.canvas.remove(point);
      });
      this.handler.pointArray?.forEach((line) => {
        this.handler.canvas.remove(line);
      });
      this.handler.canvas.remove(this.handler.activeShape);
      this.handler.canvas.remove(this.handler.mouseShape);

      // this.handler.canvas.remove(this.handler.ctx);

      // const option = {
      //   id: this.handler.ctx.get('id'),
      //   points: points,
      //   type: 'LabeledPolygon',
      //   // type: 'polygon',
      //   stroke: '#7A97CC',
      //   strokeWidth: 1,
      //   // fill: '#E3F1FF',
      //   fill: 'rgba(226,240,253,0.6)',
      //   objectCaching: !this.handler.editable,
      //   name: '多边形',
      //   superType: 'drawing',
      //   visible: true,
      //   locked: false,
      //   backgroundColor: 'rgba(255,255,255,.1)',
      //   opacity: 1,
      //   hoverCursor: 'pointer',
      //   label: '我就是测试文字显示的',
      // };
      //
      // this.handler.add(option, false);

      this.handler.pointArray = [];
      this.handler.activeShape = null;
      this.handler.mouseShape = null;
      this.handler.interactionHandler.selection();
      this.handler.canvas.renderAll();
    },
  };

  orthogonal = {};

  curve = {};
}

export default DrawingHandler;
