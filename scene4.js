
class Scene4 {
  constructor() {
    this.userImg = null;

    // Image transform (unlimited in scale)
    this.userImgW = 400;
    this.userImgH = 400;
    this.userImgRotation = 0;
    this.userImgFlipped = false;

    // Move inside frame (offset relative to frame center)
    this.imgOffsetX = 0;
    this.imgOffsetY = 0;

    // Drag state
    this.dragging = false;
    this.dragStartOffX = 0;
    this.dragStartOffY = 0;

    // Webcam
    this.video = null;
    this.usingCamera = false;

    // Marry frames
    this.currentFrameIndex = 0;

   //interaction elements
    this.fileInput = null;
    this.saveBtn = null;
    this.camBtn = null;
    this.snapBtn = null;
    this.resetBtn = null;
    this.flipBtn = null;
    this.rotateLeftBtn = null;
    this.rotateRightBtn = null;
    this.backBtn = null;

    this.widthSlider = null;
    this.heightSlider = null;
    this.rotationSlider = null;

    this.widthLabelEl = null;
    this.heightLabelEl = null;
    this.rotationLabelEl = null;

  
    this.frameBounds = { x: 0, y: 0, width: 800, height: 500 };

   
    this.uiExtras = [];

    this.stylesInjected = false;
    this.bgColor = [248, 246, 236];

  
    this.MARRY_SCALE = 0.8; // marry images shrink to 80%
    this.MARRY_DOWN = 200;  // move down 200
  }

  start() {
    if (!this.video) {
      this.video = createCapture(VIDEO);
      this.video.size(320, 240);
      this.video.hide();
    }

    this.createUI();

    if (!this.stylesInjected) {
      this.addCustomStyles();
      this.stylesInjected = true;
    }
  }

  reset() {
    this.removeUI();
    this.usingCamera = false;
    this.dragging = false;
  }

  update() {}

  draw() {
    this.display();
  }

display() {
  background(this.bgColor[0], this.bgColor[1], this.bgColor[2]);

  this.drawControlPanel();  // background
  this.drawUserPhoto();     // user input
  this.drawMarryFrame();    // marry photos
  this.drawTopFrame();      // jiehun

  this.drawUI();
  this.drawCameraPreview();
}

  drawMarryFrame() {
    if (!Array.isArray(wemarryFrames) || wemarryFrames.length === 0) return;

    let  frame = wemarryFrames[this.currentFrameIndex];
    if (!frame) return;

    let  SCALE = this.MARRY_SCALE;
   let DOWN = this.MARRY_DOWN;

    push();
    imageMode(CORNER);

    // Base area for marry content (upper region)
    let  baseW = width;
    let  baseH = min(600, height * 0.6);

    let  targetW = baseW * SCALE;
    let  targetH = baseH * SCALE;

   
    let  s = min(targetW / frame.width, targetH / frame.height);
    let  drawW = frame.width * s;
    let drawH = frame.height * s;

    let  drawX = (width - drawW) / 2;
    let  drawY = (baseH - drawH) / 2 + DOWN;

    image(frame, drawX, drawY, drawW, drawH);

    this.frameBounds = { x: drawX, y: drawY, width: drawW, height: drawH };
    pop();
  }

  constrainImageOffset(frameW, frameH) {
    let  imgW = this.userImgW * 0.92;
    let  imgH = this.userImgH * 0.92;


    let  maxX = Math.max(0, (imgW - frameW) / 2);
    let  maxY = Math.max(0, (imgH - frameH) / 2);

    this.imgOffsetX = constrain(this.imgOffsetX, -maxX, maxX);
    this.imgOffsetY = constrain(this.imgOffsetY, -maxY, maxY);
  }


