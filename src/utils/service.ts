import { request } from 'umi';
/**上传文件接口*/
export async function UploadFile(params: any) {
  return request<any>(`/api/FilesUpload/UploadFile`, {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
  });
}
