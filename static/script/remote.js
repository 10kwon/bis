var socket = io();

//send command to specific socket id
function sendCommandToSocketId(socketId, command, cmdName) {
    socket.emit(cmdName, {socketId: socketId, command: command});
}

socket.on('connect', function() {
    sendCommandToSocketId(socket.sessionid, "remote", "deviceTypeRegister");
    sendCommandToSocketId("", "", "listAvailableClient");
  });

socket.on('availableClient', function(data) {
    console.log(data.command);
    document.getElementById("socketId").innerHTML = '<option value="">--Socket을 선택하세요.--</option>'+data.command;
});

socket.on('alert', function(data) {
    alert(data.command);
});
  
function rebootClient(){
    var socketId = document.getElementById("socketId").value;
    sendCommandToSocketId(socketId, "", "reboot");
}

function playDefaultPlaylist(){
    var socketId = document.getElementById("socketId").value;
    sendCommandToSocketId(socketId, "", "playDefaultPlaylist");
}

function playCustomLive(){
    var socketId = document.getElementById("socketId").value;
    var playlistId = document.getElementById("customLiveUrl").value;
    sendCommandToSocketId(socketId, playlistId, "playCustomLive");
}

function sendTextMessage(){
    var socketId = document.getElementById("socketId").value;
    var message = document.getElementById("textMessage").value;
    sendCommandToSocketId(socketId, message, "sendTextMessage");
}