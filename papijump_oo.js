//power of ES6 :)
// TODO pause mode
// TODO fallingBoards sound does movingBoards
// TODO trick: steady block
// TODO initgame : init movingBoards, fallingBoards, boardMinWidth, boardMaxWidth
// moving boards tends to disappear on sides
// make a debug mode
// first slash: user <- -> arrows
// TODO remove completely papi when loosing
// TODO papi theme to ???
// TODO better rebound. i.e side rebound -speedX
//TODO multiple papis
// steady boards 
// firing upwards to boards or ennemies
// boosting (arrow down)
// L level up

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
		// new papis are sleeping = 0 (dead=-1).balloons starts as active
		this.active = 0
	}
	update() {
		//new position
		this.speedX = (this.speedX + this.gravityX) * (1 - this.frictionX)
		this.speedY = (this.speedY + this.gravityY) * (1 - this.frictionY)
		this.x = (this.x + this.speedX) % game.canvas.width;
		this.x += this.x<0 ? game.canvas.width : 0
		this.y += this.speedY;
	}
	draw() {
		game.context.fillStyle = this.color;
		game.context.font = "20px Impact";
		game.context.textAlign="center";
		game.context.fillText(this.comment,this.x +this.width*0.5 ,this.y -5); 
	}
		
	collision(other) {
		if (((this.y + this.height) < other.y) 
			|| (this.y > (other.y + other.height))
			|| ((this.x + this.width) < other.x)
			|| (this.x > (other.x + other.width))) return false;
		else return true;
	}
}

class Papi extends Sprite {
	update(){
		super.update()
		if (this.active == 1){
			if (this.y > game.canvas.height - this.height) game.looseOne(this)
			//deflate
			if (this.height > 30)
				this.height -= 0.06
			if (this.width > 30)
				this.width -= 0.06
		}
		this.draw()
	}

	draw(){
		super.draw()
		if (this.active == 0) {
			game.context.beginPath();
			game.context.arc(this.x+this.width/2,this.y+this.height/2, this.height / 2.0 , 0, 2 * Math.PI, false);
			game.context.fill();
		} else if (this.active == 1) 
			roundRect(game.context,this.x, this.y, this.width, this.height, 10, true, true);
		
		game.context.fillStyle = "black";
		game.context.fillRect(this.x+this.width*0.3, this.y+this.height*0.3, this.width*0.1, this.height*0.3);
		game.context.fillRect(this.x+this.width*0.6, this.y+this.height*0.3, this.width*0.1, this.height*0.3);
		game.context.fillRect(this.x+this.width*0.2, this.y+this.height*0.7, this.width*0.6, this.height*0.1);
	}

	// transform a waiting papi into a playing papi
	toPlay() {
		this.active = 1
		this.height = 30
		this.width = 30
		this.speedX = -10
		this.speedY = 0
		this.gravityY = 0.1
	}
}

