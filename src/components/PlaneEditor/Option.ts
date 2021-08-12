import { fabric } from 'fabric';
import { v4 } from 'uuid';
export const propertiesToInclude = [
  'id',
  'name',
  'locked',
  'file',
  'src',
  'link',
  'tooltip',
  'animation',
  'layout',
  'workareaWidth',
  'workareaHeight',
  'videoLoadType',
  'autoplay',
  'shadow',
  'muted',
  'loop',
  'code',
  'icon',
  'userProperty',
  'trigger',
  'configuration',
  'superType',
  'points',
  'svg',
  'loadType',
];

export const defaultOption = {
  fill: '#f0f0f0',
  stroke: '#8c8c8c',
  strokeUniform: true,
  resource: {},
  link: {
    enabled: false,
    type: 'resource',
    state: 'new',
    dashboard: {},
  },
  tooltip: {
    enabled: true,
    type: 'resource',
    template: '<div>{{message.name}}</div>',
  },
  animation: {
    type: 'none',
    loop: true,
    autoplay: true,
    duration: 1000,
  },
  backgroundColor: '#fff',
  userProperty: {},
  trigger: {
    enabled: false,
    type: 'alarm',
    script: 'return message.value > 0;',
    effect: 'style',
  },
};
export const initValues = {
  selectedItem: null,
  zoomRatio: 1,
  preview: false,
  loading: false,
  progress: 0,
  animations: [],
  styles: [],
  dataSources: [],
  editing: false,
  descriptors: {},
  objects: undefined,
};

export const group = (obj: any) => ({
  id: '',
  name: 'New group',
  type: 'group',
  objects: [...obj],
});

export const rect1 = {
  id: '',
  name: 'New shape',
  // type: 'rect1',
  type: 'labeledRect',
  // label: 'test123123123',
  // stroke: '#7A97CC',
  // strokeWidth: 1,
  // fill: '#E3F1FF',
  // fill: '#a123cb',
  height: 150,
  width: 150,
  lockUniScaling: true,
  text: '武松',
};

//  const id = v4();
export const getRect = () => ({
  id: v4(),
  type: 'group',
  objects: [
    {
      id: v4(),
      name: 'New shape',
      type: 'rect',
      stroke: '#7A97CC',
      strokeWidth: 1,
      fill: '#E3F1FF',
      height: 100,
      width: 200,
    },
  ],
});

export const text = {
  id: '',
  text: '绑定新店',
  type: 'i-text',
  fill: '#333',
  width: 100,
  height: 40,
  // stroke: '#fff',
  strokeWidth: 0.01,
  backgroundColor: 'rgba(255,255,255,.001)',
  textBackgroundColor: 'rgba(255,255,255,.2)',
  fontSize: 16,
  shadow: 'rgba(0,0,0,0.2) 0 0 5px',
  fontStyle: 'normal',
  fontFamily: 'sans-serif',
  evented: false,
  // shadow: '4px 3px 5px #b2b7bf',
  // textShadow: '4px 3px 5px #b2b7bf',
};

export const circle = {
  id: '',
  type: 'group',
  objects: [
    {
      id: v4(),
      name: 'New shape',
      radius: 60,
      type: 'circle',
      stroke: '#7A97CC',
      strokeWidth: 1,
      fill: '#E3F1FF',
      backgroundColor: 'rgba(255,255,255,.1)',
    },
  ],
};
