import { fabric } from 'fabric';
import CanvasObject from '@/components/PlaneEditor/components/canvas/CanvasObject';

const LabeledPolygon = fabric.util.createClass(fabric.Polygon, {
  type: 'LabeledPolygon',
  superType: 'drawing',
  recalcTextPosition: function (text: string) {
    if (!text) return;
    this.text.set('left', this.left);
    this.text.set('top', this.top);
  },
  initialize(points: any, options: any) {
    console.log('points', points);
    console.log('options', options);
    options = options || [];
    this.callSuper('initialize', points, options);

    if (options.text) {
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
        text: options.text || '空置',
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

      this.on('moving', () => {
        if (!options.text) return;
        this.recalcTextPosition(options.text);
      });
      this.on('rotating', () => {
        if (!options.text) return;
        this.recalcTextPosition(options.text);
      });
      this.on('scaling', (e) => {
        if (!options.text) return;
        this.recalcTextPosition(options.text);
      });

      this.on('added', () => {
        if (!options.text) return;
        this.canvas.add(this.text);
      });

      this.on('removed', () => {
        if (!options.text) return;
        this.canvas.remove(this.text);
      });
    }
  },
  // _render(ctx: CanvasRenderingContext2D) {
  //   this.callSuper('_render', ctx);
  //
  // },
});

LabeledPolygon.fromObject = (options: any, callback: any) => {
  const { points } = options;
  return callback(new LabeledPolygon(points, options));
};

window.fabric.LabeledPolygon = LabeledPolygon;

export default LabeledPolygon;
