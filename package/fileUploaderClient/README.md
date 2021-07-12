# easy-file-uploader-client

通用文件上传组件 client 端，提供了开箱即用的 client 端的上传方法。

## client 端使用方式

使用 npm 或 yarn 安装依赖

```
npm install easy-file-uploader-client
yarn add easy-file-uploader-client
```

在需要实现文件上传的前端组件中实例化`FileUploaderClient`。

`FileUploaderClient`可以接收如下配置项：

```typescript
interface IFileUploaderClientOptions {
  // 文件切片大小
  chunkSize: number;
  // 【可选】请求后台接口配置项，用于发起请求
  requestOptions?: {
    // 分片上传重试次数
    retryTimes: number;
    // 初始化上传请求函数
    initFilePartUploadFunc: () => Promise<any>;
    // 上传分片请求函数
    uploadPartFileFunc: (chunk: Blob, index: number) => Promise<any>;
    // 完成上传请求函数
    finishFilePartUploadFunc: (md5: string) => Promise<any>;
  };
}
```

在实例化`FileUploaderClient`后，可以使用`FileUploaderClient`提供的如下方法：

```typescript
/**
 * 将file对象进行切片，然后根据切片计算md5
 * @param file 要上传的文件
 * @returns 返回md5和切片列表
 */
getChunkListAndFileMd5(file: File): Promise<{
    md5: string;
    chunkList: Blob[];
}>;

/**
 * 上传文件方法，当FileUploaderClient的配置项中传入了requestOptions才能使用
 * 会依次执行getChunkListAndFileMd5、配置项中的initFilePartUploadFunc、配置项中的uploadPartFileFunc、配置项中的finishFilePartUploadFunc
 * 执行完成后返回上传结果，若有分片上传失败，则会自动重试
 * @param file 要上传的文件
 * @returns finishFilePartUploadFunc函数Promise resolve的值
 */
uploadFile(file: File): Promise<any>;
```

如果你觉得`uploadFile`方法不满足你的业务需要，那么可以直接使用`getChunkListAndFileMd5`方法进行切片，然后自己处理上传逻辑。

## 使用样例

使用样例可以看这个组件：[使用样例链接](https://github.com/shadowings-zy/easy-file-uploader/blob/master/demo/client/src/App.tsx)
