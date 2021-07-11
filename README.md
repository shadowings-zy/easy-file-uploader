# easy-file-uploader
简单易用的通用文件上传组件，包含client端和server端两部分，提供了开箱即用的client端的上传方法和server端的接收文件方法。

## client端使用方式

## server端使用方式

## contribute guide
本项目是使用yarn workspace组织的monorepo。

项目分为如下目录：

| 目录 | 说明 |
| ---- | ---- |
| src/fileUploaderClient | 文件分片上传组件客户端 |
| src/fileUploaderServer | 文件分片上传组件服务端 |
| test | 文件分片上传组件测试用例 |
| dist | 文件分片上传组件打包产物 |
| demo/client | 前端使用样例 |
| demo/server | 后端使用样例 |

使用`build:all`命令可以打包fileUploaderClient和fileUploaderServer。
使用`test:unit`命令可以使用jest进行单元测试。
使用`demo:run`命令可以启动demo目录下的使用样例。
