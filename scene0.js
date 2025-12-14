class Slider {
  constructor(x1, y, x2, min, max, init, label) {
    this.x1 = x1;
    this.y  = y;
    this.x2 = x2;

    this.min = min;
    this.max = max;
    this.value = constrain(init, min, max);

    this.label = label;
    this.radius = 8;
    this.dragging = false;
    this.pulseAnimation = 0;
  }

  draw() {
    stroke(180);
    strokeWeight(2);
    line(this.x1, this.y, this.x2, this.y);

    noStroke();
    fill(70);
    textSize(15);
    textAlign(LEFT, BOTTOM);
    text(this.label, this.x1, this.y - 6);

    textAlign(RIGHT, BOTTOM);
    text(int(this.value), this.x2, this.y - 6);

    let t = map(this.value, this.min, this.max, this.x1, this.x2);
    fill(230);
    stroke(120);
    circle(t, this.y, this.radius * 2);

    //dragging founction == to change color 
    if (mouseIsPressed) {

  
      let over =
        dist(mouseX, mouseY, t, this.y) <= this.radius + 6 ||
        (this.dragging &&
         abs(mouseY - this.y) < 15 &&
         mouseX >= this.x1 &&
         mouseX <= this.x2);

      this.dragging = over;
        //mousex valute to slider value so it changes rgb value
      if (this.dragging) {
        this.value = map(
          constrain(mouseX, this.x1, this.x2),
          this.x1, this.x2,
          this.min, this.max
        );
      }
    } else {
      this.dragging = false;
    }
  }
}

class Scene0 {
  constructor() {
    this.video = null;
    this.ctrack = null;
    this.positions = [];
    this.sliders = [];
    this.videoHeight = 280;
    this.captureWidth = 640;
    this.captureHeight = 480;
    this.glassesOffset = 20;

    this.target = null;
    this.range = 20;
    this.submitted = false;

    this.LEFT_EYE_IDX  = [23,24,25,26,63,64,65,66];
    this.RIGHT_EYE_IDX = [30,29,28,31,67,68,69,70];

    this.pulseAnimation = 0;
  }

  start() {
    this.video = createCapture({
      video: {
        width: { ideal: this.captureWidth },
        height: { ideal: this.captureHeight },
      },
      audio: false,
    });
    this.video.size(this.captureWidth, this.captureHeight);
    this.updateVideoSize();
    this.video.hide();

    this.ctrack = new clm.tracker();
    this.ctrack.init();
    this.ctrack.start(this.video.elt);

    this.sliders = [
      new Slider(0, 0, 0, 0, 255, 128, "Caring and stable"),
      new Slider(0, 0, 0, 0, 255, 128, "Emotional Availability"),
      new Slider(0, 0, 0, 0, 255, 128, "Independence"),
    ];
    this.updateSliderPositions();

    this.rerollTarget();
    this.submitted      = false;
    this.pulseAnimation = 0;
  }

  reset() {
    if (this.video) this.video.remove();
    this.video = null;

    this.ctrack    = null;
    this.positions = [];
    this.sliders   = [];

    this.submitted      = false;
    this.pulseAnimation = 0;
  }

  update() {
    if (this.ctrack) {
      let p = this.ctrack.getCurrentPosition();
      this.positions = p ? p : [];
    }
  }

