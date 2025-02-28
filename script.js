const imageInput = document.getElementById('imageInput');
const svgContainer = document.getElementById('svg-container');
const colorControls = document.getElementById('color-controls');
const errorMessage = document.getElementById('error-message');

imageInput.addEventListener('change', handleImage);

function handleImage(e) {
    const file = e.target.files[0];
    if (!file) {
        showError('ファイルが選択されていません。');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            processImage(img);
        };
        img.onerror = function() {
            showError('画像の読み込みに失敗しました。');
        };
        img.src = event.target.result;
    };

    reader.onerror = function() {
        showError('ファイルの読み込みに失敗しました。');
    };

    reader.readAsDataURL(file);
}

function processImage(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const potrace = window.Potrace.create();
    potrace.setParameters({
        threshold: 128,
        turdSize: 2,
        alphaMax: 1,
        optCurve: true,
        optTolerance: 0.2,
        turnPolicy: Potrace.TURNPOLICY_MINORITY
    });

    try {
        potrace.loadImageData(imageData);
        const svg = potrace.getSVG(1);

        svgContainer.innerHTML = svg;
        colorControls.innerHTML = '';

        const paths = svgContainer.querySelectorAll('path');
        paths.forEach((path, index) => {
            path.id = `path-${index}`;
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.id = `color-${index}`;
            colorInput.addEventListener('input', () => {
                path.style.fill = colorInput.value;
            });
            colorControls.appendChild(colorInput);
        });

        errorMessage.textContent = '';
    } catch (error) {
        showError('画像の処理中にエラーが発生しました: ' + error.message);
    }
}

function showError(message) {
    errorMessage.textContent = message;
    svgContainer.innerHTML = '';
    colorControls.innerHTML = '';
}
