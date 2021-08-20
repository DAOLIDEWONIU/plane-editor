import { fabric } from 'fabric';

const BgImage = fabric.util.createClass(fabric.Image, {
  type: 'BgImage',
  superType: 'image',
  H_PADDING: 4,
  V_PADDING: 4,
  originX: 'center',
  originY: 'center',
  initialize: function (src: string, options: any) {
    this.callSuper('initialize', options);
    this.image = new Image();
    this.image.src = src;
    this.image.onload = function () {
      this.width = 300;
      this.height = this.image.height * (300 / this.image.width);
      this.loaded = true;
      this.setCoords();
      this.fire('image:loaded');
      this.canvas.renderAll();
    }.bind(this);
  },
  _render: function (ctx) {
    if (this.loaded) {
      ctx.fillStyle = '#fff';

      ctx.fillRect(
        -(this.width / 2) - this.H_PADDING,
        -(this.height / 2) - this.H_PADDING,
        this.width + this.H_PADDING * 2,
        this.height + this.V_PADDING * 2,
      );
      ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height,
      );
    }
  },
});

BgImage.fromObject = (options: any, callback: any) => {
  return callback(new BgImage(options));
};

window.fabric.BgImage = BgImage;

export default BgImage;
