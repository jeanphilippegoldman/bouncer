
// TODO NOW
// remove completely bouncer when loosing
// change code for nice new tricks registering

// TODO later
// pause mode
// L = higher level, speficic function that higher probabilities too and registrer tricks
// fallingBoards sound does movingBoards
// make a debug mode
// first splash: use <- -> arrows
// down = booster
// up = fire
// steady board
// multiple bouncer
// game.started usefull ?
// some moving boards tends to blink on left side



// general object (extended by bouncers, boards, balloons,...)
class Sprite {
	constructor(w,h,sx,sy,x,y,gy,col,frictionX) {
		//init
		this.width = w;
		this.height = h;
		this.speedX = sx;
		this.speedY = sy;    
		this.x = x;
		this.y = y;
		this.gravityY = gy;
		this.gravityX = 0;
		this.color = col;
		this.lastBounce = 0;
		this.comment="";
		this.frictionX = (typeof frictionX == 'undefined')? 0.05 : frictionX
		this.frictionY = 0;
		// new players are sleeping = 0 (dead=-1). balloons starts as active
		this.active = 0
	}
	
	// compute new speed and position of object
	update() {
		//new speed
		this.speedX = (this.speedX + this.gravityX) * (1 - this.frictionX)
		this.speedY = (this.speedY + this.gravityY) * (1 - this.frictionY)

		//new position
		this.x = (this.x + this.speedX) % game.canvas.width;
		this.x += this.x<0 ? game.canvas.width : 0
		this.y += this.speedY;
	}

	// common part of drawing : color, text
	draw() {
		game.context.fillStyle = this.color;
		game.context.font = "20px Impact";
		game.context.textAlign="center";
		game.context.fillText(this.comment,this.x +this.width*0.5 ,this.y -5); 
	}
		
	// detect collision, return false/true
	collision(other) {
		if (((this.y + this.height) < other.y) 
			|| (this.y > (other.y + other.height))
			|| ((this.x + this.width) < other.x)
			|| (this.x > (other.x + other.width))) return false;
		else return true;
	}
}

//power of ES6 :)
class Bouncer extends Sprite {
	update(){
		super.update()
		if (this.active == 1){
			//bottom screen fall > loose one
			if (this.y > game.canvas.height - this.height) game.looseOne(this)

			//TRICK_BIG_BOUNCER deflates
			if (this.height > 30)
				this.height -= 0.06
			if (this.width > 30)
				this.width -= 0.06
		}
		this.draw()
	}

	draw(){
		super.draw()
		
		//draw bouncer
		if (this.active == 0) {
			//TODO roundRect for sleeping bouncer
			game.context.beginPath();
			game.context.arc(this.x+this.width/2,this.y+this.height/2, this.height / 2.0 , 0, 2 * Math.PI, false);
			game.context.fill();
		} else if (this.active == 1) 
			roundRect(game.context,this.x, this.y, this.width, this.height, 10, true, true);
		
		game.context.fillStyle = "black";
		
		// eyes and nose
		game.context.fillRect(this.x+this.width*0.3, this.y+this.height*0.3, this.width*0.1, this.height*0.3);
		game.context.fillRect(this.x+this.width*0.6, this.y+this.height*0.3, this.width*0.1, this.height*0.3);
		game.context.fillRect(this.x+this.width*0.2, this.y+this.height*0.7, this.width*0.6, this.height*0.1);
	}

	// transform a waiting Bouncer into a playing Bouncer (give size, speed and gravity)
	toPlay() {
		this.active = 1
		this.height = 30
		this.width = 30
		this.speedX = -10
		this.speedY = 0
		this.gravityY = 0.1
	}
}

// boards to jump on
class Board extends Sprite {
	update(){
		super.update()
		
		// boards bounce on vertical sides (if have xspeed)
		if (((this.x - this.width/2)<0) || ((this.x + this.width/2) > game.canvas.width) ) {
			this.speedX *= -1.0
			this.x += this.speedX;	
		}
		
		this.draw()
	}
	draw(){
		super.draw()
		game.context.fillRect(this.x, this.y, this.width, this.height);
	}
	
}

