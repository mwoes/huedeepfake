const LightProps = {
    on: false,
    color: 'ffffff',
    intensity: 1
};
const ExplorePages = [];
const NavItems = [];
let LightBulbEl = null;
let LightBulbTop = null;
let C = null;
let B = null;


function setDefaults() {
    if (typeof Globals === undefined) window.Globals = {
        Debug: false,
        DeviceName: 'Neo',
        LEDChannel: '00',
        onOffSpeed: '0190',
        ColorPoll: 10
    };

    let expgs = document.querySelectorAll('section');
    for (let e of expgs) {
        ExplorePages.push(e);
    }

    let nis = document.querySelectorAll('nav > *');
    for (let n of nis) {
        NavItems.push(n);
    }

    LightBulbEl = document.getElementById('lightbulb-el');
    LightBulbTop = document.getElementById('lightbulb-top');

    C = new ColorPicker(
        document.querySelector('.color-picker-radial'),
        function(_this) {
            let hex = _this.HexColor;
            let color = hex.replace('#', '');
            LightProps.color = color;
            commandLight();
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
            commandLight();
            if (Globals.Debug) console.log(`Intensity: ${intensity}`);
        },
        ColorPicker.Bar,
        ColorPicker.Grey,
        slider.offsetWidth,
        slider.offsetHeight,
        Globals.ColorPoll
    );

    //getChannel();
}
/*
function getChannel() {
    try { return KioGPIOBoard.CmdHex("0B 01 0C15", Globals.DeviceName); }
    catch(err) {
        if (Globals.Debug) console.log(err);
        return '01';
    }
}*/

function sendCommand(val, f) {
    let fade = f !== null && f !== undefined ? f : (val === '00000000' ? '0000' : '0000');
	let command = val;
    if (Globals.Debug) console.log(`Sending Command: ${command}`);
    try {
        if (window.KioGPIOBoard)
            KioGPIOBoard.CmdHex(command, Globals.DeviceName);
    }
    catch(err) {
        if (Globals.Debug) console.log(err);
    }
}

function commandLight(fade) {
    if (LightProps.on && LightProps.intensity !== 0) {
        let r = ('0' + Math.floor(parseInt(LightProps.color.substr(0,2), 16) * LightProps.intensity).toString(16)).slice(-2);
        let g = ('0' + Math.floor(parseInt(LightProps.color.substr(2,2), 16) * LightProps.intensity).toString(16)).slice(-2);
        let b = ('0' + Math.floor(parseInt(LightProps.color.substr(4,2), 16) * LightProps.intensity).toString(16)).slice(-2);
        let white = '';
        let color = `${r}${g}${b}${white}`;
        if (Globals.Debug) console.log(`Sending to light: ${color}`);
        LightBulbEl.classList.remove('off');
        LightBulbTop.style.fill = '#' + color.substr(0, 6);
        sendCommand(color, fade);
		let rgb = hexToRgb(color);
  	  	if (Globals.Debug) console.log(`Sending to rgb: ${rgb}`);
		let cie = rgb_to_cie(rgb[0],rgb[1],rgb[2]);
		if (Globals.Debug) console.log(`Send to cie: ${cie}`);
		return;
    }

    LightBulbTop.style.fill = '';
    LightBulbEl.classList.add('off');
    sendCommand('000000', fade);
}

function hexToRgb(hex) {
	return ['0x' + hex[0] + hex[1] | 0, '0x' + hex[2] + hex[3] | 0, '0x' + hex[4] + hex[5] | 0];
}

function rgb_to_cie(red, green, blue) {
	//Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device
	var red 	= (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
	var green 	= (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
	var blue 	= (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92); 

	//RGB values to XYZ using the Wide RGB D65 conversion formula
	var X 		= red * 0.664511 + green * 0.154324 + blue * 0.162028;
	var Y 		= red * 0.283881 + green * 0.668433 + blue * 0.047685;
	var Z 		= red * 0.000088 + green * 0.072310 + blue * 0.986039;

	//Calculate the xy values from the XYZ values
	var x 		= (X / (X + Y + Z)).toFixed(4);
	var y 		= (Y / (X + Y + Z)).toFixed(4);

	if (isNaN(x))
		x = 0;

	if (isNaN(y))
		y = 0;	 


	return [x, y];
}

function getExplorePageById(id) {
    return ExplorePages.filter(page => page.id === id)[0];
}

function showExplorePage(page) {
    hideAllExplorePage();
    page.classList.add('active');
}

function hideAllExplorePage() {
    for (let e of ExplorePages) {
        e.classList.remove('active');
    }
}

function navigateExplore(e) {
    let target = this.getAttribute('data-target');
    if (target === 'close') {
        hideAllExplorePage();
        return;
    }
    let page = getExplorePageById('explore-' + target);
    showExplorePage(page);
}

function navigateNav(e) {
    let target = this.getAttribute('data-target');
    if (target.indexOf('explore-') >= 0) {
        let page = getExplorePageById(target);
        showExplorePage(page);
    }
}

function toggleLight(e) {
    LightProps.on = !LightProps.on;
    if (Globals.Debug) console.log(`IsOn: ${LightProps.on}`);
    if (!LightProps.on) resetUI();
    let fade = Globals.onOffSpeed;
    commandLight(fade);
}

function resetUI() {
    C.Indicator.setAttribute('style', '');
    C.SelectedColor.setAttribute('style', '');
    B.Indicator.setAttribute('style', 'top: 40px; left: 98%;');
    B.SelectedColor.setAttribute('style', '');

    LightProps.color = 'ffffff';
    LightProps.intensity = 1;
}

function bind() {
    for (let e of ExplorePages) {
        let buttons = e.querySelectorAll('[data-target]');
        for (let b of buttons) {
            b.addEventListener('click', navigateExplore);
        }
    }
    for (let n of NavItems) {
        if (n.getAttribute('data-target') && n.getAttribute('data-target') !== '')
            n.addEventListener('click', navigateNav);
    }
    document.getElementById('cb1').addEventListener('change', toggleLight);
}

(function() {
    setDefaults();
    bind();
})();
