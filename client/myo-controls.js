Myo.connect();

var driving = false
var lastCommand = 0;  
var COMMAND_INTERVAL = 400
var THETA_DEADZONE = .1
var ROLL_MAX = .7
var PITCH_MAX = .7

var drive = function(left, right){
    $.get('/api/drive?left=' + left + "&right=" + right);
}

var start = function(){
    $.get('/api/start');
}

var stop = function(){
    $.get('/api/stop');
}

Myo.on('connected', function(data, timestamp){
    console.log('connected!', this.id)
    Myo.setLockingPolicy('none')
    this.unlock(false);
});

var rollOffset = 0
var setRollOffset = false
Myo.on('fingers_spread', function(){
//Myo.on('wave_out', function(){

    //this.zeroOrientation()
    setRollOffset = true
	driving = driving
    console.log("Driving: " + driving)
    this.vibrate("short")
    if (driving) {
        start()
    } else {
        //stop()
    }
});

Myo.on('double_tap', function(){

	driving = false
    stop()

});

var lastCommand = 0;  
Myo.on('notvector', function(vector) {
    if (setRollOffset) {
        rollOffset = vector.theta
        setRollOffset = false
    }
    var time = (new Date()).getTime();
    if (driving && time > lastCommand + COMMAND_INTERVAL) {
        var roll = vector.theta- rollOffset
        var pitch = vector.y 
        if (Math.abs(roll) < THETA_DEADZONE) {
            roll = 0
        }
        
        if (Math.abs(pitch) < THETA_DEADZONE) {
            pitch = 0
        }
        //roll = Math.max(-1.0, Math.min(roll * 1.8, 1))
        //pitch = Math.max(-1.0, Math.min(pitch * 1.8, 1))
        
        var left = Math.round(pitch * -100 * (1 - Math.abs(roll)) + roll * 100 * (1 - Math.abs(pitch)) + pitch * roll * -100)
        var right = Math.round(pitch * -100 * (1 - Math.abs(roll)) + roll * -100 * (1 - Math.abs(pitch)) + pitch * roll * 100)
        console.log("Pitch: " + pitch + ", roll: " + roll)
        drive(left, right)
        lastCommand = time
    }
})
Myo.on('orientation', function(quanternion){
    if (setRollOffset) {
        rollOffset = Angles.roll(quanternion)
        setRollOffset = false
    }
    var time = (new Date()).getTime();
    if (driving && time > lastCommand + COMMAND_INTERVAL) {
        var roll = (Angles.roll(quanternion) - rollOffset) / ROLL_MAX
        var pitch = (Angles.pitch(quanternion)) / PITCH_MAX
        if (Math.abs(roll) < THETA_DEADZONE) {
            roll = 0
        }
        
        if (Math.abs(pitch) < THETA_DEADZONE) {
            pitch = 0
        }
        roll = Math.max(-1.0, Math.min(roll, 1))
        pitch = Math.max(-1.0, Math.min(pitch, 1))
        
        var left = Math.round(pitch * -100 * (1 - Math.abs(roll)) + roll * 100 * (1 - Math.abs(pitch)) + pitch * roll * -100)
        var right = Math.round(pitch * -100 * (1 - Math.abs(roll)) + roll * -100 * (1 - Math.abs(pitch)) + pitch * roll * 100)
        console.log("Pitch: " + pitch + ", roll: " + roll)
        drive(left, right)
        lastCommand = time

    }
});
var Angles = {
    roll : function(q){
        return Math.atan2(2.0*(q.y*q.z + q.w*q.x), q.w*q.w - q.x*q.x - q.y*q.y + q.z*q.z);
    },
    pitch : function(q){
        return Math.asin(-2.0*(q.x*q.z - q.w*q.y));
    },
    yaw : function(q){
        return Math.atan2(2.0*(q.x*q.y + q.w*q.z), q.w*q.w + q.x*q.x - q.y*q.y - q.z*q.z);
    }
};

$('button.connect').click(function(){
	setRollOffset = true
	driving = !driving
    console.log("Driving: " + driving)
    this.vibrate("short")
    if (driving) {
        start()
    } else {
        stop()
    }
		});