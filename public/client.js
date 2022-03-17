// Unsere liebe Socket
var socket = io();
// Aktuelle ID des Spielers
var id;
// State zeigt ob der Spieler gerade den Ball hat
var isplaying = false;
// Die Spielfeldbreite
var canvasWidth = 900;
// Ball wird beim ersten Zug Random auf X platziert
var xBall = Math.floor(Math.random() * canvasWidth/2) + canvasWidth/4;
// Starthöhe 
var yBall = 50;
// Geschwindikeit des Balls X und Y am Start
var xSpeed = 0;
var ySpeed = 3;
// Die Scorevarriabeln
var myScore = 0;
var enemyScore = 0;
var w = window.innerWidth;
var h = window.innerHeight;  
// Array mit allen Bällen
var ballArray = [];
// Alle aktiven User
var userArray = [];
// Game States
var startScreen = true;
var gamesScreen = false;
var gameOverScreen = false;

// Hier wird der Setup gemacht
function setup() {
	canvas = createCanvas(w, h);
	// ID wird verteilt
	getID();
	cursor('ew-resize');
	rectMode(CENTER);
	colorMode(HSB);
	noStroke();
	fill("#fff");

	// Hier wird der Startbutton aufgesetzt
	button = createButton("Start");
	button.mouseClicked(function() {
		ballArray.push(new Ball(Math.floor(Math.random() * canvasWidth/2) + canvasWidth/4, 50 , 0, 3, 20, this.ballId));
	});
	button.size(50,25);
	button.position(10,625);
	button.style("font-family", "Bodoni");
	button.style("font-size", "12px");

	startButton = createButton("Start");
	startButton.id("startButton");
	startButton.mouseClicked(function() {
		startScreen = false;
		gamesScreen = true;
	});
}

// Background
function draw() {
	if (startScreen) {
		background('rgb(100%,0%,10%)');
		fill(255);
		textAlign(CENTER, CENTER);
		return;
	}

	if (gamesScreen) {
		background(0);
		// Zeigt die Framerate unten rechts an
		let fps = frameRate();
		text("FPS: " + fps.toFixed(2), canvasWidth - 150, height - 10);
		for (let ball of ballArray) {
			// Zeigt den Ball an
			ball.show();
			// Bewegt Ball
			ball.update();
			// Seitenabpraller
			if (ball.x < 10 || ball.x > w - 10) {
				ball.xSpeed *= -1;
			}

			// Hier wird der Bounce zwischen den Bällen und dem Paddle verwaltet
			if ((ball.x > mouseX - 45 && ball.x < mouseX + 45) && (ball.y + 10 >= 600)) {
				ball.ySpeed = ball.ySpeed + 0.5;
				ball.ySpeed *= -1;
				// Dynamischer Bounce abhängig von wo der Paddle getroffen wurde
				var d = mouseX - ball.x;
				ball.xSpeed += d * -0.1;
			}

			if (ball.y < 10) {
				for (let x = 0; x < ballArray.length; x++) {
					if (ball.ballId === ballArray[x].ballId) {
						socket.emit("ballData", ball.ballId, ball.x, ball.xSpeed, ball.ySpeed);
						ballArray.splice(x, 1); 
					}
				}	
			}
		}

		if (gameOverScreen) {
			background(255, 204, 0);
		}

		// Das Paddle
		//arc(mouseX, 605, 80, 30, PI, 0, CHORD);
		//rect(mouseX, 600, 80, 2);
		//rect(mouseX, 605, 60, 2);
		//rect(mouseX, 610, 30, 2);
		fill(196);
  		noStroke();
  		rect(mouseX, 600, 200, 20, 25, 25, 4, 4);
		// Score Text
		textSize(24);
		text("ME " + myScore + '-' + enemyScore + " OPPONENT", canvasWidth-250, 40);
	}
}

window.onresize = function() {
	// assigns new values for width and height variables
	w = window.innerWidth;
	h = 700;  
	canvas.size(w,h);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

// Startet das Spiel
function startGame() {
}

/*
// Ist für Bouncerei des Balls zuständig
function bounce() {

	// Triggert Ballseitenwechsel verschickt die ID des Absenders, die X-Pos und die Richtung des Balls
	if (yBall < 10 ) {
		socket.emit("triggerid", id);
		socket.emit("getX", xBall);
		ySpeed *= -1;
		socket.emit("getYSpeed", ySpeed);
		socket.emit("getXSpeed", -xSpeed);
		ballArray.push(new Ball(this.xBall, 0 , this.xSpeed , this.ySpeed, this.ballId));
	}
		
	// Triggert Punkt
	if (yBall > 700 - 10) {
		ySpeed *= -1;
		socket.emit('score', enemyScore);
		socket.emit('scoreid', id);

		// Automatic ball reset
		yBall = 50;
		xBall = Math.floor(Math.random() * canvasWidth/2) + canvasWidth/4;
		xSpeed = 0;
		ySpeed = 3;
	}
}
*/

	// Socket sendet ID von dem Spieler der gerade den Ball abgiebt
socket.on("triggerid", function(triggerid){
	if (triggerid == id) {
		isplaying = true;
		
		// Holt sich neue X Position und Richtung des Balls damit der Übergang zum nächsten Spieler auch schön geschmeidig ist
		socket.on("getX", function(newX){
			xBall = canvasWidth-newX;
		});
		socket.on("getYSpeed", function(newYSpeed){
			ySpeed = newYSpeed;
		});
		socket.on("getXSpeed", function(newXSpeed){
			xSpeed = newXSpeed;
		});
	} else {
		isplaying = false;
	}
});

socket.on("userList", function(userArray){
	
})
	
// Hier wird die Score über die Socket gehandelt
socket.on('scoreid', function(scoreId) {
	// Wer bekommt den Punkt?
	if (scoreId != id) {
		myScore++;
	} else {
		enemyScore++;
	}
});
	
// ID wird einmalig zugeteilt und auf Screen ausgegeben
function getID(){
	socket.once('user', function(msg) {
		id = msg;
		let h5 = createElement('h5', msg);
		h5.style('color', '#00a1d3');
		h5.position(10, 650);
	});
}

function checkMobileInput() {
	if (window.DeviceOrientationEvent) {
		//console.log("is Working");
		window.addEventListener("deviceorientation", function(event) {
			event.gamma
			console.log(event.gamma);
		}, true);
	} else {
		console.log("Not Supportet Device");
	}
}
	
// Generiert einen Random String, kann für IDs verwendet werden
function generateRandomString() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	var string_length = 6;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}