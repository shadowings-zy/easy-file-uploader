export interface IFileUploaderClientOptions {
    chunkSize: number;
    requestOptions?: {
        retryTimes: number;
        initFilePartUploadFunc: () => Promise<any>;
        uploadPartFileFunc: (chunk: Blob, index: number) => Promise<any>;
        finishFilePartUploadFunc: (md5: string) => Promise<any>;
    };
}
export declare class FileUploaderClient {
    fileUploaderClientOptions: IFileUploaderClientOptions;
    constructor(options: IFileUploaderClientOptions);
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
}
