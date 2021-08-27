import { fabric } from 'fabric';
import { v4 } from 'uuid';

const LabeledPolygon = fabric.util.createClass(fabric.Polygon, {
  type: 'LabeledPolygon',
  superType: 'drawing',
  UpdateLabelPosition() {
    const { x, y } = this.getCenterPoint();
    this.text.set('left', x);
    this.text.set('top', y);
    this.canvas.renderAll();
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
    const _self = this;
    this.set({
      hasBorders: false,
      strokeWidth: 3,
      cornerStyle: 'circle',
      cornerColor: '#1890FF',
      controls: _self.points.reduce(function (acc, point, index) {
        acc['p' + index] = new fabric.Control({
          positionHandler: (dim, finalMatrix, fabricObject) =>
            _self.polygonPositionHandler(dim, finalMatrix, fabricObject, index),
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
  },
  initialize(points: any, options: any) {
    options = options || {};
    this.callSuper('initialize', points, options);
    const _self = this;

    if (options.label) {
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
        editable: false,
        originX: 'center',
        originY: 'center',
        // width: this.width,
        // height: this.height,
        // textAlign: 'center',
        minScaleLimit: 1,
        mode: 'text',
        id: v4(),
        fid: options.id,
      };
      this.text = new fabric.Textbox(options.label || '空置', textOptions);
    }

    // if (this.editable) {
    //   const lastControl = this.points.length - 1;
    //   this.set({
    //     hasBorders: false,
    //     strokeWidth: 1.5,
    //     stroke: '#1089FF',
    //     cornerStyle: 'circle',
    //     cornerStrokeColor: '#333',
    //     cornerColor: '#fff',
    //     controls: this.points.reduce(function (acc, point, index) {
    //       acc['p' + index] = new fabric.Control({
    //         positionHandler: (dim, finalMatrix, fabricObject) =>
    //           _self.polygonPositionHandler(
    //             dim,
    //             finalMatrix,
    //             fabricObject,
    //             index,
    //           ),
    //         actionHandler: _self.anchorWrapper(
    //           index > 0 ? index - 1 : lastControl,
    //           _self.actionHandler,
    //         ),
    //         actionName: 'modifyPolygon',
    //         pointIndex: index,
    //       });
    //       return acc;
    //     }, {}),
    //   });
    // }

    this.on('mouse:move', () => {
      // console.log('我被修改了1');
    });

    this.on('mousedown:before', () => {
      // console.log('我被点击了');
    });

    this.on('added', () => {
      if (!options.label) return;
      this.canvas.add(this.text);
      const { x, y } = this.getCenterPoint();
      this.text.set('left', x);
      this.text.set('top', y);
      this.text.set({
        hasControls: false,
      });
      this.canvas.renderAll();
    });
    this.on('moving', () => {
      if (!this.text) return;
      this.UpdateLabelPosition();
    });
    this.on('modified', () => {
      if (!this.text) return;
      this.UpdateLabelPosition();
    });

    this.on('scaling', () => {
      if (!this.text) return;
      this.UpdateLabelPosition();
    });

    this.on('removed', () => {
      if (!this.text) return;
      this.canvas.remove(this.text);
    });

    this.on('scaled', () => {
      console.log('1111');
      if (!this.text) return;
      this.UpdateLabelPosition();
    });

    //选中事件
    this.on('selected', () => {
      const lastControl = this.points.length - 1;
      this.set({
        hasBorders: false,
        strokeWidth: 1.5,
        stroke: '#1089FF',
        cornerStyle: 'circle',
        cornerStrokeColor: '#333',
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
    });
    //取消选中事件
    this.on('deselected', () => {
      this.set({
        strokeWidth: 1,
        stroke: '#7A97CC',
      });
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
