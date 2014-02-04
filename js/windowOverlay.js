// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
      || window[vendors[x]+'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());

(function(wo){
  var d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = window.innerWidth || e.clientWidth || g.clientWidth,
    y = window.innerHeight|| e.clientHeight|| g.clientHeight;

  function getMousePos(canvas, evt) {
    return {
      x: evt.clientX - canvas.getBoundingClientRect().left - d.documentElement.scrollLeft,
      y: evt.clientY - canvas.getBoundingClientRect().top - d.documentElement.scrollTop
    };
  }

  function clearCircle(context, x, y, radius) {
    context.save();
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fill();
    context.restore();
  }

  function fillCircle(context, x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fill();
  }

  function fillCircleAnimated(context, x, y, radius, color, forwards, length, callback) {
    var circ = Math.PI * 2,
      curPerc = 0,
      self = this;

    self.animate = function(current){
      context.clearRect(0, 0, (2*radius), (2*radius));
      context.lineWidth = 10;
      context.strokeStyle = color;
      context.beginPath();

      if(forwards){
        context.arc(x, y, radius-5, 0, (circ*current), false);
      } else {
        context.arc(x, y, radius-5, 0, circ-(circ*current), false);
      }

      context.stroke();
      context.closePath();
      curPerc++;

      window.requestAnimationFrame(function () {
        if(curPerc <= length){
          self.animate(curPerc / length);
        } else {
          if(typeof callback == 'function'){
            callback();
          }
        }
      } );
    };

    self.animate(curPerc);
  }

  wo.create = function(transSize, color, borderWidth, borderColor){
    var cover = document.getElementById('cover'),
      outline = document.getElementById('outline'),
      tooltip = document.getElementById('tooltip'),
      tWidth = parseInt(window.getComputedStyle(tooltip,null).getPropertyValue('width'), 10),
      tHeight = parseInt(window.getComputedStyle(tooltip,null).getPropertyValue('height'), 10);


//    document.body.appendChild(outline);
//    document.body.appendChild(cover);

    var prevMousePos,
      currentMousePos,
      cCtx = cover.getContext('2d'),
      oCtx = outline.getContext('2d');

    var anchors = document.getElementsByTagName('a');

    cover.width = x;
    cover.height = y;
    cCtx.fillStyle = color;
    cCtx.fillRect(0, 0, cover.width, cover.height);

    outline.width = (2*transSize);
    outline.height = (2*transSize);
    oCtx.fillStyle = '#fff';


    document.body.addEventListener('mousemove', function(e) {
      prevMousePos = currentMousePos ? currentMousePos : getMousePos(cover, e);
      currentMousePos = getMousePos(cover, e);

      outline.style.left = currentMousePos.x-transSize-(transSize/10)+'px';
      outline.style.top = currentMousePos.y-transSize-(transSize/10)+'px';

      tooltip.style.left = currentMousePos.x+transSize-5+'px';
      tooltip.style.top = currentMousePos.y-(tHeight/2)-5+'px';

      fillCircle(cCtx, prevMousePos.x-(transSize/10), prevMousePos.y-(transSize/10), transSize+2, color);
      clearCircle(cCtx, currentMousePos.x-(transSize/10), currentMousePos.y-(transSize/10), transSize);
    }, false);

    for(var i = 0, len = anchors.length; i < len; i++) {
      anchors[i].addEventListener('mouseover', function() {
        var elm = this;
        fillCircleAnimated(oCtx, (outline.width/2), (outline.height/2), transSize, borderColor, true, 15, function(){
          oCtx.fillRect((outline.width/2), 0, outline.width, outline.height);
          clearCircle(oCtx, (outline.width/2), (outline.height/2), transSize-10);

          tooltip.innerHTML = elm.getAttribute('data-tooltip');
          tooltip.style.display = 'block';
        });
      });

      anchors[i].addEventListener('mouseout',function () {
        fillCircleAnimated(oCtx, (outline.width/2), (outline.height/2), transSize, borderColor, false, 15);
        tooltip.innerHTML = '';
        tooltip.style.display = 'none';
      });
    }

  };

}(this.windowOverlay = this.windowOverlay || {}));