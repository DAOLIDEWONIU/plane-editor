import { forwardRef } from 'react';
import Canvas from './Canvas';

const RefCanvas = forwardRef<any, any>((props, ref) => (
  <Canvas {...props} myRef={ref} />
));

export default RefCanvas;
