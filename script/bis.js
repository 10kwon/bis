var LED = document.getElementById("led");
var LEDScreen = LED.getElementsByClassName("ledScreen")[0];

var busList = LEDScreen.getElementsByClassName("busList")[0];
var notice = LEDScreen.getElementsByClassName("busNotice")[0];

var rbox = LEDScreen.getElementsByClassName("recentArrival")[0];

var arrival = rbox.getElementsByClassName("arrivalScroll")[0];
var arrivalList = arrival.getElementsByClassName("arrivalScrollBus")[0];
var currentTime = rbox.getElementsByClassName("currentTime")[0];

var informationFetching = true;
var BISApiKey = "HQEmzB%2BE4tD6RqzgNk4MdNZWflx867TRSnKvWHywsBRqofUZHOhWJdCuZmnLqvwrnRgEdqKYVdQV4Sd8HjXJvA%3D%3D";
var APIResult = "";

busList.style.display = "none";
notice.style.display = "none";
arrival.style.display = "none";

function getCurrentTimeAndDate(type){
    var now = new Date();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    
    var minute = now.getMinutes();
    if (minute < 10) minute = "0" + minute;

    if(type == "dt") return month + "월 " + date + "일 " + hour + "시 " + minute + "분 ";
    else if(type == "t") return hour + ":" + minute;
}

function clock(){
    currentTime.innerHTML = "현재시각 "+getCurrentTimeAndDate("t");
    setTimeout("clock()", 1000);
}

function showNotice(text, hideBusList = true) {
    if (hideBusList){
    busList.style.display = "none";
    arrival.style.display = "none";
    notice.style.display = "block";
}
else{
    busList.style.display = "";
    arrival.style.display = "";
    notice.style.display = "none";
}
    
    notice.innerHTML = text;
}

function Notice(){
    if (!informationFetching){
        showNotice("버스와 철도를 연결하는 우리는<br>(주)한인승 자회사<br><span style='color:var(--ledCyan);'>신아승합</span>입니다!", false);
    }
}

function voiceArrival(number){
    // play after audio end
    var audio = new Audio();
    function playNext() { 
        if (audioPointer <audioArray.length) { 
          audio = new Audio(audioArray[audioPointer]); 
          audio.addEventListener("ended", playNext); 
          audio.play(); 
          console.log(`playing ${audioArray[audioPointer]}`); 
          audioPointer += 1; 
        } else { 
          console.log("finished"); 
        } 
      } 
             
      function onStart() { 
        if (audio) { 
          audio.pause(); 
        } 
        audioPointer = 0; 
        playNext(); 

      } 
    
    //for each in number array, add to audioArray
    var audioArray = [];
    var localBus = ["강남", "강서", "관악", "구로", "노원", "양천", "영등포"];

    audioArray.push("audio/arrival_1.mp3");

    for (var i = 0; i < number.length; i++){
        //add individual number into array
        for (var e = 0; e < number[i].length; e++){
            t = number[i].length - 1;

            if (localBus.includes(number[i][e] + number[i][e+1])){
                audioArray.push("audio/"+number[i][e]+number[i][e+1]+".mp3");
                e = e+2;
            }
            else if (localBus.includes(number[i][e] + number[i][e+1] + number[i][e+2])){
                audioArray.push("audio/"+number[i][e]+number[i][e+1]+".mp3");
                e = e+3;
            }

            if (number[i][e] !== "0" && number[i][e] !== "1"){
                audioArray.push("audio/"+number[i][e]+".mp3");
            }
            else if (number[i][e] == 1 && e == t){
                audioArray.push("audio/"+number[i][e]+".mp3");
            }

            if (number[i].length == 4 && e == 0){
                if (number[i][e] == "0"){
                    audioArray.push("audio/0.mp3");
                }
                else{
                    audioArray.push("audio/1000.mp3");
                }
            
            }
            else if (number[i].length == 4 && e == 1){
                if (number[i][e] == "0"){
                    audioArray.push("audio/0.mp3");
                }
                else{
                    audioArray.push("audio/100.mp3");
                }
            }
            else if (number[i].length == 3 && e == 0){
                if (number[i][e] == "0"){
                    audioArray.push("audio/0.mp3");
                }
                else{
                    audioArray.push("audio/100.mp3");
                }
            }
            else if (number[i].length == 4 && e == 2){
                if (number[i][e] == "0"){
                    audioArray.push("audio/0.mp3");
                }
                else{
                    audioArray.push("audio/10.mp3");
                }
            }
            else if (number[i].length == 3 && e == 1){
                if (number[i][e] == "0"){
                    audioArray.push("audio/0.mp3");
                }
                else{
                    audioArray.push("audio/10.mp3");
                }
            }
            else if (number[i].length == 2 && e == 0){
                if (number[i][e] == "0"){
                    audioArray.push("audio/0.mp3");
                }
                else{
                    audioArray.push("audio/10.mp3");
                }
            }
        }

        if (number[i - 1] !== number.length){
            audioArray.push("audio/num.mp3");
        }
    }

    audioArray.push("audio/arrival_2.mp3");

    onStart();
}

function ajaxFromUrl(url, parameterArray, valueArray){
    var xhr = new XMLHttpRequest();
    
var queryParams = '?' + encodeURIComponent('serviceKey') + '='+BISApiKey; /*Service Key*/
for (var i = 0; i < parameterArray.length; i++){
    var parameter = parameterArray[i];
    var value = valueArray[i];
    queryParams += '&' + encodeURIComponent(parameter) + '=' + encodeURIComponent(value);
}

xhr.open('GET', 'https://proxy.cors.sh/'+url + queryParams);
xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
        //return value from first stNm
        var xml = this.responseXML;
        //make xml to json
        var x2js = new X2JS();
        var json = x2js.xml2js(xml);
        
        APIResult = xml;
    }
    else{
        var xml = this.responseXML;
        
        var x2js = new X2JS();
        var json = x2js.xml2js(xml);
        
        APIResult = xml;
    }
};

xhr.send('');
}
function getBusInfobyName(){
    ajaxFromUrl('http://ws.bus.go.kr/api/rest/stationinfo/getStationByName', ['stSrch'], [document.getElementById("busStopName").value])
    
}

//run Notice function every 5 seconds
clock();
showNotice("정보 수신 중입니다<br>기다려주세요", true);
//showNotice('<br><img width="14" height="14" style="display: inline;" src="images/seoulmetro.png">서울교통공사', true);
//showNotice('<img src="images/seoul_slogan.png">', true);
showNotice('<img width="14" height="14" style="display: inline;" src="images/seoulmetro.png">서울교통공사 | 우리역 첫/막차<br>첫차 <span style="color:var(--ledCyan);">05:30</span><br>막차 <span style="color:var(--ledCyan);">01:13</span>', true);