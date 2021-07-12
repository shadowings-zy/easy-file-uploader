# easy-file-uploader

简单易用的通用文件上传组件，包含 client 端和 server 端两部分，提供了开箱即用的 client 端的上传方法和 server 端的接收文件方法。

## 1、client 端使用方式

### 1-1、使用

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

### 1-2、例子

使用样例可以看这个组件：[使用样例链接](https://github.com/shadowings-zy/easy-file-uploader/blob/master/demo/client/src/App.tsx)

## 2、server 端使用方式

### 2-1、使用

使用 npm 或 yarn 安装依赖

```
npm install easy-file-uploader-server
yarn add easy-file-uploader-server
```

在需要实现文件上传的后端逻辑中实例化`FileUploaderServer`。

`FileUploaderServer`可以接收如下配置项：

```typescript
interface IFileUploaderOptions {
  tempFileLocation: string; // 储存文件切片的路径
  mergedFileLocation: string; // 储存合并后文件的路径
}
```

在实例化`FileUploaderServer`后，可以使用`FileUploaderServer`提供的如下方法：

```typescript
/**
 * 获取配置项
 */
getOptions(): IFileUploaderOptions;

/**
 * 初始化文件分片上传，实际上就是根据fileName和时间计算一个md5，并新建一个文件夹
 * @param fileName 文件名
 * @returns 上传Id
 */
initFilePartUpload(fileName: string): Promise<string>;

/**
 * 上传分片，实际上是将partFile写入uploadId对应的文件夹中，写入的文件命名格式为`partIndex|md5`
 * @param uploadId 上传Id
 * @param partIndex 分片序号
 * @param partFile 分片内容
 * @returns 分片md5
 */
uploadPartFile(uploadId: string, partIndex: number, partFile: Buffer): Promise<string>;

/**
 * 获取已上传的分片信息，实际上就是读取这个文件夹下面的内容
 * @param uploadId 上传Id
 * @returns 已上传的分片信息
 */
listUploadedPartFile(uploadId: string): Promise<IUploadPartInfo[]>;

/**
 * 取消文件上传，硬删除会直接删除文件夹，软删除会给文件夹改个名字
 * @param uploadId 上传Id
 * @param deleteFolder 是否直接删除文件夹
 */
cancelFilePartUpload(uploadId: string, deleteFolder?: boolean): Promise<void>;

/**
 * 完成分片上传，实际上就是将所有分片都读到一起，然后进行md5检查，最后存到一个新的路径下。
 * @param uploadId 上传Id
 * @param fileName 文件名
 * @param md5 文件md5
 * @returns 文件存储路径
 */
finishFilePartUpload(uploadId: string, fileName: string, md5: string): Promise<IMergedFileInfo>;
```

### 2-2、例子

使用样例可以看这个组件：[使用样例链接](https://github.com/shadowings-zy/easy-file-uploader/blob/master/demo/server/router.js)

## 3、contribute guide

本项目是使用 yarn workspace 组织的 monorepo。

项目分为如下目录：

| 目录                   | 说明                     |
| ---------------------- | ------------------------ |
| src/fileUploaderClient | 文件分片上传组件客户端   |
| src/fileUploaderServer | 文件分片上传组件服务端   |
| test                   | 文件分片上传组件测试用例 |
| dist                   | 文件分片上传组件打包产物 |
| demo/client            | 前端使用样例             |
| demo/server            | 后端使用样例             |

使用`build:all`命令可以打包 fileUploaderClient 和 fileUploaderServer。
使用`test:unit`命令可以使用 jest 进行单元测试。
使用`demo:run`命令可以启动 demo 目录下的使用样例。
