// Shared runtime helpers for the generated Sketch3D models.
export function easeTo(current, target, amount, epsilon = 0.001) {
  const next = current + (target - current) * amount;
  return Math.abs(next - target) <= epsilon ? target : next;
}

export function canvasPaint(ctx) {
  const solid = [], dashed = [];
  let dash;
  const values = Object.create(null);
  return {
    reset() {
      for (const key of Object.keys(values)) delete values[key];
      dash = undefined;
    },
    set(key, value) {
      if (values[key] === value) return;
      ctx[key] = value;
      values[key] = value;
    },
    dash(on, dpr) {
      if (dash === on) return;
      dash = on;
      dashed[0] = 5 * dpr;
      dashed[1] = 4 * dpr;
      ctx.setLineDash(on ? dashed : solid);
    }
  };
}

// Only consecutive strokes between paint operations are eligible for merging.
export function edgeBatch(ctx, paint, appendSegment) {
  let color, alpha, width, dashed, blend;
  let pending = false;
  function flush() {
    if (!pending) return;
    ctx.stroke();
    pending = false;
  }
  return {
    flush,
    add(P, edges, pass, nextColor, nextAlpha, nextWidth, nextDash, nextBlend, dpr) {
      if (!pending || color !== nextColor || alpha !== nextAlpha || width !== nextWidth ||
          dashed !== nextDash || blend !== nextBlend) {
        flush();
        color = nextColor;
        alpha = nextAlpha;
        width = nextWidth;
        dashed = nextDash;
        blend = nextBlend;
        paint.set('globalAlpha', alpha);
        paint.set('strokeStyle', color);
        paint.set('lineWidth', width);
        paint.set('globalCompositeOperation', blend);
        paint.dash(dashed, dpr);
        ctx.beginPath();
        pending = true;
      }
      for (const ei of edges) {
        const e = P.E[ei];
        appendSegment(P, e.a, e.b, ei, pass, e.crease);
      }
    }
  };
}

// Rigid and uniformly scaled parts can shade and cull in their own coordinates.
export function localLighting(matrix, distance, light) {
  const a = [matrix[0], matrix[3], matrix[6]];
  const b = [matrix[1], matrix[4], matrix[7]];
  const c = [matrix[2], matrix[5], matrix[8]];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const scaleSquared = dot(a, a);
  const epsilon = scaleSquared * 1e-9;
  if (!scaleSquared || Math.abs(dot(b, b) - scaleSquared) > epsilon ||
      Math.abs(dot(c, c) - scaleSquared) > epsilon || Math.abs(dot(a, b)) > epsilon ||
      Math.abs(dot(a, c)) > epsilon || Math.abs(dot(b, c)) > epsilon) return null;
  const eye = [-matrix[9], -matrix[10], distance - matrix[11]];
  const scale = Math.sqrt(scaleSquared);
  return {
    eye: [dot(a, eye) / scaleSquared, dot(b, eye) / scaleSquared, dot(c, eye) / scaleSquared],
    light: [dot(a, light) / scale, dot(b, light) / scale, dot(c, light) / scale]
  };
}
