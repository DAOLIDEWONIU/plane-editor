import { fabric } from 'fabric';
/**请求封装*/
export const awaitWrap = <T, U = any>(
  promise: Promise<T>,
): Promise<[any, any]> => {
  return promise
    .then<[any, any]>((res: any) => {
      if (res?.status === 1) return [null, res?.data];
      return [res?.message || '执行失败', null];
    })
    .catch<[null, null]>((err) => {
      // console.log('检测错误', err);
      return [null, null];
    });
};

//控制点属性

export function polygonPositionHandler(
  dim,
  finalMatrix,
  fabricObject,
  pointIndex,
) {
  const x = fabricObject.points[pointIndex].x - fabricObject.pathOffset.x,
    y = fabricObject.points[pointIndex].y - fabricObject.pathOffset.y;
  return fabric.util.transformPoint(
    { x: x, y: y },
    fabric.util.multiplyTransformMatrices(
      fabricObject.canvas.viewportTransform,
      fabricObject.calcTransformMatrix(),
    ),
  );
}
export function anchorWrapper(anchorIndex, fn) {
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
}
export function actionHandler(eventData, transform, x, y) {
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
}

export const getAngle = (x1, y1, x2, y2, cx, cy) => {
  //2个点之间的角度获取
  let c1 = (Math.atan2(y1 - cy, x1 - cx) * 180) / Math.PI;
  let c2 = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
  let angle;
  c1 = c1 <= -90 ? 360 + c1 : c1;
  c2 = c2 <= -90 ? 360 + c2 : c2;

  //夹角获取
  angle = Math.floor(c2 - c1);
  angle = angle < 0 ? angle + 360 : angle;
  return angle;
};

/**两个点的距离*/
export function getDistanceBetweenTwoPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const a = x1 - x2;
  const b = y1 - y2;

  // c^2 = a^2 + b^2
  // a^2 = Math.pow(a, 2)
  // b^2 = Math.pow(b, 2)
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

/**获取点到线的垂直距离*/

export function distanceOfPointAndLine(x, y, x1, y1, x2, y2) {
  const A = Math.abs(Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2)));
  const B = Math.abs(Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2)));
  const C = Math.abs(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
  //利用海伦公式计算三角形面积
  //周长的一半
  const P = (A + B + C) / 2;
  const allArea = Math.abs(Math.sqrt(P * (P - A) * (P - B) * (P - C)));
  //普通公式计算三角形面积反推点到线的垂直距离
  return (2 * allArea) / C;
}

interface getRadiusPointProps {
  center: { x: number; y: number }; //圆心坐标
  radius: number; //半径
}
export function getRadiusPoint(props: getRadiusPointProps) {
  const { center, radius } = props;
  const point = [] as any[];
  console.log('sd', center, radius);
  Array.from({ length: 360 }, (_, key) => ({ key })).forEach((_) => {
    if (_.key % 12 === 0) {
      const radian = ((2 * Math.PI) / 360) * _.key; //90度角的弧度
      point.push({
        x: center.x + Math.sin(radian) * radius,
        y: center.y - Math.cos(radian) * radius, //求出90度角的y坐标
      });
    }
  });
  return point;
}

// 检测是否在某个顶点内
export function checkPointIndex(
  pointsArr: any[],
  x: number,
  y: number,
  ctx: any,
) {
  let result = -1;
  // 遍历顶点绘制圆形路径，和上面的绘制顶点圆形的区别是这里不需要实际描边和填充，只需要路径
  pointsArr.forEach((item, index) => {
    ctx.beginPath();
    ctx.arc(item.x, item.y, 6, 0, 2 * Math.PI);
    if (ctx.isPointInPath(x, y)) {
      result = index;
    }
  });
  return result;
}

//获取顶点真实索引
export function getTrueIndex(index, pointsArr) {
  let prevFictitiousCount = 0;
  for (let i = 0; i < index; i++) {
    if (pointsArr[i]?.fictitious) {
      prevFictitiousCount++;
    }
  }
  return index - prevFictitiousCount;
}

