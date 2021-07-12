# easy-file-uploader-server
通用文件上传组件server端，提供了开箱即用的server端的接收文件方法。

## server端使用方式

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

## 使用样例

使用样例可以看这个组件：[使用样例链接](https://github.com/shadowings-zy/easy-file-uploader/blob/master/demo/server/router.js)
