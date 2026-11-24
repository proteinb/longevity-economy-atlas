import earcut from './vendor/earcut.js';

export function triangulate(vertices, loops, normal) {
  const outer = loops[0];
  if (loops.length === 1 && outer.length <= 4) {
    return outer.length === 3 ? outer : [outer[0], outer[1], outer[2], outer[0], outer[2], outer[3]];
  }
  let axis = 0;
  for (let i = 1; i < 3; i++) if (Math.abs(normal[i]) > Math.abs(normal[axis])) axis = i;
  const indices = [], points = [], holes = [];
  for (const loop of loops) {
    if (indices.length) holes.push(indices.length);
    for (const index of loop) {
      const v = vertices[index];
      indices.push(index);
      points.push(v[(axis + 1) % 3], v[(axis + 2) % 3]);
    }
  }
  return earcut(points, holes, 2).map(i => indices[i]);
}

export function createMotionRenderer() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
  if (!gl) return null;
  const program = gl.createProgram();
  function attach(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  attach(gl.VERTEX_SHADER, `
    attribute vec2 position;
    attribute vec4 color;
    uniform vec2 scale;
    varying lowp vec4 tint;
    void main() {
      gl_Position = vec4(position * scale + vec2(-1.0, 1.0), 0.0, 1.0);
      tint = color;
    }
  `);
  attach(gl.FRAGMENT_SHADER, `
    varying lowp vec4 tint;
    void main() { gl_FragColor = tint; }
  `);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  const buffer = gl.createBuffer();
  const position = gl.getAttribLocation(program, 'position'), color = gl.getAttribLocation(program, 'color');
  const scale = gl.getUniformLocation(program, 'scale');
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 12, 0);
  gl.enableVertexAttribArray(color);
  gl.vertexAttribPointer(color, 4, gl.UNSIGNED_BYTE, true, 12, 8);
  gl.clearColor(1, 1, 1, 1);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  let vertices = new Float32Array(65536);
  let bytes = new Uint8Array(vertices.buffer), count = 0;
  let red, green, blue, alpha, previousColor, previousOpacity;
  const colors = new Map();
  function tint(css, opacity) {
    if (css === previousColor && opacity === previousOpacity) return;
    previousColor = css;
    previousOpacity = opacity;
    let rgb = colors.get(css);
    if (!rgb) {
      rgb = css.slice(4, -1).split(',').map(c => Number(c));
      colors.set(css, rgb);
    }
    red = rgb[0]; green = rgb[1]; blue = rgb[2];
    alpha = Math.round(opacity * 255);
  }
  function reserve(size) {
    if (count + size <= vertices.length) return;
    const expanded = new Float32Array(Math.max(count + size, vertices.length * 2));
    expanded.set(vertices);
    vertices = expanded;
    bytes = new Uint8Array(vertices.buffer);
  }
  function vertex(x, y) {
    vertices[count++] = x;
    vertices[count++] = y;
    const offset = count++ * 4;
    bytes[offset] = red;
    bytes[offset + 1] = green;
    bytes[offset + 2] = blue;
    bytes[offset + 3] = alpha;
  }
  function quad(ax, ay, bx, by, cx, cy, dx, dy) {
    reserve(18);
    vertex(ax, ay); vertex(bx, by); vertex(cx, cy);
    vertex(ax, ay); vertex(cx, cy); vertex(dx, dy);
  }
  return {
    canvas,
    begin(width, height) {
      if (gl.isContextLost()) return false;
      count = 0;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(scale, 2 / width, -2 / height);
      return true;
    },
    face(P, indices, ox, oy, css, opacity) {
      tint(css, opacity);
      reserve(indices.length * 3);
      const xs = P.sx, ys = P.sy;
      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i], b = indices[i + 1], c = indices[i + 2];
        const ax = xs[a], ay = ys[a], bx = xs[b], by = ys[b], cx = xs[c], cy = ys[c];
        const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        if (Math.abs(area) < 0.6) continue;
        vertex(ax + ox, ay + oy);
        vertex(bx + ox, by + oy);
        vertex(cx + ox, cy + oy);
      }
    },
    edges(P, edges, css, opacity, width) {
      tint(css, opacity);
      for (const index of edges) {
        const { a, b } = P.E[index], ax = P.sx[a], ay = P.sy[a], bx = P.sx[b], by = P.sy[b];
        const dx = bx - ax, dy = by - ay, length = Math.hypot(dx, dy);
        if (length < 1.25) continue;
        const half = width / (2 * length), x = -dy * half, y = dx * half;
        quad(ax + x, ay + y, bx + x, by + y, bx - x, by - y, ax - x, ay - y);
      }
    },
    dot(x, y, radius, css, opacity) {
      tint(css, opacity);
      reserve(8 * 9);
      for (let i = 0; i < 8; i++) {
        const from = i * Math.PI / 4, to = from + Math.PI / 4;
        vertex(x, y);
        vertex(x + Math.cos(from) * radius, y + Math.sin(from) * radius);
        vertex(x + Math.cos(to) * radius, y + Math.sin(to) * radius);
      }
    },
    finish() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bufferData(gl.ARRAY_BUFFER, vertices.subarray(0, count), gl.STREAM_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, count / 3);
    }
  };
}
