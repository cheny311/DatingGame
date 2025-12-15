let currentScene = 0;
let scenes = [];

let imgHer, imgMe, imgHold;
let cursorImg;
let lipImg;
let kissImg;
let movieB;
let bgS;
let leftFrames = [];
let pipImg;
let bgMusicStarted = false;

let jiehunFrame;            
let wemarryFrames = [];    
const WEMARRY_COUNT = 22;

function preload() {
  let names = ["p1", "p2", "p3", "p4", "p5", "p6"];
  for (let n of names) {
    leftFrames.push(loadImage(`images/${n}.jpg`));
  }

  bgS = loadSound("images/happytogether.mp3");
  movieB = loadImage("images/metro.png");
  pipImg = loadImage("images/fish.png");
  cursorImg = loadImage("images/cursor.png");
  imgHer = loadImage("images/handR.png");
  imgMe = loadImage("images/handL.png");
  imgHold = loadImage("images/hold.png");
  lipImg = loadImage("images/lip.png");
  kissImg = loadImage("images/kiss.png");
 
 jiehunFrame = loadImage(
  "marry/jiehun.png",
  () => console.log("✓ Loaded marry/jiehun.png"),
  () => console.warn("✗ Failed to load marry/jiehun.png")
);


  wemarryFrames = [];
  for (let i = 1; i <= WEMARRY_COUNT; i++) {
    wemarryFrames.push(
      loadImage(
        `marry/wemarry${i}.png`,
        () => console.log(`✓ Loaded wemarry${i}.gif`),
        () => console.warn(`✗ Failed wemarry${i}.gif`)
      )
    );
  }


}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Kirang Haerang");

  scenes[0] = new Scene0();
  scenes[1] = new Scene1();
  scenes[2] = new Scene2();
  scenes[3] = new Scene3();
  scenes[4] = new Scene4();

  scenes[0].start();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let scene of scenes) {
    if (scene && typeof scene.handleResize === "function") {
      scene.handleResize();
    }
  }
}

function draw() {
  background(240);

  if (scenes[currentScene]) {
    scenes[currentScene].update();
    scenes[currentScene].draw();
  }
}

function switchScene(newScene) {
  // reset old scene
  if (scenes[currentScene] && scenes[currentScene].reset) {
    scenes[currentScene].reset();
  }

  // change scene index
  currentScene = newScene;

  // start new scene
  if (scenes[currentScene] && scenes[currentScene].start) {
    scenes[currentScene].start();
  }
}
function keyPressed() {
  if (scenes[currentScene] && scenes[currentScene].keyPressed) {
    scenes[currentScene].keyPressed();
  }

  if (key === "1") {
    let next = currentScene + 1;
    if (next > 4) next = 0;
    switchScene(next);
  }
}

function mousePressed() {
  if (scenes[currentScene] && scenes[currentScene].mousePressed) {
    scenes[currentScene].mousePressed();
  }
}
function mouseDragged() {
  if (scenes[currentScene] && scenes[currentScene].mouseDragged) {
    scenes[currentScene].mouseDragged();
  }
}

function mouseReleased() {
  if (scenes[currentScene] && scenes[currentScene].mouseReleased) {
    scenes[currentScene].mouseReleased();
  }
}
function mouseWheel(event) {
  if (scenes[currentScene] && scenes[currentScene].mouseWheel) {
    return scenes[currentScene].mouseWheel(event);
  }
}
