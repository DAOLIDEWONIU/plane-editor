import { fabric } from 'fabric';

const WriteBox = fabric.util.createClass(fabric.Rect, {
  type: 'writebox',
  initialize: function (element, options) {
    this.callSuper('initialize', element, options);
    options && this.set('lockUniScaling', options.lockUniScaling);
    options && this.set('label', options.label || '');
  },
  toObject: function () {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      label: this.label,
      lockUniScaling: this.lockUniScaling,
    });
  },
  _render: function (ctx) {
    console.log('ctx', ctx);
    this.callSuper('_render', ctx);
    ctx.font = '16px Times';
    ctx.fillStyle = '#333';
    ctx.rotate = 0;
    ctx.fillText(this.label, -this.width / 2 + 4, -this.height / 2 + 20);
  },
});

WriteBox.fromObject = (options: any, callback: any) => {
  return callback(new WriteBox(options));
};

window.fabric.WriteBox = WriteBox;

export default WriteBox;
