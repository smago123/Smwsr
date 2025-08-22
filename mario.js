const mario = document.getElementById('mario');
const piso = document.getElementById('piso');
const gameArea = document.getElementById('gameArea');

const pisoHeight = piso.offsetHeight;

// Variables
let left=false, right=false, jump=false, up=false, down=false;
let x = 50, y = 0, dx=0, dy=0, gravity=1.2;
let facing = 1; 
let walking=false, lookingUp=false, crouching=false;

// Tamaño Mario
let marioWidth = 50;
let marioHeight = 70;
let isBig = false;

// Sprites normales
let marioIdle = 'assets/mario/mariocindl.png';
let marioWalk1 = 'assets/mario/marioccaminando.png';
let marioWalk2 = 'assets/mario/marioccaminando2.png';
let marioUp = 'assets/mario/mariocarriba.png';
let marioDown = 'assets/mario/marioabajo.png';
let marioJump = 'assets/mario/mariocsaltando.png';

// Sprites grandes
const marioBig = {
  idle: 'assets/mario/mariogindl.png',
  walk1: 'assets/mario/mariogcaminando.png',
  walk2: 'assets/mario/mariogcaminando2.png',
  walk3: 'assets/mario/mariogcaminando3.png',
  up: 'assets/mario/mariogcarriba.png',
  down: 'assets/mario/mariogcabajo.png',
  jump: 'assets/mario/mariogcsaltando.png'
};

let frameToggle=false;

// Bloques lucky
let blocks = [
  {x:400, y:210, w:50, h:50, hit:false, element:null},
  {x:700, y:210, w:50, h:50, hit:false, element:null}
];

// Hongos activos
let mushrooms = [];

// Crear bloques lucky
blocks.forEach(b=>{
  const div = document.createElement('img');
  div.src = 'assets/nivel/lucky.png';
  div.style.position = 'absolute';
  div.style.left = `${b.x}px`;
  div.style.bottom = `${b.y}px`;
  div.style.width = `${b.w}px`;
  div.style.height = `${b.h}px`;
  gameArea.appendChild(div);
  b.element = div;

  // Animación infinita del bloque lucky
  let frames = [
    "assets/nivel/lucky.png",
    "assets/nivel/lucky1.png",
    "assets/nivel/lucky2.png",
    "assets/nivel/lucky3.png"
  ];
  let f = 0;
  setInterval(()=>{
    if(!b.hit){
      b.element.src = frames[f];
      f = (f+1) % frames.length;
    }
  },200);
});

// Eventos botones
document.getElementById("left").addEventListener("touchstart", ()=>left=true);
document.getElementById("left").addEventListener("touchend", ()=>left=false);
document.getElementById("right").addEventListener("touchstart", ()=>right=true);
document.getElementById("right").addEventListener("touchend", ()=>right=false);
document.getElementById("up").addEventListener("touchstart", ()=>up=true);
document.getElementById("up").addEventListener("touchend", ()=>up=false);
document.getElementById("down").addEventListener("touchstart", ()=>down=true);
document.getElementById("down").addEventListener("touchend", ()=>down=false);
document.getElementById("a").addEventListener("touchstart", ()=>jump=true);
document.getElementById("a").addEventListener("touchend", ()=>jump=false);

