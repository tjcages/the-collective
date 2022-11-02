precision mediump float;

uniform float time;
uniform vec2 resolution;
  
float noise(vec2 p) {
  p=(p);
  return fract(sin(p.x*45.11+p.y*97.23)*878.73+733.17)*2.-1.0;
}      
  
float map(vec2 p) {
  return length(p) - 0.2;
}
  

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 col;
    vec3 color = vec3(1.,1.,1.);
  
    for(float j = 0.0; j < 4.0; j++){
        for(float i = 1.; i <8.0; i++){
            uv.x += (1.0*(
              0.2/(i+j) * sin(i*atan(time)*2.*uv.y + (time*0.1) + i*j) 
            ));
            uv.y+= (1.0*(
              1.0/(i+j) * cos(i*0.6*uv.x + (time*0.05) + i*j) 
            ));
        }
      uv.x += noise(sin(uv+time))*0.01;
      uv.y += noise(cos(uv+time))*0.2;
      col[int(j)] = clamp((abs(uv.x+uv.y)), 0.2, 1.0);
    }
  
    vec3 bg = vec3(0.84,0.8,0.76);
    color = mix(
      col,
      bg,
      smoothstep(0.0,abs(sin(time*0.05))*3.0,map(uv))
    );
  
    gl_FragColor = vec4(color, 1.);
}