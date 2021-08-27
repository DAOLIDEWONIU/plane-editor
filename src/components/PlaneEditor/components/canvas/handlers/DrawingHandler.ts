import { fabric } from 'fabric';
import { v4 } from 'uuid';
import { fill, flatten, reverse } from 'lodash';

import Handler from './Handler';
import { FabricEvent, FabricObject } from '../utils';
import { Arrow, Line, LabeledPolygon } from '../objects';
import { MousePointer } from '@/utils';

class DrawingHandler {
  handler: Handler;
  constructor(handler: Handler) {
    this.handler = handler;
  }

  restore = {
    finish: () => {
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.circleArr = [];

      if (this.handler.activeShape) {
        this.handler.canvas.remove(this.handler.activeShape);
        this.handler.activeShape = null;
        this.handler.canvas.renderAll();
      }
      if (this.handler.activeLine) {
        this.handler.canvas.remove(this.handler.activeLine);
        this.handler.activeLine = null;
        this.handler.canvas.renderAll();
      }
      if (this.handler.mouseShape) {
        this.handler.canvas.remove(this.handler.mouseShape);
        this.handler.mouseShape = null;
        this.handler.canvas.renderAll();
      }
      this.handler.interactionHandler.selection();
    },
  };

  polygon = {
    init: () => {
      this.restore.finish();
      this.handler.interactionHandler.drawing('polygon');
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      if (!this.handler.mouseShape) {
        this.handler.canvas.add(MousePointer);
        this.handler.mouseShape = MousePointer;
        this.handler.canvas.renderAll();
      }
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
      this.handler.canvas.remove(this.handler.mouseShape);
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      this.handler.mouseShape = null;
      this.handler.canvas.renderAll();
      this.handler.interactionHandler.selection();
    },
    addPoint: (opt: FabricEvent) => {
      const { e, absolutePointer } = opt;
      const { x, y } = absolutePointer;
      const circle = new fabric.Circle({
        radius: 5,
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
        // circle.set({
        //   fill: 'red',
        // });
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
        .remove(this.handler.mouseShape)
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
        label: '我就是测试文字显示的',
        visible: true,
        locked: false,
        backgroundColor: 'rgba(255,255,255,.1)',
        opacity: 0.7,
      };
      this.handler.add(option, false);
      this.handler.pointArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      this.handler.mouseShape = null;
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
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      if (!this.handler.mouseShape) {
        this.handler.canvas.add(MousePointer);
        this.handler.mouseShape = MousePointer;
      }

      this.handler.canvas.renderAll();
    },
    finish: () => {
      this.handler.canvas
        .remove(this.handler.activeLine)
        .remove(this.handler.activeShape)
        .remove(this.handler.mouseShape);
      this.handler.pointArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      this.handler.mouseShape = null;
      this.handler.canvas.renderAll();
      this.handler.interactionHandler.selection();
    },
    addPoint: (opt: FabricEvent) => {
      const { absolutePointer } = opt;
      const { x, y } = absolutePointer;
      const points = [x, y, x, y];
      if (!this.handler.activeLine) {
        //点击线配置
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
        this.handler.canvas.add(this.handler.activeLine);
      }

      if (!this.handler.activeShape) {
        const rect = new fabric.Rect({
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
        this.handler.activeShape = rect;
        this.handler.canvas.add(rect);
      }
      this.handler.pointArray?.push({ x, y });
    },
    generate: (pointArray: any[]) => {
      const id = v4();
      this.handler.canvas
        .remove(this.handler.activeShape)
        .remove(this.handler.mouseShape)
        .remove(this.handler.activeLine);

      const option = {
        id,
        points: pointArray,
        type: 'LabeledPolygon',
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
        hoverCursor: 'pointer',
        label: '我就是测试文字显示的',
      };

      this.handler.add(option, false);
      this.handler.pointArray = [];
      this.handler.activeLine = null;
      this.handler.activeShape = null;
      this.handler.mouseShape = null;
      this.handler.interactionHandler.selection();
      this.handler.canvas.renderAll();
    },
  };

  polygonCircle = {
    init: () => {
      this.bezier.finish();
      this.handler.interactionHandler.drawing('polygonCircle');
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.activeShape = null;
      if (!this.handler.mouseShape) {
        this.handler.canvas.add(MousePointer);
        this.handler.mouseShape = MousePointer;
      }
      this.handler.canvas.renderAll();
    },
    finish: () => {
      this.handler.pointArray?.forEach((point) => {
        this.handler.canvas.remove(point);
      });
      this.handler.lineArray?.forEach((line) => {
        this.handler.canvas.remove(line);
      });
      this.handler.canvas.remove(this.handler.activeShape);
      this.handler.canvas.remove(this.handler.mouseShape);
      this.handler.pointArray = [];
      this.handler.lineArray = [];
      this.handler.activeShape = null;
      this.handler.mouseShape = null;
      this.handler.canvas.renderAll();
      this.handler.interactionHandler.selection();
    },
    addPoint: (opt: FabricEvent) => {
      const { absolutePointer } = opt;
      const { x, y } = absolutePointer;
      const circle = new fabric.Circle({
        radius: 5,
        fill: '#1089ff',
        stroke: '#333333',
        strokeWidth: 0,
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
        const polygon = new fabric.Circle({
          stroke: '#1089ff',
          strokeWidth: 2,
          fill: 'rgba(255,255,255,.7)',
          opacity: 1,
          selectable: true,
          hasBorders: true,
          hasControls: false,
          evented: false,
          radius: 5,
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
      this.handler.canvas.remove(this.handler.mouseShape);

      const option = {
        id,
        points: pointArray,
        type: 'LabeledPolygon',
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
      this.handler.mouseShape = null;
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
        radius: 5,
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
        radius: 5,
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
    init: (activeObject: any, SelectionContext: any) => {
      this.handler.interactionHandler.drawing('bezier');
      const po = activeObject.get('points');
      this.handler.ctx = activeObject;
      this.handler.targetContext = SelectionContext;
      this.handler.pointArray = po;
      this.handler.activeShape = null;
      this.handler.activeLine = null;
      this.handler.circleArr = [];
      this.handler.insertIndexArr = [];
      if (!this.handler.mouseShape) {
        this.handler.canvas.add(MousePointer);
        this.handler.mouseShape = MousePointer;
      }
      this.handler.canvas.renderAll();
    },
    finish: () => {
      this.handler.canvas
        .remove(this.handler.activeShape)
        .remove(this.handler.activeLine);
      // .remove(this.handler.mouseShape);

      this.handler.pointArray = [];
      this.handler.activeShape = null;
      // this.handler.mouseShape = null;
      this.handler.interactionHandler.selection();
      this.handler.onAddTips?.();
      this.handler.canvas.renderAll();
    },
    addPoint: (opt: any) => {
      const { x, y } = opt;
      const circle = new fabric.Circle({
        radius: 5,
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
      const points = [x, y, x, y];
      if (!this.handler.activeLine) {
        //点击线配置
        this.handler.activeLine = new Line(points, {
          strokeWidth: 2,
          fill: '#1089FF',
          stroke: '#1089FF',
          // originX: 'center',
          // originY: 'center',
          selectable: false,
          hasBorders: false,
          hasControls: false,
          evented: false,
        });
        this.handler.activeLine.set({
          class: 'line',
        });
        this.handler.canvas.add(this.handler.activeLine);
      }
      if (!this.handler.activeShape) {
        const polyPoint = [{ x, y }];
        const polygon = new fabric.Polyline(polyPoint, {
          stroke: '#e92525',
          strokeWidth: 2,
          fill: '#8c8c8c',
          opacity: 1,
          selectable: true,
          hasBorders: true,
          hasControls: false,
          evented: false,
          // width: 1920,
          // height: 1080,
        });
        this.handler.activeShape = polygon;
        this.handler.canvas.add(polygon);
      }
      this.handler.circleArr?.push(circle);
      this.handler.canvas.add(circle);
    },
    checkIndex: () => {
      if (this.handler.insertIndexArr?.length === 2) {
        const flag = this.handler.insertIndexArr.every(
          (el) => el === this.handler.insertIndexArr?.[0],
        );
        return flag
          ? this.handler.insertIndexArr[0]
          : this.handler.insertIndexArr;
      }
      return null;
    },
    getPoints: () => {
      const point = this.handler.activeShape.get('points');
      const pointArray: any[] = this.handler.pointArray || [];
      const prePoint = pointArray.map((_) => ({
        x: _.x,
        y: _.y,
      }));

      const index = this.bezier.checkIndex();

      if (typeof index === 'number') {
        prePoint?.splice(index + 1, 0, ...point);
        return prePoint;
      } else if (index instanceof Array) {
        const len = index.length - 1;
        console.log('原数组：', index);
        console.log('开始序号：', index[len]);
        console.log('结束序号：', index[0]);
        const newArr = fill(
          prePoint,
          reverse(point),
          [index[len] + 1],
          [index[0] + 1],
        );
        const newArr1 = fill([1, 2, 3, 4], 5, [2], [3]);
        console.log('跨多个数组：', newArr);
        console.log('跨多个数组flatten：', flatten(newArr));
        console.log('跨多个数组newArr1：', newArr1);
        return flatten(newArr);
      }
    },
    generate: () => {
      const points = this.bezier.getPoints();

      this.handler.circleArr?.forEach((line) => {
        this.handler.canvas.remove(line);
      });

      this.handler.canvas
        .remove(this.handler.activeShape)
        .remove(this.handler.mouseShape);

      const option = {
        id: this.handler.ctx.get('id'),
        type: 'LabeledPolygon',
        // type: 'polygon',
        stroke: '#7A97CC',
        strokeWidth: 1,
        // fill: '#E3F1FF',
        fill: 'rgba(226,240,253,0.6)',
        name: '多边形',
        superType: 'drawing',
        visible: true,
        locked: false,
        backgroundColor: 'rgba(255,255,255,.1)',
        opacity: 1,
        hoverCursor: 'pointer',
        label: '我就是测试文字显示的',
      };

      const polygon = new LabeledPolygon(points, option);
      // const polygon = new fabric.Polygon(points, {
      //   ...option,
      // });
      this.handler.canvas.add(polygon);
      this.handler.canvas.remove(this.handler.ctx);

      this.handler.pointArray = [];
      this.handler.activeShape = null;
      this.handler.mouseShape = null;
      this.handler.ctx = null;
      this.handler.interactionHandler.selection();
      this.handler.canvas.renderAll();
    },
  };

  orthogonal = {};

  curve = {};
}

export default DrawingHandler;
