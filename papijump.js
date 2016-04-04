	var game = {
		//
		canvas : document.createElement("canvas"),
		initArea : function (){
			var size = mySize();
			frictionX = 0.05;	
			frictionY = 0;
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
		},
		initGame : function() {
			started = 0
			papis = [];
			papis.push( new sprite("papi", 15, 15, 0, 0, 330, 20, 0, "red"));
			papis.push( new sprite("papi", 15, 15, 0, 0, 350, 20, 0, "red"));
			papis.push( new sprite("papi", 15, 15, 0, 0, 370, 20, 0, "red"));
			jumps = [];
			updateGame();

			//splash
			game.context.fillStyle = "#AAFFAA";
			game.context.fillRect(this.canvas.width * 0.2, this.canvas.height * 0.2, this.canvas.width * 0.6, this.canvas.height * 0.6);
			game.context.textAlign="center"; 
			
			game.context.font = "35px Impact";
			game.context.fillStyle = '#33AA33';
			game.context.fillText("papiJumP",this.canvas.width * 0.5,this.canvas.height * 0.3); 
			game.context.fillText("score "+this.score.toString(),this.canvas.width * 0.5,this.canvas.height * 0.6); 
			game.context.fillText("best "+this.bestScore.toString(),this.canvas.width * 0.5,this.canvas.height * 0.7); 
		},
		start : function() {
			score = 0;
			started = 1;
			this.time = 0;
			timer = setInterval(updateGame, 20);
			papis[0].toPlay()
			sound_start.play()
			spawnJump(100);
			spawnJump(150);
			spawnJump(200);
			spawnJump(250);
		},
		clear : function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},
		bestScore : 0,
		score : 0,
		scoreZone : function(number) {
			game.context.font = "25px Impact";
            game.context.fillStyle = "black";
			game.context.textAlign="start"; 
            game.context.fillText(number.toString(), 10, this.canvas.height * 0.98);
		},
		loose : function(){
			clearInterval(timer)
			this.clear()
			sound_loose.play()
			started = 0
			if (this.score > this.bestScore) this.bestScore = this.score;
			this.initGame()
		},
		startPapiJump :	function () {
			this.initArea();
			this.initGame();
			
		}
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
		

		//newposition then draw
		this.update = function() {
			
			//new position
			this.speedX = (this.speedX + this.gravityX) * (1 - frictionX)
			this.speedY = (this.speedY + this.gravityY) * (1 - frictionY)
			this.x = (this.x + this.speedX) % game.canvas.width;
			this.x += this.x<0 ? game.canvas.width : 0
			this.y += this.speedY;
			//this.comment = this.lastBounce.toString()
			if (this.type == "papi") {
				if (this.y > game.canvas.height - this.height) {
					papis.shift();
					if (papis.length == 0) {
						game.loose()
					}
					papis[0].toPlay();
					sound_loose1.play()
				}
				if (papis[0].height > 30)
					papis[0].height -= 0.01
				if (papis[0].width > 30)
					papis[0].width -= 0.01

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
			}
			else
				game.context.fillRect(this.x, this.y, this.width, this.height);
			
			this.comment = this.width.toString()+"  ("+jumpMinWidth.toString()+" ; "+jumpMaxWidth.toString()+" )"
			game.context.font = "10px Impact";
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
		var jumpOrangeProb = 0.1
		var jumpRedProb = 0.1
		//board falls faster and faster with score
		speed = Math.log(game.score + 1)/20 + 1

		jumpWidth = Math.floor(Math.random()*(jumpMaxWidth - jumpMinWidth + 1) +
				jumpMinWidth);
		jumpPos = Math.floor(Math.random() * (game.canvas.width - jumpWidth+1));
		if (Math.random() < jumpOrangeProb)
			jumps.push(new sprite("jump", jumpWidth, 10, 0, 1.8 * speed, jumpPos, height, 0,
				"orange"));
		else if (Math.random() < jumpRedProb)
			jumps.push(new sprite("jump", jumpWidth, 10, 0, 2.5 * speed, jumpPos, height, 0,
				"red"));
		else
			jumps.push(new sprite("jump", jumpWidth, 10, 0, 1.5 * speed , jumpPos, height, 0,
				"green"));
	}
	
	function updateGame() {
	    
		//process collisions
		for (i = 0; i < jumps.length; i += 1) {
			if (papis[0].collision(jumps[i]) && (game.time - jumps[i].lastBounce > 10 )) {
				jumps[i].lastBounce = game.time
				if (jumps[i].color == "orange") {
					papis[0].speedY = -4 -3*(papis[0].y/game.canvas.height)
					game.score += 2
					if (sound_bounce1.ended)
						sound_bounce1.play()
					else
						sound_bounce1.cloneNode(true).play()
				} else {
					papis[0].speedY = -2 -3*(papis[0].y/game.canvas.height)
					game.score += 1
					if (sound_bounce.ended)
						sound_bounce.play()
					else
						sound_bounce.cloneNode(true).play()
					// TODO: set up a setter
					if (jumps[i].color == "red") {
						jumps[i].color = "orange"
						if (Math.random() < 0.25) {
							//BIG PAPI
							papis[0].height = 60
							papis[0].width = 60
						} else if (Math.random() < 0.25) {
							//BIG JUMP BOARDS
							jumpMinWidth = 200
							jumpMaxWidth = 300
						}

						
					}
					
				}
			}
		}
		
		// draw
		game.clear();
		game.time += 1;
		for (i = 0; i < jumps.length; i += 1) jumps[i].update();
		
		//every 50 ticks, spawn a new jump board
		if (game.time == 1 || ((game.time / 50) % 1 == 0)) spawnJump(50)
		
		for (i = 0; i < papis.length; i += 1) papis[i].update();
		
		game.scoreZone(game.score);  
	}
	