class Board extends Sprite {
	update(){
		super.update()
		this.draw()
	}
	draw(){
		super.draw()
		game.context.fillRect(this.x, this.y, this.width, this.height);
	}
	
}

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
		this.gravityY = -0.05*(this.y/game.canvas.height-0.5)
		this.comment = "+"+this.value.toString()
		//this.comment = this.age.toString()
		if (this.y > game.canvas.height - this.height)  this.active = 0
		// if a star is old , disactivate
		if (this.age > 1000) this.active = 0
		this.draw()
	}
	draw(){
		super.draw()
		game.context.fillRect(this.x, this.y, this.width, this.height);
	}
}

	
var timer
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
		this.jumpOrangeProb = 0
		this.jumpRedProb = 0
		this.jumpBlackProb = 0
		this.started = 0
		this.score = 0;
		this.tricks = 0
		this.level = 1;
		this.time = 0;
		papis = [];
		papis.push( new Papi(15, 15, 0, 0, 330, 20, 0, "#2E9AFE"));
		papis.push( new Papi(15, 15, 0, 0, 350, 20, 0, "#2E9AFE"));
		papis.push( new Papi(15, 15, 0, 0, 370, 20, 0, "#2E9AFE"));
		jumps = [];
		stars = []
		updateGame();
		papis[0].toPlay()
		myPlay(sound_start)
		this.boardSpawner(100);
		this.boardSpawner(150);
		this.boardSpawner(200);
		this.boardSpawner(250);
		this.splash(1)
	
	},
	splash : function(level){
		if (timer !==undefined) clearInterval(timer)
		started = 0;
		this.clear()
		game.context.fillStyle = "#AAFFAA";
		this.context.fillRect(this.canvas.width * 0.2, this.canvas.height * 0.2, this.canvas.width * 0.6, this.canvas.height * 0.6);
		game.context.textAlign="center"; 
		game.context.font = "35px Impact";
		game.context.fillStyle = '#33AA33';
		if (level==1) {
			game.context.fillText("papiJumP",this.canvas.width * 0.5,this.canvas.height * 0.3); 
			game.context.fillText("best "+this.bestScore.toString(),this.canvas.width * 0.5,this.canvas.height * 0.7); 
		} else {
			game.context.fillText("Level "+level.toString(),this.canvas.width * 0.5,this.canvas.height * 0.4); 
			game.context.fillText("score "+this.score.toString(),this.canvas.width * 0.5,this.canvas.height * 0.3);
			if (level==2) {
				splashComment("high jump","orange")
				this.jumpOrangeProb=0.2
			} else if (level==3){
				splashComment("BIG","red")
				this.jumpRedProb=0.15
				this.tricks=1
			} else if (level==4){
				splashComment("big boards","red",100)
				this.tricks=2
			} else if (level==5){
				splashComment("yellow balloons gives points","yellow",15)
				this.tricks = 3
			} else if (level==6){
				splashComment("kills","black")
				this.jumpBlackProb=0.1
			} else if (level==7){
				splashComment("beware of falling boards","red")
				this.tricks = 4
			} else if (level==8){
				splashComment("red balls give life","red",15)
				this.tricks = 5
			} else if (level==9){
				splashComment("moving boards","red")
				this.tricks = 6
			}
			//NEXT TRICKS
			// get booster
			// red balloon = new life
		}
		this.sleep = true
		setTimeout("game.sleep=false;",1000)
	},
	
	start : function() {
		started = 1;
		this.hasScored = false
		timer = setInterval(updateGame, 20);
	},
	clear : function() {
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
	loose : function(){
		clearInterval(timer)
		this.clear()
		myPlay(sound_loose)
		started = 0
		if (this.score > this.bestScore) this.bestScore = this.score;
		this.initGame()
	},
	looseOne : function(deadPapi) {
		papis.shift();
		if (papis.length == 0) {
			this.loose()
		}
		papis[0].toPlay();
		myPlay(sound_loose1)
	},
	startPapiJump :	function () {
		this.initArea();
		this.initGame();
		
	},
	boardSpawner : function(height) {
		
		if (game.boardMinWidth > 40)
			game.boardMinWidth -= 10;
		if (game.boardMaxWidth > 60)
			game.boardMaxWidth -= 10;
		
		//boards fall faster and faster with score
		speed = Math.log(game.score + 1)/15 + 1
		speedX = (game.movingBoards>0)? 10*(Math.random()-0.5) : 0
		boardWidth = Math.floor(Math.random()*(game.boardMaxWidth - game.boardMinWidth + 1) +
				game.boardMinWidth);
		jumpPos = Math.floor(Math.random() * (game.canvas.width - game.boardWidth+1));
		if (Math.random() < game.jumpOrangeProb)
			jumps.push(new Board(boardWidth, 10, speedX, 1.8 * speed, jumpPos, height, 0,
				"orange",0));
		else if (Math.random() < game.jumpRedProb)
			jumps.push(new Board(boardWidth, 10, speedX, 2.5 * speed, jumpPos, height, 0,
				"red",0));
		else if (Math.random() < game.jumpBlackProb)
			jumps.push(new Board(boardWidth, 10, speedX, 2.5 * speed, jumpPos, height, 0,
				"black",0));
		else
			jumps.push(new Board(boardWidth, 10, speedX, 1.5 * speed , jumpPos, height, 0,
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


	rebound = (game.fallingBoards>0)? -4 : -2
	//process collisions
	for (i = 0; i < jumps.length; i += 1) {
		if (papis[0].collision(jumps[i]) && (game.time - jumps[i].lastBounce > 30 )) {
			jumps[i].lastBounce = game.time
			if (game.fallingBoards>0) jumps[i].gravityY=0.1
			if (jumps[i].color == "black") game.looseOne()
			else if (jumps[i].color == "orange") {
				papis[0].speedY = rebound -2 -3*(papis[0].y/game.canvas.height)
				game.addScore(2)
				myPlay(sound_bounce1)
			} else if (jumps[i].color == "red") {
				papis[0].speedY = rebound -3*(papis[0].y/game.canvas.height)
				game.addScore(1)
				jumps[i].color = "orange"
				if (Math.random() < 1/game.tricks) {
					//BIG PAPI
					papis[0].height = 70
					papis[0].width = 70
					myPlay(sound_inflate)
				} else if (Math.random() < 1/(game.tricks-1)) {
					//BIG JUMP BOARDS
					game.boardMinWidth = 200
					game.boardMaxWidth = 300
					myPlay(sound_stretch)
				} else if (Math.random() < 1/(game.tricks-1)) {
					//STAR
					stars.push(new Balloon(15, 15, 2*Math.random()-1, 0 , jumps[i].x+jumps[i].width/2, jumps[i].y, 0.02,"yellow"));
					myPlay(sound_balloon)
				} else  if (Math.random() < 1/(game.tricks-1)) {
					//FALLING Boards
					game.fallingBoards = 500
					myPlay(sound_fall)
				} else if (Math.random() < 1/(game.tricks-1)) {
					//RED STAR
					stars.push(new Balloon(15, 15, 2*Math.random()-1, 2*Math.random() , 200, 50, 0.02,"red"));
					myPlay(sound_balloon)
				} else  {
					//MOVING Boards
					game.movingBoards = 500
					myPlay(sound_fall)
				}
			} else {
				papis[0].speedY = rebound -3*(papis[0].y/game.canvas.height)
				game.addScore(1)
				myPlay(sound_bounce)
				// TODO: set up a setter
				// add special things after levels
			}
		}
	}

	for (i = 0; i < stars.length; i += 1) if (stars[i].active) {
		if (papis[0].collision(stars[i]) && (game.time - stars[i].lastBounce > 40 )) {
			stars[i].lastBounce = game.time
			if (stars[i].color=="red"){
				stars[i].active=0
				papis.push( new Papi(15, 15, 0, 0, 330, 20, 0, "red"));
				myPlay(sound_balloon)				
				myPlay(sound_balloon)				
			} else {
				stars[i].speedX = 0.5+Math.random()
				stars[i].speedY = 0.5+Math.random()
				myPlay(sound_balloon)				
				game.score += stars[i].value
				stars[i].value += 1
				// remove star after 5 touches
				if (stars[i].value > 5) stars[i].active=0
			}
		}
	}
	// draw
	game.clear();
	game.time += 1;
	game.fallingBoards -= 1
	game.movingBoards -= 1
	for (i = 0; i < jumps.length; i += 1) jumps[i].update();
	
	//every 50 ticks, spawn a new jump board
	if (game.time == 1 || ((game.time / 50) % 1 == 0)) game.boardSpawner(50)
	
	for (i = 0; i < papis.length; i += 1) papis[i].update();
	for (i = 0; i < stars.length; i += 1) if (stars[i].active) stars[i].update();
	game.scoreZone();
	
	var newLevel = Math.ceil((game.score+1)/25)
	if (newLevel > game.level) {
		game.level = newLevel
		game.splash(game.level)
	}
}