// floating balloons (red ones give a life, yellow ones points)
class Balloon extends Sprite {
	constructor(w,h,sx,sy,x,y,gy,col,frictionX){
		super(w,h,sx,sy,x,y,gy,col,frictionX)
		this.value = 1
		this.frictionX = 0.00105
		this.frictionY = 0.00105
		this.age = 0
		this.active = 1
	}
	update(){
		super.update()
		this.age += 1 
		//make reverse gravity when approaching bottom
		this.gravityY = -0.05*(this.y/game.canvas.height-0.5)
		this.comment = "+"+this.value.toString()
		//this.comment = this.age.toString()
		if (this.y > game.canvas.height - this.height)  this.active = 0
		// if a balloon is old , disactivate
		if (this.age > 1000) this.active = 0
		this.draw()
	}
	draw(){
		super.draw()
		game.context.fillRect(this.x, this.y, this.width, this.height);
	}
}

var game = {
	
	canvas : document.createElement("canvas"),
	bestScore : 0,
	initArea : function (){
		var size = mySize();
		this.canvas.id = "gameCanvas"			
		this.canvas.width = Math.min(400, 0.9 * size[0]);
		this.canvas.height = Math.min(600, 0.9 * size[1]);
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		sound_start = document.getElementById("sound_start");
		sound_loose = document.getElementById("sound_loose");
		sound_loose1 = document.getElementById("sound_loose1");
		sound_bounce = document.getElementById("sound_bounce");
		sound_bounce1 = document.getElementById("sound_bounce1");
		sound_inflate = document.getElementById("sound_inflate");
		sound_balloon = document.getElementById("sound_balloon");
		sound_stretch = document.getElementById("sound_stretch");
		sound_fall = document.getElementById("sound_fall");
	},
	initGame : function() {
		this.fallingBoards = 0,
		this.movingBoards= 0,
		this.boardMaxWidth = 60;
		this.boardMinWidth = 40;
		this.hasScored = false
		this.sleep = false
		this.boardOrangeProb = 0
		this.boardRedProb = 0
		this.boardBlackProb = 0
		this.started = 0
		this.score = 0;
		this.tricks = 0
		this.level = 1;
		this.time = 0;
		bouncers = [];
		bouncers.push( new Bouncer(15, 15, 0, 0, 330, 20, 0, "#2E9AFE"));
		bouncers.push( new Bouncer(15, 15, 0, 0, 350, 20, 0, "#2E9AFE"));
		bouncers.push( new Bouncer(15, 15, 0, 0, 370, 20, 0, "#2E9AFE"));
		boards = [];
		balloons = []
		updateGame();
		bouncers[0].toPlay()
		myPlay(sound_start)
		this.boardSpawner(100);
		this.boardSpawner(150);
		this.boardSpawner(200);
		this.boardSpawner(250);
		this.splash(1)
		UIMobile()
	},
	splash : function(level){
		if (this.timer !==undefined) clearInterval(this.timer)
		this.started = 0;
		this.clearArea()
		game.context.fillStyle = "#AAFFAA";
		this.context.fillRect(this.canvas.width * 0.2, this.canvas.height * 0.2, this.canvas.width * 0.6, this.canvas.height * 0.6);
		game.context.textAlign="center"; 
		game.context.font = "35px Impact";
		game.context.fillStyle = '#33AA33';
		if (level==1) {
			game.context.fillText("bouncer",this.canvas.width * 0.5,this.canvas.height * 0.3); 
			game.context.fillText("best "+this.bestScore.toString(),this.canvas.width * 0.5,this.canvas.height * 0.7); 
		} else {
			game.context.fillText("Level "+level.toString(),this.canvas.width * 0.5,this.canvas.height * 0.4); 
			game.context.fillText("score "+this.score.toString(),this.canvas.width * 0.5,this.canvas.height * 0.3);
			if (level==2) {
				splashComment("high bounce","orange")
				this.boardOrangeProb=0.2
			} else if (level==3){
				//TRICK_BIG_BOUNCER
				splashComment("BIG","red")
				this.boardRedProb=0.15
				this.tricks=1
			} else if (level==4){
				//TRICK_BIG_BOARDS
				splashComment("big boards","red",100)
				this.tricks=2
			} else if (level==5){
				//TRICK_YELLOW_BALLOON
				splashComment("yellow balloons gives points","yellow",15)
				this.tricks = 3
			} else if (level==6){
				//TRICK_BLACK_BOARDS
				splashComment("kills","black")
				this.boardBlackProb=0.1
			} else if (level==7){
				//TRICK_FALLING_BOARDS
				splashComment("beware of falling boards","red")
				this.tricks = 4
			} else if (level==8){
				//TRICK_RED_BALLOON
				splashComment("red balls give life","red",15)
				this.tricks = 5
			} else if (level==9){
				//TRICK_MOVING_BOARDS
				splashComment("moving boards","red")
				this.tricks = 6
			}
		}
		this.sleep = true
		setTimeout("game.sleep=false;",1000)
	},
	
	startGame : function() {
		this.started = 1;
		this.hasScored = false
		this.timer = setInterval(updateGame, 20);
	},
	
	clearArea : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	
	scoreZone : function(number) {
		game.context.font = "25px Impact";
		game.context.fillStyle = "black";
		game.context.textAlign="start"; 
		game.context.fillText(this.score.toString(), 10, this.canvas.height * 0.98);
		game.context.textAlign="end"; 
		game.context.fillText("lvl "+this.level.toString(), this.canvas.width * 0.98, this.canvas.height * 0.98);
	},
	addScore : function (n) {
		this.score += n
		this.hasScored = true
	},

	looseOne : function(deadBouncer) {
		bouncers.shift();
		if (bouncers.length == 0) {
			// LOOSE GAME
			clearInterval(this.timer)
			this.clearArea()
			myPlay(sound_loose)
			this.started = 0
			if (this.score > this.bestScore) this.bestScore = this.score;
			this.initGame()
		}
		bouncers[0].toPlay();
		myPlay(sound_loose1)
	},
	startBouncer :	function () {
		this.initArea();
		this.initGame();
		
	},
	
	boardSpawner : function(height) {
	//TODO move to board object
	
		//TRICK_BIG_BOARDS
		// TODO move to game.update() ?
		if (game.boardMinWidth > 40)
			game.boardMinWidth -= 10;
		if (game.boardMaxWidth > 60)
			game.boardMaxWidth -= 10;
		
		//boards fall faster and faster with score
		speed = Math.log(game.score + 1)/15 + 1
		//TRICK_MOVING_BOARDS affects speedX of new boards
		speedX = (game.movingBoards>0)? 10*(Math.random()-0.5) : 0
		
		boardWidth = Math.floor(Math.random()*(game.boardMaxWidth - game.boardMinWidth + 1) +
				game.boardMinWidth);
		boardPos = Math.floor(Math.random() * (game.canvas.width - boardWidth+1));
		if (Math.random() < game.boardOrangeProb)
			boards.push(new Board(boardWidth, 10, speedX, 1.8 * speed, boardPos, height, 0,
				"orange",0));
		else if (Math.random() < game.boardRedProb)
			boards.push(new Board(boardWidth, 10, speedX, 2.5 * speed, boardPos, height, 0,
				"red",0));
		else if (Math.random() < game.boardBlackProb)
			boards.push(new Board(boardWidth, 10, speedX, 2.5 * speed, boardPos, height, 0,
				"black",0));
		else
			boards.push(new Board(boardWidth, 10, speedX, 1.5 * speed , boardPos, height, 0,
				"green",0));
	}
}