  drawUserPhoto() {
    if (!this.userImg || !this.frameBounds) return;

    let  bx = this.frameBounds.x;
    let  by = this.frameBounds.y;
    let  bw = this.frameBounds.width;
    let  bh = this.frameBounds.height;

    let  cx = bx + bw / 2;
    let  cy = by + bh / 2;

  
    this.constrainImageOffset(bw, bh);

    push();
    translate(cx, cy);
    imageMode(CENTER);
    rectMode(CENTER);

    // Frame outline
    noFill();
    stroke(255, 215, 100);
    strokeWeight(this.dragging ? 5 : 3);
    rect(0, 0, bw, bh, 15);

    // Clip to frame
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(-bw / 2, -bh / 2, bw, bh);
    drawingContext.clip();

    // Draw image with offset + transform
    push();
    translate(this.imgOffsetX, this.imgOffsetY);
    rotate(radians(this.userImgRotation));
    if (this.userImgFlipped) scale(-1, 1);

    image(this.userImg, 0, 0, this.userImgW * 0.92, this.userImgH * 0.92);
    pop();

    drawingContext.restore();

    pop();
  }


  drawTopFrame() {
    if (!jiehunFrame) return;
    push();
    imageMode(CORNER);
    image(jiehunFrame, 0, 0, width, height);
    pop();
  }

 
  drawUI() {
    fill(255, 245, 230);
    stroke(255, 170, 90);
    strokeWeight(4);
    textAlign(CENTER, TOP);
    textSize(32);
    textStyle(BOLD);
    text("Wedding Photo Editor", width / 2, 160);

    fill(255, 200, 80);
    stroke(100, 50, 0);
    strokeWeight(2);
    textSize(16);
    text(`Frame ${this.currentFrameIndex + 1} / ${WEMARRY_COUNT}`, width / 2, 780);

    noStroke();
    fill(100);
    textAlign(CENTER, BOTTOM);
    textSize(12);
    textStyle(NORMAL);
    text(
      "Shortcuts: ← → frames | Q/E rotate | F flip | +/- zoom | Wheel zoom",
      width / 2,
      820
    );
  }

 
  drawControlPanel() {
    let  PANEL_Y = max(470, height - 360);
    push();
    fill(this.bgColor[0], this.bgColor[1], this.bgColor[2]);
    noStroke();
    rectMode(CORNER);
    rect(0, PANEL_Y, width, height - PANEL_Y);
    pop();
  }

//preview
  drawCameraPreview() {
    if (!this.video || !this.usingCamera) return;

    push();
    let  previewW = 200;
    let  previewH = 150;
    let  previewX = width - previewW - 80;
    let  previewY = 500 - previewH - 40;

    fill(0);
    stroke(255, 200, 80);
    strokeWeight(4);
    rectMode(CORNER);
    rect(previewX, previewY, previewW, previewH, 10);

    push();
    translate(previewX + previewW, previewY);
    scale(-1, 1);
    image(this.video, 0, 0, previewW, previewH);
    pop();

    fill(255, 200, 80);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(12);
    textStyle(BOLD);
    text("LIVE PREVIEW", previewX + previewW / 2, previewY - 18);
    pop();
  }

