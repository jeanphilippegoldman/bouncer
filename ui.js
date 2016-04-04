
	document.onkeydown = function(e){
		
		if ((e.which == 39))
			papis[0].gravityX = 0.5; 
		if ((e.which == 37))
			papis[0].gravityX = -0.5;
		if ((e.which == 13)||((e.which == 37)||(e.which == 39))&& (started==0)) {
			game.start();
		}
	}

	document.onkeyup = function(e){
		if ((e.which == 39))
			papis[0].gravityX = 0;
		if ((e.which == 37))
			papis[0].gravityX = 0;
		}
