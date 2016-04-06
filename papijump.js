	var timer
	var game = {
		//TODO add new sounds for special tricks
		//TODO remove completely papi when loosing
		//TODO papi theme to ???
		
		canvas : document.createElement("canvas"),
		bestScore : 0,
		fallingBoards : 0,
		score : 0,
		level : 1,
		hasScored : false,
		sleep : false,
		jumpOrangeProb : 0,
		jumpRedProb : 0,
		jumpBlackProb : 0,
		tricks : 0,
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
			img_star = document.getElementById("star");
		},
		initGame : function() {
			this.fallingBoards = 0,
			this.hasScored = false
			this.sleep = false
			this.jumpOrangeProb = 0
			this.jumpRedProb = 0.2
			this.jumpBlackProb = 0
			this.tricks = 4,
			this.started = 0
			papis = [];
			papis.push( new sprite("papi", 15, 15, 0, 0, 330, 20, 0, "red"));
			papis.push( new sprite("papi", 15, 15, 0, 0, 350, 20, 0, "red"));
			papis.push( new sprite("papi", 15, 15, 0, 0, 370, 20, 0, "red"));
			jumps = [];
			stars = []
			updateGame();
			this.score = 0;
			this.level = 7;
			this.splash(1)
			this.time = 0;
			papis[0].toPlay()
			sound_start.play()
			spawnJump(100);
			spawnJump(150);
			spawnJump(200);
			spawnJump(250);
		
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
					splashComment("higher jump","orange")
					this.jumpOrangeProb=0.2
				} else if (level==3){
					splashComment("inflates","red")
					this.jumpRedProb=0.15
					this.tricks=1
				} else if (level==4){
					splashComment("big boards","red")
					this.tricks=2
				} else if (level==5){
					splashComment("yellow ballons","red")
					this.tricks = 3
				} else if (level==6){
					splashComment("kills you","black")
					this.jumpBlackProb=0.1
				} else if (level==7){
					splashComment("falling boards","red")
					this.tricks = 4
				}
				//NEXT TRICKS
				// falling boards
					
					
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
            game.context.fillText(this.level.toString(), this.canvas.width * 0.98, this.canvas.height * 0.98);
		},
		loose : function(){
			clearInterval(timer)
			this.clear()
			sound_loose.play()
			started = 0
			if (this.score > this.bestScore) this.bestScore = this.score;
			this.initGame()
		},
		looseOne : function() {
			papis.shift();
			if (papis.length == 0) {
				this.loose()
			}
			papis[0].toPlay();
			sound_loose1.play()
		},
		startPapiJump :	function () {
			this.initArea();
			this.initGame();
			
		},
		addScore : function (n) {
			this.score += n
			this.hasScored = true
		}
	}

	function splashComment(comment,color){
		game.context.font = "20px Impact";
		game.context.fillText(comment,game.canvas.width * 0.5,game.canvas.height * 0.7);
		game.context.fillStyle = color;
		game.context.fillRect(game.canvas.width * 0.5-25, game.canvas.height * 0.65, 50, 10);
	}
	function sprite(type,w,h,sx,sy,x,y,gy,col) {

		//init
		this.type = type;
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
		this.frictionX = 0.05;	
		this.frictionY = 0;
		this.age = 0
		this.active = 1
		if (this.type=="star") {
			this.value = 1
			this.frictionX = 0.00105
			this.frictionY = 0.00105
			}

		//newposition then draw
		this.update = function() {
			
			//new position
			this.speedX = (this.speedX + this.gravityX) * (1 - this.frictionX)
			this.speedY = (this.speedY + this.gravityY) * (1 - this.frictionY)
			this.x = (this.x + this.speedX) % game.canvas.width;
			this.x += this.x<0 ? game.canvas.width : 0
			this.y += this.speedY;
			this.age += 1 
			//this.comment = this.lastBounce.toString()
			if (this.type == "papi") {
				if (this.y > game.canvas.height - this.height) game.looseOne()
				//deflate
				if (papis[0].height > 30)
					papis[0].height -= 0.01
				if (papis[0].width > 30)
					papis[0].width -= 0.01
			}
			if (this.type =="star") {
				this.gravityY = -0.05*(this.y/game.canvas.height-0.5)
				this.comment = "+"+this.value.toString()
				// this.comment = this.age.toString()
				if (this.y > game.canvas.height - this.height)  this.active = 0
				// if a star is old , disactivate
				if (this.age > 1000) this.active = 0
			}
			
			//draw
			game.context.fillStyle = this.color;
			if (type == "papi") {
				game.context.beginPath();
				game.context.arc(this.x+this.width/2,this.y+this.height/2, this.height / 2.0 , 0, 2 * Math.PI, false);
				game.context.fill();
				game.context.fillStyle = "black";
				game.context.fillRect(this.x+this.width*0.3, this.y+this.height*0.3, this.width*0.1, this.height*0.3);
				game.context.fillRect(this.x+this.width*0.6, this.y+this.height*0.3, this.width*0.1, this.height*0.3);
				game.context.fillRect(this.x+this.width*0.2, this.y+this.height*0.7, this.width*0.6, this.height*0.1);
			} else if(type == "star"){
				//game.context.save(); 
				//game.context.translate(this.x, this.y);
				//game.context.rotate(angle /180 * Math.PI);
				// game.context.drawImage(img_star, this.x, this.y );
				//game.context.drawImage(img_star, -(img_star.width/2), -(img_star.height/2));
				//game.context.restore(); 
				game.context.fillRect(this.x, this.y, this.width, this.height);
			}
			else
				game.context.fillRect(this.x, this.y, this.width, this.height);
			
			//this.comment = this.width.toString()+"  ("+jumpMinWidth.toString()+" ; "+jumpMaxWidth.toString()+" )"
			game.context.font = "20px Impact";
			game.context.textAlign="center";
			game.context.fillText(this.comment,this.x +this.width*0.5 ,this.y -5); 
				
		}

		// transform a waiting papi into a playing papi
		this.toPlay = function() {
			this.height = 30
			this.width = 30
			this.speedX = -10
			this.speedY = 0
			this.gravityY = 0.1
		}
			
		this.collision = function(other) {
			if (((this.y + this.height) < other.y) 
				|| (this.y > (other.y + other.height))
				|| ((this.x + this.width) < other.x)
				|| (this.x > (other.x + other.width))) return false;
			else return true;
		}
	}
		
	var jumpMaxWidth = 60;
	var jumpMinWidth = 40;
	
	function spawnJump(height) {
		if (jumpMinWidth > 40)
			jumpMinWidth -= 10;
		if (jumpMaxWidth > 60)
			jumpMaxWidth -= 10;
		//boards fall faster and faster with score
		speed = Math.log(game.score + 1)/15 + 1

		jumpWidth = Math.floor(Math.random()*(jumpMaxWidth - jumpMinWidth + 1) +
				jumpMinWidth);
		jumpPos = Math.floor(Math.random() * (game.canvas.width - jumpWidth+1));
		if (Math.random() < game.jumpOrangeProb)
			jumps.push(new sprite("jump", jumpWidth, 10, 0, 1.8 * speed, jumpPos, height, 0,
				"orange"));
		else if (Math.random() < game.jumpRedProb)
			jumps.push(new sprite("jump", jumpWidth, 10, 0, 2.5 * speed, jumpPos, height, 0,
				"red"));
		else if (Math.random() < game.jumpBlackProb)
			jumps.push(new sprite("jump", jumpWidth, 10, 0, 2.5 * speed, jumpPos, height, 0,
				"black"));
		else
			jumps.push(new sprite("jump", jumpWidth, 10, 0, 1.5 * speed , jumpPos, height, 0,
				"green"));
	}
	
	function updateGame() {

	
		//process collisions
		for (i = 0; i < jumps.length; i += 1) {
			if (papis[0].collision(jumps[i]) && (game.time - jumps[i].lastBounce > 20 )) {
				jumps[i].lastBounce = game.time
				if (game.fallingBoards>0) jumps[i].gravityY=0.1
				if (jumps[i].color == "black") game.looseOne()
				else if (jumps[i].color == "orange") {
					papis[0].speedY = -4 -3*(papis[0].y/game.canvas.height)
					game.addScore(2)
					if (sound_bounce1.ended)
						sound_bounce1.play()
					else
						sound_bounce1.cloneNode(true).play()
				} else if (jumps[i].color == "red") {
					papis[0].speedY = -2 -3*(papis[0].y/game.canvas.height)
					game.addScore(1)
					jumps[i].color = "orange"
					if (Math.random() < 1/game.tricks) {
						//BIG PAPI
						papis[0].height = 70
						papis[0].width = 70
						sound_inflate.play()
					} else if (Math.random() < 1/(game.tricks-1)) {
						//BIG JUMP BOARDS
						jumpMinWidth = 200
						jumpMaxWidth = 300
						sound_stretch.play()
					} else if (Math.random() < 1/(game.tricks-1)) {
						//STAR
						stars.push(new sprite("star", 15, 15, 2*Math.random()-1, 2*Math.random() , 200, 50, 0.02,"yellow"));
						sound_balloon.play()
					} else {
						//FALLING Boards
						game.fallingBoards = 250
						sound_fall.play()
					}
				} else {
					papis[0].speedY = -2 -3*(papis[0].y/game.canvas.height)
					game.addScore(1)
					if (sound_bounce.ended)
						sound_bounce.play()
					else
						sound_bounce.cloneNode(true).play()
					// TODO: set up a setter
					// add special things after levels
				}
			}
		}

		for (i = 0; i < stars.length; i += 1) if (stars[i].active) {
			if (papis[0].collision(stars[i]) && (game.time - stars[i].lastBounce > 40 )) {
				stars[i].lastBounce = game.time
				stars[i].speedX = 0.5+Math.random()
				stars[i].speedY = 0.5+Math.random()
				sound_balloon.play()				
				game.score += stars[i].value
				stars[i].value += 1
				// remove star after 5 touches
				if (stars[i].value > 5) stars[i].active=0
			}
		}
		// draw
		game.clear();
		game.time += 1;
		game.fallingBoards -= 1
		for (i = 0; i < jumps.length; i += 1) jumps[i].update();
		
		//every 50 ticks, spawn a new jump board
		if (game.time == 1 || ((game.time / 50) % 1 == 0)) spawnJump(50)
		
		for (i = 0; i < papis.length; i += 1) papis[i].update();
		for (i = 0; i < stars.length; i += 1) if (stars[i].active) stars[i].update();
		game.scoreZone();
		
		if (game.hasScored &&(game.score>0)&&(game.score % 25 == 0)) {
			game.level +=1
			game.splash(game.level)
		}
	}
	
