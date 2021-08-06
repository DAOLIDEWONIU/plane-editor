import { Spin } from 'antd';

interface FormLoadWarpProps {
  loading: boolean;
  size?: 'small' | 'default' | 'large';
  children: any;
}

const FormLoadWarp = ({
  loading,
  children,
  size = 'default',
}: FormLoadWarpProps) => {
  return (
    <Spin
      delay={200}
      spinning={loading}
      style={{ width: '100%', height: '100%' }}
      wrapperClassName="SpinWarp" size={size}
    >
      {children}
    </Spin>
  );
};

export default FormLoadWarp;
