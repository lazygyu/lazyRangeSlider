function cel(tagName, attrs, classes, text){
  var t = document.createElement(tagName);
  if( attrs ){
    for(var i in attrs){
      if( attrs.hasOwnProperty(i) ) t.setAttribute(i, attrs[i]);
    }
  }
  if( classes ){
    if( typeof classes === "string" ){
      t.className = classes;
    }else{
      t.className = classes.join(' ');
    }
  }
  if( text !== undefined ){
    t.innerHTML = text;
  }
  return t;
}



function LazySlider(params) {
    this.el = params.elem || null;
    if( typeof(this.el) === "string" ) this.el = document.querySelector(this.el);
    this.min = params.min || 0;
    this.max = params.max || 100;
    this.name = params.name || 'slide';
    this.sliderCount = params.sliderCount || 2;
    this.container = null;
    this.sliders = [];
    this.slideValues = [];
    this.inputs = [];
    this.currentDrag = null;
    this.dragOriginalValue = null;
    this.dragStart = {x:0};

    this._mouseup = this.mouseupHandler.bind(this);
    this._drag = this.dragHandler.bind(this);

    this.handlers = {};

    this.mount();
  }
LazySlider.prototype = {
  on:function(eventName, cb){
    if( !this.handlers[eventName] ) this.handlers[eventName] = [];
    this.handlers[eventName].push(cb);
  },
  emit:function(eventName, params){
    if( this.handlers[eventName] ){
      for(var i = 0;i<this.handlers[eventName].length;i++){
        var cb = this.handlers[eventName][i];
        cb(params);
      }
    }
  },
  mount:function(){
    this.container = cel("div", null, "ls-container");
    this.container.style.position = "relative";
    for(var i = 0; i < this.sliderCount; i++){
      var tmp = cel("div", {'data-number': i}, "ls-thumb");
      tmp.style.position = "absolute";
      var tIn = cel("input", {"type":"hidden", "name":(this.name || 'slider') + "[]", value:""});
      this.container.appendChild(tmp);
      this.sliders.push(tmp);
      this.inputs.push(tIn);
      this.slideValues[i] = 0;
    }
    for(var i=0;i<this.sliderCount;i++){
      this.container.appendChild(this.inputs[i]);
    }

    var avr = (this.max - this.min) / (this.sliderCount -1);
    this.slideValues[this.sliderCount-1] = this.max;
    this.slideValues[0] = this.min;
    for(var i = 1; i < this.sliderCount - 1; i++){
      this.slideValues[i] = ((i * avr) + this.min)|0;
    }
    this.el.style.display = "none";
    this.el.parentNode.insertBefore(this.container, this.el);

    this.container.addEventListener('mousedown', this.mousedownHandler.bind(this), false);
    this.render();
  },
  render:function(){
    for(var i = 0; i < this.sliderCount; i++){
      var sl = this.sliders[i];
      var left = ((((this.slideValues[i] - this.min) / (this.max - this.min)) * 100));
      sl.style.left = ((((this.slideValues[i] - this.min) / (this.max - this.min)) * 100)) + "%";
      this.inputs[i].value = this.slideValues[i] | 0;
    }
  },
  mousedownHandler:function(e){
    e.preventDefault();
    var idx = e.target.getAttribute('data-number');
    if( idx === null || idx === undefined ) return;
    this.currentDrag = parseInt(idx, 10);
    this.dragOriginalValue = parseInt(this.slideValues[idx], 10);
    this.dragStart.x = e.pageX;
    this.container.classList.add('sliding');
    document.addEventListener("mouseup", this._mouseup, false);
    document.addEventListener("mousemove", this._drag, {capture:true});
  },
  mouseupHandler:function(e){
    this.container.classList.remove('sliding');
    this.currentDrag = null;
    this.dragOriginalValue = null;
    document.removeEventListener("mouseup", this._mouseup, false);
    document.removeEventListener("mousemove", this._drag, {capture:true});
  },
  dragHandler:function(e){
    e.preventDefault();
    var dx = e.pageX - this.dragStart.x;
    var ratio = (this.max - this.min)/this.container.clientWidth;
    dx *= ratio;
    var v = parseInt(this.dragOriginalValue,10) + dx;
    if( this.currentDrag === 0 ){
      // limit minimum
      v = Math.max(v, this.min);
    }
    if( this.currentDrag === this.sliderCount - 1){
      // limit maximum
      v = Math.min(v, this.max);
    }
    // v must grater than the previous slide and lesser than the next slide
    if( this.currentDrag > 0 ){
      v = Math.max(this.slideValues[this.currentDrag - 1], v);
    }
    if( this.currentDrag < this.sliderCount - 1 ){
      v = Math.min(this.slideValues[this.currentDrag + 1], v);
    }
    this.slideValues[this.currentDrag] = v|0;
    this.render();
    if( dx !== 0 ){
      this.emit("change", this.slideValues);
    }
  }
}

LazySlider.parse = function(el){
  var tar = typeof el === "string" ? document.querySelector(el) : el;
  var min = parseInt(tar.getAttribute('data-min'),10) || 0;
  var max = parseInt(tar.getAttribute('data-max'),10) || 100;
  var name = tar.getAttribute('data-name') || 'slide';
  var sliderCount = parseInt(tar.getAttribute('data-sliders'),10) || 2;
  return new LazySlider({
    elem:tar,
    min:min, max:max, sliderCount:sliderCount, name:name
  });
}

if( jQuery ){
  (function(){
    var sliderList = [];
    jQuery.fn.lazySlider = function(params){
      return $(this).each(function(){
        var slider = LazySlider.parse(this);
        var that = this;
        slider.on("change", function(values){
          $(that).trigger("change", [values]);
        });
        sliderList.push(slider);
      });
    }
  })();
}
