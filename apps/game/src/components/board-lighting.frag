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
        // Approximate the blurred emissive square with two Gaussian falloffs.
        vec2 edge = max(abs(delta) - 0.5, 0.0);
        float d2 = dot(edge, edge);
        halo += 0.7 * exp(-d2/0.045) + 0.23 * exp(-d2/0.32);
      }
      if (tile != 0u) continue;
      float visible = visibility(center, point);
      if (penumbra) {
        for (int i = 0; i < 4; ++i) {
          vec2 offset = vec2(i % 2, i / 2) * 0.64 - 0.32;
          visible += visibility(center + offset, point);
        }
        visible *= 0.2;
      }
      light += visible * exp(-0.58 * pow(distanceToLight, 1.3)) *
               (1.0 - smoothstep(3.5, 4.0, distanceToLight));
    }
  }
  vec3 color = tile == 2u ? vec3(50,52,54) :
               tile == 1u ? vec3(232,190,82) : vec3(68,76,86);
  vec2 edgePixels = (1.0 - fract(point)) * resolution / vec2(size);
  if (tile != 2u && min(edgePixels.x, edgePixels.y) < 1.0) color *= 0.92;
  color += min(light, 0.85) * vec3(179,126,52);
  color += min(halo, 1.0) * vec3(65,62,68);
  pixel = vec4(color / 255.0, 1);
}
