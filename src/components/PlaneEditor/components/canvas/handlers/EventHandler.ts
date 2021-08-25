import { fabric } from 'fabric';
import anime from 'animejs';
import { message } from 'antd';
import Handler from './Handler';
import { FabricObject, FabricEvent } from '../utils';
import { VideoObject } from '../objects/Video';
import { NodeObject } from '../objects/Node';
import {
  checkAdsorbent,
  checkInPolygon,
  checkPointIndex,
  cross,
  distanceOfPointAndLine,
  getAngle,
  getDistanceBetweenTwoPoints,
  getPointIndex,
  getRadiusPoint,
  getTrueIndex,
  insertFictitiousPoints,
  locate,
  MousePointer,
  removeFictitiousPoints,
} from '@/utils';
import { default as Bezier } from '@/utils/bezier';

/**
 * Event Handler Class
 * @author salgum1114
 * @class EventHandler
 */
class EventHandler {
  handler: Handler;
  keyCode: number;
  panning: boolean;

  constructor(handler: Handler) {
    this.handler = handler;
    this.initialize();
  }

  /**
   * Attch event on document
   *
   */
  public initialize() {
    if (this.handler.editable) {
      this.handler.canvas.on({
        'object:modified': this.modified,
        'object:scaling': this.scaling,
        'object:scaled': this.scaled,
        'object:moving': this.moving,
        'object:moved': this.moved,
        'object:rotating': this.rotating,
        'object:rotated': this.rotated,
        'mouse:wheel': this.mousewheel,
        'mouse:down': this.mousedown,
        'mouse:move': this.mousemove,
        'mouse:up': this.mouseup,
        'selection:cleared': this.selection,
        'selection:created': this.selection,
        'selection:updated': this.selection,
      });
    } else {
      this.handler.canvas.on({
        'mouse:down': this.mousedown,
        'mouse:move': this.mousemove,
        'mouse:out': this.mouseout,
        'mouse:up': this.mouseup,
        'mouse:wheel': this.mousewheel,
      });
    }
    this.handler.canvas.wrapperEl.tabIndex = 1000;
    this.handler.canvas.wrapperEl.addEventListener(
      'keydown',
      this.keydown,
      false,
    );
    this.handler.canvas.wrapperEl.addEventListener('keyup', this.keyup, false);
    this.handler.canvas.wrapperEl.addEventListener(
      'mousedown',
      this.onmousedown,
      true,
    );
    this.handler.canvas.wrapperEl.addEventListener(
      'contextmenu',
      this.contextmenu,
      false,
    );
    if (this.handler.keyEvent.clipboard) {
      document.addEventListener('paste', this.paste, false);
    }
  }

  /**
   * Detach event on document
   *
   */
  public destroy = () => {
    if (this.handler.editable) {
      this.handler.canvas.off({
        'object:modified': this.modified,
        'object:scaling': this.scaling,
        'object:moving': this.moving,
        'object:moved': this.moved,
        'object:rotating': this.rotating,
        'mouse:wheel': this.mousewheel,
        'mouse:down': this.mousedown,
        'mouse:move': this.mousemove,
        'mouse:up': this.mouseup,
        'selection:cleared': this.selection,
        'selection:created': this.selection,
        'selection:updated': this.selection,
      });
    } else {
      this.handler.canvas.off({
        'mouse:down': this.mousedown,
        'mouse:move': this.mousemove,
        'mouse:out': this.mouseout,
        'mouse:up': this.mouseup,
        'mouse:wheel': this.mousewheel,
      });
      this.handler.getObjects().forEach((object) => {
        object.off('mousedown', this.handler.eventHandler.object.mousedown);
        if (object.anime) {
          anime.remove(object);
        }
      });
    }
    this.handler.canvas.wrapperEl.removeEventListener('keydown', this.keydown);
    this.handler.canvas.wrapperEl.removeEventListener('keyup', this.keyup);
    this.handler.canvas.wrapperEl.removeEventListener(
      'mousedown',
      this.onmousedown,
    );
    this.handler.canvas.wrapperEl.removeEventListener(
      'contextmenu',
      this.contextmenu,
    );
    if (this.handler.keyEvent.clipboard) {
      this.handler.canvas.wrapperEl.removeEventListener('paste', this.paste);
    }
  };

  /**
   * Individual object event
   *
   */
  public object = {
    /**
     * Mouse down event on object
     * @param {FabricEvent} opt
     */
    mousedown: (opt: FabricEvent) => {
      const { target } = opt;
      if (target && target.link && target.link.enabled) {
        const { onClick } = this.handler;
        if (onClick) {
          onClick(this.handler.canvas, target);
        }
      }
    },
    /**
     * Mouse double click event on object
     * @param {FabricEvent} opt
     */
    mousedblclick: (opt: FabricEvent) => {
      const { target } = opt;
      if (target) {
        const { onDblClick } = this.handler;
        if (onDblClick) {
          onDblClick(this.handler.canvas, target);
        }
      }
    },
  };

  /**
   * Modified event object
   *
   * @param {FabricEvent} opt
   * @returns
   */
  public modified = (opt: FabricEvent) => {
    const { target } = opt;
    if (!target) {
      return;
    }
    if (target.type === 'circle' && target.parentId) {
      return;
    }
    const { onModified } = this.handler;
    if (onModified) {
      onModified(target);
    }
  };