  createUI() {
    if (this.fileInput) return;

    let  panelTop = max(50, height - 560);
    let  startX = 80;
    let currentY = panelTop;

    let  metrics = this.computeButtonMetrics();
    let  {
      buttonWidth,
      buttonHeight,
      rowSpacing,
      quickButtonWidth,
      quickButtonHeight,
      quickSpacing,
      quickRowGap,
    } = metrics;

    let  instructions = createDiv("Upload or capture a photo")
      .position(startX, currentY)
      .class("section-title");
    instructions.style("font-size", "18px");
    instructions.style("max-width", "480px");
    this.uiExtras.push(instructions);
    currentY += 35;

    this.fileInput = createFileInput((file) => this.handleFile(file));
    this.fileInput.position(startX, currentY);
    this.fileInput.class("control-input");
    this.fileInput.elt.accept = "image/*";
    currentY += 50;

    this.camBtn = createButton("Use Camera");
    this.camBtn.position(startX, currentY);
    this.camBtn.mousePressed(() => this.startCamera());
    this.camBtn.class("control-btn");
    this.setButtonSize(this.camBtn, buttonWidth, buttonHeight);

    this.snapBtn = createButton("Capture Photo");
    this.snapBtn.position(startX + rowSpacing, currentY);
    this.snapBtn.mousePressed(() => this.takePhoto());
    this.snapBtn.class("control-btn accent");
    this.snapBtn.hide();
    this.setButtonSize(this.snapBtn, buttonWidth, buttonHeight);
    currentY += buttonHeight + 30;

    let  quickLabel = createDiv("Quick Actions")
      .position(startX, currentY)
      .class("section-title");
    this.uiExtras.push(quickLabel);
    currentY += 30;

    this.rotateLeftBtn = createButton("Rotate -15°");
    this.rotateLeftBtn.position(startX, currentY);
    this.rotateLeftBtn.mousePressed(() => this.rotateImage(-15));
    this.rotateLeftBtn.class("control-btn quick-btn");
    this.setButtonSize(this.rotateLeftBtn, quickButtonWidth, quickButtonHeight);

    this.rotateRightBtn = createButton("Rotate +15°");
    this.rotateRightBtn.position(startX + quickSpacing, currentY);
    this.rotateRightBtn.mousePressed(() => this.rotateImage(15));
    this.rotateRightBtn.class("control-btn quick-btn");
    this.setButtonSize(this.rotateRightBtn, quickButtonWidth, quickButtonHeight);

    let  quickSecondRowY = currentY + quickButtonHeight + quickRowGap;

    this.flipBtn = createButton("Flip");
    this.flipBtn.position(startX, quickSecondRowY);
    this.flipBtn.mousePressed(() => this.flipImage());
    this.flipBtn.class("control-btn quick-btn");
    this.setButtonSize(this.flipBtn, quickButtonWidth, quickButtonHeight);

    this.resetBtn = createButton("Reset");
    this.resetBtn.position(startX + quickSpacing, quickSecondRowY);
    this.resetBtn.mousePressed(() => this.resetPosition());
    this.resetBtn.class("control-btn quick-btn");
    this.setButtonSize(this.resetBtn, quickButtonWidth, quickButtonHeight);
    currentY = quickSecondRowY + quickButtonHeight + 30;

    let  adjustLabel = createDiv("Fine Tuning")
      .position(startX, currentY)
      .class("section-title");
    this.uiExtras.push(adjustLabel);
    currentY += 30;

    this.widthLabelEl = createElement("div", `Width: ${this.userImgW}px`)
      .position(startX, currentY)
      .class("slider-label");
    currentY += 20;

    // Slider can still have a max, but it won't limit your wheel/keys scaling
    this.widthSlider = createSlider(80, 6000, this.userImgW, 10);
    this.widthSlider.position(startX, currentY);
    this.widthSlider.class("control-slider");
    this.widthSlider.input(() => this.handleWidthSlider());
    currentY += 40;

    this.heightLabelEl = createElement("div", `Height: ${this.userImgH}px`)
      .position(startX, currentY)
      .class("slider-label");
    currentY += 20;

    this.heightSlider = createSlider(80, 6000, this.userImgH, 10);
    this.heightSlider.position(startX, currentY);
    this.heightSlider.class("control-slider");
    this.heightSlider.input(() => this.handleHeightSlider());
    currentY += 40;

    this.rotationLabelEl = createElement("div", `Rotation: ${this.userImgRotation}°`)
      .position(startX, currentY)
      .class("slider-label");
    currentY += 20;

    this.rotationSlider = createSlider(-180, 180, this.userImgRotation, 5);
    this.rotationSlider.position(startX, currentY);
    this.rotationSlider.class("control-slider");
    this.rotationSlider.input(() => {
      this.userImgRotation = this.rotationSlider.value();
      this.updateRotationLabel();
    });
  currentY += 60;

// ---- bottom-right buttons ----
let backBtnX = width - buttonWidth - 40;
let backBtnY = height - buttonHeight - 80;

// Save Photo 放在 Back 上面
let saveBtnX = backBtnX - 50;
let saveBtnY = backBtnY - 20 - (buttonHeight + 14);

this.saveBtn = createButton("Save Photo");
this.saveBtn.position(saveBtnX, saveBtnY);
this.saveBtn.mousePressed(() => saveCanvas("our_wedding_photo", "png"));
this.saveBtn.class("control-btn save");
this.setButtonSize(this.saveBtn, buttonWidth, buttonHeight);

this.backBtn = createButton("Back to Start");
this.backBtn.position(backBtnX - 50, backBtnY - 20);
this.backBtn.mousePressed(() => switchScene(0));
this.backBtn.class("control-btn secondary");
this.setButtonSize(this.backBtn, buttonWidth, buttonHeight);
  }

