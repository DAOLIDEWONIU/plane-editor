import { fabric } from 'fabric';

const Label = fabric.util.createClass(fabric.Textbox, {
  type: 'label',
  // _initX: 0,
  // _initY: 0,
  initialize(label: string, options: any) {
    options = options || {};
    this.callSuper('initialize', label, options);
    console.log('哈哈哈this', this);

    this._initX = this.left;
    this._initY = this.top;

    this.on('added', () => {
      console.log('我被创建了', this);

      // this.set({
      //   _initX: this.left,
      //   _initY: this.top,
      // });
    });

    this.on('modified', () => {
      console.log('我被修改了', this);
    });

    this.on('moving', () => {
      console.log(this);
      const offsetX = this.left - this._initX;
      const offsetY = this.top - this._initY;
      this.set({
        offsetX,
        offsetY,
      });
    });
  },
  _render(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  },
});

Label.fromObject = (options: any, callback: (obj: any) => any) => {
  const { label } = options;
  return callback(new Label(label, options));
};

// @ts-ignore
window.fabric.Label = Label;

export default Label;