  /**
   * Moving event object
   *
   * @param {FabricEvent} opt
   * @returns
   */
  public moving = (opt: FabricEvent) => {
    const { target } = opt as any;
    if (this.handler.interactionMode === 'crop') {
      this.handler.cropHandler.moving(opt);
    } else {
      if (this.handler.editable && this.handler.guidelineOption.enabled) {
        this.handler.guidelineHandler.movingGuidelines(target);
      }
      if (target.type === 'activeSelection') {
        const activeSelection = target as fabric.ActiveSelection;
        activeSelection.getObjects().forEach((obj: any) => {
          const left = target.left + obj.left + target.width / 2;
          const top = target.top + obj.top + target.height / 2;
          if (obj.superType === 'node') {
            this.handler.portHandler.setCoords({ ...obj, left, top });
          } else if (obj.superType === 'element') {
            const { id } = obj;
            const el = this.handler.elementHandler.findById(id);
            // TODO... Element object incorrect position
            this.handler.elementHandler.setPositionByOrigin(el, obj, left, top);
          }
        });
        return;
      }
      if (target.superType === 'node') {
        this.handler.portHandler.setCoords(target);
      } else if (target.superType === 'element') {
        const { id } = target;
        const el = this.handler.elementHandler.findById(id);
        this.handler.elementHandler.setPosition(el, target);
      }
    }
  };

  /**
   * Moved event object
   *
   * @param {FabricEvent} opt
   */
  public moved = (opt: FabricEvent) => {
    const { target } = opt;
    this.handler.gridHandler.setCoords(target);
    if (!this.handler.transactionHandler.active) {
      this.handler.transactionHandler.save('moved');
    }
    if (target.superType === 'element') {
      const { id } = target;
      const el = this.handler.elementHandler.findById(id);
      this.handler.elementHandler.setPosition(el, target);
    }
  };

  /**
   * Scaling event object
   *
   * @param {FabricEvent} opt
   */
  public scaling = (opt: FabricEvent) => {
    const { target } = opt as any;
    if (this.handler.interactionMode === 'crop') {
      this.handler.cropHandler.resize(opt);
    }
    // TODO...this.handler.guidelineHandler.scalingGuidelines(target);
    if (target.superType === 'element') {
      const { id, width, height } = target;
      const el = this.handler.elementHandler.findById(id);
      // update the element
      this.handler.elementHandler.setScaleOrAngle(el, target);
      this.handler.elementHandler.setSize(el, target);
      this.handler.elementHandler.setPosition(el, target);
      const video = target as VideoObject;
      if (video.type === 'video' && video.player) {
        video.player.setPlayerSize(width, height);
      }
    }
  };

  /**
   * Scaled event object
   *
   * @param {FabricEvent} opt
   */
  public scaled = (_opt: FabricEvent) => {
    if (!this.handler.transactionHandler.active) {
      this.handler.transactionHandler.save('scaled');
    }
  };

  /**
   * Rotating event object
   *
   * @param {FabricEvent} opt
   */
  public rotating = (opt: FabricEvent) => {
    const { target } = opt as any;
    if (target.superType === 'element') {
      const { id } = target;
      const el = this.handler.elementHandler.findById(id);
      // update the element
      this.handler.elementHandler.setScaleOrAngle(el, target);
    }
  };

  /**
   * Rotated event object
   *
   * @param {FabricEvent} opt
   */
  public rotated = (_opt: FabricEvent) => {
    if (!this.handler.transactionHandler.active) {
      this.handler.transactionHandler.save('rotated');
    }
  };

  /**
   * Moing object at keyboard arrow key down event
   *
   * @param {KeyboardEvent} e
   * @returns
   */
  public arrowmoving = (e: KeyboardEvent) => {
    const activeObject = this.handler.canvas.getActiveObject() as FabricObject;
    if (!activeObject) {
      return false;
    }
    if (activeObject.id === 'workarea') {
      return false;
    }
    if (e.keyCode === 38) {
      activeObject.set('top', activeObject.top - 2);
      activeObject.setCoords();
      this.handler.canvas.renderAll();
      return true;
    } else if (e.keyCode === 40) {
      activeObject.set('top', activeObject.top + 2);
      activeObject.setCoords();
      this.handler.canvas.renderAll();
      return true;
    } else if (e.keyCode === 37) {
      activeObject.set('left', activeObject.left - 2);
      activeObject.setCoords();
      this.handler.canvas.renderAll();
      return true;
    } else if (e.keyCode === 39) {
      activeObject.set('left', activeObject.left + 2);
      activeObject.setCoords();
      this.handler.canvas.renderAll();
      return true;
    }
    if (this.handler.onModified) {
      this.handler.onModified(activeObject);
    }
    return true;
  };

  /**
   * Zoom at mouse wheel event
   *
   * @param {FabricEvent<WheelEvent>} opt
   * @returns
   */
  public mousewheel = (opt: FabricEvent) => {
    const event = opt as FabricEvent<WheelEvent>;
    const { zoomEnabled } = this.handler;

    if (!zoomEnabled) {
      return;
    }
    const delta = event.e.deltaY;
    let zoomRatio = this.handler.canvas.getZoom();
    // console.log('zoomRatio', zoomRatio);
    if (delta > 0) {
      zoomRatio -= 0.1; //old 0.05
    } else {
      zoomRatio += 0.1;
    }
    this.handler.zoomHandler.zoomToPoint(
      new fabric.Point(
        this.handler.canvas.getWidth() / 2,
        this.handler.canvas.getHeight() / 2,
      ),
      zoomRatio,
    );
    event.e.preventDefault();
    event.e.stopPropagation();
    // console.log('obj=========', this.handler.canvas.getObjects());

    this.handler.canvas.getObjects().forEach((obj: any) => {
      console.log('ong', obj);
      if (obj?.mode === 'text' || obj.type === 'i-text') {
        let fontSize = 15 / zoomRatio;
        fontSize = fontSize > 29 ? 29 : fontSize < 5 ? 5 : fontSize;
        console.log('fontSize', fontSize);
        obj.set('fontSize', fontSize);
      }
      if (
        obj.type === 'labeledRect' ||
        obj.type === 'circle' ||
        obj.type === 'LabeledPolygon' ||
        obj.type === 'polygon'
      ) {
        console.log('obj', obj.strokeWidthUnscaled);
        console.log('strokeWidth', obj.strokeWidth);

        if (!obj.strokeWidthUnscaled && obj.strokeWidth) {
          obj.strokeWidthUnscaled = obj.strokeWidth;
        }
        if (obj.strokeWidthUnscaled) {
          const strokeWidth = obj.strokeWidthUnscaled / obj.scaleX / zoomRatio;
          console.log('strokeWidth', obj);
          obj.set('strokeWidth', strokeWidth);
        }

        // let w = 1; // desired width in pixels
        // let strokeWidth = w / zoomRatio;
        // obj.set('strokeWidth', strokeWidth);
      }
      if (obj.type === 'line') {
        let w = 2; // desired width in pixels
        let strokeWidth = w / zoomRatio;
        obj.set('strokeWidth', strokeWidth);
      }
    });
    this.handler.canvas.renderAll();
  };

