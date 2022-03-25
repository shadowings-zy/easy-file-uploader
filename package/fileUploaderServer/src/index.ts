import * as path from 'path';
import * as fse from 'fs-extra';
import {
  calculateFileMd5,
  calculateMd5,
  IFileInfo,
  listDir,
  mergePartFile,
  wait,
} from './util';
import {
  FolderExistException,
  Md5Exception,
  NotFoundException,
} from './exception';

const DEAFULT_TEMP_FILE_LOCATION = path.join(__dirname, './upload_file');
const DEAFULT_MERGED_FILE_LOCATION = path.join(__dirname, './merged_file');
const DEFAULT_OPTIONS = {
  tempFileLocation: DEAFULT_TEMP_FILE_LOCATION,
  mergedFileLocation: DEAFULT_MERGED_FILE_LOCATION,
};

export interface IFileUploaderOptions {
  tempFileLocation: string;
  mergedFileLocation: string;
}

export interface IUploadPartInfo {
  path: string;
  index: number;
  md5: string;
}

export interface IMergedFileInfo {
  path: string;
  md5: string;
}

export class FileUploaderServer {
  private fileSpliter: string = '_SPLIT_';
  private fileUploaderOptions: IFileUploaderOptions;

  constructor(options: IFileUploaderOptions) {
    this.fileUploaderOptions = Object.assign(DEFAULT_OPTIONS, options);
  }

  public getOptions() {
    return this.fileUploaderOptions;
  }

  /**
   * 初始化文件分片上传，实际上就是根据fileName和时间计算一个md5，并新建一个文件夹
   * @param fileName 文件名
   * @returns 上传Id
   */
  public async initFilePartUpload(fileName: string): Promise<string> {
    const { tempFileLocation } = this.fileUploaderOptions;
    await fse.ensureDir(tempFileLocation);
    const uploadId = calculateMd5(`${fileName}-${Date.now()}`);
    const uploadFolderPath = path.join(tempFileLocation, uploadId);
    const uploadFolderExist = fse.existsSync(uploadFolderPath);
    if (uploadFolderExist) {
      throw new FolderExistException(
        'found same upload folder, maybe you meet hash collision',
      );
    }
    await fse.mkdir(uploadFolderPath);
    return uploadId;
  }

  /**
   * 上传分片，实际上是将partFile写入uploadId对应的文件夹中，写入的文件命名格式为`partIndex${this.fileSpliter}md5`
   * @param uploadId 上传Id
   * @param partIndex 分片序号
   * @param partFile 分片内容
   * @returns 分片md5
   */
  public async uploadPartFile(
    uploadId: string,
    partIndex: number,
    partFile: Buffer,
  ): Promise<string> {
    const uploadFolderPath = await this.getUploadFolder(uploadId);
    const partFileMd5 = calculateMd5(partFile);
    const partFileLocation = path.join(
      uploadFolderPath,
      `${partIndex}${this.fileSpliter}${partFileMd5}.part`,
    );
    await fse.writeFile(partFileLocation, partFile);
    return partFileMd5;
  }

  /**
   * 获取已上传的分片信息，实际上就是读取这个文件夹下面的内容
   * @param uploadId 上传Id
   * @returns 已上传的分片信息
   */
  public async listUploadedPartFile(
    uploadId: string,
  ): Promise<IUploadPartInfo[]> {
    const uploadFolderPath = await this.getUploadFolder(uploadId);
    const dirList = await listDir(uploadFolderPath);
    const uploadPartInfo = dirList.map((item: IFileInfo) => {
      const [index, md5] = item.name
        .replace(/\.part$/, '')
        .split(this.fileSpliter);
      return {
        path: item.path,
        index: parseInt(index),
        md5,
      };
    });
    return uploadPartInfo;
  }

  /**
   * 取消文件上传，硬删除会直接删除文件夹，软删除会给文件夹改个名字
   * @param uploadId 上传Id
   * @param deleteFolder 是否直接删除文件夹
   */
  async cancelFilePartUpload(
    uploadId: string,
    deleteFolder: boolean = false,
  ): Promise<void> {
    const uploadFolderPath = await this.getUploadFolder(uploadId);
    if (deleteFolder) {
      await fse.remove(uploadFolderPath);
    } else {
      await fse.rename(uploadFolderPath, `${uploadFolderPath}[removed]`);
    }
  }

  /**
   * 完成分片上传，实际上就是将所有分片都读到一起，然后进行md5检查，最后存到一个新的路径下。
   * @param uploadId 上传Id
   * @param fileName 文件名
   * @param md5 文件md5
   * @returns 文件存储路径
   */
  async finishFilePartUpload(
    uploadId: string,
    fileName: string,
    md5: string,
  ): Promise<IMergedFileInfo> {
    const { mergedFileLocation } = this.fileUploaderOptions;
    await fse.ensureDir(mergedFileLocation);
    const uploadFolderPath = await this.getUploadFolder(uploadId);
    const dirList = await listDir(uploadFolderPath);
    const files = dirList.filter((item) => item.path.endsWith('.part'));
    const mergedFileDirLocation = path.join(mergedFileLocation, md5);
    await fse.ensureDir(mergedFileDirLocation);
    const mergedFilePath = path.join(mergedFileDirLocation, fileName);
    await mergePartFile(files, mergedFilePath, this.fileSpliter);
    await wait(1000); // 要等待一段时间，否则在计算md5时会读取到空文件
    const mergedFileMd5 = await calculateFileMd5(mergedFilePath);
    if (mergedFileMd5 !== md5) {
      throw new Md5Exception('md5 checked failed');
    }
    return {
      path: mergedFilePath,
      md5,
    };
  }

  /**
   * 获取上传文件夹的路径
   * @param uploadId 上传Id
   * @returns 文件夹路径
   */
  private async getUploadFolder(uploadId: string): Promise<string> {
    const { tempFileLocation } = this.fileUploaderOptions;
    await fse.ensureDir(tempFileLocation);
    const uploadFolderPath = path.join(tempFileLocation, uploadId);
    const uploadFolderExist = fse.existsSync(uploadFolderPath);
    if (!uploadFolderExist) {
      throw new NotFoundException('not found upload folder');
    }
    return uploadFolderPath;
  }
}
