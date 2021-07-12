"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Md5Exception = exports.NotFoundException = exports.FolderExistException = exports.Exception = exports.FILE_UPLOADER_STATUS_CODE = void 0;
var FILE_UPLOADER_STATUS_CODE;
(function (FILE_UPLOADER_STATUS_CODE) {
    FILE_UPLOADER_STATUS_CODE[FILE_UPLOADER_STATUS_CODE["SUCCESS"] = 0] = "SUCCESS";
    FILE_UPLOADER_STATUS_CODE[FILE_UPLOADER_STATUS_CODE["FOLDER_EXIST"] = 1001] = "FOLDER_EXIST";
    FILE_UPLOADER_STATUS_CODE[FILE_UPLOADER_STATUS_CODE["NOT_FOUND"] = 1002] = "NOT_FOUND";
    FILE_UPLOADER_STATUS_CODE[FILE_UPLOADER_STATUS_CODE["MD5_CHECK_FAILED"] = 1003] = "MD5_CHECK_FAILED";
    FILE_UPLOADER_STATUS_CODE[FILE_UPLOADER_STATUS_CODE["UNKNOWN_ERROR"] = 5000] = "UNKNOWN_ERROR";
})(FILE_UPLOADER_STATUS_CODE = exports.FILE_UPLOADER_STATUS_CODE || (exports.FILE_UPLOADER_STATUS_CODE = {}));
class Exception extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}
exports.Exception = Exception;
class FolderExistException extends Exception {
    constructor(message) {
        super(FILE_UPLOADER_STATUS_CODE.FOLDER_EXIST, message);
    }
}
exports.FolderExistException = FolderExistException;
class NotFoundException extends Exception {
    constructor(message) {
        super(FILE_UPLOADER_STATUS_CODE.NOT_FOUND, message);
    }
}
exports.NotFoundException = NotFoundException;
class Md5Exception extends Exception {
    constructor(message) {
        super(FILE_UPLOADER_STATUS_CODE.MD5_CHECK_FAILED, message);
    }
}
exports.Md5Exception = Md5Exception;
