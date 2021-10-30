/** @type {HTMLCanvasElement} */

// 获取页面元素部分
const myCanvas = document.querySelector(".canvas > canvas");
const ctx = myCanvas.getContext("2d");
const game_title = document.querySelector(".aside .title");
const start = document.querySelector(".aside .start");
const ranking = document.querySelector(".aside .ranking tbody");
const help = document.querySelector(".help");
const bgm = document.querySelector("#bgm");
const fire_m = document.querySelector("#fire");
const explode_m = document.querySelector("#explode");
const gotenemy_m = document.querySelector("#gotEnemy");
const ranking_list = ranking.children;

const canvasWidth = ctx.canvas.width;
const canvasHeight = ctx.canvas.height;

// 常数 & 变量区域
const bulletRate = 20;
const planeSize = 60;
const bulletSizeX = 12;
const bulletSizeY = 16;
const spoilSize = 32;
const cardWidth = 100;
const cardHeight = 140;
const crack_lr = 270;
const crack_card = 30;
const fontsize = 16;
const crack_hand = 35;
const crack_selected = 60;
let rate = 8;
let enterCardGame = 0;
let bulletCoolTime = 500;
let startflag = 0;
let mapIteator = 0;
let scoreMap = new Map();
let enemyArr = [];
let bulletQueue = [];
let bulletCooling = false;
let spoilList = [];
let cardBoard = null;
let myCard = null;
let enemyCard = null;
let allCard = [];
let myplane = null;
let score = 0;
let enemyCardScore = 0;
let myCardScore = 0;
let help_flag = 0;
let bulletCool = null;
let pushEnemyArr = null;
let gamerun = null;
let heart = 0;
let gameResult = false;
let selectIndex = -1;
let myHandNum = 6;
let enemyHandNum = 6;
let myHandOutWidth = 20;
let enemyHandOutWidth = 20;
let linear = ctx.createLinearGradient(10, 20, 250, 20);
let playHand = true;
linear.addColorStop(0, "#9F0100");
linear.addColorStop(1, "#FF3603");

// 图片加载部分
const bgi = new Image();
const bgi0 = new Image();
const bgi1 = new Image();
const planeN = new Image();
const planeE = new Image();
const enemy = new Image();
const bullet = new Image();
const heart_i = new Image();
const rate_i = new Image();
const card1 = new Image();
const card_back = new Image();
const enemybullet_i = new Image();
const blue_c = new Image();
const red_c = new Image();

planeE.src = "image/planeExplode.png";
planeN.src = "image/planeNormal.png";
enemy.src = "image/enemyPlane.png";
bullet.src = "image/bullet.png";
bgi.src = "image/background.jpg";
bgi0.src = "image/background0.jpg";
bgi1.src = "image/background1.jpg";
heart_i.src = "image/heart.png";
rate_i.src = "image/rate.png";
card1.src = "image/card1.png";
card_back.src = "image/card_back.jpg";
enemybullet_i.src = "image/enemybullet.png";

