/// <reference types="node" />
export interface IFileInfo {
    name: string;
    path: string;
}
export declare function wait(time: number): Promise<void>;
export declare function calculateMd5(content: Buffer | string): string;
export declare function calculateFileMd5(path: string): Promise<string>;
export declare function listDir(path: string): Promise<IFileInfo[]>;
export declare function mergePartFile(files: IFileInfo[], mergedFilePath: string): Promise<void>;
