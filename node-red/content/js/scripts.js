const LightProps = {
    on: false,
    color: 'ffffff',
    intensity: 1
};
let LightBulbEl = null;
let LightBulbTop = null;
let C = null;
let B = null;
const hue = {
    "xy": 0,
    brightness: 0,
    xyJSON: null,
    briJSON: null,
    "on": false,
    rgb: [0, 0, 0]
};

socket.on('power', function(lightOn) {
  hue.on = lightOn;
  LightProps.on = lightOn;
  console.log(lightOn);
});

function setDefaults() {
    if (typeof Globals === undefined) window.Globals = {
        Debug: false,
        DeviceName: 'Neo',
        LEDChannel: '00',
        onOffSpeed: '0190',
        ColorPoll: 10
    };

    LightBulbEl = document.getElementById('lightbulb-el');
    LightBulbTop = document.getElementById('lightbulb-top');

    C = new ColorPicker(
        document.querySelector('.color-picker-radial'),
        function(_this) {
            let hex = _this.HexColor;
            let color = hex.replace('#', '');
            LightProps.color = color;
            if(hue.on) { commandLight(); };
            if (Globals.Debug) console.log(`Color: ${color}`);
        },
        ColorPicker.Radial,
        ColorPicker.Color,
        230,
        230,
        Globals.ColorPoll
    );

    let slider = document.querySelector('.color-slider');
    B = new ColorPicker(
        slider,
        function(_this) {
            let hex = _this.HexColor;
            let intensity = parseInt(hex.replace('#', '').substr(-2), 16) / 255;
            LightProps.intensity = intensity;
            if(hue.on) { commandLight(); };
            if (Globals.Debug) console.log(`Intensity: ${intensity}`);
        },
        ColorPicker.Bar,
        ColorPicker.Grey,
        slider.offsetWidth,
        slider.offsetHeight,
        Globals.ColorPoll
    );

}

function commandLight(fade) {
        let r = ('0' + Math.floor(parseInt(LightProps.color.substr(0,2), 16) * LightProps.intensity).toString(16)).slice(-2);
        let g = ('0' + Math.floor(parseInt(LightProps.color.substr(2,2), 16) * LightProps.intensity).toString(16)).slice(-2);
        let b = ('0' + Math.floor(parseInt(LightProps.color.substr(4,2), 16) * LightProps.intensity).toString(16)).slice(-2);
        let white = '00';
        let color = `${r}${g}${b}${white}`;
        if (Globals.Debug) console.log(`Sending to light: #${color.substr(0, 6)}`);
        LightBulbTop.style.fill = '#' + color.substr(0, 6);
	hue.rgb = hexToRgb(`${r}${g}${b}`);
    socket.emit('command', hue.rgb);
}

function hexToRgb(hex) {
	return ['0x' + hex[0] + hex[1] | 0, '0x' + hex[2] + hex[3] | 0, '0x' + hex[4] + hex[5] | 0];
}

function rgb_to_cie(red, green, blue) {
    var x = null
    var y = null
	//Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device
	var red 	= (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
	var green 	= (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
	var blue 	= (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92); 

	//RGB values to XYZ using the Wide RGB D65 conversion formula
	var X 		= red * 0.664511 + green * 0.154324 + blue * 0.162028;
	var Y 		= red * 0.283881 + green * 0.668433 + blue * 0.047685;
	var Z 		= red * 0.000088 + green * 0.072310 + blue * 0.986039;

	//Calculate the xy values from the XYZ values
	var x 		= parseFloat((X / (X + Y + Z)).toFixed(4));
	var y 		= parseFloat((Y / (X + Y + Z)).toFixed(4));

	if (isNaN(x))
		x = 0;

	if (isNaN(y))
		y = 0;	 


	return [x,y];
}

function hueBri(inten) {
    return (inten * 255);
}

function toggleLight(e) {
    if (!hue.on) { turnOnHue(); };
    if (hue.on) { turnOffHue(); };
}

function turnOnHue() {
  if (Globals.Debug) console.log(`IsOn: ${LightProps.on}`);
  LightBulbEl.classList.remove('off');
  C.Indicator.setAttribute('style', '');
  C.SelectedColor.setAttribute('style', '');
  B.Indicator.setAttribute('style', 'top: 40px; left: 98%;');
  B.SelectedColor.setAttribute('style', '');
  LightProps.color = 'ffffff';
  LightProps.intensity = 1;
  LightBulbTop.style.fill = '';
  socket.emit('commandPWR', ["on", hue.rgb]);
  hue.rgb = [255, 255, 255];
}

function turnOffHue() {
  socket.emit('commandPWR', ["off", hue.rgb]);
  hue.rgb = [0, 0, 0];
  if (Globals.Debug) console.log(`IsOn: ${LightProps.on}`);
  C.Indicator.setAttribute('style', '');
  C.SelectedColor.setAttribute('style', '');
  B.Indicator.setAttribute('style', 'top: 40px; left: 98%;');
  B.SelectedColor.setAttribute('style', '');
  LightProps.color = 'ffffff';
  LightProps.intensity = 1;
  LightBulbTop.style.fill = '';
  LightBulbEl.classList.add('off');
}

function bind() {
    document.getElementById('cb1').addEventListener('change', toggleLight);
}

setDefaults();
bind();