// 类及函数定义部分
class myBullet {
  constructor(pX, pY) {
    this.positonX = pX;
    this.positonY = pY;
  }
}
class enemyBullet {
  constructor(pX, pY, classify) {
    this.positonY = pY + planeSize;
    this.classify = classify;
    switch (this.classify) {
      case 0:
        // 普通弹
        this.positonX = pX + planeSize * 3 / 7;
        this.rateY = 28;
        break;
      case 1:
        // 交叉弹
        this.positonX0 = pX + planeSize * 3 / 7;
        this.positonX1 = pX + planeSize * 3 / 7;
        this.rateY = Math.floor(Math.random() * 5 + 15);
        this.rateX = this.rateY / 2;
        break;
      case 2:
        // 滞留弹
        this.positonX0 = pX + planeSize * 3 / 7;
        this.positonX1 = pX + planeSize * 3 / 7;
        this.positonX2 = pX + planeSize * 3 / 7;
        this.rateY = Math.floor(Math.random() * 3 + 13);
        this.rateX = this.rateY / 3;
      case 3:
        // 分叉弹
        this.positonX0 = pX + planeSize * 3 / 7;
        this.positonX1 = pX + planeSize * 3 / 7;
        this.positonX2 = pX + planeSize * 3 / 7;
        this.rateY = Math.floor(Math.random() * 5 + 10);
        this.rateX = this.rateY / 4;
        break;
    }
  }
  bulletMove () {
    this.positonY += this.rateY;
    switch (this.classify) {
      case 0:
        break;
      case 1:
        this.positonX0 -= this.rateX;
        this.positonX1 += this.rateX;
        this.rateX--;
        break;
      case 2:
        if (this.rateY === 12) {
          this.positonY -= this.rateY;
          this.positonX0 -= this.rateX;
          this.positonX2 += this.rateX;
        } else {
          this.rateY--;
        }
        break;
      case 3:
        this.positonX0 -= this.rateX;
        this.positonX2 += this.rateX;
        break;
    }
  }
}
class myPlane {
  constructor() {
    this.positonX = canvasWidth / 2 - planeSize / 2;
    this.positonY = canvasHeight * 5 / 7;
  }
  fireBullet () {
    if (!bulletCooling) {
      bulletQueue.push(new myBullet(this.positonX, this.positonY));
      fire_m.play();
      bulletCooling = true;
      clearInterval(bulletCool);
      bulletCool = setInterval(() => {
        bulletCooling = false;
      }, 500);
    }
  }
}
class enemyPlane {
  constructor(pX, pY) {
    this.positonX = pX;
    this.positonY = pY;
    this.rate = Math.floor(Math.random() * 3 + 2.4);
    this.spoils = 0;
    // 敌机速度为3，4的概率大于2大于5
    this.bulletQueue = [];
  }
  fireBullet () {
    let enemyFireBullet = null;
    const fireClassify = Math.floor(Math.random() * 4);
    const fireTime = Math.floor((Math.random() * 1.5 + 1.5) * 1000);
    // [0,4) fireClassify 属于 Z
    clearInterval(enemyFireBullet);
    enemyFireBullet = setInterval(() => {
      if (this.positonY > 0 && this.positonY < canvasHeight - planeSize) {
        this.bulletQueue.push(new enemyBullet(this.positonX, this.positonY, fireClassify));
      } else if (this.positonY > canvasHeight - planeSize) {
        clearInterval(enemyFireBullet);
      }
    }, fireTime);
  }
}
class Spoils {
  constructor(pX, pY) {
    this.positonX = pX;
    this.positonY = pY;
    const randomSpoil = Math.random() * 0.2 + 1;
    if (randomSpoil > 1 && randomSpoil <= 1.1) {
      this.randomSpoil = 1;
      // 第一种战利品，加分？
    } else if (randomSpoil > 1.1 && randomSpoil <= 1.18) {
      this.randomSpoil = 2;
      // 第二种战利品，回血
    } else if (randomSpoil > 1.18 && randomSpoil <= 1.2) {
      this.randomSpoil = 3;
      // 第三种战利品，加别的？
    }
  }
  getSpoil () {
    switch (this.randomSpoil) {
      case 1:
        score++;
        break;
      case 2:
        if (heart + 2 <= 16) {
          heart += 2;
        } else if (heart > 20) {
          heart = 99999;
        } else {
          heart = 16;
        }
        break;
      case 3:
        if (rate < 12) {
          rate++;
        } else {
          score += 3;
        }
        break;
    }
  }
}
class Card {
  constructor(top, right, bottom, left, camp) {
    // this.asum = top + right + left + bottom;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    this.camp = camp;
    this.row = -1;
    this.col = -1;
  }
  switchCamp () {
    this.camp = !this.camp;
  }
}

