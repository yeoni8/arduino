const defaultSpeed = 127;

var five = require("johnny-five");
var board = new five.Board();
var control1,control2, motor;
var currentSpeed = defaultSpeed;
var servo;
var boardIsReady = false;
var loudspeaker;

var motorRunning = false;

board.on("ready", function() {
    boardIsReady = true;
    console.log('Arduino ready');
    control1 = new five.Led(4);
    control2 = new five.Led(2);
    motor = new five.Led(3);
    servo = new five.Led(11);
    loudspeaker = new five.Led(10);


    resetMotor();

});


function resetMotor(keepServoAwake){
    control1.off();
    control2.off();
    board.wait(100, function(){});
    setSpeed(1);
    motorRunning = false;
    if (!keepServoAwake)
        board.wait(400, function(){servo.brightness(0)});    //can let servo rest
}

function forward(){
    resetMotor(true);
    setSpeed(defaultSpeed);
    control1.on();
    motorRunning = true;
}

function backward(){
    resetMotor(true);
    setSpeed(defaultSpeed);
    control2.on();
    motorRunning = true;
}

function setSpeed(speed){
    currentSpeed = speed;
    motor.brightness(speed);
    servo.brightness(speed);
}







//socket
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


http.listen(80, function(){
    console.log('Websocket ready');
});

io.on('connection', function(socket){
    socket.on('data', function(msg){
        executeCommand(msg);
    });
});




function executeCommand(msg){

    loudspeaker.blink();


    if (!boardIsReady)
        return;

    switch (msg){
        case 'forward':
            forward();
            console.log('Forward');
            break;
        case 'backward':
            backward();
            console.log('Backward');
            break;
        case 'stop':
            console.log('Stop');
            resetMotor();
            break;
        case 'speedup':
            if (!motorRunning || currentSpeed > 220)
                break;
            currentSpeed += 6;
            setSpeed(currentSpeed);
            console.log('Speeding up to ' + currentSpeed);
            break;
        case 'speeddown':

            if (!motorRunning || currentSpeed < 70)
                break;
            currentSpeed -= 6;
            setSpeed(currentSpeed);
            console.log('Slowing down to ' + currentSpeed);
            break;
        case 'die':
            resetMotor();
            process.exit();
    }
}