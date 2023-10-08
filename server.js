// socket.io를 사용한 채팅 구현
const express = require('express');
const app = express();

const port = 8080;
// const server = app.listen(port, function() {
//     console.log('Listening on ' + port);
// });

// Express를 사용하여 Http 서버 생성, Http 서버를 socket.io의 server로 업그레이드함
const server = require('http').createServer(app);

const SocketIO = require('socket.io');
const io = SocketIO(server, {path : '/socket.io'});

// root url 라우트 정의 - localhost:8080으로 서버 접속시 클라이언트에 index.html을 전송
app.get('/', function (req, res) {
    res.sendFile(__dirname, '/index.html');
});

// on 메서드 사용 : 현재 접속되어 있는 클라이언트로부터 메세지 수신하기 위해 사용
// 파라미터 : String(event name), function(이벤트 핸들러. 파라미터 : 클라이언트가 송신한 메세지)
// socket.io 서버에 접속 시 connection 이벤트 발생
// => connection event handler 정의
// => function의 인자로 socket이 들어온다
io.on('connection', function(socket) {
    console.log(socket.id, 'connected...');
    // io.emit() : 접속된 모든 클라이언트에게 메시지 전송
    // io.emit('msg', `${socket.id} has entered the chatroom.`);

    // socket.on('event_name', function(data))
    // 접속한 클라이언트의 정보가 수신되면
    socket.on('login', function (data) {
        console.log('Client logged-in:\n name : ' + data.name + '\n userid : ' + data.userid);

        // socket에 클라이언트 정보 저장
        socket.name = data.name;
        socket.userid = data.userid;

        // 접속된 모든 클라이언트에게 메세지를 전송
        io.emit('login', data.name);
    });

    // 클라이언트로부터 메세지가 수신되면
    socket.on('chat', function (data) {
        console.log(socket.name, ' : ', data.msg);

        var msg = {
            from: {
                name: socket.name,
                userid: socket.userid
            },
            msg: data.msg
        };

        // 메세지를 전송한 클라이언트 제외, 모든 클라이언트에게 메세지 전송
        socket.broadcast.emit('chat', msg);

        // 메세지를 전송한 클라이언트에게만 메세지를 전송할 때
        // socket.emit('s2c chat', msg);

        // 접속한 모든 클라이언트에게 메세지 전송할 때
        // io.emit('s2c chat', msg);

        // 특정 클라이언트에게만 메세지를 전송함. (id : socket 객체의 id 속성)
        // io.to(id).emit('s2c chat', data);

    });

    // 분리 이유는 모르겠으나 연결이 끝났을 때
    socket.on('forceDisconnect', function () {
        socket.disconnect();
    });

    // user connection lost
    socket.on('disconnect', function(data) {
        io.emit('msg', '${socket.id}' + socket.name + ' has left the chatroom.');
    });
});

server.listen(port, function() {
   console.log('socket IO server listening on port 3000');
});