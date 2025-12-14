class Scene2 {
  constructor() {
    // sizing individually
    this.herHandW = 160;
    this.herHandH = 130;
    this.myHandW = 150;
    this.myHandH = 120;

    // hand position
    this.herX = width / 2;
    this.herY = height / 2;

    this.progress = 0;
    this.handHoldShow = false;
    this.bothHandsShow = true;

    this.locked = false;
    this.lockMX = null;
    this.lockMY = null;

    this.showContinue = false;
  }

  // repick the starting position each time user enter the page
  start() {
    let herBounds = this.getHerBounds();

    // random position for herHandImg
    this.herX = random(herBounds.left, herBounds.right);
    this.herY = random(herBounds.top, herBounds.bottom);

    // reset
    this.progress = 0;
    this.handHoldShow = false;
    this.bothHandsShow = true;
    this.locked = false;
    this.lockMX = null;
    this.lockMY = null;
    this.showContinue = false;

    // start to play sound
    if (!bgMusicStarted && bgS) {
      bgS.setVolume(0.3);
      bgS.loop();
      bgMusicStarted = true;
    }
  }

  reset() {
    this.progress = 0;
    this.handHoldShow = false;
    this.bothHandsShow = true;
    this.locked = false;
    this.lockMX = null;
    this.lockMY = null;
    this.showContinue = false;
  }

  update() {}

  draw() {
    this.display();
  }

  drawMeter(x, y, w, h, t, label) {
    noStroke();
    fill(255);
    rect(x, y, w, h, 6);

    fill(120);
    rect(x, y, w * constrain(t, 0, 1), h, 6);

    fill(60);
    textAlign(CENTER, BOTTOM);
    textSize(24);
    text(label, x + w / 2, y - 6);
  }

  display() {
    // background
    // background location
    let frameX = 0; // margin left
    let frameY = 50; // margin top
    let frameW = width; 
    let frameH = height - 120; 

    // white background
    push();
    noStroke();
    fill(255);
    rect(frameX, frameY, frameW, frameH);
    pop();

    // put movieb into the white frame 
    push();
    tint(255, 180);

    let imgAspect = 700 / 300;
    let frameAspect = frameW / frameH;

    let bgW, bgH;
    if (frameAspect > imgAspect) {
      // fillll
      bgH = frameH;
      bgW = bgH * imgAspect;
    } else {
      // fill
      bgW = frameW;
      bgH = bgW / imgAspect;
    }

    // set position
    let drawX = frameX + (frameW - bgW) / 2;
    let drawY = frameY + (frameH - bgH) / 2;
    image(movieB, drawX, drawY, bgW, bgH);
    pop();

    // title
    push();
    fill(60);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(25);
    text("I wanna hold your hand", width / 2, 30);
    pop();

    // movement boundaries
    let mouseBounds = this.getMouseBounds();
    let boundLeft = mouseBounds.left;
    let boundRight = mouseBounds.right;
    let boundTop = mouseBounds.top;
    let boundBottom = mouseBounds.bottom;

    let mXraw = constrain(mouseX, boundLeft, boundRight);
    let mYraw = constrain(mouseY, boundTop, boundBottom);

    let mX = this.locked ? this.lockMX : mXraw;
    let mY = this.locked ? this.lockMY : mYraw;

    let d = dist(mX, mY, this.herX, this.herY);

    // movement logic (before holding)
    //if distance is bigger than my value then her hand will move toward my hand
    //but if i move too fast or get too close, her hand will move away from my
    //when distance is under my value then process number will grow
    if (!this.locked) {
      if (d < 120 && d > 0.001) {
        let range = map(d, 0, 120, 5, 0);
        this.herX += ((this.herX - mX) / d) * range;
        this.herY += ((this.herY - mY) / d) * range;
      } else if (d > 180) {
        let pull = map(d, 180, 300, 0, 1.5, true);
        this.herX += ((mX - this.herX) / d) * pull;
        this.herY += ((mY - this.herY) / d) * pull;
      }
    }

    let herBounds = this.getHerBounds();
    this.herX = constrain(this.herX, herBounds.left, herBounds.right);
    this.herY = constrain(this.herY, herBounds.top, herBounds.bottom);

    // both hands visible
    if (this.bothHandsShow) {
      image(imgHer, this.herX, this.herY, this.herHandW, this.herHandH);
      image(imgMe, mX, mY, this.myHandW, this.myHandH);
    }

    // progress
    if (!this.locked) {
      if (d < 100) this.progress += 0.25;
      else this.progress -= 0.15;

      this.progress = constrain(this.progress, 0, 100);

      if (this.progress < 100) {
        let meterWidth = min(width - 60, 400);
        let meterX = width / 2 - meterWidth / 2;
        this.drawMeter(
          meterX,
          height - 28,
          meterWidth,
          14,
          this.progress / 100,
          "Progress"
        );
      } else {
        fill(50);
        textSize(14);
        textAlign(CENTER, TOP);
        text("Press ENTER to hold hands", width / 2, height - 48);
      }
    }

    // holding hands
    if (this.locked && this.handHoldShow) {
      image(
        imgHold,
        20, // set in the middle
        0, // set in the middle
        this.herHandW * 8, // image sized of the hand
        this.herHandH * 9
      );

      push();
      stroke(255);
      strokeWeight(5);
      fill(255, 8, 90);
      textSize(80);
      textAlign(CENTER, TOP);
      text("hand hold!", width / 2, height - 360);
      pop();
      if (this.showContinue) {
        fill(50);
        textSize(16);
        textAlign(CENTER, TOP);
        text("Press 1 to go to the next scene", width / 2, height - 30);
      }
    }
  }

  keyPressed() {
    if (keyCode === ENTER && this.progress >= 100 && !this.locked) {
      this.locked = true;

      let mouseBounds = this.getMouseBounds();
      this.lockMX = constrain(mouseX, mouseBounds.left, mouseBounds.right);
      this.lockMY = constrain(mouseY, mouseBounds.top, mouseBounds.bottom);

      this.handHoldShow = true;
      this.bothHandsShow = false;

      this.showContinue = true;
    }
  }

  getHerBounds() {
    let left = width * (80 / 600);
    let right = width * (520 / 600);
    let top = height * (130 / 450);
    let bottom = height * (360 / 450);

    right = min(right, width - 40);
    bottom = min(bottom, height - 40);

    if (right - left < 120) right = left + 120;
    if (bottom - top < 140) bottom = top + 140;

    return { left, right, top, bottom };
  }

  getMouseBounds() {
    let left = width * (15 / 600);
    let right = width * (480 / 600);
    let top = height * (100 / 450);
    let bottom = height * (390 / 450);

    right = min(right, width - 20);
    bottom = min(bottom, height - 20);

    if (right - left < 160) right = left + 160;
    if (bottom - top < 180) bottom = top + 180;

    return { left, right, top, bottom };
  }

  handleResize() {
    let herBounds = this.getHerBounds();
    this.herX = constrain(this.herX, herBounds.left, herBounds.right);
    this.herY = constrain(this.herY, herBounds.top, herBounds.bottom);

    if (this.locked) {
      let mouseBounds = this.getMouseBounds();
      if (this.lockMX !== null) {
        this.lockMX = constrain(
          this.lockMX,
          mouseBounds.left,
          mouseBounds.right
        );
      }
      if (this.lockMY !== null) {
        this.lockMY = constrain(
          this.lockMY,
          mouseBounds.top,
          mouseBounds.bottom
        );
      }
    }
  }
}
