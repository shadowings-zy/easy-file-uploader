import * as crypto from 'crypto'
import * as fse from 'fs-extra'
import * as MultiStream from 'multistream'

export interface IFileInfo {
  name: string
  path: string
}

export function wait(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export function calculateMd5(content: Buffer | string): string {
  const hash = crypto.createHash('md5')
  return hash.update(content).digest('hex')
}

export function calculateFileMd5(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5')
    const readStream = fse.createReadStream(path)

    readStream.on('error', (err) => {
      reject(err)
    })

    readStream.on('data', (data) => {
      hash.update(data)
    })

    readStream.on('end', function () {
      const md5 = hash.digest('hex')
      resolve(md5)
    })
  })
}

export async function listDir(path: string): Promise<IFileInfo[]> {
  const items = await fse.readdir(path)
  return Promise.all(
    items
      .filter((item: string) => !item.startsWith('.'))
      .map(async (item: string) => {
        return {
          name: item,
          path: `${path}/${item}`,
        }
      })
  )
}

export async function mergePartFile(files: IFileInfo[], mergedFilePath: string): Promise<void> {
  const fileList = files.map((item) => {
    const [index] = item.name.replace(/\.part$/, '').split('|')
    return {
      index: parseInt(index),
      path: item.path,
    }
  })
  const sortedFileList = fileList.sort((a, b) => {
    return a.index - b.index
  })
  const sortedFilePathList = sortedFileList.map((item) => item.path)
  merge(sortedFilePathList, mergedFilePath)
}

function merge(inputPathList: string[], outputPath: string) {
  const fd = fse.openSync(outputPath, 'w+')
  const writeStream = fse.createWriteStream(outputPath)
  const readStreamList = inputPathList.map((path) => {
    return fse.createReadStream(path)
  })
  return new Promise((resolve, reject) => {
    const multiStream = new MultiStream(readStreamList)
    multiStream.pipe(writeStream)
    multiStream.on('end', () => {
      fse.closeSync(fd)
      resolve(true)
    })
    multiStream.on('error', () => {
      fse.closeSync(fd)
      reject(false)
    })
  })
}