  draw() {
    this.display();
  }
//when submit == next screen
  display() {
    if (this.submitted) {
      this.drawTransitionScreen();
      return;
    }

    background(235);

    if (this.video) {
      //mirror camera
      push();
      translate(width, 0);
      scale(-1, 1);
      image(this.video, 0, 0, width, this.videoHeight);
      pop();
    }

    let eyes = this.getEyeCentersCLM();
    if (eyes) {
      let L = eyes.left;
      let R = eyes.right;

    let distLR = dist(L.x, L.y, R.x, R.y);
    let radius = constrain(distLR * 0.36, 24, 48);

      let userCol = this.currentRGB();

      this.drawBridge(L, R, radius, userCol);
      this.drawLens(L.x, L.y, radius, userCol);
      this.drawLens(R.x, R.y, radius, userCol);
    } else {
      fill(255);
      textSize(50)
      stroke(30);
      strokeWeight(5);
      textAlign(CENTER, CENTER);
      text("Show your face", width / 2, 250);
    }

    noStroke();
    fill(210);
    rect(0, 0, width, 40);

    push();
    fill(60);
    textAlign(CENTER, CENTER);
    textSize(25);
    text("I should be the one that they like", width / 2, 20);
    pop();

    for (let s of this.sliders) s.draw();

    push();
    strokeWeight(2);
    stroke(255);
    fill(this.target.r, this.target.g, this.target.b);
    rect(width - 120, 80, 45, 45, 6);
    pop();

    push();
    fill(255);
    stroke(20);
    textAlign(RIGHT, TOP);
    textSize(20);
    text("They are looking for", width - 25, 135);
    pop();

    let d = this.diffsRGB(this.target);
    let pass = (d.dr <= this.range &&
                d.dg <= this.range &&
                d.db <= this.range);
//helper text location not overlapping with webcam and other 
    let desiredInfoBase = this.videoHeight + 60;
    let baseMin = this.videoHeight + 30;
    let baseMax = height - 200;
    let infoBaseY;
    if (baseMax > baseMin) {
      infoBaseY = constrain(desiredInfoBase, baseMin, baseMax);
    } else {
      infoBaseY = baseMin;
    }
    infoBaseY = min(infoBaseY, height - 120);
    let infoTextY = infoBaseY + 28;
    let helperTextY = infoTextY + 18;

    if (this.positions.length > 0) {
      let statusX = width * 0.28;
      let statusUpper = max(120, this.videoHeight - 50);
      let statusY = constrain(this.videoHeight * 0.45, 80, statusUpper);

      noStroke();
      fill(90);
      textAlign(CENTER, CENTER);
      textSize(12);
      text(
        `Get ≤ ${this.range}  A:${d.dr} B:${d.dg} C:${d.db}`,
        width / 2,
        infoBaseY
      );

      push();
      stroke(255);
      strokeWeight(5);
      textSize(60);
      if (pass) {
        fill(0,150,0);
        text("Good Taste", statusX, statusY);
      } else {
        fill(200,0,0);
        text("Nah,do better", statusX, statusY);
      }
      pop();
    }

  push();
textAlign(CENTER, CENTER);
textSize(18);

if (!eyes) {
  // if eye did not show 
  fill(255);
  stroke(5);
  strokeWeight(5);
  textSize(40)
  text("Let's start some color matching", width / 2, infoTextY);

} else if (!pass) {
  // if eye show but color dont match
  fill(120);
  text("Drag sliders · Press R to reroll color", width / 2, infoTextY);
  text(
    "The goal is to get the value for A,B,and C under 20",
    width / 2,
    helperTextY
  );

} else {
  // matched for color
  fill(50);
  textSize(20);
  text("Press ENTER to submit", width / 2, infoTextY);
}

pop();


  noCursor();
  push();
  imageMode(CORNER);
  image(cursorImg, mouseX, mouseY-70, 100, 100);
  pop();

  }

