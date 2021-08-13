import { fabric } from 'fabric';
import { FabricObject } from '../utils';
import CanvasObject from '../CanvasObject';

export interface LabeledCircleObject extends FabricObject {}

//findById

const LabeledCircle = fabric.util.createClass(fabric.Circle, {
  type: 'LabeledCircle',
  text: null,
  _prevObjectStacking: null,
  _prevAngle: 0,
  recalcTextPosition: function (text: string) {
    // const sin = Math.sin(fabric.util.degreesToRadians(this.angle));
    // const cos = Math.cos(fabric.util.degreesToRadians(this.angle));
    // const newTop = sin * this.textOffsetLeft + cos * this.textOffsetTop;
    // const newLeft = cos * this.textOffsetLeft - sin * this.textOffsetTop;
    // const rectLeftTop = this.getPointByOrigin('left', 'top');
    // const x1 = this.oCoords?.mt?.x;
    // const y1 = this.oCoords?.mt?.y;
    // const x2 = this.oCoords?.mb?.x;
    // const y2 = this.oCoords?.mb?.y;
    // const centerX = (x1 + x2) / 2;
    // const centerY = (y1 + y2) / 2;

    // console.log('新的 left', centerX * this.zoomX, centerY * this.zoomY);
    // console.log('新的 left2', centerX, centerY);
    // console.log('新的 this', this);
    // console.log('新的 left', rectLeftTop.x + newLeft);
    // console.log('新的 top', rectLeftTop.y + newTop);

    // this.text.set('left', centerX * this.zoomX);
    // this.text.set('top', centerY * this.zoomY);
    if (!text) return;
    this.text.set('left', this.left);
    this.text.set('top', this.top);
  },
  initialize(options: any, text: string) {
    console.log('options', options);
    this.callSuper('initialize', options);

    if (text) {
      const textOptions = {
        strokeWidth: 0.01,
        backgroundColor: 'rgba(255,255,255,.001)',
        textBackgroundColor: 'rgba(255,255,255,.2)',
        fontSize: 15,
        shadow: 'rgba(255,255,255,0.2) 0 0 5px',
        fontStyle: 'normal',
        fontFamily: 'sans-serif',
        evented: false,
        lockUniScaling: true,
        lockScalingX: true,
        lockScalingY: true,
        selectable: false,
        width: this.width,
        height: this.height,
        textAlign: 'center',
        text: text || '空置',
        mode: 'text',
        id: options.id,
      };
      const textOption = Object.assign({}, textOptions, {});
      this.text = CanvasObject['textbox'].create(textOption);
      // this.text = new fabric.Textbox(text || '空置1', textOption);

      setTimeout(() => {
        this.text.set('left', this.left);
        this.text.set('top', this.top);
        this.canvas.renderAll();
      }, 0);
    }

    this.on('moving', () => {
      this.recalcTextPosition(text);
    });
    this.on('rotating', () => {
      // this.text.rotate(this.text.angle + this.angle - this._prevAngle); //文字不旋转
      this.recalcTextPosition(text);
      this._prevAngle = this.angle;
    });
    this.on('scaling', (e) => {
      this.recalcTextPosition(text);
    });

    this.on('added', () => {
      if (!text) return;
      this.canvas.add(this.text);
    });
    this.on('removed', () => {
      if (!text) return;
      this.canvas.remove(this.text);
    });
    this.on('mousedown:before', () => {
      this._prevObjectStacking = this.canvas.preserveObjectStacking;
      this.canvas.preserveObjectStacking = true;
    });
    this.on('mousedblclick', () => {
      // this.text.selectable = true;
      // this.text.evented = true;
      // this.canvas.setActiveObject(this.text);
      // this.text.enterEditing();
      // this.selectable = false;
    });
    this.on('deselected', () => {
      this.canvas.preserveObjectStacking = this._prevObjectStacking;
    });

    // this.text.on('editing:exited', () => {
    //   this.text.selectable = false;
    //   this.text.evented = false;
    //   this.selectable = true;
    // });
  },
});

LabeledCircle.fromObject = (
  options: LabeledCircleObject,
  callback: (obj: LabeledCircleObject) => any,
) => {
  return callback(new LabeledCircle(options));
};

// @ts-ignore
window.fabric.LabeledCircle = LabeledCircle;

export default LabeledCircle;
