import { fabric } from 'fabric';
import { FabricObject } from '../utils';

export interface LabeledRectObject extends FabricObject {}

const LabeledRect = fabric.util.createClass(fabric.Rect, {
  type: 'labeledRect',
  text: null,
  textOffsetLeft: 0,
  textOffsetTop: 0,
  _prevObjectStacking: null,
  _prevAngle: 0,
  recalcTextPosition: function () {
    const sin = Math.sin(fabric.util.degreesToRadians(this.angle));
    const cos = Math.cos(fabric.util.degreesToRadians(this.angle));
    const newTop = sin * this.textOffsetLeft + cos * this.textOffsetTop;
    const newLeft = cos * this.textOffsetLeft - sin * this.textOffsetTop;
    const rectLeftTop = this.getPointByOrigin('left', 'top');

    console.log('initialize', this);
    const newWidth = (this.width * this.scaleX) / 2;
    const newHeight = (this.height * this.scaleY) / 2;
    console.log('新的宽度', newWidth);
    console.log('新的高度', newHeight);

    console.log('新的newTop', newTop);
    console.log('新的newLeft', newLeft);

    // this.text.set('left', newLeft);
    // this.text.set('top', newTop);

    console.log('rectLeftTop', rectLeftTop);

    this.text.set('left', rectLeftTop.x + newLeft + newWidth);
    this.text.set('top', rectLeftTop.y + newTop + newHeight);
  },
  initialize: function (rectOptions, textOptions, text) {
    this.callSuper('initialize', rectOptions);
    // if(text) {
    //
    // }
    this.text = new fabric.IText(text, {
      ...textOptions,
      selectable: false,
      evented: false,
    });
    console.log('initialize', this);

    const x1 = this.oCoords?.mt?.x;
    const y1 = this.oCoords?.mt?.y;
    const x2 = this.oCoords?.mb?.x;
    const y2 = this.oCoords?.mb?.y;

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    console.log('新的newLeft', centerX, centerY);
    this.textOffsetLeft = this.left + this.width / 2;
    this.textOffsetTop = this.top + this.height / 2;
    // this.text.set('left', centerX);
    // this.text.set('top', centerY);
    this.on('moving', () => {
      this.recalcTextPosition();
    });
    this.on('rotating', () => {
      // this.text.rotate(this.text.angle + this.angle - this._prevAngle); //文字不旋转
      this.recalcTextPosition();
      this._prevAngle = this.angle;
    });
    this.on('scaling', (e) => {
      this.recalcTextPosition();
    });
    this.on('added', () => {
      this.canvas.add(this.text);
    });
    this.on('removed', () => {
      this.canvas.remove(this.text);
    });
    this.on('mousedown:before', () => {
      this._prevObjectStacking = this.canvas.preserveObjectStacking;
      this.canvas.preserveObjectStacking = true;
    });
    this.on('mousedblclick', () => {
      this.text.selectable = true;
      this.text.evented = true;
      this.canvas.setActiveObject(this.text);
      this.text.enterEditing();
      this.selectable = false;
    });
    this.on('deselected', () => {
      this.canvas.preserveObjectStacking = this._prevObjectStacking;
    });
    this.text.on('editing:exited', () => {
      this.text.selectable = false;
      this.text.evented = false;
      this.selectable = true;
    });
  },
});

LabeledRect.fromObject = (
  options: LabeledRectObject,
  callback: (obj: LabeledRectObject) => any,
) => {
  return callback(new LabeledRect(options));
};

// @ts-ignore
window.fabric.LabeledRect = LabeledRect;

export default LabeledRect;
