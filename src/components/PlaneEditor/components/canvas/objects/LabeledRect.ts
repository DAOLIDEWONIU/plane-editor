import { fabric } from 'fabric';
import { FabricObject } from '../utils';
import CanvasObject from '../CanvasObject';

export interface LabeledRectObject extends FabricObject {}

const LabeledRect = fabric.util.createClass(fabric.Rect, {
  type: 'labeledRect',
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
    // console.log('options', options);
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
  _render: function (ctx) {
    this.callSuper('_render', ctx);
    console.log('hahah11', this);
    console.log('ctx', ctx);
    console.log('hahah', this.canvas.getZoom());
    const zoomRatio = this.canvas.getZoom();
    let fontSize = 16 / zoomRatio;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(0,0,0,.85)';
    ctx.textAlign = 'center';
    ctx.scaleX = 1;
    ctx.lockUniScaling = false;
    ctx.fillText(this.get('name'), 0, 0, 30);

    // ctx.font = '20px sans-serif';
    // const width = this.width;
    // const height = this.height;
    //
    // const tempImg = new Image();
    // tempImg.src =
    //   'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="' +
    //   width +
    //   '" height="' +
    //   height +
    //   '"><body xmlns="http://www.w3.org/1999/xhtml" style="margin:0;font:' +
    //   ctx.font +
    //   ';">我是一段需要换行</body></foreignObject></svg>';
    //
    // tempImg.onload = function () {
    //   tempImg.width = width;
    //   tempImg.height = height;
    //   // 把img绘制在canvas画布上
    //   ctx.drawImage(tempImg, 0, 0, width, height);
    //   this.canvas.renderAll();
    // }.bind(this);
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
