// 宣告變數來儲存精靈圖片（Sprite Sheet）
let spriteSheet;

// 定義精靈圖片的總寬度與總高度
const totalWidth = 940;
const totalHeight = 146;

// 定義精靈圖片中包含的總影格（張數）數量
const totalFrames = 4;

// 計算單張影格的原始寬度與原始高度
const frameWidth = totalWidth / totalFrames; // 940 / 4 = 235
const frameHeight = totalHeight;             // 146

// 宣告變數來追蹤目前播放到第幾張影格
let currentFrame = 0;

// 設定動畫播放速度（數值越小，切換越快）
const frameDelay = 8;

// 宣告變數來儲存角色目前的水平 X 座標位置
let posX;

// 設定角色的移動速度（每秒移動的像素距離）
const moveSpeed = 6;

// 記錄角色目前的面向方向：1 代表向右，-1 代表向左
let facingDirection = 1;

// 角色相對於地面（畫布最底端）的垂直偏移量（0 代表在地面，負值代表在空中）
let jumpOffsetY = 0;

// 角色目前的垂直移動速度
let velocityY = 0;

// 重力加速度（數值越大，掉落速度越快）
const gravity = 0.8;

// 起跳瞬間的向上推力（負值代表往畫布上方移動）
const jumpForce = -18;

// 記錄角色目前是否正在空中，用來防止在空中無限連跳
let isJumping = false;

// preload 函式會在 setup 執行前載入外部資源
function preload() {
  // 載入指定路徑的角色 1 精靈圖片檔案
  spriteSheet = loadImage('1/magic1/magic1.png');
}

// setup 函式在程式啟動時執行一次，用來初始化環境
function setup() {
  // 建立一個符合瀏覽器視窗大小的全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 啟用圖片平滑處理，讓縮放後的邊緣更圓滑
  smooth();
  
  // 計算並初始化角色在畫布上的起始 X 座標（位於畫布 2/3 處）
  let displayHeight = height * 0.2;
  let displayWidth = displayHeight * (frameWidth / frameHeight);
  posX = (width * (2 / 3)) - (displayWidth / 2);
}

// draw 函式會以每秒 60 次的頻率持續重複執行
function draw() {
  // 設定背景顏色為天空色（RGB: 135, 206, 235）
  background(135, 206, 235);

  // 設定角色顯示的高度為目前畫布高度的 20%
  let displayHeight = height * 0.2;
  
  // 根據原始寬高比等比例計算顯示寬度，防止圖片變形
  let displayWidth = displayHeight * (frameWidth / frameHeight);

  // === 處理左右移動控制與面向方向 ===
  // 當按下鍵盤的「左方向鍵」時，角色向左移動並將面向改為向左
  if (keyIsDown(LEFT_ARROW)) {
    posX -= moveSpeed;
    facingDirection = -1; // 記錄面向左邊
    // 限制角色不能跑出畫面左側之外
    if (posX < 0) {
      posX = 0;
    }
  }
  
  // 當按下鍵盤的「右方向鍵」時，角色向右移動並將面向改為向右
  if (keyIsDown(RIGHT_ARROW)) {
    posX += moveSpeed;
    facingDirection = 1;  // 記錄面向右邊
    // 限制角色不能跑出畫面右側之外
    if (posX > width - displayWidth) {
      posX = width - displayWidth;
    }
  }

  // === 處理跳躍物理與重力運算 ===
  // 將垂直速度累加到垂直偏移量上
  jumpOffsetY += velocityY;

  // 如果角色在空中（偏移量小於 0），持續套用重力將速度往下拉
  if (jumpOffsetY < 0) {
    velocityY += gravity;
  } else {
    // 如果角色已經落回地面，重置位置與跳躍狀態
    jumpOffsetY = 0;
    velocityY = 0;
    isJumping = false;
  }

  // 計算角色在畫布上的 Y 座標（基礎地面高度加上跳躍偏移量）
  let posY = (height - displayHeight) + jumpOffsetY;

  // 計算目前影格在精靈大圖中的裁切起始 X 座標
  let sourceX = currentFrame * frameWidth;

  // === 繪製角色並支援左右翻轉 ===
  push(); // 儲存目前的繪製狀態
  
  // 如果角色面向左邊，使用推移與水平翻轉技巧
  if (facingDirection === -1) {
    translate(posX + displayWidth, posY); // 將座標原點移至角色右上角
    scale(-1, 1);                        // 將 X 軸反向（水平翻轉）
    image(
      spriteSheet,
      0, 0,                             // 在新座標原點繪製
      displayWidth, displayHeight,
      sourceX, 0, frameWidth, frameHeight
    );
  } else {
    // 如果面向右邊，正常繪製
    image(
      spriteSheet,
      posX, posY,
      displayWidth, displayHeight,
      sourceX, 0, frameWidth, frameHeight
    );
  }
  
  pop(); // 恢復繪製狀態，避免影響其他畫布元素

  // 利用 frameCount 取餘數來控制精靈動畫的播放頻率
  if (frameCount % frameDelay === 0) {
    // 切換至下一張影格，並透過取餘數循環（0 ~ 3）
    currentFrame = (currentFrame + 1) % totalFrames;
  }
}

// 當鍵盤上有按鍵被按下時觸發
function keyPressed() {
  // 檢查是否按下空白鍵（Spacebar），且角色不在空中
  if ((key === ' ' || keyCode === 32) && !isJumping) {
    // 給予向上的初始速度
    velocityY = jumpForce;
    // 標記目前正在跳躍中
    isJumping = true;
  }
}

// 當瀏覽器視窗大小改變時自動觸發
function windowResized() {
  // 自動調整畫布大小維持全螢幕
  resizeCanvas(windowWidth, windowHeight);
}