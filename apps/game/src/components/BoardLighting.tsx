import { useLayoutEffect, useRef, useState } from 'react';
import type { GameState } from '@state-maze/game-core';
import fragmentSource from './board-lighting.frag?raw';

export type LightingOptions = { penumbra: boolean; bloom: boolean };

const vertexSource = `#version 300 es
void main() {
  vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(corner * 2.0 - 1.0, 0, 1);
}`;

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false });
  if (!gl) return null;
  const program = gl.createProgram();
  if (!program) return null;
  for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
    const shader = gl.createShader(type);
    if (!shader) {
      gl.deleteProgram(program);
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);
  const texture = gl.createTexture();
  if (!texture) {
    gl.deleteProgram(program);
    return null;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  const resolution = gl.getUniformLocation(program, 'resolution');
  const penumbra = gl.getUniformLocation(program, 'penumbra');
  const bloom = gl.getUniformLocation(program, 'bloom');

  return {
    draw(map: GameState['map'], options: LightingOptions) {
      const rows = map.length;
      const cols = map[0].length;
      if (Math.max(rows, cols) > maxSize) {
        canvas.hidden = true;
        return;
      }
      canvas.hidden = false;
      const scale = Math.min(48, 1024 / Math.max(rows, cols));
      const width = Math.max(1, Math.round(cols * scale));
      const height = Math.max(1, Math.round(rows * scale));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8UI, cols, rows, 0, gl.RED_INTEGER, gl.UNSIGNED_BYTE, Uint8Array.from(map.flat()));
      gl.uniform2f(resolution, width, height);
      gl.uniform1i(penumbra, Number(options.penumbra));
      gl.uniform1i(bloom, Number(options.bloom));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    },
  };
}

export default function BoardLighting({ map, options }: { map: GameState['map']; options: LightingOptions }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<ReturnType<typeof createRenderer>>(null);
  const [generation, setGeneration] = useState(0);
  useLayoutEffect(() => {
    const element = canvas.current!;
    renderer.current = createRenderer(element);
    const lost = (event: Event) => {
      event.preventDefault();
      element.hidden = true;
      renderer.current = null;
    };
    const restored = () => setGeneration(value => value + 1);
    element.addEventListener('webglcontextlost', lost);
    element.addEventListener('webglcontextrestored', restored);
    return () => {
      element.removeEventListener('webglcontextlost', lost);
      element.removeEventListener('webglcontextrestored', restored);
      renderer.current?.dispose();
    };
  }, [generation]);
  useLayoutEffect(() => {
    renderer.current?.draw(map, options);
  }, [map, options, generation]);

  return <canvas className="board-lighting" aria-hidden="true" ref={canvas} />;
}
