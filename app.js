// Global Selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('generate');
const sliders = document.querySelectorAll('input[type="range"]'); // selecting certain type of inputs
const currentHexes = document.querySelectorAll('.color h2'); // select the h2 inside div of class color
let initialColors;


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

randomColors();