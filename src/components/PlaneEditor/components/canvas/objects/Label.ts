import { fabric } from 'fabric';

const Label = fabric.util.createClass(fabric.Textbox, {
  type: 'label',
  // _initX: 0,
  // _initY: 0,
  initialize(text: string, options: any) {
    options = options || {};
    this.callSuper('initialize', text, options);
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

    this.on('moving', () => {
      console.log(this);
      const offsetX = this.left - this._initX;
      const offsetY = this.top - this._initY;
      console.log('哈哈哈', offsetX, offsetY);
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
  const { text } = options;
  return callback(new Label(text, options));
};

// @ts-ignore
window.fabric.CirclePort = Label;

export default Label;