  removeUI() {
    let  els = [
      this.fileInput,
      this.saveBtn,
      this.camBtn,
      this.snapBtn,
      this.resetBtn,
      this.flipBtn,
      this.rotateLeftBtn,
      this.rotateRightBtn,
      this.backBtn,
      this.widthSlider,
      this.heightSlider,
      this.rotationSlider,
      this.widthLabelEl,
      this.heightLabelEl,
      this.rotationLabelEl,
    ];

    for (let el of els) {
      if (el) el.remove();
    }

    for (let el of this.uiExtras) {
      if (el) el.remove();
    }
    this.uiExtras = [];

    this.fileInput = null;
    this.saveBtn = null;
    this.camBtn = null;
    this.snapBtn = null;
    this.resetBtn = null;
    this.flipBtn = null;
    this.rotateLeftBtn = null;
    this.rotateRightBtn = null;
    this.backBtn = null;
    this.widthSlider = null;
    this.heightSlider = null;
    this.rotationSlider = null;
    this.widthLabelEl = null;
    this.heightLabelEl = null;
    this.rotationLabelEl = null;
  }

  // ---------------------------
  // File upload
  // ---------------------------
  handleFile(file) {
    if (file && file.type === "image") {
      loadImage(file.data, (img) => {
        this.userImg = img;
        this.imgOffsetX = 0;
        this.imgOffsetY = 0;
      });
    }
  }

  startCamera() {
    this.usingCamera = true;
    if (this.snapBtn) this.snapBtn.show();
  }

  takePhoto() {
    if (!this.video) return;

    let  capturedImg = this.video.get();
    let  flipped = createGraphics(capturedImg.width, capturedImg.height);

    flipped.push();
    flipped.translate(capturedImg.width, 0);
    flipped.scale(-1, 1);
    flipped.image(capturedImg, 0, 0);
    flipped.pop();

    this.userImg = flipped;
    this.imgOffsetX = 0;
    this.imgOffsetY = 0;

    this.usingCamera = false;
    if (this.snapBtn) this.snapBtn.hide();
  }

  // ---------------------------
  // Transforms
  // ---------------------------
  resetPosition() {
    this.userImgW = 400;
    this.userImgH = 400;
    this.userImgRotation = 0;
    this.userImgFlipped = false;

    this.imgOffsetX = 0;
    this.imgOffsetY = 0;

    if (this.widthSlider) this.widthSlider.value(this.userImgW);
    if (this.heightSlider) this.heightSlider.value(this.userImgH);
    if (this.rotationSlider) this.rotationSlider.value(0);

    this.updateWidthLabel(this.userImgW);
    this.updateHeightLabel(this.userImgH);
    this.updateRotationLabel();
  }

  rotateImage(deg) {
    if (!this.userImg) return;

    this.userImgRotation += deg;
    if (this.userImgRotation > 180) this.userImgRotation -= 360;
    if (this.userImgRotation < -180) this.userImgRotation += 360;

    if (this.rotationSlider) this.rotationSlider.value(this.userImgRotation);
    this.updateRotationLabel();
  }

  flipImage() {
    if (!this.userImg) return;
    this.userImgFlipped = !this.userImgFlipped;
  }


  mousePressed() {
    if (!this.userImg || !this.frameBounds) return;

    let  bx = this.frameBounds.x;
    let by = this.frameBounds.y;
    let  bw = this.frameBounds.width;
    let  bh = this.frameBounds.height;

    if (mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh) {
      let  cx = bx + bw / 2;
      let  cy = by + bh / 2;

      this.dragging = true;
      this.dragStartOffX = this.imgOffsetX - (mouseX - cx);
      this.dragStartOffY = this.imgOffsetY - (mouseY - cy);
    }
  }

  mouseDragged() {
    if (!this.dragging || !this.frameBounds) return;

    let  cx = this.frameBounds.x + this.frameBounds.width / 2;
    let  cy = this.frameBounds.y + this.frameBounds.height / 2;

    this.imgOffsetX = (mouseX - cx) + this.dragStartOffX;
    this.imgOffsetY = (mouseY - cy) + this.dragStartOffY;

    this.constrainImageOffset(this.frameBounds.width, this.frameBounds.height);
  }

