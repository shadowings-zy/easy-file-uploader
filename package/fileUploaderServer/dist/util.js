"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergePartFile = exports.listDir = exports.calculateFileMd5 = exports.calculateMd5 = exports.wait = void 0;
const crypto = require("crypto");
const fse = require("fs-extra");
const MultiStream = require("multistream");
const path = require("path");
function wait(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
exports.wait = wait;
function calculateMd5(content) {
    const hash = crypto.createHash('md5');
    return hash.update(content).digest('hex');
}
exports.calculateMd5 = calculateMd5;
function calculateFileMd5(path) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const readStream = fse.createReadStream(path);
        readStream.on('error', (err) => {
            reject(err);
        });
        readStream.on('data', (data) => {
            hash.update(data);
        });
        readStream.on('end', function () {
            const md5 = hash.digest('hex');
            resolve(md5);
        });
    });
}
exports.calculateFileMd5 = calculateFileMd5;
async function listDir(dirPath) {
    const items = await fse.readdir(dirPath);
    return Promise.all(items
        .filter((item) => !item.startsWith('.'))
        .map(async (item) => {
        return {
            name: item,
            path: path.join(dirPath, item),
        };
    }));
}
exports.listDir = listDir;
async function mergePartFile(files, mergedFilePath, fileSpliter) {
    const fileList = files.map((item) => {
        const [index] = item.name.replace(/\.part$/, '').split(fileSpliter);
        return {
            index: parseInt(index),
            path: item.path,
        };
    });
    const sortedFileList = fileList.sort((a, b) => {
        return a.index - b.index;
    });
    const sortedFilePathList = sortedFileList.map((item) => item.path);
    merge(sortedFilePathList, mergedFilePath);
}
exports.mergePartFile = mergePartFile;
function merge(inputPathList, outputPath) {
    const fd = fse.openSync(outputPath, 'w+');
    const writeStream = fse.createWriteStream(outputPath);
    const readStreamList = inputPathList.map((path) => {
        return fse.createReadStream(path);
    });
    return new Promise((resolve, reject) => {
        const multiStream = new MultiStream(readStreamList);
        multiStream.pipe(writeStream);
        multiStream.on('end', () => {
            fse.closeSync(fd);
            resolve(true);
        });
        multiStream.on('error', () => {
            fse.closeSync(fd);
            reject(false);
        });
    });
}