function splashComment(comment,color,width){
	if (width == undefined) width = 50;
	game.context.font = "20px Impact";
	game.context.fillText(comment,game.canvas.width * 0.5,game.canvas.height * 0.7);
	game.context.fillStyle = color;
	game.context.fillRect(game.canvas.width * 0.5-width/2, game.canvas.height * 0.6, width, 15);
}
	
function myPlay(snd){
	if (snd.ended)
		snd.play()
	else
		snd.cloneNode(true).play()
}

function updateGame() {

	// get high bounces when falling boards
	rebound = (game.fallingBoards>0)? -4 : -2

	//process collisions with boards
	for (i = 0; i < boards.length; i += 1) {
		if (bouncers[0].collision(boards[i]) && (game.time - boards[i].lastBounce > 30 )) {
			boards[i].lastBounce = game.time
			if (game.fallingBoards>0) boards[i].gravityY=0.1
			if (boards[i].color == "black") game.looseOne()
			else if (boards[i].color == "orange") {
				bouncers[0].speedY = rebound -2 -3*(bouncers[0].y/game.canvas.height)
				game.addScore(2)
				myPlay(sound_bounce1)
			} else if (boards[i].color == "red") {
				bouncers[0].speedY = rebound -3*(bouncers[0].y/game.canvas.height)
				game.addScore(1)
				boards[i].color = "orange"
				if (Math.random() < 1/game.tricks) {
					//BIG Bouncer
					bouncers[0].height = 70
					bouncers[0].width = 70
					myPlay(sound_inflate)
				} else if (Math.random() < 1/(game.tricks-1)) {
					//BIG board BOARDS
					game.boardMinWidth = 200
					game.boardMaxWidth = 300
					myPlay(sound_stretch)
				} else if (Math.random() < 1/(game.tricks-1)) {
					//TRICK_YELLOW_BALLOON
					balloons.push(new Balloon(15, 15, 2*Math.random()-1, 0 , boards[i].x+boards[i].width/2, boards[i].y, 0.02,"yellow"));
					myPlay(sound_balloon)
				} else  if (Math.random() < 1/(game.tricks-1)) {
					//TRICK_FALLING_BOARDS
					game.fallingBoards = 500
					myPlay(sound_fall)
				} else if (Math.random() < 1/(game.tricks-1)) {
					//TRICK_RED_BALLOON
					balloons.push(new Balloon(15, 15, 2*Math.random()-1, 2*Math.random() , 200, 50, 0.02,"red"));
					myPlay(sound_balloon)
				} else  {
					//TRICK_MOVING_BOARDS
					game.movingBoards = 500
					myPlay(sound_fall)
				}
			} else {
				bouncers[0].speedY = rebound -3*(bouncers[0].y/game.canvas.height)
				game.addScore(1)
				myPlay(sound_bounce)
				// TODO: set up a setter
				// add special things after levels
			}
		}
	}

	//process collisions with balloons
	for (i = 0; i < balloons.length; i += 1) if (balloons[i].active) {
		if (bouncers[0].collision(balloons[i]) && (game.time - balloons[i].lastBounce > 40 )) {
			balloons[i].lastBounce = game.time
			if (balloons[i].color=="red"){
				balloons[i].active=0
				bouncers.push( new Bouncer(15, 15, 0, 0, 330, 20, 0, "red"));
				myPlay(sound_balloon)				
				myPlay(sound_balloon)				
			} else {
				balloons[i].speedX = 0.5+Math.random()
				balloons[i].speedY = 0.5+Math.random()
				myPlay(sound_balloon)				
				game.score += balloons[i].value
				balloons[i].value += 1
				// remove balloon after 5 touches
				if (balloons[i].value > 5) balloons[i].active=0
			}
		}
	}
	
	// update and draw
	game.clearArea();
	//TODO make function updateGame
	game.time += 1;
	game.fallingBoards -= 1
	game.movingBoards -= 1
	for (i = 0; i < boards.length; i += 1) boards[i].update();
	
	//every 50 ticks, spawn a new jump board
	if (game.time == 1 || ((game.time / 50) % 1 == 0)) game.boardSpawner(50)
	
	for (i = 0; i < bouncers.length; i += 1) bouncers[i].update();
	for (i = 0; i < balloons.length; i += 1) if (balloons[i].active) balloons[i].update();
	game.scoreZone();
	
	var newLevel = Math.ceil((game.score+1)/25)
	if (newLevel > game.level) {
		game.level = newLevel
		game.splash(game.level)
	}
}

