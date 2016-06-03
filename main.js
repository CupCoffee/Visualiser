var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var bars = [];
var fftSize = 32;

var spectrums = [
	['red', 'orange'],
	['orange', 'yellow'],
	['yellow', 'green'],
	['green', 'blue'],
	['blue', 'indigo'],
	['indigo', 'violet']
]

document.addEventListener("keypress", function(e) {
	if (e.keyCode == 100) {
		camera.position.set(camera.position.x + 1, camera.position.y, camera.position.z)
	} else {
		if (e.keyCode == 97) {
			camera.position.set(camera.position.x - 1, camera.position.y, camera.position.z)
		}
	}
})

var rainbow = new Rainbow();
rainbow.setNumberRange(0, Math.floor(fftSize / spectrums.length));

var currentSpectrum = 0;

for(var i = 0; i < fftSize; i++) {
	if (spectrums.length % i == 0) {
		currentSpectrum++;
		rainbow.setSpectrum(spectrums[currentSpectrum][0], spectrums[currentSpectrum][1]);
	}

	// var rainbow = spectrums.length % fftSize == 0
	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var material = new THREE.MeshBasicMaterial({
	    color: new THREE.Color('#' + rainbow.colourAt(Math.floor(i / spectrums.length))).getHex()
	});

	var bar = new THREE.Mesh(geometry, material);
	bar.position.set(i + (1 * i), 0, 0);

	scene.add(bar);

	bars[i] = bar;
}


function degInRad(deg) {
    return deg * Math.PI / 180;
}

function mean(arr) { // it's ok to use short variable names in short, simple functions
    // set all variables at the top, because of variable hoisting
    var i,
        sum = 0, // try to use informative names, not "num"
        len = arr.length; // cache arr.length because accessing it is usually expensive
    for (i = 0; i < len; i++) { // arrays start at 0 and go to array.length - 1
        sum += arr[i]; // short for "sum = sum + arr[i];"
    } // always use brackets. It'll save you headaches in the long run
    // don't mash your computation and presentation together; return the result.
    return sum / len;
}

camera.position.x = fftSize;
camera.position.z = 25;

var i = 0;

var ctx = new AudioContext();

var audio = document.createElement('audio');
audio.crossOrigin = "anonymous";
audio.src = "https://p.scdn.co/mp3-preview/ad6aa086a54e6faca9694e304337d586e0145815";

var audioSrc = ctx.createMediaElementSource(audio);
var analyser = ctx.createAnalyser();

// we have to connect the MediaElementSource with the analyser
audioSrc.connect(analyser);
audioSrc.connect(ctx.destination);

// we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)
// frequencyBinCount tells you how many values you'll receive from the analyser
var frequencyData = new Uint8Array(analyser.frequencyBinCount);

analyser.getByteFrequencyData(frequencyData);

var j = 0;
function render() {
    renderer.render(scene, camera);
}


function update() {
    requestAnimationFrame(update);

	// update data in frequencyData
    analyser.getByteFrequencyData(frequencyData);

	for(var i = 0; i < bars.length; i++) {
		var bar = bars[i];
		bar.scale.set(bar.scale.x, (frequencyData[i] / 8) - ((frequencyData[i] / 8) /2) , bar.scale.z);
	}

    // render frame based on values in frequencyData
	render();
}

audio.addEventListener("play", function() {
	update();
});

render();
audio.play();
