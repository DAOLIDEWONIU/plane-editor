import { createContext, memo } from 'react';

import {
  Input as AntdInput,
  FormItem,
  FormLayout,
  PreviewText,
  Form,
} from '@formily/antd';
import { createForm, onFieldInputValueChange } from '@formily/core';
import { Field, mapReadPretty, connect } from '@formily/react';
import styles from '../index.less';

interface MapAttrProps {
  canvasRef: any;
  selectedItem: any;
}

const Input = connect(
  AntdInput,
  mapReadPretty(PreviewText.Input, { className: 'custom-preview' }),
);

const MapAttr = memo(({ canvasRef, selectedItem }: MapAttrProps) => {
  if (!selectedItem) {
    return (
      <div style={{ padding: '12px 16px' }}>
        <p style={{ textAlign: 'center', lineHeight: '30px' }}>
          选择元素后，可在这里查看或者修改元素属性
        </p>
      </div>
    );
  }

  const id = selectedItem.get('id');
  const name = selectedItem.get('name');
  const left = selectedItem.get('left');
  const top = selectedItem.get('top');
  const label = selectedItem.get('label');

  const form = createForm({
    initialValues: {
      id,
      name,
      left,
      top,
      label,
    },
    effects: () => {
      onFieldInputValueChange('label', ({ value }) => {
        const childId = selectedItem.get('childId');
        canvasRef.handler.setById(id, 'label', value);
        canvasRef.handler.setById(childId, 'text', value);
      });
    },
  });

  return (
    <div className={styles.mapAttr}>
      <Form form={form} previewTextPlaceholder="暂无数据">
        <PreviewText.Placeholder value="暂无数据">
          <FormLayout
            labelWidth={80}
            labelAlign="left"
            wrapperAlign="right"
            style={{ marginBottom: 30 }}
            // layout="vertical"
          >
            <Field
              name="id"
              title="ID"
              decorator={[
                FormItem,
                {
                  colon: false,
                  style: { marginBottom: 10 },
                  wrapperWidth: 180,
                },
              ]}
              component={[Input]}
              editable={false}
            />
            <Field
              name="name"
              title="图形"
              decorator={[
                FormItem,
                { colon: false, style: { marginBottom: 10 } },
              ]}
              component={[Input]}
              editable={false}
            />
            <FormLayout wrapperAlign="right" layout="vertical" wrapperCol={24}>
              <Field
                name="label"
                title="标注名称"
                decorator={[
                  FormItem,
                  {
                    colon: false,
                    style: { marginBottom: 10 },
                    wrapperStyle: { width: '100%', marginTop: 6 },
                  },
                ]}
                component={[Input, { placeholder: '请输入' }]}
              />
            </FormLayout>
            <Field
              name="left"
              title="坐标X"
              decorator={[
                FormItem,
                { colon: false, style: { marginBottom: 10 } },
              ]}
              component={[Input]}
              editable={false}
            />
            <Field
              name="top"
              title="坐标Y"
              decorator={[
                FormItem,
                { colon: false, style: { marginBottom: 10 } },
              ]}
              component={[Input, { style: { width: '100%' } }]}
              editable={false}
            />
          </FormLayout>
        </PreviewText.Placeholder>
      </Form>
    </div>
  );
});

export default MapAttr;
