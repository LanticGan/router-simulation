### 概述

计网的一个小作业，要求模拟路由器分组转发的过程。

### 技术选用

Node.js + socket.io

### 演示

![](https://github.com/LanticGan/router-simulation/blob/master/preview.gif)

### 原理

利用三个端口模拟三台pc，端口与ip固定映射关系为

| port | ip |
| :------:  | :------: |
| 8080 | 192.168.0.0 |
| 8081 | 192.168.1.0 |
| 8082 | 192.168.2.0 |

### 使用

1. clone & run npm install

2. node server0.js & server1.js & server2.js 

3. 访问127.0.0.1:8080/8081/8082，随意设置路由表即可