function createEnemy () {
  const pX = Math.floor(Math.random() * (canvasWidth - planeSize + 1));
  const pY = -planeSize;
  const newEnemy = new enemyPlane(pX, pY);
  newEnemy.fireBullet();
  return newEnemy;
}
function reliveEnemy (k, delay = 2000, errTime = 4000) {
  enemyArr[k].positonY = NaN;
  // 我直接给你搞成NaN(￣_￣ )
  const time = Math.floor(Math.random() * delay + errTime);
  // 随机的复活时间
  setTimeout(() => {
    enemyArr[k] = createEnemy();
  }, time);
}
function drawGame (plane) {
  ctx.drawImage(bgi, 0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(plane, myplane.positonX, myplane.positonY, planeSize, planeSize);
  for (const k of enemyArr) {
    ctx.drawImage(enemy, k.positonX, k.positonY, planeSize, planeSize);
    for (const b of k.bulletQueue) {
      switch (b.classify) {
        case 0:
          ctx.drawImage(enemybullet_i, b.positonX, b.positonY, bulletSizeX, bulletSizeY);
          break;
        case 1:
          ctx.drawImage(enemybullet_i, b.positonX0, b.positonY, bulletSizeX, bulletSizeY);
          ctx.drawImage(enemybullet_i, b.positonX1, b.positonY, bulletSizeX, bulletSizeY);
          break;
        case 2:
        case 3:
          ctx.drawImage(enemybullet_i, b.positonX0, b.positonY, bulletSizeX, bulletSizeY);
          ctx.drawImage(enemybullet_i, b.positonX1, b.positonY, bulletSizeX, bulletSizeY);
          ctx.drawImage(enemybullet_i, b.positonX2, b.positonY, bulletSizeX, bulletSizeY);
      }
    }
  }
  for (const k of bulletQueue) {
    ctx.drawImage(bullet, k.positonX + planeSize / 2 - 10, k.positonY, bulletSizeX, bulletSizeY);
  }
  for (const k of spoilList) {
    switch (k.randomSpoil) {
      case 1:
        ctx.drawImage(card1, k.positonX - spoilSize / 2, k.positonY - spoilSize / 2, spoilSize, spoilSize);
        break;
      case 2:
        ctx.drawImage(heart_i, k.positonX - spoilSize / 2, k.positonY - spoilSize / 2, spoilSize, spoilSize);
        break;
      case 3:
        ctx.drawImage(rate_i, k.positonX - spoilSize / 2, k.positonY - spoilSize / 2, spoilSize, spoilSize);
    }
  }
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 240, 30);
  ctx.fillStyle = linear;
  ctx.fillRect(10, 10, 240, 30);
  ctx.fillStyle = "#000";
  ctx.font = '30px 微软雅黑';
  ctx.textAlign = "left";
  const hover = (16 - heart) / 16;
  const scorestr = score >= 10 ? score >= 100 ? score.toString() : '0' + score : '00' + score;
  ctx.fillText("分数:" + scorestr, canvasWidth - 140, 35);
  if (hover <= 1 && hover > 0) {
    ctx.fillRect(250 - 240 * hover, 10, 240 * hover, 30);
  } else if (hover > 1) {
    ctx.fillRect(10, 10, 240, 30);
  }
  ctx.fillStyle = "#C6E8FE";
  ctx.fillText("血量:" + (heart < 0 ? 0 : heart), 75, 37);
}
function drawBoard () {
  myHandOutWidth = cardWidth / (myHandNum === 1 ? 1 : myHandNum - 1);
  enemyHandOutWidth = cardWidth / (enemyHandNum === 1 ? 1 : enemyHandNum - 1);
  ctx.textAlign = 'center';
  ctx.font = "20px 微软雅黑";
  ctx.fillStyle = "#EBF3FA";
  ctx.drawImage(bgi0, 0, 0, canvasWidth, canvasHeight);
  ctx.strokeStyle = "#BD5313";
  //绘制网格部分
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(crack_lr + crack_card / 2, crack_card / 2 + i * (crack_card + cardHeight));
    ctx.lineTo(canvasWidth - crack_lr - crack_card / 2, crack_card / 2 + i * (crack_card + cardHeight));
    ctx.moveTo(crack_lr + crack_card / 2 + i * (crack_card + cardWidth), crack_card / 2);
    ctx.lineTo(crack_lr + crack_card / 2 + i * (crack_card + cardWidth), canvasHeight - crack_card / 2);
    ctx.stroke();
  }
  // 绘制牌桌上的卡牌，这里要改成依据数据绘制
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const vertex_x = crack_lr + crack_card + j * (cardWidth + crack_card);
      const vertex_y = crack_card + i * (cardHeight + crack_card);
      ctx.beginPath();
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(vertex_x, vertex_y, cardWidth, cardHeight);
      if (!!cardBoard[i][j]) {
        if (cardBoard[i][j].camp) {
          ctx.drawImage(blue_c, vertex_x, vertex_y, cardWidth, cardHeight);
        } else if (!cardBoard[i][j].camp) {
          ctx.drawImage(red_c, vertex_x, vertex_y, cardWidth, cardHeight);
        }
        ctx.fillText(cardBoard[i][j].top.toString(), vertex_x + cardWidth / 2, vertex_y + fontsize);
        ctx.fillText(cardBoard[i][j].bottom.toString(), vertex_x + cardWidth / 2, vertex_y + cardHeight);
        ctx.fillText(cardBoard[i][j].left.toString(), vertex_x + fontsize / 2, vertex_y + cardHeight / 2 + fontsize / 2);
        ctx.fillText(cardBoard[i][j].right.toString(), vertex_x + cardWidth - fontsize / 2, vertex_y + cardHeight / 2 + fontsize / 2);
      }
    }
  }
  // 绘制双方的手牌
  for (let i = 0; i < enemyHandNum; i++) {
    const vertex_x = crack_hand + i * enemyHandOutWidth;
    const vertex_y = canvasHeight - cardHeight - crack_hand;
    ctx.drawImage(card_back, vertex_x, vertex_y, cardWidth, cardHeight);
  }
  for (let i = 0; i < myHandNum; i++) {
    let offset = 0;
    if (i === selectIndex) {
      offset = 20;
    }
    const vertex_x = canvasWidth - crack_lr + crack_hand + i * myHandOutWidth;
    const vertex_y = canvasHeight - cardHeight - crack_hand - offset;
    ctx.strokeRect(vertex_x, vertex_y, cardWidth, cardHeight);
    ctx.drawImage(blue_c, vertex_x, vertex_y, cardWidth, cardHeight);
    ctx.fillText(myCard[i].left.toString(), vertex_x + fontsize / 2, vertex_y + cardHeight / 2 + fontsize / 2);
    ctx.fillText(myCard[i].bottom.toString(), vertex_x + cardWidth / 2, vertex_y + cardHeight);
    ctx.fillText(myCard[i].right.toString(), vertex_x + cardWidth - fontsize / 2, vertex_y + cardHeight / 2 + fontsize / 2);
    ctx.fillText(myCard[i].top.toString(), vertex_x + cardWidth / 2, vertex_y + fontsize);
  }
  // 绘制备选卡牌与得分区域，这里手动添加了一个块作用域
  {
    const vertex_x = canvasWidth - crack_lr + crack_selected;
    const vertex_y = 2 * crack_selected;
    const selected_width = cardWidth * 3 / 2;
    const selected_height = cardHeight * 3 / 2;
    ctx.strokeRect(vertex_x, vertex_y, selected_width, selected_height);
    if (selectIndex >= 0) {
      ctx.drawImage(blue_c, vertex_x, vertex_y, selected_width, selected_height);
      ctx.fillText(myCard[selectIndex].top.toString(), vertex_x + selected_width / 2, vertex_y + fontsize);
      ctx.fillText(myCard[selectIndex].bottom.toString(), vertex_x + selected_width / 2, vertex_y + selected_height);
      ctx.fillText(myCard[selectIndex].left.toString(), vertex_x + fontsize / 2, vertex_y + selected_height / 2 + fontsize / 2);
      ctx.fillText(myCard[selectIndex].right.toString(), vertex_x + selected_width - fontsize / 2, vertex_y + selected_height / 2 + fontsize / 2);
    }
    ctx.strokeRect(crack_selected, vertex_y, selected_width, selected_height);
    ctx.font = "30px 微软雅黑";
    ctx.fillText("我方得分：" + myCardScore, vertex_x + selected_width / 2, vertex_y - crack_selected);
    ctx.fillText("敌方得分：" + enemyCardScore, crack_selected + selected_width / 2, vertex_y - crack_selected);
  }
}
function initGame () {
  startflag = 1;
  score = 0;
  heart = 16;
  enemyArr = null;
  bulletQueue = null;
  enemyArr = [];
  bulletQueue = [];
  spoilList = [];
  // 应该先将两个数组设为空在进行游戏配置的初始化，因为游戏配置里有需要判断空数组的条件
  myplane = new myPlane();
  game_title.innerHTML = "飞机大战";
  game_title.className = "title";
  help.innerHTML = "躲避子弹，击败敌机，获取高分";
  gameSet();
  drawGame(planeN);
}
function initCard () {
  // 还是逻辑的问题，先初始化卡组，再分配卡牌
  myHandNum = 6;
  enemyHandNum = 6;
  selectIndex = -1;
  enemyCardScore = 0;
  myCardScore = 0;
  initAllCard();
  myCard = [];
  enemyCard = [];
  initCardGroup(myCard);
  initCardGroup(enemyCard);
  for (const k of enemyCard) {
    k.camp = false;
  }
  for (const k of myCard) {
    k.camp = true;
  }
  cardBoard = [[], [], []];
  playHand = true;
  enterCardGame = 2;
  stopGame();
  startflag = 2;
  blue_c.src = "image/blueCard.png";
  red_c.src = "image/redCard.png";
  red_c.onload = () => {
    setTimeout(() => {
      drawBoard();
      game_title.innerHTML = "Double Twin";
      game_title.className = "title1";
      help.innerHTML = "欢迎进入Double Twin！放置卡牌，与敌方卡牌拼点并赢取它，获取高分并取得胜利";
    }, 50);
  }
  // console.log(allCard);
}
function gameSet () {
  stopGame();
  pushEnemyArr = setInterval(() => {
    if (startflag === 1 && enemyArr.length < 8 + score / 25 && enemyArr.length <= 16) {
      enemyArr.push(createEnemy());
    }
  }, 5000);
  bulletCool = setInterval(() => {
    bulletCooling = false;
  }, bulletCoolTime);
  gamerun = setInterval(() => {
    if (bulletQueue.length !== 0) {
      for (const k of bulletQueue) {
        k.positonY -= bulletRate;
        if (k.positonY < 0) {
          bulletQueue.shift();
        }
        for (let e = 0; e < enemyArr.length; e++) {
          // 对于命中敌人的判定
          if (k.positonY >= enemyArr[e].positonY && k.positonY <= enemyArr[e].positonY + planeSize) {
            if (k.positonX + planeSize / 2 >= enemyArr[e].positonX + 10 && k.positonX + planeSize / 2 <= enemyArr[e].positonX + planeSize) {
              score++;
              if (enterCardGame === 0) {
                if (score % 25 >= 20) {
                  help.innerHTML = "您已达到足够的分数，按p键进入卡牌游戏环节";
                  help_flag = 1;
                } else if (help_flag === 1 && score % 25 < 20) {
                  help.innerHTML = "抱歉您错过了进入卡牌游戏的时间";
                  help_flag = 0;
                  setTimeout(() => {
                    help.innerHTML = "躲避子弹，击败敌机，获取高分";
                  }, 3000);
                }
              }
              const randomSpoil = Math.random();
              if (randomSpoil > 0.5 && spoilList.length <= 8) {
                spoilList.push(new Spoils(enemyArr[e].positonX, enemyArr[e].positonY));
              }
              gotenemy_m.play();
              reliveEnemy(e);
              bulletQueue.shift();
            }
          }
        }
      }

      drawGame(planeN);
    }
    if (enemyArr.length !== 0) {
      for (let k = 0; k < enemyArr.length; k++) {
        // 敌机子弹出界判定，敌机出界判定
        enemyArr[k].positonY += enemyArr[k].rate;
        for (const b of enemyArr[k].bulletQueue) {
          b.bulletMove();
          if (b.positonY > canvasHeight) {
            enemyArr[k].bulletQueue.shift();
          }
        }
        if (enemyArr[k].positonY >= canvasHeight) {
          reliveEnemy(k);
        }
      }
      drawGame(planeN);
      for (let k = 0; k < enemyArr.length; k++) {

        const myPoX = myplane.positonX + planeSize / 2;
        const myPoY = myplane.positonY + planeSize / 2;
        // 判断是否与敌机相撞
        if (myPoX >= enemyArr[k].positonX && myPoX <= enemyArr[k].positonX + planeSize) {
          if (myPoY >= enemyArr[k].positonY && myPoY <= enemyArr[k].positonY + planeSize * 3 / 2) {
            heart -= 5;
            explode_m.play();
            reliveEnemy(k);
          }
        }
        // 判断是否被敌机子弹击中
        for (const b of enemyArr[k].bulletQueue) {
          switch (b.classify) {
            case 0:
              if (judgeHit(b.positonX, b.positonY, myPoX, myPoY, b)) {
                b.positonX = NaN;
              }
              break;
            case 1:
              if (judgeHit(b.positonX0, b.positonY, myPoX, myPoY, b)) {
                b.positonX0 = NaN;
              }
              if (judgeHit(b.positonX1, b.positonY, myPoX, myPoY, b)) {
                b.positonX1 = NaN;
              }
              break;
            case 2:
            case 3:
              if (judgeHit(b.positonX0, b.positonY, myPoX, myPoY, b)) {
                b.positonX0 = NaN;
              }
              if (judgeHit(b.positonX1, b.positonY, myPoX, myPoY, b)) {
                b.positonX1 = NaN;
              }
              if (judgeHit(b.positonX2, b.positonY, myPoX, myPoY, b)) {
                b.positonX2 = NaN;
              }
              break;
          }
        }
        // 判断是否拾取到战利品
        for (let s = 0; s < spoilList.length; s++) {
          if (spoilList[s].positonY >= myPoY - planeSize / 2 && spoilList[s].positonY <= myPoY + planeSize / 2) {
            if (spoilList[s].positonX >= myPoX - planeSize / 2 && spoilList[s].positonX <= myPoX + planeSize / 2) {
              spoilList[s].getSpoil();
              spoilList.splice(s, 1);
            }
          }
        }
      }
      if (heart <= 0) {
        gameOver();
      }
    }
    if (enterCardGame === 2 && help_flag === 1) {
      enterCardGame = 3;
      if (gameResult) {
        help.innerHTML = "知道你可以的！你已经得到了一项增益";
      } else {
        help.innerHTML = "别灰心，继续收集更好的卡牌战胜他吧！";
      }
      help_flag = 0;
      setTimeout(() => {
        help.innerHTML = "躲避子弹，击败敌机，获取高分";
      }, 3000);
    } else if (enterCardGame === 3 && score % 25 < 20) {
      enterCardGame = 0;
    }
  }, 40);
}
function stopGame () {
  clearInterval(pushEnemyArr);
  clearInterval(bulletCool);
  clearInterval(gamerun);
}
function continueGame () {
  startflag = 1;
  gameSet();
  for (const k in enemyArr) {
    reliveEnemy(k, 1000, 2000);
    enemyArr[k].bulletQueue = [];
  }
  drawGame(planeN);
}
function judgeHit (bulletX, bulletY, myPoX, myPoY, bullet) {
  if (bulletY >= myPoY - planeSize / 2 && bulletY <= myPoY + planeSize / 2) {
    if (bulletX >= myPoX - planeSize / 2 && bulletX <= myPoX + planeSize / 2) {
      explode_m.play();
      heart--;
      return true;
    }
  }
  return false;
}
function gameOver () {
  drawGame(planeE);
  explode_m.play();
  bgm.src = "";
  bgm.src = "music/game_music.mp3";
  startflag = 0;
  const scorestr = score >= 10 ? score >= 100 ? score.toString() : '0' + score : '00' + score;
  let name = start.nextElementSibling.value;
  name = name === "" ? "无名氏" : name;
  scoreMapAdd(name, scorestr);
  start.innerHTML = "游戏结束";
  delayR()
    .then(value => {
      start.innerHTML = "距离重新开始还有5秒";
      return delayR();
    }).then(value => {
      start.innerHTML = "距离重新开始还有4秒";
      return delayR();
    }).then(value => {
      start.innerHTML = "距离重新开始还有3秒";
      return delayR();
    }).then(value => {
      start.innerHTML = "距离重新开始还有2秒";
      return delayR();
    }).then(value => {
      start.innerHTML = "距离重新开始还有1秒";
      return delayR();
    }).then(value => {
      start.innerHTML = "开始游戏";
      start.disabled = false;
    })
  clearInterval(gamerun);
}
function scoreMapAdd (...data) {
  if (scoreMap.size < ranking_list.length) {
    scoreMap.set(mapIteator++, data);
  } else if (scoreMap.size === ranking_list.length) {
    scoreMap.set(mapIteator, data);
    mapSort(scoreMap);
    scoreMap.delete(mapIteator);
  }
  mapSort(scoreMap);
  scoreMap.forEach((value, key, scoreMap) => {
    const rk = ranking_list[key];
    if (rk.children.length === 0) {
      const tdNumber = document.createElement('td');
      const tdValue = document.createElement('td');
      const tdName = document.createElement('td');
      tdNumber.innerHTML = key + 1 + ":";
      tdValue.innerHTML = value[1];
      tdName.innerHTML = value[0];
      rk.appendChild(tdNumber);
      rk.appendChild(tdValue);
      rk.appendChild(tdName);
    } else if (rk.children.length === 3) {
      rk.removeChild(rk.children[2]);
      rk.removeChild(rk.children[1]);
      rk.removeChild(rk.children[0]);
      const tdNumber = document.createElement('td');
      const tdValue = document.createElement('td');
      const tdName = document.createElement('td');
      tdNumber.innerHTML = key + 1 + ":";
      tdValue.innerHTML = value[1];
      tdName.innerHTML = value[0];
      rk.appendChild(tdNumber);
      rk.appendChild(tdValue);
      rk.appendChild(tdName);
    }

  })

}
function mapSort (map) {
  map.forEach((value, key, map) => {
    let max = value;
    let maxk = key;
    for (let k = key + 1; k < map.size; k++) {
      if (parseInt(map.get(k)[1], 10) > parseInt(max[1], 10)) {
        max = map.get(k);
        maxk = k;
      }
    }
    let temp = map.get(key);
    map.set(key, map.get(maxk));
    map.set(maxk, temp);
  })
}
function delayR () {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  })
}
function initAllCard () {
  allCard.push(new Card(1, 8, 6, 9));
  allCard.push(new Card(7, 7, 3, 5));
  allCard.push(new Card(5, 9, 9, 3));
  allCard.push(new Card(9, 7, 9, 1));
  allCard.push(new Card(3, 5, 4, 5));
  allCard.push(new Card(6, 2, 2, 2));
  allCard.push(new Card(5, 4, 8, 2));
  allCard.push(new Card(2, 6, 6, 6));
  allCard.push(new Card(2, 5, 3, 9));
  allCard.push(new Card(6, 6, 5, 4));
  allCard.push(new Card(6, 3, 4, 9));
  allCard.push(new Card(6, 4, 11, 8));
  allCard.sort((card_a, card_b) => {
    let sum_a = 0;
    let sum_b = 0;
    for (const k in card_a) {
      if (typeof card_a[k] === "number" && typeof card_b[k] === "number") {
        sum_a += card_a[k];
        sum_b += card_b[k];
      }
    }
    return sum_a - sum_b;
  });
}
function initCardGroup (cardGroup) {
  let flagArr = [];
  for (let k = 0; k < allCard.length; k++) {
    flagArr[k] = false;
  }
  for (let k = 0; k < 6;) {
    const randomNum = Math.floor(Math.random() * allCard.length);
    if (!flagArr[randomNum]) {
      // 这里需要用到一个深拷贝
      let temp = new Card();
      Object.assign(temp, allCard[randomNum]);
      cardGroup.push(temp);
    } else {
      continue;
    }
    flagArr[randomNum] = true;
    k++;
  }
}
function enemyPlayHand () {
  setTimeout(() => {
    let i = -1;
    let j = -1;
    let hasempty = false;
    do {
      hasempty = false;
      i = Math.floor(Math.random() * 3);
      j = Math.floor(Math.random() * 3);
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          if (!cardBoard[a][b]) {
            hasempty = true;
          }
        }
      }
    } while (!!cardBoard[i][j] && hasempty);
    if (hasempty) {
      cardBoard[i][j] = enemyCard[0];
      enemyCard.splice(0, 1);
      enemyHandNum--;
      enemyCardScore++;
      compareCard(i, j);
      playHand = true;
      setTimeout(() => {
        drawBoard();
      }, 300);
      help.innerHTML = "轮到你了";
    } else if (!hasempty) {
      myCardScore += myHandNum;
      enemyCardScore += enemyHandNum;
      drawBoard();
      if (myCardScore > enemyCardScore) {
        help.innerHTML = "游戏结束，恭喜你获胜！";
        gameResult = true;
      } else {
        help.innerHTML = "游戏结束，很遗憾你失败了...";
        gameResult = false;
      }
      setTimeout(() => {
        cardBoard = null;
        continueGame();
      }, 3000);
    }
  }, 1000);
}
function compareCard (row, col) {
  let thisCamp = cardBoard[row][col].camp;
  if (row - 1 >= 0) {
    compareDetil(row - 1, col, row, col, thisCamp);
  }
  if (row + 1 <= 2) {
    compareDetil(row + 1, col, row, col, thisCamp);
  }
  if (col - 1 >= 0) {
    compareDetil(row, col - 1, row, col, thisCamp);
  }
  if (col + 1 <= 2) {
    compareDetil(row, col + 1, row, col, thisCamp);
  }
}
function compareDetil (target_row, target_col, row, col, thisCamp) {
  if (!!cardBoard[target_row][target_col]) {
    if (thisCamp !== cardBoard[target_row][target_col].camp) {
      let property1 = 0;
      let property2 = 0;
      if (target_row === row - 1) {
        property1 = cardBoard[row][col].top;
        property2 = cardBoard[target_row][target_col].bottom;
      } else if (target_row === row + 1) {
        property1 = cardBoard[row][col].bottom;
        property2 = cardBoard[target_row][target_col].top;
      } else if (target_col === col - 1) {
        property1 = cardBoard[row][col].left;
        property2 = cardBoard[target_row][target_col].right;
      } else if (target_col === col + 1) {
        property1 = cardBoard[row][col].right;
        property2 = cardBoard[target_row][target_col].left;
      }
      if (property1 > property2) {
        ctx.drawImage(card_back, crack_lr + (target_col + 1) * crack_card + target_col * cardWidth, (target_row + 1) * crack_card + (target_row) * cardHeight, cardWidth, cardHeight)
        cardBoard[target_row][target_col].camp = thisCamp;
        thisCamp ? (enemyCardScore--, myCardScore++) : (enemyCardScore++, myCardScore--);
      }
    }
  }
}
bgi1.onload = function () {
  ctx.drawImage(bgi1, 0, 0, canvasWidth, canvasHeight);
}

