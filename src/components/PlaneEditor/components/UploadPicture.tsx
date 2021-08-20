import { memo } from 'react';
import { ToTopOutlined } from '@ant-design/icons';
import { Button, Upload, message } from 'antd';
import { RcFile } from 'antd/lib/upload/interface';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { awaitWrap } from '@/utils';
import { UploadFile } from '@/utils/service';

interface UploadPictureProps {
  onAdd: (url: string) => void;
}
const UploadPicture = memo(({ onAdd }: UploadPictureProps) => {
  const loading = false;

  const beforeUpload = (file: RcFile, FileList: RcFile[]) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('请选择图片文件上传');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('上传文件大小不能超过2MB');
    }
    return isJpgOrPng && isLt2M;
  };

  const HandleUpload = async (fields: any, options: any) => {
    options.onProgress(0);
    const [err, res] = await awaitWrap(UploadFile(fields));
    if (res) {
      message.success('导入成功');
      // onChange(res);
      options.onProgress(100);
      options.onSuccess(res);
      console.log('qwqw', res?.[0]?.FileName);
      const url = res?.[0]?.FileName;
      if (url) {
        onAdd(url);
      }
    }
    if (err) {
      options.onError();
      message.error(err || '导入失败，请稍后再试');
    }
    // setLoading(false);
  };

  const doImgUpload = async (options: RcCustomRequestOptions) => {
    const { file, filename } = options;
    if (!filename) return;
    let formData = new FormData();
    formData.append(filename, file);
    await HandleUpload(formData, options);
  };

  return (
    <Upload
      name="file"
      showUploadList={false}
      disabled={loading}
      accept="image/jpeg,image/png"
      beforeUpload={beforeUpload}
      customRequest={doImgUpload}
    >
      <Button icon={<ToTopOutlined style={{ fontSize: 18 }} />} type="text">
        导入参考图
      </Button>
    </Upload>
  );
});

export default UploadPicture;
