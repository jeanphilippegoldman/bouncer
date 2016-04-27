
	document.onkeydown = function(e){
		
		if ((e.which == 76))
			game.level += 1 ; 		
		if ((e.which == 39))
			bouncers[0].gravityX = 0.5; 
		if ((e.which == 37))
			bouncers[0].gravityX = -0.5;
		if ((e.which == 13)||((e.which == 37)||(e.which == 39))&& (started==0)&&(!game.sleep)) {
			game.start();
		}
	}

	document.onkeyup = function(e){
		if ((e.which == 39))
			bouncers[0].gravityX = 0;
		if ((e.which == 37))
			bouncers[0].gravityX = 0;
		}

		

		
// mobile version
function UIMobile(){
	if(window.DeviceOrientationEvent) {
		window.addEventListener("deviceorientation", function(event) {
			gamma = Math.max(Math.min(event.gamma,90),-90)
			bouncers[0].gravityX = 0.5 * gamma/45
		}
		, false);
	} else {
		// Le navigateur ne supporte pas l'événement deviceorientation
	}

	document.getElementById("gameCanvas").addEventListener('touchstart', function(event) {
			game.start()
			}
		, false);
}