  /**
   * Mouse down event on object
   *
   * @param {FabricEvent<MouseEvent>} opt
   * @returns
   */
  public mousedown = (opt: FabricEvent) => {
    const event = opt as FabricEvent<MouseEvent>;
    const { editable } = this.handler;
    if (
      event.e.altKey &&
      editable &&
      !this.handler.interactionHandler.isDrawingMode()
    ) {
      this.handler.interactionHandler.grab();
      this.panning = true;
      return;
    }
    if (this.handler.interactionMode === 'grab') {
      this.panning = true;
      return;
    }
    const { target } = event;
    if (editable) {
      if (
        this.handler.prevTarget &&
        this.handler.prevTarget.superType === 'link'
      ) {
        this.handler.prevTarget.set({
          stroke: this.handler.prevTarget.originStroke,
        });
      }
      if (target && target.type === 'fromPort') {
        this.handler.linkHandler.init(target);
        return;
      }
      if (
        target &&
        this.handler.interactionMode === 'link' &&
        (target.type === 'toPort' || target.superType === 'node')
      ) {
        let toPort;
        if (target.superType === 'node') {
          toPort = target.toPort;
        } else {
          toPort = target;
        }
        this.handler.linkHandler.generate(toPort);
        return;
      }
      this.handler.guidelineHandler.viewportTransform =
        this.handler.canvas.viewportTransform;
      this.handler.guidelineHandler.zoom = this.handler.canvas.getZoom();
      if (this.handler.interactionMode === 'selection') {
        if (target && target.superType === 'link') {
          target.set({
            stroke: target.selectFill || 'green',
          });
        }
        this.handler.prevTarget = target;
        return;
      }
      if (this.handler.interactionMode === 'polygon') {
        if (
          target &&
          this.handler.pointArray.length &&
          target.id === this.handler.pointArray[0].id
        ) {
          this.handler.drawingHandler.polygon.generate(this.handler.pointArray);
        } else {
          this.handler.drawingHandler.polygon.addPoint(event);
        }
      } else if (this.handler.interactionMode === 'polygonRect') {
        //自定义矩形
        if (
          target &&
          this.handler.pointArray?.length === 2 &&
          this.handler.activeShape
        ) {
          const pointArray = this.handler.activeShape.getCoords();
          //结束
          this.handler.drawingHandler.polygonRect.generate(pointArray);
        } else {
          if (this.handler.pointArray?.length < 2) {
            this.handler.drawingHandler.polygonRect.addPoint(event);
          }
        }
      } else if (this.handler.interactionMode === 'polygonCircle') {
        if (
          target &&
          this.handler.pointArray?.length === 1 &&
          this.handler.activeShape
        ) {
          const { left, top } = this.handler.pointArray[0];
          const { radius } = this.handler.activeShape;
          const pointArray = getRadiusPoint({
            center: [left, top],
            radius,
            count: 30,
          });

          //结束
          this.handler.drawingHandler.polygonCircle.generate(pointArray);
        } else {
          if (this.handler?.pointArray?.length < 1) {
            this.handler.drawingHandler.polygonCircle.addPoint(event);
          }
        }
      } else if (this.handler.interactionMode === 'bezier') {
        //addPoint
        if (
          target &&
          this.handler.circleArr?.length === 2 &&
          this.handler.activeShape
        ) {
          const point = this.handler.activeShape.get('points');
          //结束
          this.handler.drawingHandler.bezier.generate(point);
        } else {
          if (this.handler?.circleArr?.length < 2) {
            const x = this.handler.mouseShape.get('left');
            const y = this.handler.mouseShape.get('top');
            const insertIndex = this.handler.mouseShape.get('insertIndex');
            this.handler.insertIndexArr?.push(insertIndex);
            this.handler.drawingHandler.bezier.addPoint({ x, y });
          }
        }

        // this.handler.isMousedown = true;
        // const { x, y } = this.handler.canvas.getPointer(event.e);
        // const getContext = this.handler.canvas.getContext();
        // // 记录按下的起始位置
        // this.handler.startPos.x = x;
        // this.handler.startPos.y = y;
        //
        // // 记录当前顶点数据
        // this.handler.cachePointsArr = this.handler.pointArray?.map((item) => {
        //   return {
        //     ...item,
        //   };
        // });
        //
        // //是否在多边形内
        // this.handler.isInPolygon = checkInPolygon(
        //   this.handler.pointArray,
        //   x,
        //   y,
        //   getContext,
        // );
        //
        // const dragPointIndex = checkPointIndex(
        //   this.handler.pointArray || [],
        //   x,
        //   y,
        //   getContext,
        // );
        // this.handler.dragPointIndex = dragPointIndex;
        //
        // if (!this.handler.isInPolygon) {
        //   this.handler.drawingHandler.bezier.finish();
        // }
      } else if (this.handler.interactionMode === 'line') {
        if (this.handler.pointArray.length && this.handler.activeLine) {
          this.handler.drawingHandler.line.generate(event);
        } else {
          this.handler.drawingHandler.line.addPoint(event);
        }
      } else if (this.handler.interactionMode === 'arrow') {
        if (this.handler.pointArray.length && this.handler.activeLine) {
          this.handler.drawingHandler.arrow.generate(event);
        } else {
          this.handler.drawingHandler.arrow.addPoint(event);
        }
      }
    }
  };

