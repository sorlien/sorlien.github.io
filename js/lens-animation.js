(function () {
  // Desktop only
  if (window.innerWidth < 768) return;

  var canvas = document.getElementById('lensCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  // Fixed artboard — matches hero-photo-clear.png exactly (801 × 983 px)
  // No JS resize needed; CSS scales the element, canvas draws at these coords.
  var W = 801;
  var H = 983;

  // Lens centre from animation_position.png (red shape centre pixel 381, 208)
  var LX = 381;
  var LY = 208;

  var t = 0;
  var mouseX = 0.5, mouseY = 0.5;  // raw normalised 0–1
  var smX    = 0.5, smY    = 0.5;  // lerped

  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  // Five gradient layers — purples, pinks, greens, blues
  // amp / r / mx / my are in artboard pixels
  var LAYERS = [
    // Purple
    { h0: 270, xOff: 0.00, yOff: 0.00, xF: 0.80, yF: 1.00, amp: 144, r: 511, mx:  96, my:  79 },
    // Pink / Magenta
    { h0: 315, xOff: 2.10, yOff: 0.80, xF: 1.20, yF: 0.70, amp: 120, r: 422, mx: -80, my:  98 },
    // Teal / Green
    { h0: 155, xOff: 1.05, yOff: 3.20, xF: 0.60, yF: 1.40, amp: 160, r: 383, mx:  64, my: -118 },
    // Blue
    { h0: 210, xOff: 3.50, yOff: 1.60, xF: 1.30, yF: 0.90, amp: 128, r: 462, mx: -72, my: -79 },
    // Violet accent
    { h0: 290, xOff: 0.70, yOff: 2.40, xF: 1.00, yF: 1.20, amp:  96, r: 325, mx:  56, my:  88 },
  ];

  function draw() {
    requestAnimationFrame(draw);
    t += 0.007;

    // Smooth mouse
    smX += (mouseX - smX) * 0.05;
    smY += (mouseY - smY) * 0.05;

    // Deep dark base
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#050008';
    ctx.fillRect(0, 0, W, H);

    LAYERS.forEach(function (l, i) {
      // Each gradient orbits the lens centre + mouse nudge
      var cx = LX + Math.cos(t * l.xF + l.xOff) * l.amp + (smX - 0.5) * l.mx;
      var cy = LY + Math.sin(t * l.yF + l.yOff) * l.amp + (smY - 0.5) * l.my;

      var hue   = (l.h0 + t * 22) % 360;
      var hue2  = (hue  + 55)     % 360;
      var pulse = 0.72 + 0.28 * Math.sin(t * 1.1 + i * 1.3);

      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, l.r);
      g.addColorStop(0,    'hsla(' + hue  + ',100%,68%,' + pulse           + ')');
      g.addColorStop(0.45, 'hsla(' + hue2 + ', 90%,48%,' + (pulse * 0.55) + ')');
      g.addColorStop(1,    'hsla(' + hue2 + ', 70%,20%,0)');

      ctx.globalCompositeOperation = i === 0 ? 'source-over' : 'screen';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
  }

  draw();
})();
