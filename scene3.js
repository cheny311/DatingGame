class Scene3 {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.radius = 60;

    this.isFlashing = false;
    this.nextFlashTime = 0;
    this.flashEndTime = 0;

    this.score = 0;
    this.misses = 0;
    this.message = "Click to kiss when it flashes red!";
    this.messageTimer = millis() + 5000;

    this.isKissing = false;
    this.kissProgress = 0;
    this.kissSpeed = 0.008;

    this.kiss1X = -100;
    this.kiss2X = width + 100;
    this.kissY = height / 2;
    this.kissSize = 250;

    this.hasClicked = false;

    this.pauseAfterKiss = false;
    this.pauseEndTime = 0;

    this.gameOver = false;
    this.fadeAlpha = 0;
    this.fadeSpeed = 2;
    this.showFinalText = false;
    this.showReturnText = false;
    this.isWin = false;

    this.scheduleNextFlash();
  }

  //the math behind flashing time
  scheduleNextFlash() {
    let randomDelay = random(1500, 4500);
    this.nextFlashTime = millis() + randomDelay;
    this.flashEndTime = this.nextFlashTime + 800;
    this.hasClicked = false;
  }
  //end sequence= fade screen and then the text
  update() {
    if (this.gameOver) {
      if (this.fadeAlpha < 255) {
        this.fadeAlpha += this.fadeSpeed;
        if (this.fadeAlpha >= 255) {
          this.fadeAlpha = 255;

          setTimeout(() => {
            this.showFinalText = true;
          }, 500);

          setTimeout(() => {
            this.showReturnText = true;
          }, 2500);
        }
      }
      return;
    }

    let currentTime = millis();

    if (this.pauseAfterKiss) {
      if (currentTime >= this.pauseEndTime) {
        this.pauseAfterKiss = false;
        this.scheduleNextFlash();
      }
      return;
    }

    if (this.isKissing) {
      this.kissProgress += this.kissSpeed;
      //kissing animation = flying mouth
      this.kiss1X = lerp(-100, width / 2 - 50, this.kissProgress);
      this.kiss2X = lerp(width + 100, width / 2 + 50, this.kissProgress);

      if (this.kissProgress >= 1) {
        this.isKissing = false;
        this.kissProgress = 0;
        this.kiss1X = -100;
        this.kiss2X = width + 100;

        this.pauseAfterKiss = true;
        this.pauseEndTime = millis() + 1500;
      }
      return;
    }

    if (!this.isFlashing && currentTime >= this.nextFlashTime) {
      this.isFlashing = true;
    }

    if (
      this.isFlashing &&
      !this.hasClicked &&
      currentTime >= this.flashEndTime
    ) {
      this.isFlashing = false;
      this.misses++;
      this.message = "It is all about timing";
      this.messageTimer = millis() + 2000;

      if (this.misses >= 5) {
        this.gameOver = true;
        this.isWin = false;

        // stop music when lose the game...
        if (bgS && bgS.isPlaying()) {
          bgS.stop();
        }
        bgMusicStarted = false;
      } else {
        this.scheduleNextFlash();
      }
    }
  }

  draw() {
    this.display();
  }

  display() {
    background(255, 230, 230);
    this.update();

    if (this.gameOver) {
      push();
      noStroke();
      fill(0, this.fadeAlpha);
      rect(0, 0, width, height);
      pop();

      if (this.showFinalText) {
        fill(255);
        textAlign(CENTER, CENTER);
        if (this.isWin) {
          textSize(28);
          text("See you Sunday", width / 2, height / 2 - 40);
        } else {
          textSize(24);
          text("I think we are not compatible", width / 2, height / 2 - 40);
        }
      }

      if (this.showReturnText) {
        fill(255);
        textSize(20);
        textAlign(CENTER, CENTER);

        if (this.isWin) {
          text("get home safe", width / 2, height / 2 + 20);
        }

        text("Press ENTER to take the train", width / 2, height / 2 + 60);
      }

      return;
    }

    if (this.isKissing || this.pauseAfterKiss) {
      push();
      imageMode(CENTER);
      tint(255, 255, 255, 230);

      image(kissImg, this.kiss1X, this.kissY, this.kissSize, this.kissSize);

      push();
      translate(this.kiss2X, this.kissY);
      scale(-1, 1);
      image(kissImg, 0, 0, this.kissSize, this.kissSize);
      pop();

      noTint();
      pop();

      fill(0);
      textSize(24);
      textAlign(CENTER);
      text(`Kisses: ${this.score}  |  Misses: ${this.misses}`, width / 2, 50);
      push();
      if (this.pauseAfterKiss) {
        stroke(255);
        strokeWeight(8);
        fill(255, 100, 150);
        textSize(60);
        text("Muah!", width / 2, height / 2);
      }
      pop();
      noCursor();
      return;
    }
    //waiting for user mouse input
    push();
    imageMode(CENTER);
    if (this.isFlashing) {
      tint(255, 100, 100);
      image(lipImg, this.x, this.y, this.radius * 5, this.radius * 5);
      noTint();
      image(lipImg, this.x, this.y, this.radius * 4.6, this.radius * 4.6);
    } else {
      tint(200);
      image(lipImg, this.x, this.y, this.radius * 5, this.radius * 5);
      noTint();
    }
    pop();

    fill(0);
    textSize(24);
    textAlign(CENTER);
    text(`Kisses: ${this.score}  |  Misses: ${this.misses}`, width / 2, 50);

    if (millis() < this.messageTimer) {
      textSize(20);
      text(this.message, width / 2, height - 50);
    }

    noCursor();
    push();
    imageMode(CENTER);
    image(cursorImg, mouseX, mouseY, 120, 120);
    pop();
  }

  mousePressed() {
    if (this.isKissing || this.pauseAfterKiss || this.gameOver) return;

    if (this.isClicked(mouseX, mouseY)) {
      this.hasClicked = true;

      if (this.isFlashing) {
        this.score++;
        this.message = "We kissed!";
        this.messageTimer = millis() + 3000;
        this.isFlashing = false;

        if (this.score >= 5) {
          this.gameOver = true;
          this.isWin = true;
          // music on when play and win
        } else {
          this.isKissing = true;
          this.kissProgress = 0;
        }
      } else {
        //early will count as miss and show text
        this.misses++;
        this.message = "Too early! No one wants to kiss now";
        this.messageTimer = millis() + 1500;

        if (this.misses >= 5) {
          this.gameOver = true;
          this.isWin = false;

          if (bgS && bgS.isPlaying()) {
            bgS.stop();
          }
          bgMusicStarted = false;
        }
      }
    }
  }

  isClicked(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.radius * 2;
  }

  keyPressed() {
    if (
      this.gameOver &&
      this.showReturnText &&
      (key === "Enter" || keyCode === ENTER)
    ) {
      // back to scene one to restart
      switchScene(0);

      // cleanup
      this.score = 0;
      this.misses = 0;
      this.gameOver = false;
      this.fadeAlpha = 0;
      this.showFinalText = false;
      this.showReturnText = false;
      this.isWin = false;
      this.message = "Click the lip when it flashes red!";
      this.messageTimer = millis() + 5000;
      this.isFlashing = false;
      this.pauseAfterKiss = false;
      this.isKissing = false;
      this.kissProgress = 0;
      this.kiss1X = -100;
      this.kiss2X = width + 100;

      this.scheduleNextFlash();
    }
  }

  handleResize() {
    this.x = width / 2;
    this.y = height / 2;
    this.kissY = height / 2;
    this.kiss1X = -100;
    this.kiss2X = width + 100;
  }
}
