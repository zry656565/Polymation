var Delaunay = require("delaunay-fast/delaunay");
var Sobel = require('sobel/sobel');

var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');

var image = new Image();
image.src = '../images/apple.jpg';
image.onload = drawImage;

function drawImage(event) {
    var w, h, vertices = [];

    canvas.width = w = image.width;
    canvas.height = h = image.height;

    context.drawImage(image, 0, 0);
    var imageData = context.getImageData(0, 0, w, h);

    var edge = Sobel(imageData, true); // result of edge detect

    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            if (edge[y][x] > 150) {
                vertices.push([x, y]);
            }
        }
    }

    console.time("triangulate");
    var triangles = Delaunay.triangulate(vertices);
    console.timeEnd("triangulate");

    for(var i = triangles.length; i; ) {
        context.beginPath();
        --i; context.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        --i; context.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        --i; context.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        context.closePath();
        context.stroke();
    }
}