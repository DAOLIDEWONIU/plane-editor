import { WorkareaObject, FabricObjectOption } from '../utils';

export const canvasOption = {
  preserveObjectStacking: true,
  width: 300,
  height: 150,
  selection: true,
  defaultCursor: 'default',
  backgroundColor: '#F2F6FC',
  centeredScaling: true, //对象中心缩放
  devicePixelRatio: true, //高清屏幕
  perPixelTargetFind: true,
  selectionColor: 'rgba(255,255,255,0.4)', //拖曳区块背景顏色
  selectionBorderColor: '#1890FF', //设定拖曳区块边框顏色
  selectionLineWidth: '2', //拖曳区块边框粗度
  // canvas.current.selectionColor = 'rgba(255,255,255,0.4)'; //拖曳区块背景顏色
  // canvas.current.selectionBorderColor = '#1890FF'; //设定拖曳区块边框顏色
  // canvas.current.selectionLineWidth = '2'; //拖曳区块边框粗度
};

export const keyEvent = {
  move: true,
  all: true,
  copy: true,
  paste: true,
  esc: true,
  del: true,
  clipboard: false,
  transaction: true,
  zoom: true,
  cut: true,
};

export const gridOption = {
  enabled: false,
  grid: 10,
  snapToGrid: false,
  lineColor: '#ebebeb',
  borderColor: '#cccccc',
};

export const workareaOption: Partial<WorkareaObject> = {
  width: 900,
  height: 500,
  workareaWidth: 900,
  workareaHeight: 500,
  lockScalingX: true,
  lockScalingY: true,
  scaleX: 1,
  scaleY: 1,
  backgroundColor: '#dfe8f4',
  hasBorders: false,
  hasControls: false,
  selectable: false,
  lockMovementX: true,
  lockMovementY: true,
  hoverCursor: 'default',
  name: '',
  id: 'workarea',
  type: 'image',
  layout: 'fixed', // fixed, responsive, fullscreen
  link: {},
  tooltip: {
    enabled: false,
  },
  isElement: false,
};

export const objectOption: Partial<FabricObjectOption> = {
  rotation: 0,
  centeredRotation: true,
  strokeUniform: true,
};

export const guidelineOption = {
  enabled: true,
};

export const activeSelectionOption = {
  hasControls: true,
};

export const propertiesToInclude = ['id', 'name', 'locked', 'editable', 'mode'];
