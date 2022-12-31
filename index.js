const express = require('express')
const app = express()
const port = 3000
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

var connectedDevices = [];

app.use(express.static('static'))

app.get('/', (req, res) => {
   res.redirect('/bis.html')
})


function validateSocketClient(socketId, type){
    var result = false;
    connectedDevices.forEach(function(busList){
        if (type !== undefined || type !== null){
            if (busList.socketId == socketId){
                result = true;
            }
        }
        else{
            if (busList.socketId == socketId && busList.deviceType == type){
                result = true;
            }
        }
        
    });
    return result;
}

function refreshAvailableLED(){
    var remotes = "";
        connectedDevices.forEach(function(busList){
            if (busList.deviceType == "led"){
                remotes = remotes + '<option value="' + busList.socketId + '">' + busList.socketId + '</option>';
            }
        });
        
        io.sockets.emit('availableClient', {socketId: "", command: remotes});
}

io.on('connection', (socket) => {
    
    console.log(`Client is connected (${socket.id})`);

    socket.on('disconnect', () => {
        console.log(`Client is detached (${socket.id}) - Reason: ${socket.reason}`);
        //if disconnected, delete from available socket list
        connectedDevices.forEach(function(busList, index){
            if (busList.socketId == socket.id){
                connectedDevices.splice(index, 1);
            }
        });
        refreshAvailableLED();
    });

    socket.on('deviceTypeRegister', (data) => {
        if (data.command == "led"){
            console.log(`Client LED (${socket.id}) is registered`);
        }
        else if (data.command == "remote"){
            console.log(`Client Remote (${socket.id}) is registered`);
        }
        //add socket id and type to array
        connectedDevices.push({socketId: socket.id, deviceType: data.command});
    });
    socket.on('listAvailableClient', (data) => {
        console.log(`Client Remote (${socket.id}) requested for available socket`);
        refreshAvailableLED();
        console.log(`Emmiting availableClient to Client Remote (${socket.id})`);
    });

    socket.on('reboot', (data) => {
        console.log(`Client Remote (${socket.id}) requested for rebooting Client LED (${data.socketId})`);
        if (validateSocketClient(data.socketId, "led")){
            console.log(`Rebooting Client LED (${data.socketId})`);
            io.to(data.socketId).emit('clientReboot', {socketId: data.socketId, command: ""});
        }
        else{
            console.log(`Client LED (${data.socketId}) is not available`);
            io.to(socket.id).emit('alert', {socketId: socket.id, command: "Client LED (" + data.socketId + ") is not available"});
        }
    });

    socket.on('playDefaultPlaylist', (data) => {
        console.log(`Client Remote (${socket.id}) requested for playing default playlist Client LED (${data.socketId})`);
        if (validateSocketClient(data.socketId, "led")){
            console.log(`Playing default playlist on (${data.socketId})`);
            io.to(data.socketId).emit('clientDF', {socketId: data.socketId, command: ""});
        }
        else{
            console.log(`Client LED (${data.socketId}) is not available`);
            io.to(socket.id).emit('alert', {socketId: socket.id, command: "Client LED (" + data.socketId + ") is not available"});
        }
    });

    socket.on('playCustomLive', (data) => {
        console.log(`Client Remote (${socket.id}) requested for playing custom live Client LED (${data.socketId})`);
        if (validateSocketClient(data.socketId, "led")){
            console.log(`Playing custom live on (${data.socketId})`);
            io.to(data.socketId).emit('clientCL', {socketId: data.socketId, command: data.command});
        }
        else{
            console.log(`Client LED (${data.socketId}) is not available`);
            io.to(socket.id).emit('alert', {socketId: socket.id, command: "Client LED (" + data.socketId + ") is not available"});
        }
    });
    
        });

server.listen(port, () => {
  console.log(`BIS is available at localhost:${port}`)
})