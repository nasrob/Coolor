// Global Selections and variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]'); // selecting certain type of inputs
const currentHexes = document.querySelectorAll(".color h2"); // select the h2 inside div of class color
const popupContainer = document.querySelector('.copy-container');
const adjsutButtons = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
const lockButtons = document.querySelectorAll('.lock');

let initialColors;

// saving in local storage
let savedPalettes = [];

// Event Listeners

generateBtn.addEventListener('click', randomColors);

sliders.forEach((slider) => {
    slider.addEventListener("input", hslControls);
});

//
colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
        updateTextUI(div);
    });
});

currentHexes.forEach(hex => {
    hex.addEventListener('click', () => { // arrow function to be able to pass hex as param 
        copyToClipBoard(hex);
    });
});

popupContainer.addEventListener('transitionend', () => {
    const popupBox = popupContainer.children[0];
    popupContainer.classList.remove('active');
    popupBox.classList.remove('active');
});

adjsutButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((button, index) => {
    button.addEventListener('click', () => {
        closeAdjustmentPanel(index);
    });
});

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
    initialColors = []; // reset on each page refrech
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0]; // get the h2 of the div
        const randomColor = generateHex();

        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText); // keeping the previous values if lock active
            console.log('IF LOCKED');
            return; // don't continue the fonction execution
        } else {
            initialColors.push(chroma(randomColor).hex());
        }

        // add the color to the div background
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        checkTextContrast(randomColor, hexText);
        // Initialize sliders colors
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hueSlider = sliders[0];
        const brightSlider = sliders[1];
        const saturationSlider = sliders[2];
        // console.log(saturationSlider);

        colorizeSliders(color, hueSlider, brightSlider, saturationSlider);
    });
    resetInputs();

    // check buttons contrast
    adjsutButtons.forEach((button, index) => {
        checkTextContrast(initialColors[index], button); // params : the generated color and the adjustbutton
        checkTextContrast(initialColors[index], lockButtons[index]); // second param : lock button of the div
    })

}

/**ckeck for contrast and adapt the text color */
function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hueSlider, brightSlider, saturationSlider) {
    // Scale Saturation
    const noSaturation = color.set("hsl.s", 0); // deaturate a color
    const fullSaturation = color.set("hsl.s", 1); // max saturation
    const saturationScale = chroma.scale([noSaturation, color, fullSaturation]);

    // Brightness Scale: it goes from black to white, we just need the mid bright using chroma
    const midBright = color.set("hsl.l", 0.5);
    const brightScale = chroma.scale(["black", midBright, "white"]);

    // Update Input Colors (the slider)
    saturationSlider.style.backgroundImage = `linear-gradient(to right, ${saturationScale(0)}, ${saturationScale(1)})`;
    brightSlider.style.backgroundImage = `linear-gradient(to right,  ${brightScale(0)}, ${brightScale(0.5)}, ${brightScale(1)})`;
    // for hue slider it ranges between the basic colors here in rgb values
    hueSlider.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(event) {
    const index =
        event.target.getAttribute("data-bright") ||
        event.target.getAttribute("data-sat") ||
        event.target.getAttribute("data-hue");
    let sliders = event.target.parentElement.querySelectorAll(
        'input[type="range"]'
    );
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index]; // the color reference on which the change will occur
    let color = chroma(bgColor)
        .set("hsl.s", saturation.value)
        .set("hsl.l", brightness.value)
        .set("hsl.h", hue.value);

    colorDivs[index].style.backgroundColor = color;
    colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(div) {
    const color = chroma(div.style.backgroundColor);
    const textHex = div.querySelector("h2");
    const icons = div.querySelectorAll(".controls button");
    textHex.innerText = color.hex();
    checkTextContrast(color, textHex);
    for (const icon of icons) {
        checkTextContrast(color, icon);
    }
}

function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach((slider) => {
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if (slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;
        }
        if (slider.name === "saturation") {
            const satColor = initialColors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
        }
    });
}

function copyToClipBoard(hex) {
    const textArea = document.createElement('textarea');
    textArea.value = hex.innerText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    // popup animation
    const popupBox = popupContainer.children[0];
    popupBox.classList.add('active');
    popupContainer.classList.add('active');

}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove('active');
}

// Save Palettes in local Storage
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libraryBtn.addEventListener('click', openLibraryPopUp);
closeLibraryBtn.addEventListener('click', closeLibraryPopUp);


function openPalette(event) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(event) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(event) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });
    // generate palette object
    let paletteNbmr = savedPalettes.length;
    const paletteObj = {
        name,
        colors,
        number: paletteNbmr
    };
    savedPalettes.push(paletteObj);
    // saving in local storage
    saveToLocal(paletteObj);
    saveInput.value = '';
    // generate palette for Library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;

    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.number);
    paletteBtn.innerText = 'Select';

    paletteBtn.addEventListener('click', event => {
        closeLibraryPopUp();
        const paletteIndex = event.target.classList[1]; // get the second class of the paletteBtn
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => { // for each color from the selected palette
            initialColors.push(color);
            // console.log(colorDivs[index]);
            colorDivs[index].style.backgroundColor = color; // reset the color of the div from the library
            const text = colorDivs[index].children[0]; // reset the color text (name)
            checkTextContrast(color, text);
            updateTextUI(colorDivs[index]);
        });
        resetInputs();
    });

    // append to Library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
    let localPalettes;
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function openLibraryPopUp(event) {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibraryPopUp(event) {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getColorsFromLocal() {
    // let localPalettes;
    if (localStorage.getItem('palettes') === null) {
        localStorage = [];
    } else {
        const paletteObjcts = JSON.parse(localStorage.getItem('palettes'));
        paletteObjcts.forEach(paletteObj => {
            // generate palette for Library
            const palette = document.createElement('div');
            palette.classList.add('custom-palette');
            const title = document.createElement('h4');
            title.innerText = paletteObj.name;

            const preview = document.createElement('div');
            preview.classList.add('small-preview');
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });
            const paletteBtn = document.createElement('button');
            paletteBtn.classList.add('pick-palette-btn');
            paletteBtn.classList.add(paletteObj.number);
            paletteBtn.innerText = 'Select';

            paletteBtn.addEventListener('click', event => {
                closeLibraryPopUp();
                const paletteIndex = event.target.classList[1]; // get the second class of the paletteBtn
                initialColors = [];
                paletteObjcts[paletteIndex].colors.forEach((color, index) => { // for each color from the selected palette
                    initialColors.push(color);
                    // console.log(colorDivs[index]);
                    colorDivs[index].style.backgroundColor = color; // reset the color of the div from the library
                    const text = colorDivs[index].children[0]; // reset the color text (name)
                    checkTextContrast(color, text);
                    updateTextUI(colorDivs[index]);
                });
                resetInputs();
            });
            // append to Library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        })

    }
}

localStorage.clear();

getColorsFromLocal();
randomColors();