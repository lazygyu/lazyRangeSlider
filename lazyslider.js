(function(){
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
	this.defaultValues = [];

	if( params.values && params.values.length > 0 ){
		for(var i = 0, l = params.values.length;i<l;i++){
			this.defaultValues[i] = params.values[i]|0;
			console.log('default value : ' + params.values[i]);
		}
	}

	this.ranges = [];

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
			tmp.style.zIndex = 2;
			tmp.classList.add('no' + (i+1));
			var tIn = cel("input", {"type":"hidden", "name":(this.name || 'slider') + "[]", value:""});
			this.container.appendChild(tmp);
			this.sliders.push(tmp);
			this.inputs.push(tIn);
			this.slideValues[i] = 0;
		}
		this.sliders[0].classList.add('first');
		this.sliders[this.sliders.length-1].classList.add('last');

		for(var i=0;i<this.sliderCount+1;i++){
			var tmp = cel("div", {"data-order":i}, "ls-range");
			tmp.style.position = "absolute";
			tmp.style.zIndex = 1;
			tmp.classList.add('no' + (i+1));
			this.ranges.push(tmp);
			this.container.appendChild(tmp);
		}

		this.ranges[0].classList.add('first');
		this.ranges[this.ranges.length-1].classList.add('last');


		for(var i=0;i<this.sliderCount;i++){
			this.container.appendChild(this.inputs[i]);
		}



		var avr = (this.max - this.min) / (this.sliderCount -1);
		this.slideValues[this.sliderCount-1] = (this.defaultValues[this.sliderCount-1]||this.max);
		this.slideValues[0] = (this.defaultValues[0] || this.min);
		var last = this.slideValues[0];
		for(var i = 1; i < this.sliderCount - 1; i++){
			this.slideValues[i] = (this.defaultValues[i] || ((i * avr) + this.min)|0);
			if( this.slideValues[i] < last ) throw Error("Wrong default value");
			last = this.slideValues[i];
		}

		this.el.style.display = "none";
		this.el.parentNode.insertBefore(this.container, this.el);

		this.container.addEventListener('mousedown', this.mousedownHandler.bind(this), false);
		this.render();
	},
	render:function(){
		var lefts = [0];
		for(var i = 0; i < this.sliderCount; i++){
			var sl = this.sliders[i];
			var left = ((((this.slideValues[i] - this.min) / (this.max - this.min)) * 100));
			lefts.push(left);
			sl.style.left = ((((this.slideValues[i] - this.min) / (this.max - this.min)) * 100)) + "%";
			this.inputs[i].value = this.slideValues[i] | 0;
		}
		lefts.push(100);

		for(var i=0;i<this.sliderCount+1;i++){
			var rg = this.ranges[i];
			rg.style.left = lefts[i] + '%';
			rg.style.width = (lefts[i+1] - lefts[i]) + '%';
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
	},
	get(){
		return this.sliderValues;
	}
}

LazySlider.parse = function(el){
	var tar = typeof el === "string" ? document.querySelector(el) : el;
	var min = parseInt(tar.getAttribute('data-min'),10) || 0;
	var max = parseInt(tar.getAttribute('data-max'),10) || 100;
	var name = tar.getAttribute('data-name') || 'slide';
	var sliderCount = parseInt(tar.getAttribute('data-sliders'),10) || 2;
	var values = (tar.getAttribute('data-values') || '').split(',');
	
	return new LazySlider({
		elem:tar,
		min:min, max:max, sliderCount:sliderCount, name:name, values:values
	});
}

if(window){
	window.LazySlider = LazySlider;
}

if( jQuery ){
	(function(){
		var sliderList = [];
		jQuery.fn.lazySlider = function(params){
			return $(this).each(function(){
				if( typeof params === "string" ){
					if( $(this).data('slider') ){
						switch(params){
							case "values":
								var sl = $(this).data('slider');
								return sl.get();
								break;
						}
					}
				}else{
					var slider = LazySlider.parse(this);
					$(this).data('slider', slider);
					var that = this;
					slider.on("change", function(values){
						$(that).trigger("change", [values]);
					});
					sliderList.push(slider);
				}
			});
		}
	})();
}
})();
