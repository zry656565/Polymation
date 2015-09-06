var Sobel = require('sobel/sobel');

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var image = new Image();
image.src = '../images/apple.jpg';
image.onload = drawImage;

function drawImage(event) {
    var w = image.width;
    var h = image.height;

    canvas.width = w;
    canvas.height = h;

    context.drawImage(image, 0, 0);
    var imageData = context.getImageData(0, 0, w, h);

    var sobelImageData = Sobel(imageData);
    context.putImageData(sobelImageData, 0, 0);
}