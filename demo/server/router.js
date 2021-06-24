const KoaRouter = require('koa-router')
const multer = require('@koa/multer')
const path = require('path')
const { FileUploader } = require('file-uploader-server')

const upload = multer()
const router = KoaRouter()

const fileUploader = new FileUploader({
  tempFileLocation: path.join(__dirname, './file/tempUploadFile'),
  mergedFileLocation: path.join(__dirname, './file/mergedUploadFile'),
})

router.post('/api/initUpload', async (ctx, next) => {
  const { name } = ctx.request.body
  const uploadId = await fileUploader.initFilePartUpload(name)
  ctx.body = { uploadId }
  await next()
})

router.post('/api/uploadPart', upload.single('partFile'), async (ctx, next) => {
  const { buffer } = ctx.file
  const { uploadId, partIndex } = ctx.request.body
  const partFileMd5 = await fileUploader.uploadPartFile(uploadId, partIndex, buffer)
  ctx.body = { partFileMd5 }
  await next()
})

router.post('/api/finishUpload', async (ctx, next) => {
  const { uploadId, name, md5 } = ctx.request.body
  const { path: filePathOnServer } = await fileUploader.finishFilePartUpload(uploadId, name, md5)
  const suffix = filePathOnServer.split('/mergedUploadFile/')[1]
  ctx.body = { path: suffix }
  await next()
})

module.exports = router