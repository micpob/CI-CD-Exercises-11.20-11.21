function openingAnimation() {
  let keepDrawing = true;
  let readyToEnd = false;
  let startingCirclePosition = 0 - r;
  let animationCircle = new Shape (startingCirclePosition, canvas.height / 2, r);
  animationCircle.speedX = 1;

  let fontSize = canvas.width * 0.18;
  let ctxFontProperties = fontSize + 'px' + ' ChawP';
  let word1CurrentPosition = 0 - fontSize;
  let word1EndPosition = (canvas.height / 2) - fontSize;
  let word2CurrentPosition = canvas.height + fontSize;
  let word2EndPosition = (canvas.height / 2) + fontSize * 1.75;

  function drawWord(word, yPosition) {
    ctx.font = ctxFontProperties;
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText(word, canvas.width/2, yPosition);
  }

  let generalDraw = setInterval (function() {

    if (keepDrawing) {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      //Word 1 drawing
      if (word1CurrentPosition < word1EndPosition) {
      	drawWord('ZEN', word1CurrentPosition);
        word1CurrentPosition += canvas.width * 0.025;
      } else {
        drawWord('ZEN', word1EndPosition);
      }

      //YinYang circle drawing
		  if (animationCircle.x < canvas.width * 0.55 && animationCircle.speedX > 0) {
        animationCircle.speedX += canvas.width * 0.003;
        animationCircle.x += animationCircle.speedX;
        animationCircle.draw();
      } else {
        animationCircle.speedX = 0;
        animationCircle.draw();
        if (readyToEnd === false) {
          readyToEnd = true;
          setTimeout(function(){animationCircle.x = canvas.width / 2; animationCircle.draw()}, 750);
          setTimeout(function(){keepDrawing = false;}, 1200);
        }
      }

      //Word 2 drawing
      if (word2CurrentPosition > word2EndPosition) {
        drawWord('TER', word2CurrentPosition);
        word2CurrentPosition -= canvas.width * 0.021;
      } else {
        drawWord('TER', word2EndPosition);
      }

    } else {
      clearInterval(generalDraw);
      drawBlueCircle();
      //setTimeout(drawBlueCircle, 600);
    }

  }, 20);

}


function drawBlueCircle () {

  let maskRadius = canvas.width * 0.75;
  let strokeUnit = (maskRadius - r) / 100;
  let count = 0;

  let drawCenterCircle = setInterval(function(){
    maskRadius = maskRadius - strokeUnit;
    if (count < 100) {
      ctx.lineWidth = strokeUnit / 2; //This is cutted in half to achieve the "vinyl" look of the mask area. remove "/ 2" to have a solid look.
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(centerXPosition, centerYPosition, maskRadius, 0, 2 * Math.PI);
      ctx.stroke();
      count++;
    } else {
      clearInterval(drawCenterCircle);
      setTimeout(drawClosingcircle, 1000);
    }

  }, 10);
}

function drawClosingcircle () {

  let stopDrawing = false;

  let progressiveRadius = 1;
  let count = 0;
  let strokeUnit = (canvas.width * 0.75) / 100;
  //this circle drawing is necessary to cover the dot that stays in the center in Chrome
  ctx.lineWidth = strokeUnit + 1;
  ctx.strokeStyle = 'green';
  ctx.beginPath();
  ctx.arc(centerXPosition, centerYPosition, 3, 0, 2 * Math.PI);
  ctx.stroke();

  let drawCenterCircleOut = setInterval(function(){

    if (count < 100) {
      ctx.arc(centerXPosition, centerYPosition, progressiveRadius, 0, 2 * Math.PI);
      ctx.stroke();
      progressiveRadius += strokeUnit;
      count++;
    } else {
      if (stopDrawing === false) {
        stopDrawing = true;
        clearInterval(drawCenterCircleOut);
        clickToStart();
        const buttonScoreboard = document.getElementById('show_scores');
        buttonScoreboard.addEventListener('click', showScoreboard);
        const containerScoreboard = document.getElementById('container_scoreboard');
        containerScoreboard.addEventListener('click', showScoreboard);
      }
    }
  }, 10);

}

setNewRecordThreshold()