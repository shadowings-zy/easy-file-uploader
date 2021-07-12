export declare enum FILE_UPLOADER_STATUS_CODE {
    SUCCESS = 0,
    FOLDER_EXIST = 1001,
    NOT_FOUND = 1002,
    MD5_CHECK_FAILED = 1003,
    UNKNOWN_ERROR = 5000
}
export declare class Exception extends Error {
    code: FILE_UPLOADER_STATUS_CODE;
    constructor(code: FILE_UPLOADER_STATUS_CODE, message: string);
}
export declare class FolderExistException extends Exception {
    constructor(message: string);
}
export declare class NotFoundException extends Exception {
    constructor(message: string);
}
export declare class Md5Exception extends Exception {
    constructor(message: string);
}
