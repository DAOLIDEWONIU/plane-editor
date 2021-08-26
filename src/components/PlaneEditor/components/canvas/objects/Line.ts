import { fabric } from 'fabric';

const Line = fabric.util.createClass(fabric.Line, {
  type: 'line',
  superType: 'drawing',
  initialize(points: any, options: any) {
    if (!points) {
      const { x1, x2, y1, y2 } = options;
      points = [x1, y1, x2, y2];
    }
    options = options || {};
    this.callSuper('initialize', points, options);

    //选中事件
    this.on('selected', () => {
      this.set({
        hasBorders: false,
        hasControls: false,
        strokeWidth: 1.5,
        stroke: '#1089FF',
        cornerStyle: 'circle',
        cornerStrokeColor: '#333',
        cornerColor: '#fff',
      });
    });
    //取消选中事件
    this.on('deselected', () => {
      this.set({
        strokeWidth: 1,
        stroke: '#7A97CC',
      });
    });
  },
  drawDot(ctx, x, y) {
    ctx.beginPath();
    ctx.strokeStyle = '#1791fc';
    ctx.fillStyle = '#fff';
    ctx.arc(x, y, 6, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
  },
  _render(ctx: CanvasRenderingContext2D) {
    // const { x1, y1, x2, y2 } = this;
    this.callSuper('_render', ctx);

    //
    // ctx.save();
    // // ctx.lineWidth = 2;
    // this.drawDot(ctx, this.left, this.top);
    // this.drawDot(ctx, x2, y2);
    // ctx.restore();
  },
});

Line.fromObject = (options: any, callback: any) => {
  const { x1, x2, y1, y2 } = options;
  return callback(new Line([x1, y1, x2, y2], options));
};

window.fabric.Line = Line;

export default Line;
