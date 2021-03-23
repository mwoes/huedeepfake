class ColorPicker {
	constructor(container, upCallback, type = ColorPicker.Radial, color = ColorPicker.Color, width = 230, height = 25, timeout = 50, countClockwise = false) {
		this.$container = container;
		this.$canvas = null;
		this.$indicator = null;
		this.$selectedColor = null;
		this.$listening = false;
		this.$wasListening = false;
		this.$indicatorListening = false;
		this.$color = '#ffffff';
		this.$timeout = timeout;
		this.$clock = null;
		this.$upCallback = upCallback;

		switch(type) {
			case 1:
				this.$createRadial(width, color, countClockwise);
				this.Canvas.addEventListener('mousedown', this.$mouseDownRadial.bind(this.Canvas, this));
				this.Canvas.addEventListener('touchstart', this.$mouseDownRadial.bind(this.Canvas, this));
				break;
			case 2:
				this.$createBar(width, height, color, countClockwise);
				this.Canvas.addEventListener('mousedown', this.$mouseDownBar.bind(this.Canvas, this));
				this.Canvas.addEventListener('touchstart', this.$mouseDownBar.bind(this.Canvas, this));
				break;
		}
		this.Indicator.addEventListener('mousemove', this.UpdateIndicator.bind(this.Indicator, this, type === 2));
		this.Indicator.addEventListener('touchmove', this.UpdateIndicator.bind(this.Indicator, this, type === 2));
		this.Indicator.addEventListener('mousedown', this.$mouseDownIndicator.bind(this.Indicator, this));
		this.Indicator.addEventListener('touchstart', this.$mouseDownIndicator.bind(this.Indicator, this));
		document.addEventListener('mouseup', this.$mouseUp.bind(document, this));
		document.addEventListener('touchend', this.$mouseUp.bind(document, this));
		this.Indicator.addEventListener('mouseup', this.$mouseUp.bind(this.Indicator, this));
		this.Indicator.addEventListener('touchend', this.$mouseUp.bind(this.Indicator, this));
	}

	$createRadial(size, color, counterClockwise) {
// 		let template = `<canvas></canvas>
// <div class="indicator">
// 	<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50" height="64" viewBox="0 0 25 32">
// 	<path fill="#ffffff" d="M12.528 0c-6.943 0-12.528 5.585-12.528 12.528 0 10.868 12.528 19.472 12.528 19.472s12.528-9.585 12.528-18.792c0-6.868-5.66-13.208-12.528-13.208zM12.528 21.434c-4.981 0-9.057-4.075-9.057-9.057s4.075-9.057 9.057-9.057 9.057 4.075 9.057 9.057-4.075 9.057-9.057 9.057z"></path>
// 	</svg>
// 	<span class="selected-color"></span>
// </div>`;
	let template = `<canvas></canvas>
<div class="indicator">
	<svg width="50" height="50" viewBox="0 0 50 50">
	<path fill="#ffffff" d="M25.1,0C11.4,0,0.3,11.1,0.3,24.8c0,13.7,11.1,24.7,24.7,24.7c13.7,0,24.7-11.1,24.7-24.7 C49.8,11.1,38.7,0,25.1,0z M25,42.9c-10,0-18.1-8.1-18.1-18.1C6.9,14.7,15,6.6,25,6.6s18.1,8.1,18.1,18.1C43.1,34.8,35,42.9,25,42.9 z"/>
	</svg>
	<span class="selected-color"></span>
</div>`;
		this.Container.innerHTML = template;
		this.Canvas = this.Container.querySelector('canvas');
		this.Indicator = this.Container.querySelector('.indicator');
		this.SelectedColor = this.Indicator.querySelector('.selected-color');

		this.Canvas.width = size;
		this.Canvas.height = size;

		let context = this.Canvas.getContext('2d');
		let x = size / 2;
		let y = size / 2;
		let radius = x;
		for (let angle = 0; angle <= 360; angle++) {
			let start = (angle - 2) * Math.PI / 180;
			let end = angle * Math.PI / 180;
			let gradient = context.createRadialGradient(x, y, 0, x, y, radius);
			if (color === 1) {
				gradient.addColorStop(0, 'hsl(' + angle + ', 10%, 100%)');
				gradient.addColorStop(1, 'hsl(' + angle + ', 100%, 50%)');
			} else if (color === 2) {
				//turn this to greyscale
				gradient.addColorStop(0, 'hsl(' + angle + ', 10%, 100%)');
				gradient.addColorStop(1, 'hsl(' + angle + ', 100%, 50%)');
			}

			context.beginPath();
			context.moveTo(x, y);
			context.arc(x, y, radius, start, end, counterClockwise);
			context.closePath();
			context.fillStyle = gradient;
			context.fill();
		}

		this.Canvas.addEventListener('mousemove', this.UpdateRadial.bind(this.Canvas, this));
		this.Canvas.addEventListener('touchmove', this.UpdateRadial.bind(this.Canvas, this));
	}

	$createBar(width, height, color, toLeft) {
		let template = `<canvas></canvas>
<div class="indicator" style="top: 40px; left: 98%;">
	<svg width="50" height="50" viewBox="0 0 50 50">
		<path fill="#ffffff" d="M25.1,0C11.4,0,0.3,11.1,0.3,24.8c0,13.7,11.1,24.7,24.7,24.7c13.7,0,24.7-11.1,24.7-24.7 C49.8,11.1,38.7,0,25.1,0z M25,42.9c-10,0-18.1-8.1-18.1-18.1C6.9,14.7,15,6.6,25,6.6s18.1,8.1,18.1,18.1C43.1,34.8,35,42.9,25,42.9 z"/>
	</svg>
	<span class="selected-color"></span>
</div>`;
		this.Container.innerHTML = template;
		this.Canvas = this.Container.querySelector('canvas');
		this.Indicator = this.Container.querySelector('.indicator');
		this.SelectedColor = this.Indicator.querySelector('.selected-color');

		this.Canvas.width = width;
		this.Canvas.height = height;

		let context = this.Canvas.getContext('2d');
		let gradient = context.createLinearGradient(0, 0, this.Canvas.width, 0);
		if (color === 1) {
			gradient.addColorStop(0.00, "hsl(0,100%,50%)");
			gradient.addColorStop(0.17, "hsl(298.8, 100%, 50%)");
			gradient.addColorStop(0.33, "hsl(241.2, 100%, 50%)");
			gradient.addColorStop(0.50, "hsl(180, 100%, 50%)");
			gradient.addColorStop(0.67, "hsl(118.8, 100%, 50%)");
			gradient.addColorStop(0.83, "hsl(61.2,100%,50%)");
			gradient.addColorStop(1.00, "hsl(360,100%,50%)");
		} else if (color === 2) {
			gradient.addColorStop(0.00, "hsl(0, 0%, 0%)");
			gradient.addColorStop(1.00, "hsl(0, 0%, 100%)");
		}
		context.fillStyle = gradient;
		context.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

		this.Canvas.addEventListener('mousemove', this.UpdateBar.bind(this.Canvas, this));
		this.Canvas.addEventListener('touchmove', this.UpdateBar.bind(this.Canvas, this));
	}

	get Container() { return this.$container; }

	get Canvas() { return this.$canvas; }
	set Canvas(val) { this.$canvas = val; }

	get Indicator() { return this.$indicator; }
	set Indicator(val) { this.$indicator = val; }

	get SelectedColor() { return this.$selectedColor; }
	set SelectedColor(val) { this.$selectedColor = val; }

	get IsListening() { return this.$listening; }
	set IsListening(val) { this.$listening = val; }

	get WasListening() { return this.$wasListening; }
	set WasListening(val) { this.$wasListening = val; }

	get HexColor() { return this.$color; }
	set HexColor(val) { this.$color = val; }

	get RgbColor() { return ColorPicker.ConvertToRgb(this.HexColor); }
	set RgbColor(rgb) { this.$color = ColorPicker.ConvertToHex(rgb.r, rgb.g, rgb.b); }

	$clockFunction(_this) {
		if (typeof _this.$upCallback === 'function') _this.$upCallback(_this);
		_this.$clock = setTimeout(function() { _this.$clockFunction(_this); }, _this.$timeout);
	}

	$mouseDownRadial(_this, e) {
		_this.IsListening = true;
		_this.$wasListening = true;
		_this.Indicator.style.pointerEvents = 'none';

		if (_this.$timeout !== 0)
			_this.$clock = setTimeout(function() { _this.$clockFunction(_this); }, _this.$timeout);

		let cx = (e.clientX) ? e.clientX : e.changedTouches[0].clientX;
		let cy = (e.clientY) ? e.clientY : e.changedTouches[0].clientY;
		let offset = _this.Canvas.getBoundingClientRect();
		let canvasX = Math.floor(cx - offset.left);
		let canvasY = Math.floor(cy - offset.top);
		_this.Update(canvasX, canvasY, true);
		if (typeof _this.$upCallback === 'function') _this.$upCallback(_this);
	}

	$mouseDownBar(_this, e) {
		_this.IsListening = true;
		_this.$wasListening = true;
		_this.Indicator.style.pointerEvents = 'none';

		if (_this.$timeout !== 0)
			_this.$clock = setTimeout(function() { _this.$clockFunction(_this); }, _this.$timeout);

		let cx = (e.clientX) ? e.clientX : e.changedTouches[0].clientX;
		let cy = _this.Canvas.height / 2;
		let offset = _this.Canvas.getBoundingClientRect();
		let canvasX = Math.floor(cx - offset.left);
		let canvasY = cy;
		_this.Update(canvasX, canvasY, false);
		if (typeof _this.$upCallback === 'function') _this.$upCallback(_this);
	}

	$mouseDownIndicator(_this, e) {
		_this.$indicatorListening = true;
		_this.$wasListening = true;
		_this.Indicator.classList.add('active');

		if (_this.$timeout !== 0)
			_this.$clock = setTimeout(function() { _this.$clockFunction(_this); }, _this.$timeout);

		let cx = (e.clientX) ? e.clientX : e.changedTouches[0].clientX;
		let cy = (e.clientY) ? e.clientY : e.changedTouches[0].clientY;
		let offset = _this.Canvas.getBoundingClientRect();
		let canvasX = Math.floor(cx - offset.left);
		let canvasY = Math.floor(cy - offset.top);
		_this.Update(canvasX, canvasY, true);
		if (typeof _this.$upCallback === 'function') _this.$upCallback(_this);
	}

	$mouseUp(_this, e) {
		clearTimeout(_this.$clock);

		_this.IsListening = false;
		_this.$indicatorListening = false;
		_this.Indicator.style.pointerEvents = 'all';
		_this.Indicator.classList.remove('active');
		if (_this.WasListening) {
			_this.WasListening = false;
			if (typeof _this.$upCallback === 'function') _this.$upCallback(_this);
		}
	}

	UpdateRadial(_this, e) {
		e.preventDefault();
		e.stopPropagation();
		if ((e.type === 'mousemove' || e.type === 'touchmove') && !_this.IsListening) return;

		let context = _this.Canvas.getContext('2d');
		let cx = (e.clientX) ? e.clientX : e.changedTouches[0].clientX;
		let cy = (e.clientY) ? e.clientY : e.changedTouches[0].clientY;
		let offset = _this.Canvas.getBoundingClientRect();
		let canvasX = Math.floor(cx - offset.left);
		let canvasY = Math.floor(cy - offset.top);

		_this.Update(canvasX, canvasY, true);
	}

	UpdateBar(_this, e) {
		e.preventDefault();
		e.stopPropagation();
		if ((e.type === 'mousemove' || e.type === 'touchmove') && !_this.IsListening) return;

		let context = _this.Canvas.getContext('2d');
		let cx = (e.clientX) ? e.clientX : e.changedTouches[0].clientX;
		let cy = _this.Canvas.height / 2;
		let offset = _this.Canvas.getBoundingClientRect();
		let canvasX = Math.floor(cx - offset.left);
		let canvasY = cy;

		_this.Update(canvasX, canvasY, false);
	}

	UpdateIndicator(_this, isBar, e) {
		e.preventDefault();
		e.stopPropagation();
		if ((e.type === 'mousemove' || e.type === 'touchmove') && !_this.$indicatorListening) return;
		let cx = (e.clientX) ? e.clientX : e.changedTouches[0].clientX;
		let cy = isBar ? _this.Canvas.height / 2 : (e.clientY) ? e.clientY : e.changedTouches[0].clientY;
		let offset = _this.Canvas.getBoundingClientRect();
		let canvasX = Math.floor(cx - offset.left);
		let canvasY = isBar ? cy : Math.floor(cy - offset.top);

		_this.Update(canvasX, canvasY, !isBar);
	}

	Update(x, y, adjustY) {
		let context = this.Canvas.getContext('2d');
		let imageData = context.getImageData(x, y, 1, 1);
		let pixel = imageData.data;

		if (!pixel[pixel.length - 1]) return;

		let dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
		this.HexColor = '#' + ('0000' + dColor.toString(16)).substr(-6);

		this.Indicator.style.left = x + 'px';
		//this.Indicator.style.top = adjustY ? y - 24 + 'px' : y * 2 + 'px';
        this.Indicator.style.top = adjustY ? y + 15 + 'px' : y * 1.6 + 'px';
		this.SelectedColor.style.backgroundColor = this.HexColor;
	}

	// Type definitions
	static get Radial() { return 1; }
	static get Bar() { return 2; }

	// Color definitions
	static get Color() { return 1; }
	static get Grey() { return 2; }

	static IntToHex(int) {
		let hex = int.toString('16');
		return hex.length == 1 ? '0' + hex : hex;
	}

	static ConvertToHex(r, g, b) {
		return '#' + r + g + b;
	}

	static ConvertToRgb(hexColor) {
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
		return result
			? 	{
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				}
			: 	null;
	}
}