  drawTransitionScreen() {
    background(235);
    this.pulseAnimation += 0.02;
    let pulse = sin(this.pulseAnimation) * 0.5 + 0.5;

    let col = this.currentRGB();

    noStroke();
    fill(col.r, col.g, col.b, 20 + pulse * 20);
    ellipse(width / 2, height / 2, 500 + pulse * 100);

    fill(col.r, col.g, col.b, 40 + pulse * 30);
    ellipse(width / 2, height / 2, 350 + pulse * 80);

    fill(col.r, col.g, col.b, 80 + pulse * 50);
    ellipse(width / 2, height / 2, 250 + pulse * 60);

    fill(col.r, col.g, col.b);
    ellipse(width / 2, height / 2, 80);

    fill(255);
    stroke(0);
    strokeWeight(3);
    textAlign(CENTER, CENTER);
    textSize(26);
    text("Press 1 to enter the dating world", width / 2, height / 2);
  }
//clm indicate eye posiiton
  getEyeCentersCLM() {
    let P = this.positions;
    if (!P || P.length === 0) return null;

    let scaleX = (this.captureWidth !== 0)
      ? width / this.captureWidth
      : 1;
    let scaleY = (this.captureHeight !== 0)
      ? this.videoHeight / this.captureHeight
      : 1;
//get a stabler value
    let avg = (arr) => {
      let sx = 0, sy = 0, n = 0;
      for (let i of arr) {
        if (P[i]) {
          sx += P[i][0];
          sy += P[i][1];
          n++;
        }
      }
      if (n === 0) return null;
      let avgX = sx / n;
      let avgY = sy / n;
      return {
        x: width - avgX * scaleX,
        y: avgY * scaleY,
      };
    };

    let L = avg(this.LEFT_EYE_IDX);
    let R = avg(this.RIGHT_EYE_IDX);
    return (L && R) ? { left: L, right: R } : null;
  }

  drawBridge(L, R, r, col) {
    let v = createVector(R.x - L.x, R.y - L.y);
    let d = v.mag();
    if (d < 1) return;
    v.normalize();

    let moveU = this.glassesOffset;
    stroke(col.r, col.g, col.b);
    strokeWeight(5);
    line(
      L.x + v.x * r,
      L.y + v.y * r - moveU,
      R.x - v.x * r,
      R.y - v.y * r - moveU
    );
  }

  drawLens(x, y, r, col) {
    let moveU = this.glassesOffset;
    noFill();
    stroke(col.r, col.g, col.b);
    strokeWeight(6);
    circle(x, y - moveU, r * 1.92);
  }

  rerollTarget() {
    this.target = {
      r: int(random(256)),
      g: int(random(256)),
      b: int(random(256)),
    };
  }

  currentRGB() {
    return {
      r: int(this.sliders[0].value),
      g: int(this.sliders[1].value),
      b: int(this.sliders[2].value),
    };
  }

  diffsRGB(target) {
    let c = this.currentRGB();
    return {
      dr: abs(c.r - target.r),
      dg: abs(c.g - target.g),
      db: abs(c.b - target.b),
    };
  }
//avoid resubmit
  keyPressed() {
    if (this.submitted) {
      return;
    }

    if (key === "r" || key === "R") {
      this.rerollTarget();
      return;
    }

    let d = this.diffsRGB(this.target);
    //all value are close to targeted value
    let pass =
      (d.dr <= this.range &&
       d.dg <= this.range &&
       d.db <= this.range);

    if (pass && keyCode === ENTER) {
      this.submitted = true;
    }
  }
//location for sliders
  updateSliderPositions() {
    if (!this.sliders || this.sliders.length === 0) return;
    let cx = width / 2;
    let sliderStartY = max(height - 140, this.videoHeight + 180);
    let spacing = 25;

    for (let i = 0; i < this.sliders.length; i++) {
      let s = this.sliders[i];
      s.x1 = cx - 150;
      s.x2 = cx + 150;
      s.y = sliderStartY + spacing * i;
    }
  }

  updateVideoSize() {
    if (!this.video) return;
    this.video.size(this.captureWidth, this.captureHeight);
    //work as "margin" for sliders and texts below webcam video
    let reserved = 260;
    let available = height - reserved;
    if (available < 140) available = 140;
    let maxHeight = height * 0.75;
    this.videoHeight = constrain(available, 140, maxHeight);
  }

  handleResize() {
    this.updateVideoSize();
    this.updateSliderPositions();
  }
}
