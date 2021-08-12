import { fabric } from 'fabric';
import { FabricObject } from '../utils';

export interface CustomGroupObject extends FabricObject {}

const CustomGroup = fabric.util.createClass(fabric.Group, {
  type: 'CustomGroup',
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

    // console.log('initialize', this);
    const newWidth = (this.width * this.scaleX) / 2;
    const newHeight = (this.height * this.scaleY) / 2;
    // console.log('新的宽度', newWidth);
    // console.log('新的高度', newHeight);

    // console.log('新的newTop', newTop);
    // console.log('新的newLeft', newLeft);

    // this.text.set('left', newLeft);
    // this.text.set('top', newTop);

    // console.log('rectLeftTop', rectLeftTop);
    console.log('新的 left', rectLeftTop.x + newLeft);
    console.log('新的 top', rectLeftTop.y + newTop);

    this.text.set('left', rectLeftTop.x + newLeft);
    this.text.set('top', rectLeftTop.y + newTop);
  },
  initialize(options: any) {
    this.callSuper('initialize', options);

    this.on('moving', () => {
      console.log('mov-----------', this);
      // this.recalcTextPosition();
    });

    this.on('rotating', () => {
      // this.text.rotate(this.text.angle + this.angle - this._prevAngle); //文字不旋转
      // this.recalcTextPosition();
      // this._prevAngle = this.angle;
      console.log('旋转角度-----------', this.angle);
      console.log('rotating-----------', this.item(1));
      this.item(1).set({
        // text: 'trololo',
        // fill: 'white',
        // fontSize: 16,
        angle: -20,
      });
      this.canvas.renderAll();
      this._prevAngle = this.angle;
    });

    this.on('scaling', (e) => {
      // console.log('scaling-----------', this);
      console.log('scaling-----------', this.item(1));
      this.item(1).set({
        // text: 'trololo',
        // fill: 'white',
        // fontSize: 16,
        scaleX: 1,
        scaleY: 1,
      });
      this.item(2).set({
        // text: 'trololo',
        // fill: 'white',
        // fontSize: 16,
        scaleX: 1,
        scaleY: 1,
      });
    });
    // this.on('added', () => {
    //   this.canvas.add(this.text);
    // });
    // this.on('removed', () => {
    //   this.canvas.remove(this.text);
    // });
    // this.on('mousedown:before', () => {
    //   this._prevObjectStacking = this.canvas.preserveObjectStacking;
    //   this.canvas.preserveObjectStacking = true;
    // });
    // this.on('mousedblclick', () => {
    //   this.text.selectable = true;
    //   this.text.evented = true;
    //   this.canvas.setActiveObject(this.text);
    //   this.text.enterEditing();
    //   this.selectable = false;
    // });
    // this.on('deselected', () => {
    //   this.canvas.preserveObjectStacking = this._prevObjectStacking;
    // });
    // this.text.on('editing:exited', () => {
    //   this.text.selectable = false;
    //   this.text.evented = false;
    //   this.selectable = true;
    // });
  },
});

CustomGroup.fromObject = (
  options: CustomGroupObject,
  callback: (obj: CustomGroupObject) => any,
) => {
  return callback(new CustomGroup(options));
};

// @ts-ignore
window.fabric.CustomGroup = CustomGroup;

export default CustomGroup;
