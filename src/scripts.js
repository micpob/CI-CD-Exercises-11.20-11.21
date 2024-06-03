/* eslint-disable indent */
let averageScore;
const thermometerBar = document.getElementById('gray_bar');
const containerCanvas = document.getElementById('container_canvas');
const scoreboard = document.getElementById('container_scoreboard');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let dpi = window.devicePixelRatio;
let centerXPosition = canvas.width / 2;
let centerYPosition = canvas.height / 2;

let r; //radius
let s;  //canvas state
let yinYangCircle;
let roundTimer;
let roundSecondsLeft = 5;
let roundCount = 0;
const containerRoundInfo = document.getElementById('container_round_info');
const roundWord = document.getElementById('round_word');
const roundNumber = document.getElementById('round_number');
const progressiveRoundResult = document.getElementById('progressive_round_result');
let totalSumOfResults = 0;
let clickToStartFlashingMessage = null;

const arrowButtons = document.querySelectorAll('#container_arrows button');
const leftArrowButton = document.getElementById('left_arrow');
const upArrowButton = document.getElementById('up_arrow');
const rightArrowButton = document.getElementById('right_arrow');
const downArrowButton = document.getElementById('down_arrow');

function convertToRomanNumeral(number) {
  switch (number){
  case 1: return 'I';
  case 2: return 'II';
  case 3: return 'III';
  case 4: return 'IV';
  case 5: return 'V';
  default: return '';
  }
}

function fix_dpi() {
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  canvas.width = canvas.width * dpi;
  canvas.height = canvas.height * dpi;
// Normalize coordinate system to use css pixels.
//ctx.scale(scale, scale);
}

const debounce = (func, delay) => {
  let debounceTimer
  return function() {
    const context = this
    const args = arguments
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => func.apply(context, args), delay)
  }
};

function resizeCanvas() {

  if (containerCanvas.offsetWidth <= containerCanvas.offsetHeight) {
    canvas.width = containerCanvas.offsetWidth * 0.9;
    canvas.height = canvas.width;
  } else {
    canvas.width = containerCanvas.offsetHeight * 0.9;
    canvas.height = canvas.width;
  }
  progressiveRoundResult.style.fontSize = canvas.width * 0.11 + 'px';
  progressiveRoundResult.style.bottom = (containerCanvas.offsetHeight - canvas.height) / 2 + 'px';
  containerScoreboard.style.width = canvas.width + 'px';
  containerScoreboard.style.height = canvas.width + 'px';
  containerNewRecord.style.width = canvas.width + 'px';
  containerNewRecord.style.height = canvas.width + 'px';
  fix_dpi();

  r = canvas.width * 0.13;
  if (yinYangCircle) {
    yinYangCircle.r = r;
  }
  if (s) {
    s.valid = false;
    s.draw();
  }
  centerXPosition = canvas.width / 2;
  centerYPosition = canvas.height / 2;
}

window.addEventListener('resize', debounce(resizeCanvas, 250));

function Shape (x, y, r) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.speedX = 0;
  this.speedY = 0;
  this.newPos = function() {
    this.x += this.speedX;
    this.y += this.speedY;
  	this.speedX = 0;
    this.speedY = 0;
  }

  this.moveLeft = function() {
    this.speedX -= 0.5;
  }

  this.moveUp = function() {
    this.speedY -= 0.5;
  }

  this.moveRight = function() {
    this.speedX += 0.5;
  }

  this.moveDown = function() {
    this.speedY += 0.5;
  }
}

Shape.prototype.changePosition = function() {
  this.x += this.speedX;
  this.y += this.speedY;

  if (this.x > (canvas.width - this.r)) this.x = (canvas.width - this.r);

  if (this.x < this.r) this.x = this.r;

  if (this.y > (canvas.height - this.r)) this.y = canvas.height - this.r;

  if (this.y < this.r) this.y = this.r;

  this.speedX = 0;
  this.speedY = 0;
}

function drawCircle(x, y, r, startAngle, endAngle, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, startAngle, endAngle);
  ctx.fill();
}

Shape.prototype.draw = function() {
  //big white circle
  drawCircle(this.x, this.y, this.r, 0, 2 * Math.PI, 'white')
  //big black half circle
  drawCircle(this.x, this.y, this.r, 1.5 * Math.PI, 0.5 * Math.PI, 'black')
  //medium white cricle
  drawCircle(this.x, this.y + (this.r/2), this.r/2, 0, 2 * Math.PI, 'white')
  //medium black circle
  drawCircle(this.x, this.y - (this.r/2), this.r/2, 0, 2 * Math.PI, 'black')
  //small white circle
  drawCircle(this.x, this.y - (this.r/2), this.r/6, 0, 2 * Math.PI, 'white')
  //small black circle
  drawCircle(this.x, this.y + (this.r/2), this.r/6, 0, 2 * Math.PI, 'black')
}