//移除虚拟顶点
export function removeFictitiousPoints(pointsArr) {
  return pointsArr.filter((item) => {
    return !item.fictitious;
  });
}

// 检查是否在多边形内
export function checkInPolygon(pointsArr, x, y, ctx) {
  ctx.beginPath();
  pointsArr.forEach((item, index) => {
    if (index === 0) {
      ctx.moveTo(item.x, item.y);
    } else {
      ctx.lineTo(item.x, item.y);
    }
  });
  ctx.closePath();
  return ctx.isPointInPath(x, y);
}

//根据顶点创建一下线段
export function createLineSegment(pointsArr: any[], dragPointIndex: number) {
  let result = [];
  // 创建线段
  let arr = pointsArr;
  let len = arr.length;
  for (let i = 0; i < len - 1; i++) {
    result.push([arr[i], arr[i + 1]]);
  }
  // 加上起点和终点组成的线段
  result.push([arr[len - 1], arr[0]]);
  // 去掉包含当前拖动点的线段
  if (dragPointIndex !== -1) {
    // 如果拖动的是起点，那么去掉第一条和最后一条线段
    if (dragPointIndex === 0) {
      result.splice(0, 1);
      result.splice(-1, 1);
    } else {
      // 其余中间的点则去掉前一根和后一根
      result.splice(dragPointIndex - 1, 2);
    }
  }
  return result;
}

//吸附线段的逻辑
export function checkAdsorbent(pointsArr, dragPointIndex, x, y) {
  let result: any[] = [x, y];
  // 吸附到线段
  let segments = createLineSegment(pointsArr, dragPointIndex);
  let nearestLineResult = getPintNearestLine(x, y, segments);
  if (nearestLineResult[0] <= 10) {
    let segment = nearestLineResult[1];
    let nearestPoint = getNearestPoint(
      segment[0].x,
      segment[0].y,
      segment[1].x,
      segment[1].y,
      x,
      y,
    );
    if (nearestPoint) {
      result = [nearestPoint.x, nearestPoint.y];
    }
  }
  return result;
}
//计算里某个点最近的线段
export function getPintNearestLine(x, y, lineSegments) {
  let minNum = Infinity;
  let minLine;
  for (let i = 0; i < lineSegments.length; i++) {
    let item = lineSegments[i];
    let a = item[0];
    let b = item[1];
    let d = getLinePointDistance(a.x, a.y, b.x, b.y, x, y);
    if (d < minNum) {
      minNum = d;
      minLine = item;
    }
  }
  return [minNum, minLine];
}

//获取点到直线的距离
export function getLinePointDistance(x1, y1, x2, y2, x, y) {
  // 直线垂直于x轴
  if (x1 === x2) {
    return Math.abs(x - x1);
  } else {
    let B = -1;
    let A, C;
    A = (y2 - y1) / (x2 - x1);
    C = 0 - B * y1 - A * x1;
    return Math.abs((A * x + B * y + C) / Math.sqrt(A * A + B * B));
  }
}

//获取线段上离某个点最近的点
export function getNearestPoint(x1, y1, x2, y2, x0, y0) {
  let k = (y2 - y1) / (x2 - x1);
  let x = (k * k * x1 + k * (y0 - y1) + x0) / (k * k + 1);
  let y = k * (x - x1) + y1;
  // 判断该点的x坐标是否在线段的两个端点内
  let min = Math.min(x1, x2);
  let max = Math.max(x1, x2);
  // 如果在线段内就是我们要的点
  if (x >= min && x <= max) {
    return {
      x,
      y,
    };
  } else {
    // 否则返回最近的端点
    return null;
  }
}

//insertFictitiousPoints

