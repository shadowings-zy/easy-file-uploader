import * as path from 'path'
import * as fse from 'fs-extra'
import { FileUploader } from '../src/fileUploaderServer/src/index'
import { calculateFileMd5 } from '../src/fileUploaderServer/src/util'

const FILE_PATH = path.join(__dirname, './test.png') // you can change the filePath by yourself
const FILE_NAME = 'test.png'

const uploadFileBuffer = fse.readFileSync(FILE_PATH)
const uploadPart: any = []
const partNumber = 10
const uploadPartSize = Math.ceil(uploadFileBuffer.length / partNumber)
for (let a = 0; a < partNumber; a++) {
  let subItem
  if (a * uploadPartSize + uploadPartSize < uploadFileBuffer.length) {
    subItem = uploadFileBuffer.subarray(a * uploadPartSize, (a + 1) * uploadPartSize)
  } else {
    subItem = uploadFileBuffer.subarray(a * uploadPartSize, uploadFileBuffer.length)
  }
  uploadPart.push(subItem)
}

test('upload', async () => {
  const fileMd5 = await calculateFileMd5(FILE_PATH)
  const fileUploader = new FileUploader({
    tempFileLocation: path.join(__dirname, './tempUploadFile'),
    mergedFileLocation: path.join(__dirname, './mergedUploadFile'),
  })
  const uploadId = await fileUploader.initFilePartUpload('test.png')
  expect(uploadId.length).toBe(32)

  for (let a = 0; a < uploadPart.length; a++) {
    await fileUploader.uploadPartFile(uploadId, a, uploadPart[a])
  }
  const fileList = await fileUploader.listUploadedPartFile(uploadId)
  expect(fileList.length).toBe(partNumber)

  const { md5 } = await fileUploader.finishFilePartUpload(uploadId, 'test.png', fileMd5)
  expect(md5).toBe(fileMd5)
})
