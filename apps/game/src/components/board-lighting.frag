#version 300 es
precision highp float;
precision highp int;

uniform highp usampler2D tiles;
uniform vec2 resolution;
uniform bool penumbra;
uniform bool bloom;
out vec4 pixel;

// Cross grid boundaries in order, stopping at the first opaque cell.
float visibility(vec2 source, vec2 point) {
  ivec2 cell = ivec2(floor(source));
  ivec2 target = ivec2(floor(point));
  vec2 ray = point - source;
  ivec2 stepDir = ivec2(sign(ray));
  vec2 stride = 1.0 / max(abs(ray), vec2(0.000001));
  vec2 next = mix(fract(source), 1.0 - fract(source), greaterThan(ray, vec2(0))) * stride;
  // Sources are at most four cells away along each axis.
  for (int i = 0; i < 9; ++i) {
    if (all(equal(cell, target))) return 1.0;
    if (next.x < next.y) {
      cell.x += stepDir.x;
      next.x += stride.x;
    } else {
      cell.y += stepDir.y;
      next.y += stride.y;
    }
    if (texelFetch(tiles, cell, 0).r == 2u) return 0.0;
  }
  return 0.0;
}

// Project wall silhouettes onto a line across the emitting tile. Each wall
// projects at least one tile wide, so it can only trim an end of the source
// interval or cover it entirely. Overlapping walls therefore cast one shadow.
float visibleSpan(vec2 point, vec2 center, bool transposeAxes) {
  vec2 p = transposeAxes ? point.yx : point;
  vec2 c = transposeAxes ? center.yx : center;
  float depth = abs(c.x - p.x);
  if (depth < 0.0001) return visibility(center, point);
  float direction = sign(c.x - p.x);
  const float radius = 0.44;
  float low = c.y - radius;
  float high = c.y + radius;
  ivec2 first = ivec2(floor(min(p, c - vec2(0.0, radius))));
  ivec2 last = ivec2(floor(max(p, c + vec2(0.0, radius))));
  for (int x = first.x; x <= last.x; ++x) {
    float middle = (float(x) + 0.5 - p.x) * direction;
    float nearDepth = max(0.00001, middle - 0.5);
    float farDepth = min(depth, middle + 0.5);
    if (farDepth < nearDepth) continue;
    for (int y = first.y; y <= last.y; ++y) {
      ivec2 wall = transposeAxes ? ivec2(y,x) : ivec2(x,y);
      if (texelFetch(tiles, wall, 0).r != 2u) continue;
      float bottom = float(y) - p.y;
      float top = bottom + 1.0;
      float start = p.y + depth * bottom / (bottom < 0.0 ? nearDepth : farDepth);
      float end = p.y + depth * top / (top > 0.0 ? nearDepth : farDepth);
      if (start <= low) low = max(low, end);
      else high = min(high, start);
      if (low >= high) return 0.0;
    }
  }
  return (high - low) / (2.0 * radius);
}

float softVisibility(vec2 point, vec2 center) {
  vec2 d = abs(point - center);
  float blend = smoothstep(-0.18, 0.18, (d.y - d.x) / max(d.x + d.y, 0.001));
  if (blend == 0.0) return visibleSpan(point, center, false);
  if (blend == 1.0) return visibleSpan(point, center, true);
  return mix(visibleSpan(point, center, false), visibleSpan(point, center, true), blend);
}

void main() {
  ivec2 size = textureSize(tiles, 0);
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 point = vec2(uv.x, 1.0 - uv.y) * vec2(size);
  ivec2 cell = ivec2(floor(point));
  uint tile = texelFetch(tiles, cell, 0).r;
  float light = 0.0;
  float halo = 0.0;
  for (int y = max(0, cell.y-4); y <= min(size.y-1, cell.y+4); ++y) {
    for (int x = max(0, cell.x-4); x <= min(size.x-1, cell.x+4); ++x) {
      if (texelFetch(tiles, ivec2(x,y), 0).r != 1u) continue;
      vec2 center = vec2(x,y) + 0.5;
      vec2 delta = point - center;
      float distanceToLight = length(delta);
      if (distanceToLight >= 4.0) continue;
      if (bloom) {
        // Integrate a smooth blur kernel over the square. Adjacent tiles
        // share an edge and their integrals join into one continuous halo.
        vec2 coverage = smoothstep(vec2(-0.75), vec2(0.75), delta + 0.5)
                      - smoothstep(vec2(-0.75), vec2(0.75), delta - 0.5);
        halo += coverage.x * coverage.y;
      }
      if (tile != 0u) continue;
      float visible = penumbra ? softVisibility(point, center) : visibility(center, point);
      light += visible * exp(-0.58 * pow(distanceToLight, 1.3)) *
               (1.0 - smoothstep(3.5, 4.0, distanceToLight));
    }
  }
  vec3 color = tile == 2u ? vec3(50,52,54) :
               tile == 1u ? vec3(232,190,82) : vec3(68,76,86);
  vec2 edgePixels = (1.0 - fract(point)) * resolution / vec2(size);
  if (tile != 2u && min(edgePixels.x, edgePixels.y) < 1.0) color *= 0.92;
  color += (1.0 - exp(-light)) * vec3(155,112,52);
  color += halo * vec3(23,27,19);
  pixel = vec4(color / 255.0, 1);
}
