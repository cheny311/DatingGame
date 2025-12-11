class LeftBubble {
  constructor() {
    this.visible = true;
    this.frames = leftFrames;
    this.idx = 0;
  }

  show() { this.visible = true; }
  hide() { this.visible = false; }

  nextFrame() {
    if (!this.frames || this.frames.length === 0) return;
    this.idx = (this.idx + 1) % this.frames.length;
  }

  display(scaleFactor = 1, offsetX = 0, offsetY = 0) {
    if (!this.visible) return;

    push();
    translate(offsetX, offsetY);
    scale(scaleFactor);
    noFill();
    stroke(0);
    rect(100, 100, 180, 32, 5);
    fill(0);
    noStroke();
    textSize(16);
    textAlign(LEFT, CENTER);
    text("how r u?", 110, 115);
    pop();

    push();
    translate(offsetX, offsetY);
    scale(scaleFactor);
    noFill();
    stroke(0);
    rect(60, 100, 32, 32, 5);
    pop();

    if (this.frames && this.frames.length > 0) {
      push();
      translate(offsetX, offsetY);
      scale(scaleFactor);
      image(this.frames[this.idx], 62, 102, 28, 28);
      pop();
    }
  }
}

class RightBubble {
  constructor() {
    this.visible = true;
  }

  show() { this.visible = true; }
  hide() { this.visible = false; }

  display(inputText = "", scaleFactor = 1, offsetX = 0, offsetY = 0) {
    if (!this.visible) return;

    push();
    translate(offsetX, offsetY);
    scale(scaleFactor);
    noFill();
    stroke(0);
    rect(280, 160, 210, 32, 5);

    fill(0);
    noStroke();
    textSize(16);
    textAlign(LEFT, CENTER);
    text(inputText, 330, 175);
    pop();

    push();
    translate(offsetX, offsetY);
    scale(scaleFactor);
    noFill();
    stroke(0);
    rect(500, 160, 32, 32, 5);
    if (pipImg) {
      image(pipImg, 502, 162, 28, 28);
    }
    pop();
  }
}

class BlurLayer {
  constructor() {
    this.visible = false;
  }

  show() { this.visible = true; }
  hide() { this.visible = false; }

  display() {
    if (!this.visible) return;

    push();
    noStroke();
    fill(255, 255, 255, 130);
    rect(0, 0, width, height);
    pop();
  }
}

class Scene1 {
  constructor() {
    this.input = createInput('');
    this.positionInput();
    this.input.size(140, 24);
    this.input.style('font-family', 'Kirang Haerang');

    this.visible = false;
    this.input.hide();

    this.message = '';
    this.lastSentText = "";   // saving the last sentence and show it on screen

    this.leftBubble = new LeftBubble();
    this.rightBubble = new RightBubble();
    this.blurLayer = new BlurLayer();

    this.tryAgainVisible = false;
    this.tryBtn = { w: 140, h: 36 };
    this.updateTryBtnPos();

    this.hasBeenActivated = false;

    // enter to push the response
    this.input.elt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        let sent = this.input.value();
        this.lastSentText = sent;   // keep the sentence
        this.input.value('');       // clear the input

        // randomlly decide whether the response will be matched or unmatched
        this.message = (random(1) < 0.10) ? 'We can go out!' : 'Unmatched';

        if (this.message === 'Unmatched') {
          // indicate try again and able to reenter user input
          this.blurLayer.show();
          this.tryAgainVisible = true;
        } else {
          // its a match and it will keep lastSentText，but hide the text box
          this.input.hide();
          this.tryAgainVisible = false;
          this.blurLayer.hide();
        }

        e.preventDefault();
      }
    });
  }

  start() {
    this.input.value('');
    this.lastSentText = "";

    this.message = '';
    this.tryAgainVisible = false;
    this.blurLayer.hide();
    this.leftBubble.show();
    this.rightBubble.show();
    this.hasBeenActivated = false;

    this.show();

    setTimeout(() => this.input.elt.focus(), 20);
  }

  reset() {
    this.message = '';
    this.lastSentText = "";
    this.tryAgainVisible = false;
    this.blurLayer.hide();
    this.input.value('');
    this.leftBubble.idx = 0;
    this.leftBubble.show();
    this.rightBubble.show();
    this.hasBeenActivated = false;
    this.visible = false;
    this.input.hide();
  }

  update() {}

  draw() {
    this.display();
  }

  updateTryBtnPos() {
    this.tryBtn.x = width / 2 - this.tryBtn.w / 2;
    this.tryBtn.y = height / 2 + 40;
  }

  positionInput() {
    if (!this.input) return;
    let y = max(height - 150, 200);
    this.input.position(width / 2 - 70, y);
  }

  //  Try Again go back to the logic of texting and whether the result will be unmatch or matched
  handleTryAgain() {
    this.leftBubble.nextFrame();
    this.lastSentText = "";
    this.message = "";
    this.blurLayer.hide();
    this.tryAgainVisible = false;

    this.input.show();
    this.input.value('');
    this.input.elt.focus();
  }

  show() {
    if (!this.visible) {
      this.input.show();
      this.visible = true;
    }
  }

  hide() {
    if (this.visible) {
      this.input.hide();
      this.visible = false;
    }
  }

  display() {
    background(240);
  // allow user to show input on the right texting box
    let bubbleText = "";

    if (this.message === "") {
      // show what user put inside of the typing box(the bottom one)
      bubbleText = this.input.value();
    } else {
      //after enter they will show up in the texting box(the top one)
      bubbleText = this.lastSentText;
    }

    const bubbleScale = 1.1;
    const baseMinX = 60;
    const baseMaxX = 532;
    const baseMinY = 100;
    const baseMaxY = 192;
    const baseCenterX = (baseMinX + baseMaxX) / 2;
    const baseCenterY = (baseMinY + baseMaxY) / 2;
    const offsetX = width / 2 - baseCenterX * bubbleScale;
    const offsetY = height / 2 - baseCenterY * bubbleScale;

    this.leftBubble.display(bubbleScale, offsetX, offsetY);
    this.rightBubble.display(bubbleText, bubbleScale, offsetX, offsetY);
    this.blurLayer.display();
    push();
    imageMode(CENTER);
    if (cursor) image(cursorImg, mouseX, mouseY, 60, 60);
    pop();

    if (!this.hasBeenActivated) {
      this.show();
      this.hasBeenActivated = true;
      this.input.elt.focus();
    }

   

    if (this.message) {
      fill(50);
      textSize(40);
      textAlign(CENTER, CENTER);
      textFont("Kirang Haerang");
      text(this.message, width / 2, height / 2);

      if (this.message === 'We can go out!') {
        fill(255);
        textSize(30);
        textAlign(CENTER, TOP);
        text('Press 1 to go to see the movie', width / 2, height / 2 + 48);
      }
    }

    if (this.tryAgainVisible) {
      let { x, y, w, h } = this.tryBtn;
      push();
      stroke(0);
      fill(255);
      rect(x, y, w, h, 8);
      noStroke();
      fill(0);
      textSize(16);
      textAlign(CENTER, CENTER);
      textFont("Kirang Haerang");
      text("Try again", x + w / 2, y + h / 2 + 1);
      pop();
    }
   
  }

  mousePressed() {
    if (!this.tryAgainVisible) return;

    let { x, y, w, h } = this.tryBtn;

    if (
      mouseX >= x && mouseX <= x + w &&
      mouseY >= y && mouseY <= y + h
    ) {
      this.handleTryAgain();
    }
  }

  keyPressed() {}

  handleResize() {
    this.positionInput();
    this.updateTryBtnPos();
  }
}
