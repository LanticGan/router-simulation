$(document).ready(function() {
    const socket = io();
    let hostIP;

    // 获取主机ip
    socket.on('setHostIP', function(ip) {
        hostIP = ip;
        $('#ip-label').text(ip);
    })
    // 配置路由表
    $('#save-rt').click(function(e) {
        let routeTable = [];

        for (let i = 1; i <=3; ++i) {

            let distip = $(`#dip-${i}`).val(),
                nexthop = $(`#nh-${i}`).val();
            let tableItem = {
                    distip: distip,
                    nexthop: nexthop
                };
            routeTable.push(tableItem)
            $(`#t-dip-${i}`).text(distip);
            $(`#t-nh-${i}`).text(nexthop);
        }

        socket.emit('setRouteTable', routeTable);
    })

    $('#dataForm').submit(function(e) {
        e.preventDefault();
        let message = {
            srcIP: hostIP,
            distIP: $('#distIp').val(),
            data : $('#postData').val()
        };
        socket.emit('transferMessage', message);
    })

    // 收到来自server的数据
    socket.on('getMessage', function(msg){
        $('#route-des').append($('<p></p').text(msg));
    })

})