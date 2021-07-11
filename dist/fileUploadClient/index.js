var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import SparkMD5 from 'spark-md5';
import { getBlobSlice } from './util';
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;
const DEFAULT_OPTIONS = {
    chunkSize: DEFAULT_CHUNK_SIZE,
};
export class FileUploaderClient {
    constructor(options) {
        this.fileUploaderClientOptions = Object.assign(DEFAULT_OPTIONS, options);
    }
    /**
     * 将file对象进行切片，然后根据切片计算md5
     * @param file 要上传的文件
     * @returns 返回md5和切片列表
     */
    getChunkListAndFileMd5(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let currentChunk = 0;
                const chunkSize = this.fileUploaderClientOptions.chunkSize;
                const chunks = Math.ceil(file.size / chunkSize);
                const spark = new SparkMD5.ArrayBuffer();
                const fileReader = new FileReader();
                const blobSlice = getBlobSlice();
                const chunkList = [];
                fileReader.onload = function (e) {
                    var _a;
                    if (((_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.result) instanceof ArrayBuffer) {
                        spark.append(e.target.result);
                    }
                    currentChunk++;
                    if (currentChunk < chunks) {
                        loadNextChunk();
                    }
                    else {
                        const computedHash = spark.end();
                        resolve({ md5: computedHash, chunkList });
                    }
                };
                fileReader.onerror = function (e) {
                    console.warn('read file error', e);
                    reject(e);
                };
                function loadNextChunk() {
                    const start = currentChunk * chunkSize;
                    const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
                    const chunk = blobSlice.call(file, start, end);
                    chunkList.push(chunk);
                    fileReader.readAsArrayBuffer(chunk);
                }
                loadNextChunk();
            });
        });
    }
    /**
     * 上传文件方法，会依次执行getChunkListAndFileMd5、initFilePartUploadFunc、uploadPartFileFunc、finishFilePartUploadFunc，并返回上传结果，若有分片上传失败，则会自动重试
     * @param file 要上传的文件
     * @returns finishFilePartUploadFunc函数Promise resolve的值
     */
    uploadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestOptions = this.fileUploaderClientOptions.requestOptions;
            const { md5, chunkList } = yield this.getChunkListAndFileMd5(file);
            const retryList = [];
            if ((requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.retryTimes) === undefined ||
                !(requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.initFilePartUploadFunc) ||
                !(requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.uploadPartFileFunc) ||
                !(requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.finishFilePartUploadFunc)) {
                throw Error('invalid request options, need retryTimes, initFilePartUploadFunc, uploadPartFileFunc and finishFilePartUploadFunc');
            }
            yield requestOptions.initFilePartUploadFunc();
            for (let index = 0; index < chunkList.length; index++) {
                try {
                    yield requestOptions.uploadPartFileFunc(chunkList[index], index);
                }
                catch (e) {
                    console.warn(`${index} part upload failed`);
                    retryList.push(index);
                }
            }
            for (let retry = 0; retry < requestOptions.retryTimes; retry++) {
                if (retryList.length > 0) {
                    console.log(`retry start, times: ${retry}`);
                    for (let a = 0; a < retryList.length; a++) {
                        const blobIndex = retryList[a];
                        try {
                            yield requestOptions.uploadPartFileFunc(chunkList[blobIndex], blobIndex);
                            retryList.splice(a, 1);
                        }
                        catch (e) {
                            console.warn(`${blobIndex} part retry upload failed, times: ${retry}`);
                        }
                    }
                }
            }
            if (retryList.length === 0) {
                return yield requestOptions.finishFilePartUploadFunc(md5);
            }
            else {
                throw Error(`upload failed, some chunks upload failed: ${JSON.stringify(retryList)}`);
            }
        });
    }
}