start.addEventListener("click", () => {
  initGame();
  bgm.play();
  start.disabled = true;
})

window.onkeypress = function (e) {
  if (startflag === 1 && start.disabled === true) {
    if ((e.key === "w" || e.key === "W") && myplane.positonY > 0) {
      myplane.positonY -= rate;
    } else if ((e.key === "s" || e.key === "S") && myplane.positonY < canvasHeight - planeSize) {
      myplane.positonY += rate;
    } else if ((e.key === "d" || e.key === "D") && myplane.positonX < canvasWidth - planeSize) {
      myplane.positonX += rate;
    } else if ((e.key === "a" || e.key === "A") && myplane.positonX > 0) {
      myplane.positonX -= rate;
    } else if (e.key === " ") {
      myplane.fireBullet();
    } else if (e.key === "1") {
      score++;
    } else if (e.key === "0") {
      if (heart < 20) {
        heart = 99999;
      } else {
        heart = 1;
      }
    } else if ((e.key === "p" || e.key === "P") && (score % 25 >= 20)) {
      initCard();
    }
    drawGame(planeN);
  }
}
myCanvas.addEventListener("click", (e) => {
  myHandOutWidth = cardWidth / (myHandNum === 1 ? 1 : myHandNum - 1);
  if (startflag === 2 && start.disabled === true) {
    const x0 = canvasWidth - crack_lr + crack_hand;
    const y0 = canvasHeight - crack_hand - cardHeight;
    if (e.offsetX >= x0 && e.offsetX <= canvasWidth - crack_hand) {
      if (e.offsetY >= y0 && e.offsetY <= canvasHeight - crack_hand) {
        const x = e.offsetX - x0;
        if (myHandNum === 1) {
          if (x >= 0 && x < cardWidth) {
            selectIndex = selectIndex === 0 ? -1 : 0;
          }
        } else if (myHandNum >= 2) {
          for (let i = 0; i < myHandNum - 1; i++) {
            if (x >= i * myHandOutWidth && x < (i + 1) * myHandOutWidth) {
              selectIndex = selectIndex === i ? -1 : i;
            }
          }
          if (x >= cardWidth && x <= 2 * cardWidth) {
            selectIndex = selectIndex === myHandNum - 1 ? -1 : myHandNum - 1;
          }
        }
        drawBoard();
      }
    }
  }
  if (startflag === 2 && start.disabled === true && selectIndex !== -1 && playHand) {
    const x0 = crack_lr;
    const y0 = 0;
    const x = e.offsetX - x0;
    const y = e.offsetY;
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        if (x >= (i + 1) * crack_card + i * cardWidth && x <= (i + 1) * (crack_card + cardWidth)) {
          if (y >= (j + 1) * crack_card + j * cardHeight && y <= (j + 1) * (crack_card + cardHeight)) {
            if (!cardBoard[j][i]) {
              cardBoard[j][i] = myCard[selectIndex];
              compareCard(j, i);
              myCard.splice(selectIndex, 1);
              myHandNum--;
              myCardScore++;
              selectIndex = -1;
              playHand = false;
              help.innerHTML = "当前为敌方回合，请等待对方思考......";
              enemyPlayHand();
            }
          }
        }
      }
    }
    setTimeout(() => {
      drawBoard();
    }, 300);
  }
})
console.log("作弊模式：按1增加分数，按0切换血量为99999或1");


// // 测试代码，测试生成敌军飞机可用性及随机性
// let rarr = [0, 0, 0, 0];
// for (let k = 0; k < 100; k++) {
//   let enemy1 = createEnemy();
//   console.log(enemy1.positonX);
//   if (enemy1.rate == 2) {
//     rarr[0]++;
//   } else if (enemy1.rate == 3) {
//     rarr[1]++;
//   } else if (enemy1.rate == 4) {
//     rarr[2]++;
//   } else if (enemy1.rate == 5) {
//     rarr[3]++;
//   }
// }
// console.log(rarr, rarr[0] + rarr[1] + rarr[2] + rarr[3]);