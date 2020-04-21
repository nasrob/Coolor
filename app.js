// Global Selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('generate');
const sliders = document.querySelectorAll('input[type="range"]'); // selecting certain type of inputs
const currentHexes = document.querySelectorAll('.color h2'); // select the h2 inside div of class color
let initialColors;

// Event Listeners
sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
})


// Functions

/*
generate a color without chromaJs

function generateHex() {
    const letters = '#0123456789ABCDEF';
    let hash = '#';
    for (let i = 0; i < 6; i++) {
        hash += letters[Math.floor(Math.random() * 16)];
    }
    return hash;
}
*/

// generate a hexCode using chroma
function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}


/** generates random colors at doc ready */
function randomColors() {
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0]; // get the h2 of the div
        const randomColor = generateHex();
        // add the color to the div background
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        checkTextContrast(randomColor, hexText);
        // Initialize sliders colors
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hueSlider = sliders[0];
        const brightSlider = sliders[1];
        const saturationSlider = sliders[2];
        // console.log(saturationSlider);

        colorizeSliders(color, hueSlider, brightSlider, saturationSlider);

    });
}

/**ckeck for contrast and adapt the text color */
function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = 'black';
    } else {
        text.style.color = 'white';
    }
}

function colorizeSliders(color, hueSlider, brightSlider, saturationSlider) {
    // Scale Saturation
    const noSaturation = color.set('hsl.s', 0); // deaturate a color
    const fullSaturation = color.set('hsl.s', 1); // max saturation
    const saturationScale = chroma.scale([noSaturation, color, fullSaturation]);

    // Brightness Scale: it goes from black to white, we just need the mid bright using chroma 
    const midBright = color.set('hsl.l', 0.5);
    const brightScale = chroma.scale(['black', midBright, 'white']);


    // Update Input Colors (the slider)
    saturationSlider.style.backgroundImage = `linear-gradient(to right, ${saturationScale(0)}, ${saturationScale(1)})`;
    brightSlider.style.backgroundImage = `linear-gradient(to right,  ${brightScale(0)}, ${brightScale(0.5)}, ${brightScale(1)})`;
    // for hue slider it ranges between the basic colors here in rgb values
    hueSlider.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;

}

function hslControls(event) {
    const index = event.target.getAttribute('data-bright') || event.target.getAttribute('data-sat') || event.target.getAttribute('data-hue');
    let sliders = event.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = colorDivs[index].querySelector('h2').innerText;
    let color = chroma(bgColor)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
        .set('hsl.h', hue.value);
    // console.log(color);
    colorDivs[index].style.backgroundColor = color;
}


randomColors();