/* ==========================================================================
   NIWOT — Living hero background (raw WebGL2, ~5 KB, no dependencies)
   A single full-screen fragment shader renders: a slow alpenglow sky cycle,
   drifting fBm clouds, three parallax ridges shaped like the Flatirons and
   Front Range, a cottonwood-lined valley floor, and Left Hand Creek catching
   light in the foreground. Pauses when off-screen, caps DPR for performance,
   and falls back to the SVG scene when WebGL is unavailable.
   ========================================================================== */
const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 R; uniform float T; uniform float S; uniform vec2 M;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v += a*noise(p); p = p*2.03 + 17.1; a *= .5; } return v; }

/* Ridge profile: base fbm + tilted "flatiron" slabs (sawtooth) */
float ridge(float x, float seed, float amp, float slab){
  float r = fbm(vec2(x*1.1 + seed, seed)) * amp;
  r += noise(vec2(x*3.5 + seed*2., seed)) * amp * .35;
  /* tilted slabs: steep east face, long west dip, like the Flatirons */
  float saw = fract(x*1.6 + seed*.3);
  r += slab * smoothstep(0., .7, saw) * (1. - smoothstep(.7, .95, saw));
  return r;
}

void main(){
  vec2 uv = gl_FragCoord.xy / R;
  float asp = R.x / R.y;
  vec2 q = vec2(uv.x * asp, uv.y);

  /* Day cycle: dawn → day → dusk, ~70s loop, slowed */
  float day = .5 + .5 * sin(T * .045);
  /* pointer parallax + scroll parallax */
  vec2 par = (M - .5) * .02 + vec2(0., S * .12);

  /* Sky */
  vec3 dawnTop = vec3(.17,.20,.33), dawnHor = vec3(.94,.60,.46);
  vec3 dayTop  = vec3(.30,.50,.72), dayHor  = vec3(.78,.86,.90);
  vec3 top = mix(dawnTop, dayTop, day), hor = mix(dawnHor, dayHor, day);
  float h = pow(clamp(uv.y - par.y*.5, 0., 1.), .9);
  vec3 col = mix(hor, top, smoothstep(.22, 1., h));
  /* Sun / glow near the horizon */
  vec2 sunP = vec2(asp*.68 + (M.x-.5)*.03, .36 + day*.28);
  float sd = distance(q + par*vec2(1.,.5), sunP);
  col += vec3(1., .80, .58) * (.18/(sd*8.+.6)) * (1.15 - day*.5);
  /* Clouds */
  float c = fbm(q*1.8 + vec2(T*.012, 0.) + par*2.);
  float cm = smoothstep(.48, .78, c) * smoothstep(.18, .6, uv.y);
  col = mix(col, mix(vec3(.98,.86,.80), vec3(1.), day), cm * .55);
  /* Stars fading at dawn */
  float st = step(.997, hash(floor(q*220.))) * (1. - day) * smoothstep(.55, 1., uv.y);
  col += st * .8;

  /* Ridges: far → near, with haze */
  vec3 farC  = mix(vec3(.36,.30,.42), vec3(.55,.62,.72), day);
  vec3 midC  = mix(vec3(.28,.20,.27), vec3(.36,.42,.46), day);
  vec3 nearC = mix(vec3(.12,.11,.12), vec3(.18,.22,.20), day);
  vec3 glow  = vec3(.93,.55,.42) * (1.-day) * .5;

  float x = q.x;
  float r1 = .50 + ridge(x*.8 + par.x*.6, 3.1, .12, .07) - par.y*.25;
  float r2 = .40 + ridge(x*1.1 + par.x*1.2, 7.7, .10, .09) - par.y*.55;
  float r3 = .28 + ridge(x*1.5 + par.x*2.0, 12.3, .06, .04) - par.y*.95;

  float aa = 2.5 / R.y;
  float m1 = smoothstep(r1+aa, r1-aa, uv.y);
  float m2 = smoothstep(r2+aa, r2-aa, uv.y);
  float m3 = smoothstep(r3+aa, r3-aa, uv.y);
  /* rim light on the far ridges facing the sun */
  float rim1 = smoothstep(r1-.02, r1, uv.y);
  col = mix(col, farC + glow*rim1*1.4 + (1.-day)*.06, m1);
  float rim2 = smoothstep(r2-.015, r2, uv.y);
  col = mix(col, midC + glow*rim2*.9, m2);
  col = mix(col, nearC, m3);

  /* Valley floor & Left Hand Creek: horizontal band with shimmer */
  float floorY = .22 - par.y*1.1;
  float fm = smoothstep(floorY+aa, floorY-aa, uv.y);
  vec3 floorC = mix(vec3(.16,.16,.13), vec3(.30,.34,.24), day);
  col = mix(col, floorC, fm);
  float creekY = .13 - par.y*1.25;
  float cw = .035 + .01*sin(x*3. + 1.);
  float creek = smoothstep(cw, 0., abs(uv.y - creekY - .012*sin(x*4.2 + .7)));
  float ripple = fbm(vec2(x*9. - T*.35, uv.y*40. + T*.6));
  vec3 creekC = mix(hor*.9, top, .35) + vec3(.06,.10,.10);
  creekC += vec3(1., .85, .6) * pow(ripple, 5.) * (1.4 - day*.6);
  col = mix(col, creekC, creek * .9);

  /* Fog at the base of ridges, vignette, grain */
  col = mix(col, hor*.9, (1.-day)*.25*smoothstep(.45, .2, uv.y)*(1.-fm));
  col *= 1. - .35*pow(distance(uv, vec2(.5,.45))*1.15, 2.2);
  col += (hash(gl_FragCoord.xy + fract(T)) - .5) * .035;
  o = vec4(col, 1.);
}`;

export function mountHero(canvas) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return false;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return false;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uR = gl.getUniformLocation(prog, 'R'), uT = gl.getUniformLocation(prog, 'T');
  const uS = gl.getUniformLocation(prog, 'S'), uM = gl.getUniformLocation(prog, 'M');

  const state = { scroll: 0, mx: .5, my: .5, tx: .5, ty: .5, visible: true, raf: 0, start: performance.now() };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.floor(canvas.clientWidth * dpr), h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  function frame(now) {
    state.raf = 0;
    resize();
    state.mx += (state.tx - state.mx) * .05; state.my += (state.ty - state.my) * .05;
    gl.uniform2f(uR, canvas.width, canvas.height);
    gl.uniform1f(uT, reduced ? 20 : (now - state.start) / 1000);
    gl.uniform1f(uS, state.scroll);
    gl.uniform2f(uM, state.mx, state.my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (state.visible && !reduced) state.raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!state.raf) state.raf = requestAnimationFrame(frame); };

  new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; if (state.visible) kick(); }, { threshold: 0 }).observe(canvas);
  addEventListener('resize', kick, { passive: true });
  addEventListener('pointermove', e => { state.tx = e.clientX / innerWidth; state.ty = 1 - e.clientY / innerHeight; if (reduced) kick(); }, { passive: true });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); canvas.classList.add('is-lost'); });

  kick();
  return { setScroll(v) { state.scroll = v; if (reduced) kick(); } };
}
