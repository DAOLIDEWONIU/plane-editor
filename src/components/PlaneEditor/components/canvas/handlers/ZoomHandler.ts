import { fabric } from 'fabric';

import Handler from './Handler';
import { VideoObject } from '../objects/Video';
import { FabricObject } from '../utils';

class ZoomHandler {
  handler?: Handler;

  constructor(handler: Handler) {
    this.handler = handler;
  }

  public zoomToPoint1 = (point: any, value) => {
    const before = point;
    const canvas = this.handler?.canvas;
    let vpt = canvas.viewportTransform.slice(0);
    point = fabric.util.transformPoint(
      point,
      fabric.util.invertTransform(canvas.viewportTransform),
    );
    vpt[0] = value;
    vpt[3] = value;
    const after = fabric.util.transformPoint(point, vpt);
    vpt[4] += before.x - after.x;
    vpt[5] += before.y - after.y;
    return this.setViewportTransform(vpt);
  };

  setViewportTransform = (vpt) => {
    console.log(this);
    console.log('fabric', fabric.util);
    // var activeObject = this._activeObject,
    //   backgroundObject = this.backgroundImage,
    //   overlayObject = this.overlayImage,
    //   object,
    //   i,
    //   len;
    // this.viewportTransform = vpt;
    // for (i = 0, len = this._objects.length; i < len; i++) {
    //   object = this._objects[i];
    //   object.group || object.setCoords(true);
    // }
    // if (activeObject) {
    //   activeObject.setCoords();
    // }
    // if (backgroundObject) {
    //   backgroundObject.setCoords(true);
    // }
    // if (overlayObject) {
    //   overlayObject.setCoords(true);
    // }
    // this.calcViewportBoundaries();
    // this.renderOnAddRemove && this.requestRenderAll();
    return this;
  };

  /**
   * Zoom to point
   *
   * @param {fabric.Point} point
   * @param {number} zoom ex) 0 ~ 1. Not percentage value.
   */
  public zoomToPoint = (point: fabric.Point, zoom: number) => {
    const { minZoom, maxZoom } = this.handler;
    let zoomRatio = zoom;
    if (zoom <= minZoom / 100) {
      zoomRatio = minZoom / 100;
    } else if (zoom >= maxZoom / 100) {
      zoomRatio = maxZoom / 100;
    }
    this.zoomToPoint1(point, zoomRatio);
    //fabric.devicePixelRatio
    this.handler.canvas.zoomToPoint(point, zoomRatio);
    this.handler.getObjects().forEach((obj) => {
      if (obj.superType === 'element') {
        const { id, width, height, player } = obj as VideoObject;
        const el = this.handler.elementHandler.findById(id);
        // update the element
        this.handler.elementHandler.setScaleOrAngle(el, obj);
        this.handler.elementHandler.setSize(el, obj);
        this.handler.elementHandler.setPosition(el, obj);
        if (player) {
          player.setPlayerSize(width, height);
        }
      }
    });
    if (this.handler.onZoom) {
      this.handler.onZoom(zoomRatio);
    }
    this.handler.canvas.requestRenderAll();
  };

  /**
   * Zoom one to one
   *
   */
  public zoomOneToOne = () => {
    const center = this.handler.canvas.getCenter();
    this.handler.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.zoomToPoint(new fabric.Point(center.left, center.top), 1);
  };

  /**
   * Zoom to fit
   *
   */
  public zoomToFit = () => {
    let scaleX = this.handler.canvas.getWidth() / this.handler.workarea.width;
    const scaleY =
      this.handler.canvas.getHeight() / this.handler.workarea.height;
    if (this.handler.workarea.height >= this.handler.workarea.width) {
      scaleX = scaleY;
      if (
        this.handler.canvas.getWidth() <
        this.handler.workarea.width * scaleX
      ) {
        scaleX =
          scaleX *
          (this.handler.canvas.getWidth() /
            (this.handler.workarea.width * scaleX));
      }
    } else {
      if (
        this.handler.canvas.getHeight() <
        this.handler.workarea.height * scaleX
      ) {
        scaleX =
          scaleX *
          (this.handler.canvas.getHeight() /
            (this.handler.workarea.height * scaleX));
      }
    }
    const center = this.handler.canvas.getCenter();
    this.handler.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.zoomToPoint(new fabric.Point(center.left, center.top), scaleX);
  };

  /**
   * Zoom in
   *
   */
  public zoomIn = () => {
    let zoomRatio = this.handler.canvas.getZoom();
    zoomRatio += 0.05;
    const center = this.handler.canvas.getCenter();
    this.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
  };

  /**
   * Zoom out
   *
   */
  public zoomOut = () => {
    let zoomRatio = this.handler.canvas.getZoom();
    zoomRatio -= 0.05;
    const center = this.handler.canvas.getCenter();
    this.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
  };

  /**
   * Zoom to center with object
   *
   * @param {FabricObject} target If zoomFit true, rescaled canvas zoom.
   */
  public zoomToCenterWithObject = (target: FabricObject, zoomFit?: boolean) => {
    const { left: canvasLeft, top: canvasTop } =
      this.handler.canvas.getCenter();
    const { left, top, width, height } = target;
    const diffTop = canvasTop - (top + height / 2);
    const diffLeft = canvasLeft - (left + width / 2);
    if (zoomFit) {
      let scaleX;
      let scaleY;
      scaleX = this.handler.canvas.getWidth() / width;
      scaleY = this.handler.canvas.getHeight() / height;
      if (height > width) {
        scaleX = scaleY;
        if (this.handler.canvas.getWidth() < width * scaleX) {
          scaleX = scaleX * (this.handler.canvas.getWidth() / (width * scaleX));
        }
      } else {
        scaleY = scaleX;
        if (this.handler.canvas.getHeight() < height * scaleX) {
          scaleX =
            scaleX * (this.handler.canvas.getHeight() / (height * scaleX));
        }
      }
      this.handler.canvas.setViewportTransform([1, 0, 0, 1, diffLeft, diffTop]);
      this.zoomToPoint(new fabric.Point(canvasLeft, canvasTop), scaleX);
    } else {
      const zoom = this.handler.canvas.getZoom();
      this.handler.canvas.setViewportTransform([1, 0, 0, 1, diffLeft, diffTop]);
      this.zoomToPoint(new fabric.Point(canvasLeft, canvasTop), zoom);
    }
  };

  /**
   * Zoom to center with objects
   *
   * @param {boolean} [zoomFit] If zoomFit true, rescaled canvas zoom.
   * @returns
   */
  public zoomToCenter = (zoomFit?: boolean) => {
    const activeObject = this.handler.canvas.getActiveObject();
    if (!activeObject) {
      return;
    }
    this.zoomToCenterWithObject(activeObject, zoomFit);
  };
}

export default ZoomHandler;