  /**
   * Mouse move event on canvas
   *
   * @param {FabricEvent<MouseEvent>} opt
   * @returns
   */
  public mousemove = (opt: FabricEvent) => {
    const event = opt as FabricEvent<MouseEvent>;
    if (this.handler.interactionMode === 'grab' && this.panning) {
      this.handler.interactionHandler.moving(event.e);
      this.handler.canvas.requestRenderAll();
    }

    if (!this.handler.editable && event.target) {
      if (event.target.superType === 'element') {
        return;
      }
      if (event.target.id !== 'workarea') {
        if (event.target !== this.handler.target) {
          this.handler.tooltipHandler.show(event.target);
        }
      } else {
        this.handler.tooltipHandler.hide(event.target);
      }
    }
    if (this.handler.interactionMode === 'polygon') {
      const pointer = this.handler.canvas.getPointer(event.e);
      this.mouseShapeMove(pointer);
      if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
        const pointer = this.handler.canvas.getPointer(event.e);
        this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
        const points = this.handler.activeShape.get('points');
        points[this.handler.pointArray.length] = {
          x: pointer.x,
          y: pointer.y,
        };
        this.handler.activeShape.set({
          points,
        });
        this.handler.canvas.requestRenderAll();
      }
    } else if (this.handler.interactionMode === 'polygonRect') {
      const pointer = this.handler.canvas.getPointer(event.e);
      this.mouseShapeMove(pointer);
      //超过2个点
      if (this.handler.pointArray?.length === 2) {
        const pointArray = this.handler.pointArray;
        const xDiff = pointArray[1].left - pointArray[0].left;
        const yDiff = pointArray[1].top - pointArray[0].top;
        const angle1 = Math.atan2(yDiff, xDiff);
        const re = (angle1 * 180) / Math.PI;

        const Distance = getDistanceBetweenTwoPoints(
          pointArray[0].left,
          pointArray[0].top,
          pointArray[1].left,
          pointArray[1].top,
        );
        this.handler.activeShape?.set({
          width: Distance,
          height: distanceOfPointAndLine(
            pointer.x,
            pointer.y,
            pointArray[0].left,
            pointArray[0].top,
            pointArray[1].left,
            pointArray[1].top,
          ),
          left: pointArray[0].left,
          top: pointArray[0].top,
          angle: re,
          originX: 'left',
          originY: 'bottom',
        });
        this.handler.canvas.remove(this.handler.activeLine);
        this.handler.activeShape?.setCoords();
        this.handler.canvas.requestRenderAll();
      }

      if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
        const pointer = this.handler.canvas.getPointer(event.e);
        this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
        this.handler.canvas.requestRenderAll();
      }
    } else if (this.handler.interactionMode === 'polygonCircle') {
      const pointer = this.handler.canvas.getPointer(event.e);
      this.mouseShapeMove(pointer);
      //超过2个点
      if (this.handler.pointArray?.length === 1) {
        const pointer = this.handler.canvas.getPointer(event.e);
        const pointArray = this.handler.pointArray;
        const Distance = getDistanceBetweenTwoPoints(
          pointArray[0].left,
          pointArray[0].top,
          pointer.x,
          pointer.y,
        );
        this.handler.activeShape?.set({
          left: pointArray[0].left,
          top: pointArray[0].top,
          radius: Distance,
        });
        this.handler.activeShape?.setCoords();
        this.handler.canvas.requestRenderAll();
      }
    } else if (this.handler.interactionMode === 'bezier') {
      const { x, y } = this.handler.canvas.getPointer(event.e);
      const getContext = this.handler.canvas.getContext();
      this.handler.canvas.setCursor('default');
      //鼠标移动
      this.mouseShapeMove({
        x,
        y,
        mode: 'bezier',
        dragPointIndex: this.handler.dragPointIndex,
      });

      const points = this.handler.circleArr;
      if (points?.length === 2) {
        console.log('points', points);
        const p1x = points[0].get('left');
        const p1y = points[0].get('top');
        const p2x = points[1].get('left');
        const p2y = points[1].get('top');
        console.log(
          '贝塞尔曲线',
          Bezier.getBezierPoints(30, [p1x, p1y], [p2x, p2y], [x, y]),
        );
        // let activeShapepoints = this.handler.activeShape.get('points');
        const activeShapepoints = Bezier.getBezierPoints(
          30,
          [p1x, p1y],
          [x, y],
          [p2x, p2y],
        );
        this.handler.activeShape.set({
          points: activeShapepoints.map((e) => ({ x: e[0], y: e[1] })),
          hasBorders: true,
        });
        this.handler.canvas.requestRenderAll();
      }

      //是否需要进行吸附
      // const check = checkPointIndex(this.handler.pointArray, x, y, getContext);
      // if (check === -1) {
      //   // this.handler.canvas.setCursor('default');
      //   let point = checkAdsorbent(this.handler.pointArray, check, x, y); // ++ 判断是否需要进行吸附
      //   this.handler.mouseShape.set({
      //     left: point[0],
      //     top: point[1],
      //   });
      //   this.handler.canvas.renderAll();
      // }

      // if (this.handler.isMousedown) {
      //   //在顶点内 初始化 虚拟顶点 + 真实顶点
      //   if (this.handler.dragPointIndex !== -1) {
      //     // console.log('获得的顶点：', this.handler.dragPointIndex);
      //     // 是虚拟顶点，转换成真实顶点
      //     if (
      //       this.handler.pointArray?.[this.handler?.dragPointIndex]?.fictitious
      //     ) {
      //       delete this.handler.pointArray[this.handler.dragPointIndex]
      //         .fictitious;
      //       // this.handler.pointArray = this.handler.pointArray.map((e, i) => {
      //       //   if (i === this.handler?.dragPointIndex) {
      //       //     return new fabric.Point(e.x, e.y);
      //       //   }
      //       //   return e;
      //       // });
      //     }
      //     this.handler.dragPointIndex = getTrueIndex(
      //       this.handler.dragPointIndex,
      //       this.handler.pointArray,
      //     );
      //     this.handler.pointArray = removeFictitiousPoints(
      //       this.handler.pointArray,
      //     );
      //
      //     let adsorbentPos = checkAdsorbent(
      //       this.handler.pointArray,
      //       this.handler.dragPointIndex,
      //       x,
      //       y,
      //     );
      //
      //     var invertedMatrix = fabric.util.invertTransform(
      //       this.handler.canvas.viewportTransform,
      //     );
      //     const p = { x: adsorbentPos[0], y: adsorbentPos[1] };
      //     const transformedP = fabric.util.transformPoint(p, invertedMatrix);
      //     console.log('之前的', adsorbentPos);
      //     console.log('transformedP', transformedP);
      //
      //     this.handler.pointArray.splice(this.handler.dragPointIndex, 1, {
      //       ...this.handler.pointArray[this.handler.dragPointIndex],
      //       x: adsorbentPos[0],
      //       y: adsorbentPos[1],
      //     });
      //
      //     // fabric.util.transformPoint(
      //     //   { x: x, y: y },
      //     //   fabric.util.multiplyTransformMatrices(
      //     //     fabricObject.canvas.viewportTransform,
      //     //     fabricObject.calcTransformMatrix(),
      //     //   ),
      //     // );
      //     this.handler.drawingHandler.bezier.render();
      //
      //     // const dragIndex = getTrueIndex(
      //     //   this.handler.dragPointIndex,
      //     //   this.handler.pointArray,
      //     // );
      //     // const FictitiousPoints = removeFictitiousPoints(
      //     //   this.handler.pointArray,
      //     // );
      //     //
      //     // //判断是否需要进行吸附
      //     // let adsorbentPos = checkAdsorbent(FictitiousPoints, dragIndex, x, y);
      //     // console.log('移动检测2==============');
      //     // console.log('新位置', adsorbentPos);
      //     // this.handler.pointArray = this.handler.pointArray?.map((e, i) => {
      //     //   if (i === this.handler.dragPointIndex) {
      //     //     return { ...e, x: adsorbentPos[0], y: adsorbentPos[1] };
      //     //   }
      //     //   return e;
      //     // });
      //
      //     // this.handler.pointArray.splice(
      //     //   this.handler.dragPointIndex,
      //     //   1,
      //     //   new fabric.Point(adsorbentPos[0], adsorbentPos[1]),
      //     // );
      //     //
      //     // this.handler.drawingHandler.bezier.render();
      //   } else if (this.handler.isInPolygon) {
      //     //整体移动
      //     // let diffX = x - this.handler.startPos.x;
      //     // let diffY = y - this.handler.startPos.y;
      //     // this.handler.pointArray = this.handler.cachePointsArr.map((item) => {
      //     //   return new fabric.Point(item.x + diffX, item.y + diffY);
      //     // });
      //     // this.handler.drawingHandler.bezier.render();
      //   } else {
      //   }
      // } else {
      //   if (this.handler.tmpPoint) {
      //     this.handler.tmpPoint.x = x;
      //     this.handler.tmpPoint.y = y;
      //   } else {
      //     this.handler.tmpPoint = {
      //       x,
      //       y,
      //     };
      //   }
      //   // this.handler.drawingHandler.bezier.render();
      // }

      // if (this.handler.isMousedown) {
      //   if (this.handler.dragPointIndex !== -1) {
      //     console.log('sd', this.handler.pointArray);
      //     console.log(
      //       'this.handler.dragPointIndex',
      //       this.handler.dragPointIndex,
      //     );
      //     console.log('this.handler.tmpPointArray', this.handler.tmpPointArray);
      //     // 是虚拟顶点，转换成真实顶点
      //     if (
      //       this.handler.pointArray?.[this.handler?.dragPointIndex]?.fictitious
      //     ) {
      //       delete this.handler.pointArray?.[this.handler?.dragPointIndex]
      //         ?.fictitious;
      //     }
      //     this.handler.dragPointIndex = getTrueIndex(
      //       this.handler.dragPointIndex,
      //       this.handler.pointArray,
      //     );
      //
      //     this.handler.pointArray = removeFictitiousPoints(
      //       this.handler.pointArray,
      //     );
      //     let adsorbentPos = checkAdsorbent(
      //       this.handler.pointArray,
      //       this.handler.dragPointIndex,
      //       x,
      //       y,
      //     ).point;
      //     this.handler.pointArray.splice(this.handler.dragPointIndex, 1, {
      //       ...this.handler.pointArray[this.handler.dragPointIndex],
      //       x: adsorbentPos[0],
      //       y: adsorbentPos[1],
      //     });
      //     this.handler.drawingHandler.bezier.render();
      //   } else if (this.handler.isInPolygon) {
      //     let diffX = x - this.handler.startPos.x;
      //     let diffY = y - this.handler.startPos.y;
      //     this.handler.pointArray = this.handler.cachePointsArr?.map((item) => {
      //       return {
      //         ...item,
      //         x: item.x + diffX,
      //         y: item.y + diffY,
      //       };
      //     });
      //     this.handler.drawingHandler.bezier.render();
      //   }
      // } else {
      //   if (this.handler.tmpPoint) {
      //     this.handler.tmpPoint.x = x;
      //     this.handler.tmpPoint.y = y;
      //   } else {
      //     this.handler.tmpPoint = {
      //       x,
      //       y,
      //     };
      //   }
      //   this.handler.drawingHandler.bezier.render();
      // }

      // const check = checkPointIndex(this.handler.pointArray, x, y, getContext);
      // if (check === -1) {
      //   this.handler.canvas.setCursor('default');
      //   let { point, minIndex } = checkAdsorbent(
      //     this.handler.pointArray,
      //     check,
      //     x,
      //     y,
      //   ); // ++ 判断是否需要进行吸附
      //   this.handler.pointIndex = minIndex;
      //   this.handler.mouseShape.set({
      //     left: point[0],
      //     top: point[1],
      //   });
      // }

      //locate

      // if (this.handler.tmpPointArray?.length === 2) {
      //   const po = this.handler.tmpPointArray.map((e) => ({
      //     x: e.left,
      //     y: e.top,
      //   }));
      //   // console.log(
      //   //   '现在圆心点：',
      //   //   locate(po[0].x, po[0].y, po[1].x, po[1].y, x, y),
      //   // );
      //
      //   cross({ x: po[0].x, y: po[0].y }, { x, y }, { x: po[1].x, y: po[1].y });
      //
      //   // getContext.moveTo(po[0].x, po[0].y);
      //   // getContext.lineWidth = 10;
      //   // getContext.strokeStyle = 'aquamarine';
      //   // getContext.bezierCurveTo(po[0].x, po[0].y, x, y, po[1].x, po[1].y);
      //   // getContext.stroke();
      //
      //   const pointer = this.handler.canvas.getPointer(event.e);
      //   const pointArray = this.handler.tmpPointArray;
      //   const p1 = [pointArray[0].left, pointArray[0].top];
      //   const cp = [pointer.x, pointer.y];
      //   const p2 = [pointArray[1].left, pointArray[1].top];
      //   const BezierArr = Bezier.getBezierPoints(30, p1, cp, p2);
      //   const points = BezierArr.map((_) => ({ x: _[0], y: _[1] }));
      //   this.handler.activeShape?.set({
      //     points,
      //   });
      //
      //   console.log('最新的', insertFictitiousPoints(this.handler.pointArray));
      //
      //   console.log('以前的', this.handler.pointArray);
      //
      //   // console.log(
      //   //   'hhahaha',
      //   //   insertFictitiousPoints(
      //   //     this.handler.pointArray,
      //   //     points,
      //   //     this.handler.pointIndex,
      //   //   ),
      //   // );
      // }

      //吸附功能

      // this.pointsArr.splice(this.dragPointIndex, 1, {
      //   x: adsorbentPos[0],// ++ 修改为吸附的值
      //   y: adsorbentPos[1]// ++ 修改为吸附的值
      // })

      this.handler.canvas.requestRenderAll();
      //当前选中节点
      // const activeObject = this.handler.canvas.getActiveObject();
      // const SelectionContext = this.handler.canvas.getSelectionContext();
    } else if (this.handler.interactionMode === 'line') {
      if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
        const pointer = this.handler.canvas.getPointer(event.e);
        this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
      }
      this.handler.canvas.requestRenderAll();
    } else if (this.handler.interactionMode === 'arrow') {
      if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
        const pointer = this.handler.canvas.getPointer(event.e);
        this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
      }
      this.handler.canvas.requestRenderAll();
    } else if (this.handler.interactionMode === 'link') {
      if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
        const pointer = this.handler.canvas.getPointer(event.e);
        this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
      }
      this.handler.canvas.requestRenderAll();
    }
    return;
  };

  /**公共鼠标样式*/
  mouseShapeMove = (props: {
    x: number;
    y: number;
    mode?: string;
    dragPointIndex?: any;
  }) => {
    const { x, y, dragPointIndex = -1, mode } = props;

    if (this.handler.mouseShape) {
      if (mode) {
        let point = checkAdsorbent(
          this.handler.pointArray,
          dragPointIndex,
          x,
          y,
        ); // ++ 判断是否需要进行吸附
        this.handler.mouseShape?.set({
          left: point[0],
          top: point[1],
          insertIndex: point[2],
        });
        // this.handler.setByPartial(this.handler.mouseShape, {
        //   visible: dragPointIndex === -1,
        // });
        // this.handler.mouseShape?.bringToFront(); //鼠标样式置顶
        this.handler.canvas.requestRenderAll();
        return;
      }
      this.handler.mouseShape?.set({
        left: x,
        top: y,
      });
      // this.handler.mouseShape?.bringToFront(); //鼠标样式置顶
      this.handler.canvas.requestRenderAll();
      return;
    }
    this.handler.canvas.add(MousePointer);
    this.handler.mouseShape = MousePointer;
    // this.handler.mouseShape?.bringToFront(); //鼠标样式置顶
    this.handler.canvas.requestRenderAll();
  };

  /**
   * Mouse up event on canvas
   *
   * @param {FabricEvent<MouseEvent>} opt
   * @returns
   */
  public mouseup = (opt: FabricEvent) => {
    const event = opt as FabricEvent<MouseEvent>;
    if (this.handler.interactionMode === 'grab') {
      this.panning = false;
      return;
    }

    const { target, e } = event;
    if (this.handler.interactionMode === 'selection') {
      if (target && e.shiftKey && target.superType === 'node') {
        const node = target as NodeObject;
        this.handler.canvas.discardActiveObject();
        const nodes = [] as NodeObject[];
        this.handler.nodeHandler.getNodePath(node, nodes);
        const activeSelection = new fabric.ActiveSelection(nodes, {
          canvas: this.handler.canvas,
          ...this.handler.activeSelectionOption,
        });
        this.handler.canvas.setActiveObject(activeSelection);
        this.handler.canvas.requestRenderAll();
      }
    }
    if (this.handler.editable && this.handler.interactionMode === 'bezier') {
      // this.handler.tmpPointArray?.forEach((point) => {
      //   this.handler.canvas.remove(point);
      // });
      //
      // console.log('鼠标提起时的顶点==========', this.handler.pointArray);
      //
      // this.handler.drawingHandler.bezier.init(
      //   this.handler.pointArray || [],
      //   this.handler.ctx,
      //   this.handler.targetContext,
      // );
      // this.handler.canvas.requestRenderAll();
      // this.handler.setControls();
      // this.handler.isMousedown = false;
      // this.handler.dragPointIndex = -1;
      // this.handler.cachePointsArr = [];
      // this.handler.drawingHandler.bezier.render();
      // setTimeout(() => {
      //   this.handler.drawingHandler.bezier.init(
      //     [],
      //     this.handler.ctx,
      //     this.handler.targetContext,
      //   );
      // }, 0);
    }

    if (this.handler.editable && this.handler.guidelineOption.enabled) {
      this.handler.guidelineHandler.verticalLines.length = 0;
      this.handler.guidelineHandler.horizontalLines.length = 0;
    }
    this.handler.canvas.renderAll();
  };

  /**
   * Mouse out event on canvas
   *
   * @param {FabricEvent<MouseEvent>} opt
   */
  public mouseout = (opt: FabricEvent) => {
    const event = opt as FabricEvent<MouseEvent>;
    if (!event.target) {
      this.handler.tooltipHandler.hide();
    }
  };

  /**
   * Selection event event on canvas
   *
   * @param {FabricEvent} opt
   */
  public selection = (opt: FabricEvent) => {
    const { onSelect, activeSelectionOption } = this.handler;
    const target = opt.target as FabricObject<fabric.ActiveSelection>;
    if (target && target.type === 'activeSelection') {
      target.set({
        ...activeSelectionOption,
      });
    }
    if (onSelect) {
      onSelect(target);
    }
  };

  /**
   * Called resize event on canvas
   *
   * @param {number} nextWidth
   * @param {number} nextHeight
   * @returns
   */
  public resize = (nextWidth: number, nextHeight: number) => {
    this.handler.canvas.setWidth(nextWidth).setHeight(nextHeight);

    this.handler.canvas.setBackgroundColor(
      this.handler.canvasOption.backgroundColor,
      this.handler.canvas.renderAll.bind(this.handler.canvas),
    );
    if (!this.handler.workarea) {
      return;
    }
    const diffWidth = nextWidth / 2 - this.handler.width / 2;
    const diffHeight = nextHeight / 2 - this.handler.height / 2;
    this.handler.width = nextWidth;
    this.handler.height = nextHeight;
    if (this.handler.workarea.layout === 'fixed') {
      this.handler.canvas.centerObject(this.handler.workarea);
      this.handler.workarea.setCoords();
      if (this.handler.gridOption.enabled) {
        return;
      }
      this.handler.canvas.getObjects().forEach((obj: FabricObject) => {
        if (obj.id !== 'workarea') {
          const left = obj.left + diffWidth;
          const top = obj.top + diffHeight;
          obj.set({
            left,
            top,
          });
          obj.setCoords();
          if (obj.superType === 'element') {
            const { id } = obj;
            const el = this.handler.elementHandler.findById(id);
            // update the element
            this.handler.elementHandler.setPosition(el, obj);
          }
        }
      });
      this.handler.canvas.requestRenderAll();
      return;
    }
    if (this.handler.workarea.layout === 'responsive') {
      const { scaleX } = this.handler.workareaHandler.calculateScale();
      const center = this.handler.canvas.getCenter();
      const deltaPoint = new fabric.Point(diffWidth, diffHeight);
      this.handler.canvas.relativePan(deltaPoint);
      this.handler.zoomHandler.zoomToPoint(
        new fabric.Point(center.left, center.top),
        scaleX,
      );
      return;
    }
    const scaleX = nextWidth / this.handler.workarea.width;
    const scaleY = nextHeight / this.handler.workarea.height;
    const diffScaleX =
      nextWidth / (this.handler.workarea.width * this.handler.workarea.scaleX);
    const diffScaleY =
      nextHeight /
      (this.handler.workarea.height * this.handler.workarea.scaleY);
    this.handler.workarea.set({
      scaleX,
      scaleY,
    });
    this.handler.canvas.getObjects().forEach((obj: any) => {
      const { id } = obj;

      if (obj.id !== 'workarea') {
        const left = obj.left * diffScaleX;
        const top = obj.top * diffScaleY;
        const newScaleX = obj.scaleX * diffScaleX;
        const newScaleY = obj.scaleY * diffScaleY;
        obj.set({
          scaleX: newScaleX,
          scaleY: newScaleY,
          left,
          top,
        });
        obj.setCoords();
        if (obj.superType === 'element') {
          const video = obj as VideoObject;
          const { width, height } = obj;
          const el = this.handler.elementHandler.findById(id);
          this.handler.elementHandler.setSize(el, obj);
          if (video.player) {
            video.player.setPlayerSize(width, height);
          }
          this.handler.elementHandler.setPosition(el, obj);
        }
      }
    });
    this.handler.canvas.renderAll();
  };

  /**
   * Paste event on canvas
   *
   * @param {ClipboardEvent} e
   * @returns
   */
  public paste = (e: ClipboardEvent) => {
    if (this.handler.canvas.wrapperEl !== document.activeElement) {
      return false;
    }
    if (e.preventDefault) {
      e.preventDefault();
    }
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    const clipboardData = e.clipboardData;
    if (clipboardData.types.length) {
      clipboardData.types.forEach((clipboardType: string) => {
        if (clipboardType === 'text/plain') {
          const textPlain = clipboardData.getData('text/plain');
          try {
            const objects = JSON.parse(textPlain);
            const {
              gridOption: { grid = 10 },
              isCut,
            } = this.handler;
            const padding = isCut ? 0 : grid;
            if (objects && Array.isArray(objects)) {
              const filteredObjects = objects.filter((obj) => obj !== null);
              if (filteredObjects.length === 1) {
                const obj = filteredObjects[0];
                if (typeof obj.cloneable !== 'undefined' && !obj.cloneable) {
                  return;
                }
                obj.left = obj.properties.left + padding;
                obj.top = obj.properties.top + padding;
                const createdObj = this.handler.add(obj, false, true);
                this.handler.canvas.setActiveObject(createdObj as FabricObject);
                this.handler.canvas.requestRenderAll();
              } else {
                const nodes = [] as any[];
                const targets = [] as any[];
                objects.forEach((obj) => {
                  if (!obj) {
                    return;
                  }
                  if (obj.superType === 'link') {
                    obj.fromNodeId = nodes[obj.fromNodeIndex].id;
                    obj.toNodeId = nodes[obj.toNodeIndex].id;
                  } else {
                    obj.left = obj.properties.left + padding;
                    obj.top = obj.properties.top + padding;
                  }
                  const createdObj = this.handler.add(obj, false, true);
                  if (obj.superType === 'node') {
                    nodes.push(createdObj);
                  } else {
                    targets.push(createdObj);
                  }
                });
                const activeSelection = new fabric.ActiveSelection(
                  nodes.length ? nodes : targets,
                  {
                    canvas: this.handler.canvas,
                    ...this.handler.activeSelectionOption,
                  },
                );
                this.handler.canvas.setActiveObject(activeSelection);
                this.handler.canvas.requestRenderAll();
              }
              if (!this.handler.transactionHandler.active) {
                this.handler.transactionHandler.save('paste');
              }
              this.handler.isCut = false;
              this.handler.copy();
            }
          } catch (error) {
            console.error(error);
            // const item = {
            //     id: uuv4id(),
            //     type: 'textbox',
            //     text: textPlain,
            // };
            // this.handler.add(item, true);
          }
        } else if (clipboardType === 'text/html') {
          // Todo ...
          // const textHtml = clipboardData.getData('text/html');
          // console.log(textHtml);
        } else if (clipboardType === 'Files') {
          // Array.from(clipboardData.files).forEach((file) => {
          //     const { type } = file;
          //     if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
          //         const item = {
          //             id: v4(),
          //             type: 'image',
          //             file,
          //             superType: 'image',
          //         };
          //         this.handler.add(item, true);
          //     } else {
          //         console.error('Not supported file type');
          //     }
          // });
        }
      });
    }
    return true;
  };

  /**
   * Keydown event on document
   *
   * @param {KeyboardEvent} e
   */
  public keydown = (e: KeyboardEvent) => {
    const { keyEvent, editable } = this.handler;
    if (!Object.keys(keyEvent).length) {
      return;
    }
    const { clipboard } = keyEvent;
    if (this.handler.interactionHandler.isDrawingMode()) {
      if (this.handler.shortcutHandler.isEscape(e)) {
        if (this.handler.interactionMode === 'polygon') {
          this.handler.drawingHandler.polygon.finish();
        } else if (this.handler.interactionMode === 'line') {
          this.handler.drawingHandler.line.finish();
        } else if (this.handler.interactionMode === 'arrow') {
          this.handler.drawingHandler.arrow.finish();
        } else if (this.handler.interactionMode === 'link') {
          this.handler.linkHandler.finish();
        }
      }
      return;
    }
    if (this.handler.shortcutHandler.isW(e)) {
      this.keyCode = e.keyCode;
      this.handler.interactionHandler.grab();
      return;
    }
    if (e.altKey && editable) {
      this.handler.interactionHandler.grab();
      return;
    }
    if (this.handler.shortcutHandler.isEscape(e)) {
      if (this.handler.interactionMode === 'selection') {
        this.handler.canvas.discardActiveObject();
        this.handler.canvas.renderAll();
      }
      this.handler.tooltipHandler.hide();
    }
    if (this.handler.canvas.wrapperEl !== document.activeElement) {
      return;
    }
    if (editable) {
      if (this.handler.shortcutHandler.isQ(e)) {
        this.keyCode = e.keyCode;
      } else if (this.handler.shortcutHandler.isDelete(e)) {
        this.handler.remove();
      } else if (this.handler.shortcutHandler.isArrow(e)) {
        this.arrowmoving(e);
      } else if (this.handler.shortcutHandler.isCtrlA(e)) {
        e.preventDefault();
        this.handler.selectAll();
      } else if (this.handler.shortcutHandler.isCtrlC(e)) {
        e.preventDefault();
        this.handler.copy();
      } else if (this.handler.shortcutHandler.isCtrlV(e) && !clipboard) {
        e.preventDefault();
        this.handler.paste();
      } else if (this.handler.shortcutHandler.isCtrlX(e)) {
        e.preventDefault();
        this.handler.cut();
      } else if (this.handler.shortcutHandler.isCtrlZ(e)) {
        e.preventDefault();
        this.handler.transactionHandler.undo();
      } else if (this.handler.shortcutHandler.isCtrlY(e)) {
        e.preventDefault();
        this.handler.transactionHandler.redo();
      } else if (this.handler.shortcutHandler.isPlus(e)) {
        e.preventDefault();
        this.handler.zoomHandler.zoomIn();
      } else if (this.handler.shortcutHandler.isMinus(e)) {
        e.preventDefault();
        this.handler.zoomHandler.zoomOut();
      } else if (this.handler.shortcutHandler.isO(e)) {
        e.preventDefault();
        this.handler.zoomHandler.zoomOneToOne();
      } else if (this.handler.shortcutHandler.isP(e)) {
        e.preventDefault();
        this.handler.zoomHandler.zoomToFit();
      }
      return;
    }
    return;
  };

  /**
   * Key up event on canvas
   *
   * @param {KeyboardEvent} _e
   */
  public keyup = (e: KeyboardEvent) => {
    if (this.handler.interactionHandler.isDrawingMode()) {
      return;
    }
    if (!this.handler.shortcutHandler.isW(e)) {
      this.handler.interactionHandler.selection();
    }
  };

  /**
   * Context menu event on canvas
   *
   * @param {MouseEvent} e
   */
  public contextmenu = (e: MouseEvent) => {
    e.preventDefault();
    const { editable, onContext } = this.handler;
    if (editable && onContext) {
      const target = this.handler.canvas.findTarget(e, false) as FabricObject;
      if (target && target.type !== 'activeSelection') {
        this.handler.select(target);
      }
      this.handler.contextmenuHandler.show(e, target);
    }
  };

  /**
   * Mouse down event on canvas
   *
   * @param {MouseEvent} _e
   */
  public onmousedown = (_e: MouseEvent) => {
    this.handler.contextmenuHandler.hide();
  };
}

export default EventHandler;
