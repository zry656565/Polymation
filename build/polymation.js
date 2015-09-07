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

	var Delaunay = __webpack_require__(1);
	var Sobel = __webpack_require__(2);

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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Delaunay;

	(function() {
	  "use strict";

	  var EPSILON = 1.0 / 1048576.0;

	  function supertriangle(vertices) {
	    var xmin = Number.POSITIVE_INFINITY,
	        ymin = Number.POSITIVE_INFINITY,
	        xmax = Number.NEGATIVE_INFINITY,
	        ymax = Number.NEGATIVE_INFINITY,
	        i, dx, dy, dmax, xmid, ymid;

	    for(i = vertices.length; i--; ) {
	      if(vertices[i][0] < xmin) xmin = vertices[i][0];
	      if(vertices[i][0] > xmax) xmax = vertices[i][0];
	      if(vertices[i][1] < ymin) ymin = vertices[i][1];
	      if(vertices[i][1] > ymax) ymax = vertices[i][1];
	    }

	    dx = xmax - xmin;
	    dy = ymax - ymin;
	    dmax = Math.max(dx, dy);
	    xmid = xmin + dx * 0.5;
	    ymid = ymin + dy * 0.5;

	    return [
	      [xmid - 20 * dmax, ymid -      dmax],
	      [xmid            , ymid + 20 * dmax],
	      [xmid + 20 * dmax, ymid -      dmax]
	    ];
	  }

	  function circumcircle(vertices, i, j, k) {
	    var x1 = vertices[i][0],
	        y1 = vertices[i][1],
	        x2 = vertices[j][0],
	        y2 = vertices[j][1],
	        x3 = vertices[k][0],
	        y3 = vertices[k][1],
	        fabsy1y2 = Math.abs(y1 - y2),
	        fabsy2y3 = Math.abs(y2 - y3),
	        xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

	    /* Check for coincident points */
	    if(fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
	      throw new Error("Eek! Coincident points!");

	    if(fabsy1y2 < EPSILON) {
	      m2  = -((x3 - x2) / (y3 - y2));
	      mx2 = (x2 + x3) / 2.0;
	      my2 = (y2 + y3) / 2.0;
	      xc  = (x2 + x1) / 2.0;
	      yc  = m2 * (xc - mx2) + my2;
	    }

	    else if(fabsy2y3 < EPSILON) {
	      m1  = -((x2 - x1) / (y2 - y1));
	      mx1 = (x1 + x2) / 2.0;
	      my1 = (y1 + y2) / 2.0;
	      xc  = (x3 + x2) / 2.0;
	      yc  = m1 * (xc - mx1) + my1;
	    }

	    else {
	      m1  = -((x2 - x1) / (y2 - y1));
	      m2  = -((x3 - x2) / (y3 - y2));
	      mx1 = (x1 + x2) / 2.0;
	      mx2 = (x2 + x3) / 2.0;
	      my1 = (y1 + y2) / 2.0;
	      my2 = (y2 + y3) / 2.0;
	      xc  = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
	      yc  = (fabsy1y2 > fabsy2y3) ?
	        m1 * (xc - mx1) + my1 :
	        m2 * (xc - mx2) + my2;
	    }

	    dx = x2 - xc;
	    dy = y2 - yc;
	    return {i: i, j: j, k: k, x: xc, y: yc, r: dx * dx + dy * dy};
	  }

	  function dedup(edges) {
	    var i, j, a, b, m, n;

	    for(j = edges.length; j; ) {
	      b = edges[--j];
	      a = edges[--j];

	      for(i = j; i; ) {
	        n = edges[--i];
	        m = edges[--i];

	        if((a === m && b === n) || (a === n && b === m)) {
	          edges.splice(j, 2);
	          edges.splice(i, 2);
	          break;
	        }
	      }
	    }
	  }

	  Delaunay = {
	    triangulate: function(vertices, key) {
	      var n = vertices.length,
	          i, j, indices, st, open, closed, edges, dx, dy, a, b, c;

	      /* Bail if there aren't enough vertices to form any triangles. */
	      if(n < 3)
	        return [];

	      /* Slice out the actual vertices from the passed objects. (Duplicate the
	       * array even if we don't, though, since we need to make a supertriangle
	       * later on!) */
	      vertices = vertices.slice(0);

	      if(key)
	        for(i = n; i--; )
	          vertices[i] = vertices[i][key];

	      /* Make an array of indices into the vertex array, sorted by the
	       * vertices' x-position. */
	      indices = new Array(n);

	      for(i = n; i--; )
	        indices[i] = i;

	      indices.sort(function(i, j) {
	        return vertices[j][0] - vertices[i][0];
	      });

	      /* Next, find the vertices of the supertriangle (which contains all other
	       * triangles), and append them onto the end of a (copy of) the vertex
	       * array. */
	      st = supertriangle(vertices);
	      vertices.push(st[0], st[1], st[2]);
	      
	      /* Initialize the open list (containing the supertriangle and nothing
	       * else) and the closed list (which is empty since we havn't processed
	       * any triangles yet). */
	      open   = [circumcircle(vertices, n + 0, n + 1, n + 2)];
	      closed = [];
	      edges  = [];

	      /* Incrementally add each vertex to the mesh. */
	      for(i = indices.length; i--; edges.length = 0) {
	        c = indices[i];

	        /* For each open triangle, check to see if the current point is
	         * inside it's circumcircle. If it is, remove the triangle and add
	         * it's edges to an edge list. */
	        for(j = open.length; j--; ) {
	          /* If this point is to the right of this triangle's circumcircle,
	           * then this triangle should never get checked again. Remove it
	           * from the open list, add it to the closed list, and skip. */
	          dx = vertices[c][0] - open[j].x;
	          if(dx > 0.0 && dx * dx > open[j].r) {
	            closed.push(open[j]);
	            open.splice(j, 1);
	            continue;
	          }

	          /* If we're outside the circumcircle, skip this triangle. */
	          dy = vertices[c][1] - open[j].y;
	          if(dx * dx + dy * dy - open[j].r > EPSILON)
	            continue;

	          /* Remove the triangle and add it's edges to the edge list. */
	          edges.push(
	            open[j].i, open[j].j,
	            open[j].j, open[j].k,
	            open[j].k, open[j].i
	          );
	          open.splice(j, 1);
	        }

	        /* Remove any doubled edges. */
	        dedup(edges);

	        /* Add a new triangle for each edge. */
	        for(j = edges.length; j; ) {
	          b = edges[--j];
	          a = edges[--j];
	          open.push(circumcircle(vertices, a, b, c));
	        }
	      }

	      /* Copy any remaining open triangles to the closed list, and then
	       * remove any triangles that share a vertex with the supertriangle,
	       * building a list of triplets that represent triangles. */
	      for(i = open.length; i--; )
	        closed.push(open[i]);
	      open.length = 0;

	      for(i = closed.length; i--; )
	        if(closed[i].i < n && closed[i].j < n && closed[i].k < n)
	          open.push(closed[i].i, closed[i].j, closed[i].k);

	      /* Yay, we're done! */
	      return open;
	    },
	    contains: function(tri, p) {
	      /* Bounding box test first, for quick rejections. */
	      if((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
	         (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
	         (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
	         (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1]))
	        return null;

	      var a = tri[1][0] - tri[0][0],
	          b = tri[2][0] - tri[0][0],
	          c = tri[1][1] - tri[0][1],
	          d = tri[2][1] - tri[0][1],
	          i = a * d - b * c;

	      /* Degenerate tri. */
	      if(i === 0.0)
	        return null;

	      var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i,
	          v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

	      /* If we're outside the tri, fail. */
	      if(u < 0.0 || v < 0.0 || (u + v) > 1.0)
	        return null;

	      return [u, v];
	    }
	  };

	  if(true)
	    module.exports = Delaunay;
	})();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	(function(root) {
	  'use strict';

	  function Sobel(imageData, ifMiddleData) {
	    if (!(this instanceof Sobel)) {
	      return new Sobel(imageData, ifMiddleData);
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

	        var avg = (r + g + b) / 3;
	        grayscaleData.push(avg, avg, avg, 255);
	      }
	    }

	    pixelAt = bindPixelAt(grayscaleData);

	    var middleData = [];

	    for (y = 0; y < h; y++) {
	      ifMiddleData && middleData.push([]);
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
	            (kernelY[2][2] * pixelAt(x + 1, y + 1))
	        );

	        var magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY))>>0;

	        ifMiddleData && (middleData[y][x] = magnitude);
	        sobelData.push(magnitude, magnitude, magnitude, 255);
	      }
	    }

	    if (ifMiddleData) return middleData;
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