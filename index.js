var express = require('express');
var ev3dev = require('ev3dev');
var app = express();

//Setup a static folder for our assets and resources for the webpage
app.use(express.static(__dirname + '/client'));

//Setup motors
var leftMotor = new ev3dev.Motor('outA');
var rightMotor = new ev3dev.Motor('outB');

if (!leftMotor.connected || !rightMotor.connected)
	console.log("Motors could be found. Are you sure that one is connected?");

console.log(' Left motor: ' + leftMotor.portName);
console.log(' Right motor: ' + rightMotor.portName);

console.log('Setting motor properties...');
leftMotor.rampUpSp = 100;
leftMotor.rampDownSp = 100;
leftMotor.timeSp = 1000;
leftMotor.dutyCycleSp = 50;

rightMotor.rampUpSp = 100;
rightMotor.rampDownSp = 100;
rightMotor.timeSp = 1000;
rightMotor.dutyCycleSp = 50;

console.log('Available commands: ' + leftMotor.commands);
console.log('Sending motor command...');



// serve our webpage
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/client/index.html');
});




//API commands
app.get('/api/left_motor', function(req, res){
	console.log('GOT COMMAND TO MOVE LEFT MOTOR');
	leftMotor.command = 'run-timed';
	res.status(200).send('moved left motor');
})

app.get('/api/drive', function(req, res) {
    
    console.log(req.originalUrl);
    
    leftMotor.dutyCycleSp = req.query.left
    rightMotor.dutyCycleSp = req.query.right
    
    //leftMotor.command = 'run-direct';
    //rightMotor.command = 'run-direct';
	res.status(200).send('Driving');
})

app.get('/api/stop', function(req, res){
	console.log('Stopped');
    leftMotor.command = 'stop';
    rightMotor.command = 'stop';
	res.status(200).send('stopped');
})

app.get('/api/start', function(req, res){
	console.log('starting');
    leftMotor.command = 'run-direct';
    rightMotor.command = 'run-direct';
	res.status(200).send('starting');
})




var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('myo-ev3 app listening at http://%s:%s', host, port);
 });