// Animación Mario
setInterval(()=>{
  let flip = facing===1 ? 1 : -1;

  if(isBig){
    // Mario grande
    if(y>0){
      mario.style.backgroundImage = `url(${marioBig.jump})`;
      mario.style.transform = `scaleX(${flip})`; // salto normal
    } else if(walking){
      mario.style.backgroundImage = `url(${frameToggle ? marioBig.walk1 : marioBig.walk2})`;
      mario.style.transform = `scaleX(${-flip})`; // voltear caminando
    } else if(crouching){
      mario.style.backgroundImage = `url(${marioBig.down})`;
      mario.style.transform = `scaleX(${flip})`; // agachado normal
    } else if(lookingUp){
      mario.style.backgroundImage = `url(${marioBig.up})`;
      mario.style.transform = `scaleX(${flip})`; // arriba normal
    } else {
      mario.style.backgroundImage = `url(${marioBig.idle})`;
      mario.style.transform = `scaleX(${flip})`; // idle normal
    }
  } else {
    // Mario chico
    if(y>0){
      mario.style.backgroundImage = `url(${marioJump})`;
      mario.style.transform = `scaleX(${flip})`; // salto normal
    } else if(crouching){
      mario.style.backgroundImage = `url(${marioDown})`;
      mario.style.transform = `scaleX(${flip})`; // agachado normal
    } else if(lookingUp){
      mario.style.backgroundImage = `url(${marioUp})`;
      mario.style.transform = `scaleX(${flip})`; // arriba normal
    } else if(walking){
      mario.style.backgroundImage = `url(${frameToggle ? marioWalk1 : marioWalk2})`;
      mario.style.transform = `scaleX(${-flip})`; // voltear caminar
    } else {
      mario.style.backgroundImage = `url(${marioIdle})`;
      mario.style.transform = `scaleX(${-flip})`; // voltear idle
    }
  }

  frameToggle = !frameToggle;
},129);

// Loop principal
function gameLoop(){
  walking=false; lookingUp=false; crouching=false;

  // Movimiento horizontal
  if(left){ dx=-4; walking=true; facing=-1; }
  else if(right){ dx=4; walking=true; facing=1; }
  else dx=0;

  // Mirar arriba / agacharse
  if(up){ lookingUp=true; }
  if(down){ crouching=true; }

  // Salto
  if(jump && y===0){ dy=20; }

  // Física vertical
  dy -= gravity;
  y += dy;
  if(y<0){ y=0; dy=0; }

  // Movimiento horizontal
  x += dx;

  // Colisión con bloques lucky (solo por abajo)
  blocks.forEach(b=>{
    if(!b.hit && dy>0 && x + marioWidth > b.x && x < b.x+b.w && y + marioHeight > b.y && y < b.y){
      b.hit = true;
      dy = 0;
      y = b.y - marioHeight;

      // Cambiar bloque a "usado"
      b.element.src = "assets/nivel/lucky3.png";

      // Crear hongo rojo
      const mushroom = document.createElement('img');
      mushroom.src = 'assets/nivel/hongorojo.png';
      mushroom.style.position='absolute';
      mushroom.style.width='40px';
      mushroom.style.height='40px';
      mushroom.style.left = `${b.x}px`;
      mushroom.style.bottom = `${b.y + b.h}px`;
      mushroom.dy = 5;
      mushroom.vx = 1;
      mushroom.y = b.y + b.h;
      mushrooms.push(mushroom);
      gameArea.appendChild(mushroom);
    }
  });

  // Animación hongos y colisión con Mario
  mushrooms.forEach((m, i)=>{
    m.y += m.dy;
    m.dy -= gravity*0.2;
    if(m.y<0){ m.y=0; m.dy=0; }
    m.style.bottom = `${m.y}px`;
    m.style.left = `${parseFloat(m.style.left) + m.vx}px`;

    // Colisión con Mario
    if(x + marioWidth > parseFloat(m.style.left) && x < parseFloat(m.style.left)+40 &&
       y + marioHeight > m.y && y < m.y + 40){
      // Cambiar sprites a versión grande
      marioIdle = marioBig.idle;
      marioWalk1 = marioBig.walk1;
      marioWalk2 = marioBig.walk2;
      marioUp = marioBig.up;
      marioDown = marioBig.down;
      marioJump = marioBig.jump;
      marioWidth = 70;
      marioHeight = 100;
      isBig = true;

      // Eliminar hongo
      gameArea.removeChild(m);
      mushrooms.splice(i,1);
    }
  });

  // Cámara centrada
  const centerX = window.innerWidth/2;
  let cameraX = 0;
  if(x > centerX){ cameraX = x - centerX; }
  gameArea.scrollLeft = cameraX;

  // Limites horizontales
  if(x<0) x=0;

  // Posición Mario
  mario.style.bottom = `${y + pisoHeight}px`;
  mario.style.left = `${x}px`;

  requestAnimationFrame(gameLoop);
}

gameLoop();