Shape.prototype.contains = function(mx, my) {
  return Math.pow((mx - this.x), 2) + Math.pow((my - this.y), 2) <= Math.pow(r, 2);
}

function startGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let randomXaxisPosition = Math.floor(Math.random() * (canvas.width - r));
  let randomYaxisPosition = Math.floor(Math.random() * (canvas.height - r));
  yinYangCircle = new Shape (randomXaxisPosition, randomYaxisPosition, r);

  s = new CanvasState(canvas);
	  s.addShape(yinYangCircle);
  roundCount++;
  roundNumber.innerHTML = convertToRomanNumeral(roundCount);
  roundWord.style.visibility = 'visible';
  roundTimer = setInterval(gameTimeManagement, 1000);

  thermometerBar.style.transition = 'all 5s linear';
  thermometerBar.style.webkitTransition = 'all 5s linear';
  if (window.matchMedia('(orientation: landscape)').matches) {
    thermometerBar.style.minHeight = '100%';
  } else {
    thermometerBar.style.minWidth = '100%';
  }

}

function gameTimeManagement() {
  if (roundSecondsLeft > 1) {
    roundSecondsLeft--;
  } else {
    clearInterval(roundTimer);
    stopGame();
  }
}

function CanvasState(canvas) {

  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;
  this.ctx = canvas.getContext('2d');

  // This complicates things a little but but fixes mouse co-ordinate problems
  // when there's a border or padding. See getMouse for more detail
  //var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
  }
  // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
  // They will mess up mouse coordinates and this fixes that
  var html = document.body.parentNode;
  this.htmlTop = html.offsetTop;
  this.htmlLeft = html.offsetLeft;

  // **** Keep track of state! ****

  this.valid = false; // when set to false, the canvas will redraw everything
  this.shapes = [];  // the collection of things to be drawn
  this.dragging = false; // Keep track of when we are dragging
  // the current selected object. In the future we could turn this into an array for multiple selection
  this.selection = null;
  this.dragoffx = 0; // See mousedown and mousemove events for explanation
  this.dragoffy = 0;

  // **** Then events! ****

  // This is an example of a closure!
  // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
  // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
  // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
  // This is our reference!
  var myState = this;
  let pressed = false;
  let keepPressing;
  let isLong = false;
  let acceleration;

  function moveYinYangCircle(e) {
    if (pressed === true || s === null || s.shapes[0] === undefined) {
      return;
    }

    pressed = true;
    let direction;

    if (e.keyCode) {
      switch (e.keyCode) {
      case 37:
        leftArrowButton.classList.add('arrowButtonActive');
        leftArrowButton.focus();
        direction = 'left';
        s.shapes[0].moveLeft();
        break;
      case 38:
        upArrowButton.classList.add('arrowButtonActive');
        upArrowButton.focus();
        direction = 'up';
        s.shapes[0].moveUp();
        break;
      case 39:
        rightArrowButton.classList.add('arrowButtonActive');
        rightArrowButton.focus();
        direction = 'right';
        s.shapes[0].moveRight();
        break;
      case 40:
        downArrowButton.classList.add('arrowButtonActive');
        downArrowButton.focus();
        direction = 'down';
        s.shapes[0].moveDown();
        break
      default:
        return;
      }
    } else {
      e.target.classList.add('arrowButtonActive');
      switch(e.target.id) {
      case 'left_arrow':
        direction = 'left';
        s.shapes[0].moveLeft();
        break;
      case 'up_arrow':
        direction = 'up';
        s.shapes[0].moveUp();
        break;
      case 'right_arrow':
        direction = 'right';
        s.shapes[0].moveRight();
        break;
      case 'down_arrow':
        direction = 'down';
        s.shapes[0].moveDown();
      }
    }
    myState.valid = false;
    isLong = false;
    keepPressing = setTimeout(function() {
      if (pressed === true) longPress(direction);
    }, 350);

  }

  function stopMovingYinYangCircle(e) {

    if (e.keyCode) {
      if (e.keyCode !== 37 && e.keyCode !== 38 && e.keyCode !== 39 && e.keyCode !== 40) {
        return;
      }
    }

    for (let i = 0; i < arrowButtons.length; i++) {
  		arrowButtons[i].classList.remove('arrowButtonActive');
  		}

    clearTimeout(keepPressing);
    pressed = false;
    if (isLong) {
	  clearInterval(acceleration);
    }

  }

  function longPress(direction) {

    isLong = true;
    let i = 0;

    acceleration = setInterval(function(){
	  if (s.shapes[0]) {
	  switch(direction) {
        case 'left':
          s.shapes[0].speedX -= i;
          s.shapes[0].moveLeft();
          break;
        case 'up':
          s.shapes[0].speedY -= i;
          s.shapes[0].moveUp();
          break;
        case 'right':
          s.shapes[0].speedX += i;
          s.shapes[0].moveRight();
          break;
        case 'down':
          s.shapes[0].speedY += i;
          s.shapes[0].moveDown();
        }
  	  myState.valid = false;
	  i++;

      }

	  }, 50);
  }

  leftArrowButton.addEventListener('pointerdown', moveYinYangCircle);
  upArrowButton.addEventListener('pointerdown', moveYinYangCircle);
  rightArrowButton.addEventListener('pointerdown', moveYinYangCircle);
  downArrowButton.addEventListener('pointerdown', moveYinYangCircle);

  leftArrowButton.addEventListener('pointerup', stopMovingYinYangCircle);
  upArrowButton.addEventListener('pointerup', stopMovingYinYangCircle);
  rightArrowButton.addEventListener('pointerup', stopMovingYinYangCircle);
  downArrowButton.addEventListener('pointerup', stopMovingYinYangCircle);

  window.addEventListener('pointerup', stopMovingYinYangCircle);

  window.addEventListener('keydown', moveYinYangCircle);
  window.addEventListener('keyup', stopMovingYinYangCircle);


  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
  // Up, down, and move are for dragging
  canvas.addEventListener('pointerdown', selectCircle, true);

  function selectCircle(e) {
    var pointer = myState.getMouse(e);
    var mx = pointer.x * dpi;
    var my = pointer.y * dpi;
    var shapes = myState.shapes;
    var l = shapes.length;

    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].contains(mx, my)) {
        var mySel = shapes[i];
        // Keep track of where in the object we clicked
        // so we can move it smoothly (see mousemove)
        myState.dragoffx = mx - mySel.x;
        myState.dragoffy = my - mySel.y;
        myState.dragging = true;
        myState.selection = mySel;
        myState.valid = false;
        return;
      }
    }
    // havent returned means we have failed to select anything.
    // If there was an object selected, we deselect it
    if (myState.selection) {
      myState.selection = null;
      myState.valid = false; // Need to clear the old selection border
    }
  }

  canvas.addEventListener('pointermove', dragCircle, true);

  function dragCircle(e) {
    e.preventDefault();
    if (myState.dragging){
      var pointer = myState.getMouse(e);
      // We don't want to drag the object by its top-left corner, we want to drag it
      // from where we clicked. Thats why we saved the offset and use it here
      myState.selection.x = pointer.x * dpi - myState.dragoffx;
      myState.selection.y = pointer.y * dpi - myState.dragoffy;
      myState.valid = false; // Something's dragging so we must redraw
    }
  }

  window.addEventListener('pointerup', function(e) {myState.dragging = false}, true);
  setInterval(function() { myState.draw() }, 20);
}