export function getTwoPointDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// 获取锚点是在之前顶点内的序号
export function getPointIndex(
  pointsArr: any[],
  x: number,
  y: number,
  ctx: any,
) {
  let result = -1;
  const len = pointsArr.length;
  console.log('宽度=====111=：', ctx.isPointInStroke(x, y));
  // 遍历顶点绘制圆形路径，和上面的绘制顶点圆形的区别是这里不需要实际描边和填充，只需要路径
  pointsArr.forEach((item, index) => {
    const lastIndex = index + 1 === len ? 0 : index + 1;
    const w = getTwoPointDistance(
      pointsArr[index].x,
      pointsArr[index].y,
      pointsArr[lastIndex].x,
      pointsArr[lastIndex].y,
    );
    console.log('宽度======：', w);
    // ctx.beginPath();
    // ctx.fillRect(item.x, item.y, w, 4);
    if (ctx.isPointInPath(x, y)) {
      result = index;
    }
  });
  return result;
}
// 插入虚拟顶点
export function insertFictitiousPoints(pointsArr: any[], isMousedown: boolean) {
  if (isMousedown) return;
  // 生成虚拟顶点，跟创建线段一样的逻辑，只是计算的是线段的中点位置
  let points = [];
  let arr = pointsArr;
  let len = arr.length;
  for (let i = 0; i < len - 1; i++) {
    let p1 = arr[i];
    let p2 = arr[i + 1];
    points.push({
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
      fictitious: true, // 这个字段标志是否是虚拟顶点
    });
  }
  points.push({
    x: (arr[len - 1].x + arr[0].x) / 2,
    y: (arr[len - 1].y + arr[0].y) / 2,
    fictitious: true,
  });
  // 插入到顶点数组里
  let newArr = [];
  for (let i = 0; i < pointsArr.length; i++) {
    newArr.push(pointsArr[i]);
    newArr.push(points.shift());
  }
  return newArr;
}

//平面三点定位算法
export function locate(x1, y1, x2, y2, x3, y3) {
  let a, b;
  a = (y2 - y1) / (x2 - x1);
  b = y1 - a * x1;

  let xMiddle = (x1 + x2) / 2;
  let yMiddle = (y1 + y2) / 2;
  let c, lastX, lastY;
  if (a != 0) {
    c = yMiddle - (-1 / a) * xMiddle;
    lastX =
      (Math.pow(x1, 2) +
        Math.pow(y1, 2) -
        Math.pow(x3, 2) -
        Math.pow(y3, 2) -
        2 * c * y1 +
        2 * c * y3) /
      (2 * (x1 - x3 - (1 / a) * (y1 - y3)));
    lastY = (-1 / a) * lastX + c;
  } else {
    lastX = c = xMiddle;
    lastY =
      (Math.pow(x1, 2) +
        Math.pow(y1, 2) -
        Math.pow(x3, 2) -
        Math.pow(y3, 2) +
        2 * lastX * (x3 - x1)) /
      (2 * (y1 - y3));
  }
  console.log('定位点X坐标: ' + lastX);
  console.log('定位点Y坐标: ' + lastY);
  return [lastX, lastY];
}

export function cross(a, b, c) {
  const res = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
  console.log(res > 0 ? '顺时针' : '逆时针');
  return res;
}
//公共鼠标样式
export const MousePointer = new fabric.Circle({
  radius: 6,
  fill: '#1089ff',
  stroke: '#fff',
  strokeWidth: 1,
  selectable: false,
  hasBorders: false,
  hasControls: false,
  evented: true,
  originX: 'center',
  originY: 'center',
});

//虚拟顶点集合方法
export const fictitiousFunc = {
  actionHandler: () => {},
  positionHandler: () => {},
  mouseUpHandler: (eventData, transform) => {
    const target = transform.target;
    const canvas = target.canvas;
    canvas.remove(target);
    canvas.requestRenderAll();
  },
  render: (ctx, left, top, styleOverride, fabricObject) => {
    // const size = this.cornerSize;
    ctx.save();
    ctx.translate(left, top);
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#1791fc';

    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.beginPath();
    ctx.arc(left, top, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  },
};
