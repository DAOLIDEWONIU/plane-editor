import { fabric } from 'fabric';

import { toObject, FabricElement } from '../utils';

export interface Code {
  html: string;
  css: string;
  js: string;
}

export interface ElementObject extends FabricElement {
  setSource: (source: Code) => void;
  setCode: (code: Code) => void;
  code: Code;
}

const initialCode: Code = {
  html: '',
  css: '',
  js: '',
};

const LabelElement = fabric.util.createClass(fabric.Rect, {
  type: 'LabelElement',
  superType: 'LabelElement',
  initialize(html: any, options: any) {
    options = options || {};
    this.callSuper('initialize', html, options);

    this.on('modified', () => {
      console.log('修改了', this);
    });
  },
  setSource(source: any) {
    console.log('source', source);
    this.setCode(source);
  },
  setCode(code = initialCode) {
    this.set({
      code,
    });
    console.log(this.element);

    const { css, js, html } = code;
    // this.styleEl.innerHTML = css;
    // this.scriptEl.innerHTML = js;
    if (this.element) {
      this.element.innerHTML = html;
    }
  },
  _render(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
    console.log('修改了', this);
    if (!this.element) {
      const { id, editable, html, left, top, width, height } = this;
      this.element = fabric.util.makeElement('div', {
        id: `${id}_container`,
        style: `        transform: rotate(${0}deg) scale(${1}, ${1});left: ${left}px;
                        top: ${top}px;
                        position: absolute;
                        width: ${width}px;
                        height: ${height}px;
                        z-index: 0;
                        font-size: 16px;
                        user-select: ${editable ? 'none' : 'auto'};
                        pointer-events: none;`,
      }) as HTMLDivElement;
      const container = document.getElementsByClassName('canvas-container')[0];
      container.appendChild(this.element);
      this.element.innerHTML = html;
    } else {
      console.log('element====', this.element);
    }
  },
});

LabelElement.fromObject = (options: any, callback: (obj: any) => any) => {
  return callback(new LabelElement(options.html, options));
};

window.fabric.LabelElement = LabelElement;

export default LabelElement;
