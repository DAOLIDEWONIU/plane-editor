import { fabric } from 'fabric';

fabric.util.object.extend(fabric.Object.prototype, {
  // 将圆分成N等份的多边形提高碰撞精度
  getCirclePoints: function (number) {
    number = number || 8;
    const [x, y, r] = [this.left, this.top, this.radius];
    const angle = 360 / number;
    const points = [];
    for (let i = 0; i < number; i++) {
      points.push({
        x: x + r * Math.cos((angle * i * Math.PI) / 180),
        y: y + r * Math.sin((angle * i * Math.PI) / 180),
      });
    }
    return points;
  },
  // 获取多边形的相对画布的绝对位置点
  getPolygonPoints: function () {
    return this.get('points').map((p) => {
      // @ts-ignore
      return fabric.util.transformPoint(
        {
          // @ts-ignore
          x: ~~(p.x - this.pathOffset.x),
          // @ts-ignore
          y: ~~(p.y - this.pathOffset.y),
        },
        this.calcTransformMatrix(),
      );
    });
  },
  pointToLines: function (points) {
    const lines = {};
    points.forEach((item, index) => {
      lines[`line${index}`] = {
        d: item,
        o: points[(index + 1) % points.length],
      };
    });
    return lines;
  },
  // 讲多边形的点换成线，方便对象的包含关系判断
  getPolygonToLines: function () {
    return this.pointToLines(this.getPolygonPoints());
  },
  checkCrossPoints: function (point, lines) {
    let b1,
      b2,
      a1,
      a2,
      xi, // yi,
      xcount = 0,
      iLine;
    for (let lineKey in lines) {
      iLine = lines[lineKey];
      // optimisation 1: line below point. no cross
      if (iLine.o.y < point.y && iLine.d.y < point.y) {
        continue;
      }
      // optimisation 2: line above point. no cross
      if (iLine.o.y >= point.y && iLine.d.y >= point.y) {
        continue;
      }
      // optimisation 3: vertical line case
      if (iLine.o.x === iLine.d.x && iLine.o.x >= point.x) {
        xi = iLine.o.x;
        // yi = point.y;
      }
      // calculate the intersection point
      else {
        b1 = 0;
        b2 = (iLine.d.y - iLine.o.y) / (iLine.d.x - iLine.o.x);
        a1 = point.y - b1 * point.x;
        a2 = iLine.o.y - b2 * iLine.o.x;
        xi = -(a1 - a2) / (b1 - b2);
        // yi = a1 + b1 * xi;
      }
      // dont count xi < point.x cases
      if (xi >= point.x) {
        xcount += 1;
      }
    }
    return xcount !== 0 && xcount % 2 === 1;
  },
  // 判断一个对象是否再一个对象内，包括任意形状的多边形
  checkObjectIsInOtherObject: function (other) {
    let type = this.type,
      lines,
      points,
      oType = other.type;
    if (type === 'circle') {
      // 获取圆的点数，默认8个点
      points = this.getCirclePoints();
    } else if (type === 'polygon') {
      points = this.getPolygonPoints();
    } else {
      points = this.getCoords();
    }
    if (oType === 'circle') {
      lines = other.pointToLines(other.getCirclePoints);
    } else if (oType === 'polygon') {
      lines = other.getPolygonToLines();
    } else {
      other.setCoords();
      lines = other._getImageLines(other.aCoords);
    }
    for (let i = 0, len = points.length; i < len; i++) {
      if (!other.checkCrossPoints(points[i], lines)) {
        return false;
      }
    }
    return true;
  },
  // 检测是否再某个对象里面 intersection 判断是否要相交
  isIntersectsWithObject: function (other, intersection) {
    let intersectionRes = null;
    if (intersection) {
      let type = this.type,
        oType = other.type,
        points,
        oPoints;
      if (type === 'polygon') {
        points = this.getPolygonPoints();
      } else if (type === 'circle') {
        points = this.getCirclePoints();
      } else {
        this.setCoords();
        points = this.getCoords();
      }
      if (oType === 'polygon') {
        oPoints = other.getPolygonPoints();
      } else if (oType === 'circle') {
        oPoints = other.getCirclePoints();
      } else {
        this.setCoords();
        oPoints = other.getCoords();
      }
      intersectionRes = fabric.Intersection.intersectPolygonPolygon(
        points,
        oPoints,
      );
      console.log(intersectionRes, 'insterction');
    }
    return (
      (intersectionRes && intersectionRes.status === 'Intersection') ||
      this.checkObjectIsInOtherObject(other)
    );
  },
});

fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

fabric.Canvas.prototype.getAbsoluteCoords = function (object) {
  return {
    left: object.left + this._offset.left,
    top: object.top + this._offset.top,
  };
};

fabric.Polygon.prototype.setPositionDimensions = function () {
  this._setPositionDimensions(this);
};

fabric.Polygon.prototype._getTransformedDimensions = function (skewX, skewY) {
  if (typeof skewX === 'undefined') {
    skewX = this.skewX;
  }
  if (typeof skewY === 'undefined') {
    skewY = this.skewY;
  }
  const dimensions = this._getNonTransformedDimensions();
  if (skewX === 0 && skewY === 0) {
    return {
      x: dimensions.x * this.scaleX + this.strokeWidth * (1 - this.scaleX),
      y: dimensions.y * this.scaleY + this.strokeWidth * (1 - this.scaleY),
    };
  }
  const dimX = dimensions.x / 2,
    dimY = dimensions.y / 2,
    points = [
      {
        x: -dimX,
        y: -dimY,
      },
      {
        x: dimX,
        y: -dimY,
      },
      {
        x: -dimX,
        y: dimY,
      },
      {
        x: dimX,
        y: dimY,
      },
    ],
    i,
    transformMatrix = this._calcDimensionsTransformMatrix(skewX, skewY, false),
    bbox;
  for (i = 0; i < points.length; i++) {
    points[i] = fabric.util.transformPoint(points[i], transformMatrix);
  }
  bbox = fabric.util.makeBoundingBoxFromPoints(points);
  return {
    x: bbox.width,
    y: bbox.height,
  };
};
