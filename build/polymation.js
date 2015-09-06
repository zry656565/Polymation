/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Sobel = __webpack_require__(1);

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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	(function(root) {
	  'use strict';

	  function Sobel(imageData) {
	    if (!(this instanceof Sobel)) {
	      return new Sobel(imageData);
	    }

	    var w = imageData.width;
	    var h = imageData.height;

	    var kernelX = [
	      [-1,0,1],
	      [-2,0,2],
	      [-1,0,1]
	    ];

	    var kernelY = [
	      [-1,-2,-1],
	      [0,0,0],
	      [1,2,1]
	    ];

	    var sobelData = [];
	    var grayscaleData = [];

	    function bindPixelAt(data) {
	      return function(x, y, i) {
	        i = i || 0;
	        return data[((w * y) + x) * 4 + i];
	      };
	    }

	    var data = imageData.data;
	    var pixelAt = bindPixelAt(data);
	    var x, y;

	    for (y = 0; y < h; y++) {
	      for (x = 0; x < w; x++) {
	        var r = pixelAt(x, y, 0);
	        var g = pixelAt(x, y, 1);
	        var b = pixelAt(x, y, 2);
	        var a = pixelAt(x, y, 3);

	        var avg = (r + g + b) / 3;
	        grayscaleData.push(avg, avg, avg, 255);
	      }
	    }

	    pixelAt = bindPixelAt(grayscaleData);

	    for (y = 0; y < h; y++) {
	      for (x = 0; x < w; x++) {
	        var pixelX = (
	            (kernelX[0][0] * pixelAt(x - 1, y - 1)) +
	            (kernelX[0][1] * pixelAt(x, y - 1)) +
	            (kernelX[0][2] * pixelAt(x + 1, y - 1)) +
	            (kernelX[1][0] * pixelAt(x - 1, y)) +
	            (kernelX[1][1] * pixelAt(x, y)) +
	            (kernelX[1][2] * pixelAt(x + 1, y)) +
	            (kernelX[2][0] * pixelAt(x - 1, y + 1)) +
	            (kernelX[2][1] * pixelAt(x, y + 1)) +
	            (kernelX[2][2] * pixelAt(x + 1, y + 1))
	        );

	        var pixelY = (
	          (kernelY[0][0] * pixelAt(x - 1, y - 1)) +
	          (kernelY[0][1] * pixelAt(x, y - 1)) +
	          (kernelY[0][2] * pixelAt(x + 1, y - 1)) +
	          (kernelY[1][0] * pixelAt(x - 1, y)) +
	          (kernelY[1][1] * pixelAt(x, y)) +
	          (kernelY[1][2] * pixelAt(x + 1, y)) +
	          (kernelY[2][0] * pixelAt(x - 1, y + 1)) +
	          (kernelY[2][1] * pixelAt(x, y + 1)) +
	          (kernelY[2][2] * pixelAt(x+1,y+1))
	        );

	        var magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY))>>0;

	        sobelData.push(magnitude, magnitude, magnitude, 255);
	      }
	    }

	    return new ImageData(new Uint8ClampedArray(sobelData), w, h);
	  }

	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = Sobel;
	    }
	    exports.Sobel = Sobel;
	  } else if (typeof define === 'function' && define.amd) {
	    define([], function() {
	      return Sobel;
	    });
	  } else {
	    root.Sobel = Sobel;
	  }

	})(this);


/***/ }
/******/ ]);