import { fabric } from 'fabric';

const LabeledPolygon = fabric.util.createClass(fabric.Polygon, {
  type: 'LabeledPolygon',
  superType: 'drawing',
  recalcTextPosition: function (text: string) {
    if (!text) return;
    this.text.set('left', this.left);
    this.text.set('top', this.top);
  },
  polygonPositionHandler(dim, finalMatrix, fabricObject, pointIndex) {
    const x = fabricObject.points[pointIndex].x - fabricObject.pathOffset.x,
      y = fabricObject.points[pointIndex].y - fabricObject.pathOffset.y;
    return fabric.util.transformPoint(
      { x: x, y: y },
      fabric.util.multiplyTransformMatrices(
        fabricObject.canvas.viewportTransform,
        fabricObject.calcTransformMatrix(),
      ),
    );
  },
  anchorWrapper(anchorIndex, fn) {
    return function (eventData, transform, x, y) {
      const fabricObject = transform.target,
        absolutePoint = fabric.util.transformPoint(
          {
            x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
            y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
          },
          fabricObject.calcTransformMatrix(),
        ),
        actionPerformed = fn(eventData, transform, x, y),
        newDim = fabricObject._setPositionDimensions({}),
        polygonBaseSize = fabricObject._getNonTransformedDimensions(),
        newX =
          (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) /
          polygonBaseSize.x,
        newY =
          (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) /
          polygonBaseSize.y;
      fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
      return actionPerformed;
    };
  },
  actionHandler(eventData, transform, x, y) {
    const polygon = transform.target,
      currentControl = polygon.controls[polygon.__corner],
      mouseLocalPosition = polygon.toLocalPoint(
        new fabric.Point(x, y),
        'center',
        'center',
      ),
      polygonBaseSize = polygon._getNonTransformedDimensions(),
      size = polygon._getTransformedDimensions(0, 0),
      finalPointPosition = {
        x:
          (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
          polygon.pathOffset.x,
        y:
          (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
          polygon.pathOffset.y,
      };

    polygon.points[currentControl.pointIndex] = finalPointPosition;
    return true;
  },
  updateControls() {
    const lastControl = this.points.length - 1;
    this.set({
      hasBorders: false,
      strokeWidth: 3,
      cornerStyle: 'circle',
      cornerColor: '#1890FF',
      controls: this.points.reduce(function (acc, point, index) {
        acc['p' + index] = new fabric.Control({
          positionHandler: (dim, finalMatrix, fabricObject) =>
            this.polygonPositionHandler(dim, finalMatrix, fabricObject, index),
          actionHandler: this.anchorWrapper(
            index > 0 ? index - 1 : lastControl,
            this.actionHandler,
          ),
          actionName: 'modifyPolygon',
          pointIndex: index,
        });
        return acc;
      }, {}),
    });
  },
  initialize(points: any, options: any) {
    // console.log('访问多边形数据：', this);
    // console.log('访问多边形数据options：', options);

    options = options || {};
    this.callSuper('initialize', points, options);
    const _self = this;

    if (this.editable) {
      // console.log('我被触发了');
      const lastControl = this.points.length - 1;
      this.set({
        hasBorders: false,
        strokeWidth: 1,
        cornerStyle: 'circle',
        cornerColor: '#fff',
        controls: this.points.reduce(function (acc, point, index) {
          acc['p' + index] = new fabric.Control({
            positionHandler: (dim, finalMatrix, fabricObject) =>
              _self.polygonPositionHandler(
                dim,
                finalMatrix,
                fabricObject,
                index,
              ),
            actionHandler: _self.anchorWrapper(
              index > 0 ? index - 1 : lastControl,
              _self.actionHandler,
            ),
            actionName: 'modifyPolygon',
            pointIndex: index,
          });
          return acc;
        }, {}),
      });
    }

    // this.on('modified', () => {
    //   // console.log('我被修改了');
    // });
    this.on('mouse:move', () => {
      // console.log('我被修改了1');
    });

    this.on('mousedown:before', () => {
      // console.log('我被点击了');
    });

    this.on('added', () => {
      // console.log('我被添加了--------', this);

      if (!this?.label) return;
      this.positionText(this, this.id);
      // const absCoords = this.canvas.getAbsoluteCoords(this);
      // console.log('absCoords', absCoords);
      //
      // const PText = document.createElement('p');
      // PText.id = this.id;
      // PText.style.width = '100px';
      // PText.style.height = '40px';
      // PText.style.left = absCoords.left - 100 / 2 + 'px';
      // PText.style.top = absCoords.top - 40 / 2 + 'px';
      // PText.innerHTML = this.label;
      // const container = document.getElementsByClassName('canvas-container')[0];
      // container.appendChild(PText);
    });
    this.on('moving', () => {
      // console.log('我移动了', this);
      if (!this?.label) return;
      // this.positionText(this, this.id);
    });
    this.on('modified', () => {
      // this.setCoords();
      if (!this?.label) return;
      // this.positionText(this, this.id);
    });

    this.on('scaling', () => {
      if (!this?.label) return;
      // this.positionText(this, this.id);
    });
    this.on('scaled', () => {
      if (!this?.label) return;
      // this.positionText(this, this.id);
    });
  },
  positionText(obj, id) {
    const absCoords = this.canvas.getAbsoluteCoords(this);
    // console.log('absCoords', absCoords);
    const tar = document.getElementById(id);
    if (tar) {
      tar.style.left = absCoords.left - this.width / 2 + 'px';
      tar.style.top = absCoords.top - this.height / 2 + 'px';
      return;
    }
    const PText = document.createElement('p');
    PText.id = this.id;
    PText.innerHTML = this.label;
    PText.style.left = absCoords.left - this.width / 2 + 'px';
    PText.style.top = absCoords.top - this.height / 2 + 'px';
    const container = document.getElementsByClassName('p-editor-container')[0];
    // const container = document.body;
    container.appendChild(PText);
  },
  // _render(ctx: CanvasRenderingContext2D) {
  //   // console.log('ctx', ctx);
  //   this.callSuper('_render', ctx);
  // },
});

LabeledPolygon.fromObject = (options: any, callback: any) => {
  const { points } = options;
  return callback(new LabeledPolygon(points, options));
};

window.fabric.LabeledPolygon = LabeledPolygon;

export default LabeledPolygon;
