import { useRef, useState } from 'react'
import './App.css'
import axios from 'axios'
import { FileUploaderClient } from 'file-uploader-client'
// import { FileUploaderClient } from 'easy-file-uploader-client' //or you can use easy-file-uploader-client on npm


const HOST = 'http://localhost:10001/'

function App() {
  const fileInput = useRef(null)
  const [url, setUrl] = useState<string>('')
  let uploadId = ''

  const fileUploaderClient = new FileUploaderClient({
    chunkSize: 2 * 1024 * 1024, // 2MB
    requestOptions: {
      retryTimes: 2,
      initFilePartUploadFunc: async () => {
        const fileName = (fileInput.current as any).files[0].name
        const { data } = await axios.post(`${HOST}api/initUpload`, {
          name: fileName,
        })
        uploadId = data.uploadId
        console.log('初始化上传完成')
        setUrl('')
      },
      uploadPartFileFunc: async (chunk: Blob, index: number) => {
        const formData = new FormData()
        formData.append('uploadId', uploadId)
        formData.append('partIndex', index.toString())
        formData.append('partFile', chunk)

        await axios.post(`${HOST}api/uploadPart`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        console.log(`上传分片${index}完成`)
      },
      finishFilePartUploadFunc: async (md5: string) => {
        const fileName = (fileInput.current as any).files[0].name
        const { data } = await axios.post(`${HOST}api/finishUpload`, {
          name: fileName,
          uploadId,
          md5,
        })
        console.log(`上传完成，存储地址为：${HOST}${data.path}`)
        setUrl(`${HOST}${data.path}`)
      },
    },
  })

  const upload = () => {
    if (fileInput.current) {
      fileUploaderClient.uploadFile((fileInput.current as any).files[0])
    }
  }

  return (
    <div className="App">
      <h1>easy-file-uploader-demo</h1>
      <h3>选择文件后点击“上传文件”按钮即可</h3>
      <div className="App">
        <input type="file" name="file" ref={fileInput} />
        <input type="button" value="上传文件" onClick={upload} />
      </div>
      {url && <h3>{`文件地址：${url}`}</h3>}
    </div>
  )
}

export default App