CanvasState.prototype.addShape = function(shape) {
  this.shapes.push(shape);
  this.valid = false;
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {

  // if our state is invalid, redraw and validate!
  if (!this.valid) {
	  this.ctx.clearRect(0, 0, this.width, this.height);
    yinYangCircle.changePosition();
    yinYangCircle.draw();
    this.valid = true;
  }
}
// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }
  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar
  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  if (e.pageX !== undefined) {
    mx = (e.pageX - offsetX);
    my = (e.pageY - offsetY);
  } else {
    mx = e.touches[0].pageX - offsetX;
    my = e.touches[0].pageY - offsetY;
  }

  // We return a simple javascript object (a hash) with x and y defined
  return { x: mx, y: my };
}

function stopGame() {
  s.pressed = false;
  s.valid = true; // when set to false, the canvas will redraw everything
  s.shapes = [];  // the collection of things to be drawn
  s.dragging = false; // Keep track of when we are dragging
  // the current selected object. In the future we could turn this into an array for multiple selection
  s.selection = null;
  s.dragoffx = 0; // See mousedown and mousemove events for explanation
  s.dragoffy = 0;
  //Calculate accuracy of yinYangCircle position in relation to perfectly centered circle
  let accuracy = Math.round(areaOfIntersection(centerXPosition, centerYPosition, yinYangCircle.x, yinYangCircle.y, r) * 10) / 10;
  //Prepare animated drawing of perfectly centered circle
  let accuracyUnit = accuracy / 100;
  let result = 0;
  let maskRadius = canvas.width * 0.75;
  let strokeUnit = (maskRadius - r) / 100;
  let count = 0;
  let resultAccuracy;

  progressiveRoundResult.style.display = 'block';
  //The area to paint is divided in 100 units, each unit is a circle. Circles are painted progressively and the radius is reduced by strokeUnit value at any painting.
  //Accuracy result is updated each time a circle is painted
  let drawCenterCircle = setInterval(function(){
    maskRadius = maskRadius - strokeUnit;
    if (count < 100) {
      //Draw blu circle
      ctx.lineWidth = strokeUnit / 2; //This is cutted in half to achieve the "vinyl" look of the mask area. remove "/ 2" to have a solid look.
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(centerXPosition, centerYPosition, maskRadius, 0, 2 * Math.PI);
      ctx.stroke();
      //Progressive result on chalkboard
      result = result + accuracyUnit;
      resultAccuracy = Math.round(result* 10) / 10 + ' %';
      if (result > 0) { //If accuracy is 0% progression in setting result can't be shown. Wait for drawing process to end before showing result.
        progressiveRoundResult.innerHTML = resultAccuracy;
      }
      count++;

    } else {
      clearInterval(drawCenterCircle);
      progressiveRoundResult.innerHTML = accuracy + ' %'; //At the end of the drawing process set the final result to Accuracy value. Necessary in case the result is 0 and we don't want to show it before the end of the drawing animation.
      totalSumOfResults += accuracy;
      roundSecondsLeft = 5;
      if (roundCount < 5) {
        let nextRound = 'Round ' + (roundCount + 1);
        setTimeout(zoomOut, 1500, nextRound);
      } else {
        averageScore = Math.round((totalSumOfResults / 5) * 10) / 10;
        totalSumOfResults = 0;
        const finalResult = 'Total: '+ averageScore + ' %';
        setTimeout(zoomOut, 2000, finalResult);
      }
    }
	}, 10);

}

