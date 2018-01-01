const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);

app.use(express.static('public')); 

let hostIP = '192.168.0.0';

let routeTable = [
    {distip: '192.168.0.0', nexthop: '192.168.0.0'},
    {distip: '192.168.1.0', nexthop: '192.168.1.0'},
    {distip: '192.168.2.0', nexthop: '192.168.2.0'},
];

const ipToPort = {
    '192.168.0.0': '8080',
    '192.168.1.0': '8081',
    '192.168.2.0': '8082',
};

app.get('/', function (req, res) {
    res.send('Hello World');
    console.log(routeTable, hostIP);
})

// server间的通信
app.get('/api/transfer-data', function(req, res) {

   let  srcip = req.query.srcip,
        distip = req.query.distip,
        data = req.query.data,
        message = transferData(srcip, distip, data);

    io.emit('getMessage', message);
    res.send(message);
})

io.on('connection', function(socket) {
    console.log('a user connected');

    // 设置主机ip
    io.emit('setHostIP', hostIP);

    // 配置路由表
    socket.on('setRouteTable', function(config) {
        routeTable = config;
    })

    // 进行路由转发 client与server的通信
    socket.on('transferMessage', function(msg) {
        let srcip = msg.srcIP,
            distip = msg.distIP,
            data = msg.data,
            message = transferData(srcip, distip, data);
        io.emit('getMessage', message);
    })

    socket.on('disconnect', function() {
        console.log('user disconnected')    
    })
})

 
server.listen(8080, function () {
    console.log('listening on *:8080');
})


function transferData(srcip, distip, data) {
    io.emit('getMessage', `收到来自主机：${srcip}的数据`);
    io.emit('getMessage', `目的地址：${distip}，数据内容：${data}`);
    io.emit('getMessage', '正在查询路由表...');
    let isDistIpInRouteTable = false,
            nextHop = '',
            message = '';
    // 判断目的地址是否在路由表中，并找到下一跳。
    for (let route of routeTable) {
        if (route.distip == distip) {
            // 用端口號來代替三個主機。
            isDistIpInRouteTable = true;
            nextHop = route.nexthop;
        }
    }
    if (isDistIpInRouteTable) {
        // 如果下一跳是自己
        if (nextHop == hostIP) {
            message = `获得数据：${data}`;
        } else {
            message = `根据路由表，将数据转发给：${nextHop}`;
            let port = ipToPort[nextHop];
            let sentData = `srcip=${srcip}&distip=${distip}&data=${data}`,
                url = `http://127.0.0.1:${port}/api/transfer-data?${sentData}`;
            http.get(url, function(req, res) {
                req.on('end', function() {
                    console.log("响应结束");
                })
            });
        }
    } else {
        message = `路由表中无相关信息，数据包被丢弃`;
    }

    return message;
}