  mouseReleased() {
    this.dragging = false;
  }

  mouseWheel(event) {
    if (!this.userImg) return;

    let  zoomFactor = event.delta > 0 ? 0.95 : 1.05;
    this.userImgW *= zoomFactor;
    this.userImgH *= zoomFactor;

  
    if (this.frameBounds) {
      this.constrainImageOffset(this.frameBounds.width, this.frameBounds.height);
    }

    if (this.widthSlider) this.widthSlider.value(constrain(this.userImgW, 80, 6000));
    if (this.heightSlider) this.heightSlider.value(constrain(this.userImgH, 80, 6000));
    this.updateWidthLabel();
    this.updateHeightLabel();

    return false;
  }


  keyPressed() {
    if (keyCode === RIGHT_ARROW) {
      this.currentFrameIndex = (this.currentFrameIndex + 1) % WEMARRY_COUNT;
    } else if (keyCode === LEFT_ARROW) {
      this.currentFrameIndex = (this.currentFrameIndex - 1 + WEMARRY_COUNT) % WEMARRY_COUNT;
    }

 

    if (this.frameBounds) {
      this.constrainImageOffset(this.frameBounds.width, this.frameBounds.height);
    }

    if (key === "q" || key === "Q") this.rotateImage(-5);
    else if (key === "e" || key === "E") this.rotateImage(5);

    if (key === "f" || key === "F") this.flipImage();

    if (key === "+" || key === "=") {
      this.userImgW *= 1.1;
      this.userImgH *= 1.1;
    } else if (key === "-" || key === "_") {
      this.userImgW *= 0.9;
      this.userImgH *= 0.9;
    }

    if (this.frameBounds) {
      this.constrainImageOffset(this.frameBounds.width, this.frameBounds.height);
    }

    if (this.widthSlider) this.widthSlider.value(constrain(this.userImgW, 80, 6000));
    if (this.heightSlider) this.heightSlider.value(constrain(this.userImgH, 80, 6000));
    this.updateWidthLabel();
    this.updateHeightLabel();
  }

  handleWidthSlider() {
    if (!this.widthSlider) return;
    this.userImgW = this.widthSlider.value();
    if (this.frameBounds) {
      this.constrainImageOffset(this.frameBounds.width, this.frameBounds.height);
    }
    this.updateWidthLabel();
  }

  handleHeightSlider() {
    if (!this.heightSlider) return;
    this.userImgH = this.heightSlider.value();
    if (this.frameBounds) {
      this.constrainImageOffset(this.frameBounds.width, this.frameBounds.height);
    }
    this.updateHeightLabel();
  }

  computeButtonMetrics() {
    let  maxWidth = width * 0.25;
    let  buttonWidth = Math.min(200, maxWidth);
    let  buttonHeight = 44;
    let  rowSpacing = buttonWidth + 20;
   
    let  quickButtonWidth = Math.min(Math.max(90, buttonWidth * 0.7), maxWidth);
    let  quickButtonHeight = Math.max(32, buttonHeight - 10);
    let  quickSpacing = quickButtonWidth + 16;
    let  quickRowGap = 12;
    return {
      buttonWidth,
      buttonHeight,
      rowSpacing,
    
      quickButtonWidth,
      quickButtonHeight,
      quickSpacing,
      quickRowGap,
    };
  }

  setButtonSize(btn, targetWidth, targetHeight) {
    if (!btn) return;
    let  maxWidth = width * 0.25;
    let  clampedWidth = Math.min(targetWidth, maxWidth);
    btn.style("width", clampedWidth + "px");
    btn.style("max-width", maxWidth + "px");
    btn.style("height", targetHeight + "px");
    btn.style("line-height", targetHeight + "px");
    btn.style("box-sizing", "border-box");
  }

  updateWidthLabel(value = this.userImgW) {
    if (this.widthLabelEl) this.widthLabelEl.html("Width: " + round(value) + "px");
  }

  updateHeightLabel(value = this.userImgH) {
    if (this.heightLabelEl) this.heightLabelEl.html("Height: " + round(value) + "px");
  }

  updateRotationLabel() {
    if (this.rotationLabelEl) this.rotationLabelEl.html("Rotation: " + round(this.userImgRotation) + "°");
  }


  
}