function zoomOut(text) {
  let progressiveRadius = 1;
  count = 0;
  strokeUnit = (canvas.width * 0.75) / 100;

  //this circle drawing is necessary to cover the dot that stays in the center of the canvas in Chrome
  ctx.lineWidth = strokeUnit + 1;
  ctx.strokeStyle = 'green';
  ctx.beginPath();
  ctx.arc(centerXPosition, centerYPosition, 3, 0, 2 * Math.PI);
  ctx.stroke();

  let drawCenterCircleOut = setInterval(function(){

    if (count < 100) {
      if (progressiveRadius > r * 2 && progressiveRadius <= (r * 2 + strokeUnit)) {
		    ctx.beginPath();
        let ctxFontProperties = canvas.width * 0.09 + 'px' + ' impact';
        ctx.font = ctxFontProperties;
        ctx.fillStyle = 'yellow';
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        thermometerBar.style.transition = 'none';
        thermometerBar.style.webkitTransition = 'none';
        if (window.matchMedia('(orientation: landscape)').matches) {
          thermometerBar.style.minHeight = '0';
        } else {
          thermometerBar.style.minWidth = '0';
        }
        progressiveRoundResult.style.display = 'none';
        progressiveRoundResult.innerHTML = '';
      }
      ctx.arc(centerXPosition, centerYPosition, progressiveRadius, 0, 2 * Math.PI);
      ctx.stroke();
      progressiveRadius += strokeUnit;
      count++;
    } else {
      clearInterval(drawCenterCircleOut);
      if (roundCount === 5) {
        roundNumber.innerHTML = '';
        roundWord.style.visibility = 'hidden';
        s = null;
        averageScore >= newRecordThreshold ? checkForNewRecord() : setTimeout(clickToStart, 2000);
      } else {
        startGame();
      }
    }
  }, 10);
}

function areaOfIntersection(x0, y0, x1, y1, r) {
  let rr = r * r;
  let d = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));

  // Circles do not overlap at all
  if (d > (r * 2))
  {
    return 0;
  }

  // Circles perfectly overlap
  else if (d === 0)
  {
    return 100;
  }

  // Circles partially overlap
  else {
    let phi = (Math.acos((rr + (d * d) - rr) / (2 * r * d))) * 2;
    let theta = (Math.acos((rr + (d * d) - rr) / (2 * r * d))) * 2;
    let area1 = 0.5 * theta * rr - 0.5 * rr * Math.sin(theta);
    let area2 = 0.5 * phi * rr - 0.5 * rr * Math.sin(phi);

    // Return area of intersection % over total circle area
    return ((area1 + area2) * 100) / (Math.PI * rr);
  }
}

function clickToStart() {
  roundCount = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let tainted = false;
  clickToStartFlashingMessage = setInterval( () => {
    let ctxFontProperties = canvas.width * 0.09 + 'px' + ' Impact';
    ctx.font = ctxFontProperties;
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    if (tainted === true) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        tainted = false;
    } else {
    ctx.fillText('Click to start', canvas.width/2, canvas.height/2);
        tainted = true;
    }
  }, 750);

  canvas.addEventListener('click', () => {
    if (roundCount === 0) {
      clearInterval(clickToStartFlashingMessage);
      clickToStartFlashingMessage = null;
      startGame();
    }
  });
}

resizeCanvas();