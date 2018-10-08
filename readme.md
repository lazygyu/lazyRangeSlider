Lazy Range Slider
=================

This is a simple slider control that supports multiple knobs. You can use this for variable number of knobs.

## Usage

### without jQuery
```html
<div id="slider" data-min="10" data-max="100" data-sliders="3" data-name="range"></div>
<div id="log"></div>
<script type="text/javascript" src="lazyslider.js"></script>
<script>
	var logger = document.querySelector('#log');
	var slider = LazySlider.parse("#slider");
	slider.on('change', function(values){
		logger.innerHTML = values.join(',');
	});
</script>
```

### with jQuery
```html
<div id="slider" data-min="10" data-max="100" data-sliders="3" data-name="range"></div>
<script type="text/javascript" src="lazyslider.js"></script>
<script>
	var logger = $("#logger");
	$("#slider").lazySlider().on('change', function(values){
		logger.text(values.join(','));
	});
</script>
```

### use the constructor
```html
<div id="slider'></div>
<script type="text/javascript" src="lazyslider.js"></script>
<script>
	var slider = new LazySlider({
		elem:'#slider',
		min:0,
		max:100,
		sliderCount:4,
		name:'level',
		values:[0, 5, 10]
		});
</script>
```

## Options

### `elem` or an argument of LazySlider.parse

A original element of the slider. The slider will created and inserted before this.

### `min` or `data-min` attribute

Minimum value of the slider. Default is 0.

### `max` or `data-max` attribute

Maximum value of the slider. Default is 100.

### `sliderCount` or `data-sliders` attribute

Count of knobs. Default is 3.

### `name` or `data-name` attribute

A value of `name` attribute for each `<input>` element. This slider creates hidden inputs for each knob. So you can use this slider in a form to action without any additional job. Default is 'slide'. This slider add '[]' to each inputs name automatically.

## Methods

### LazySlider.parse(element|selector)

Make a slider with provided element. If the argument is not a html element, this method try to parse the argument to an css selector.

### slider.on(eventName, callback)

Add an event listener to an event.

### slider.get()

Get values array.

### $(...).lazySlider()

A wrapper of `LazySlider.parse` for jQuery.

### $(...).on(eventName, callback)

A wrapper of `slider.on` for jQuery.

### $(...).lazySlider('values')

A wrapper of `slider.get` for jQuery.

## Events

### change

Occurs when a value changed. The argument of callback is an array of values.

## Styling

```
+------------- div.ls-container ----------+
|====O===============O=============O======|
+-----------------------------------------+
```

O : div.ls-thumb

==== : div.ls-range

Each thumb or range element has numeric class. `ex) div.ls-thumb.no1, div.ls-thumb.no2, ....`

And the first and last things have `first` and `last` class.
