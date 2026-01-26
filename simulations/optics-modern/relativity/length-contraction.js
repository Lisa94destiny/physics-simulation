// 相对论可视化模拟 - 长度收缩模块

// 长度收缩可视化
function setupLengthContractionSketch() {
  // 确保容器存在
  const container = document.getElementById('length-contraction-animation');
  if (!container) {
    console.error('找不到长度收缩动画容器');
    return;
  }

  lengthContractionSketch = new p5((sketch) => {
    // 动画参数
    let time = 0;
    let lastTime = 0;
    let trainPosition = 0;
    let trainSpeed = 0;
    let prevPlayState = false; // 记录上一帧的播放状态
    let pausePosition = 0; // 记录暂停时的列车位置
    
    // 参考系颜色 - 使用更鲜明的颜色
    const staticColor = sketch.color(65, 105, 225); // 皇家蓝
    const movingColor = sketch.color(46, 204, 113); // 翡翠绿
    const rulerColor = sketch.color(52, 73, 94); // 深蓝灰色
    const groundColor = sketch.color(236, 240, 241); // 浅灰色
    const trackColor = sketch.color(52, 73, 94); // 深蓝灰色
    const trainWindowColor = sketch.color(214, 234, 248); // 浅蓝色
    const trainWheelColor = sketch.color(44, 62, 80); // 深蓝黑色
    const formulaColor = sketch.color(52, 73, 94); // 深蓝灰色
    
    sketch.setup = function() {
      // 创建画布
      const canvas = sketch.createCanvas(container.offsetWidth, container.offsetHeight);
      canvas.parent('length-contraction-animation');
      
      // 设置文本属性
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.textSize(14);
      
      // 初始化lastTime
      lastTime = sketch.millis() / 1000;
      
      // 初始化列车位置
      trainPosition = -50;
      pausePosition = trainPosition;
      
      // 添加点击事件监听器，确保点击动画区域也能触发动画
      canvas.mousePressed(function() {
        // 如果点击了动画区域，确保重新计算lastTime以避免时间跳跃
        lastTime = sketch.millis() / 1000;
      });
      
      // 监听重置按钮
      const resetBtn = document.getElementById('reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', resetAnimation);
      }
    };
    
    // 重置动画函数
    function resetAnimation() {
      time = 0;
      trainPosition = -50;
      pausePosition = trainPosition;
      lastTime = sketch.millis() / 1000;
      console.log("长度收缩动画已重置");
    }
    
    sketch.draw = function() {
      // 获取当前参数
      const velocity = parseFloat(document.getElementById('velocity').value);
      const properLength = parseFloat(document.getElementById('proper-length').value);
      const gamma = 1 / Math.sqrt(1 - velocity * velocity);
      const contractedLength = properLength / gamma;
      
      // 获取当前的isPlaying状态
      const isPlayingNow = window.isPlayingState || false;
      
      // 检测播放状态变化
      if (isPlayingNow !== prevPlayState) {
        if (isPlayingNow) {
          // 从暂停到播放，更新lastTime以避免时间跳跃
          lastTime = sketch.millis() / 1000;
        } else {
          // 从播放到暂停，记录当前位置
          pausePosition = trainPosition;
        }
        prevPlayState = isPlayingNow;
      }
      
      // 更新时间和位置
      if (isPlayingNow) {
        const currentTime = sketch.millis() / 1000;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // 更新列车位置
        trainSpeed = velocity * 100; // 缩放速度以适应画布
        trainPosition += trainSpeed * deltaTime;
        
        // 循环动画
        if (trainPosition > sketch.width + properLength) {
          trainPosition = -properLength * 1.5;
        }
      } else {
        // 暂停状态，使用记录的暂停位置
        trainPosition = pausePosition;
      }
      
      // 绘制背景 - 使用渐变背景
      const bgGradientTop = sketch.color(240, 248, 255); // 爱丽丝蓝
      const bgGradientBottom = sketch.color(245, 245, 250); // 淡紫色
      for (let y = 0; y < sketch.height; y++) {
        const inter = sketch.map(y, 0, sketch.height, 0, 1);
        const c = sketch.lerpColor(bgGradientTop, bgGradientBottom, inter);
        sketch.stroke(c);
        sketch.line(0, y, sketch.width, y);
      }
      
      // 绘制标尺
      drawRuler(sketch, 0, sketch.height * 0.45, sketch.width, 20, rulerColor);
      
      // 绘制静止参考系标题 - 添加阴影效果
      sketch.fill(staticColor);
      sketch.noStroke();
      sketch.textSize(20);
      sketch.textStyle(sketch.BOLD);
      sketch.text("静止参考系观察者", sketch.width * 0.2, 30);
      
      // 绘制运动参考系标题 - 添加阴影效果
      sketch.fill(movingColor);
      sketch.textSize(20);
      sketch.textStyle(sketch.BOLD);
      sketch.text("运动参考系观察者", sketch.width * 0.8, 30);
      sketch.textStyle(sketch.NORMAL);
      
      // 绘制观察者 - 使用更精细的人物图形
      drawObserver(sketch, sketch.width * 0.2, sketch.height * 0.2, staticColor);
      drawObserver(sketch, sketch.width * 0.8, sketch.height * 0.2, movingColor);
      
      // 绘制静止参考系中的列车
      const staticTrainX = sketch.width * 0.5 - properLength / 2;
      drawTrain(sketch, staticTrainX, sketch.height * 0.3, properLength, 30, staticColor, trainWindowColor, trainWheelColor, "静止长度: " + properLength.toFixed(1) + " m");
      
      // 绘制运动参考系中的列车
      drawTrain(sketch, trainPosition, sketch.height * 0.6, contractedLength, 30, movingColor, trainWindowColor, trainWheelColor, "收缩长度: " + contractedLength.toFixed(1) + " m");
      
      // 绘制地面和轨道 - 使用更美观的设计
      // 绘制地面
      sketch.fill(groundColor);
      sketch.noStroke();
      sketch.rect(0, sketch.height * 0.75, sketch.width, sketch.height * 0.25);
      
      // 绘制轨道
      sketch.stroke(trackColor);
      sketch.strokeWeight(3);
      sketch.line(0, sketch.height * 0.75, sketch.width, sketch.height * 0.75);
      
      // 绘制轨道枕木
      sketch.strokeWeight(2);
      for (let x = 0; x < sketch.width; x += 30) {
        sketch.line(x, sketch.height * 0.75 - 5, x, sketch.height * 0.75 + 5);
      }
      
      // 绘制信息面板背景
      sketch.fill(255, 255, 255, 200);
      sketch.strokeWeight(1);
      sketch.stroke(200);
      sketch.rect(sketch.width * 0.5 - 150, sketch.height - 110, 300, 90, 10);
      
      // 绘制速度信息
      sketch.fill(formulaColor);
      sketch.textSize(16);
      sketch.text(`相对速度: ${velocity.toFixed(2)}c`, sketch.width * 0.5, sketch.height - 80);
      sketch.text(`洛伦兹因子 (γ): ${gamma.toFixed(3)}`, sketch.width * 0.5, sketch.height - 55);
      
      // 绘制公式
      sketch.fill(formulaColor);
      sketch.textSize(14);
      sketch.text("L' = L/γ = L×√(1-v²/c²)", sketch.width * 0.5, sketch.height - 30);
      
      // 绘制视线 - 使用更精细的虚线
      if (isPlayingNow) {
        drawViewLines(sketch, sketch.width * 0.2, sketch.height * 0.2, staticTrainX, staticTrainX + properLength, sketch.height * 0.3, staticColor);
        drawViewLines(sketch, sketch.width * 0.8, sketch.height * 0.2, trainPosition, trainPosition + contractedLength, sketch.height * 0.6, movingColor);
      }
      
      // 绘制信息框 - 显示公式和计算结果
      drawInfoBox(sketch, sketch.width - 200, 80, 180, 100, velocity, properLength, contractedLength, gamma);
      
      // 更新计算结果
      updateLengthContractionResults(velocity, properLength, gamma);
    };
    
    // 绘制信息框
    function drawInfoBox(sketch, x, y, width, height, velocity, properLength, contractedLength, gamma) {
      // 绘制半透明背景
      sketch.fill(255, 255, 255, 220);
      sketch.stroke(200);
      sketch.strokeWeight(1);
      sketch.rect(x, y, width, height, 10);
      
      // 绘制标题
      sketch.fill(formulaColor);
      sketch.noStroke();
      sketch.textAlign(sketch.LEFT, sketch.CENTER);
      sketch.textSize(14);
      sketch.textStyle(sketch.BOLD);
      sketch.text("计算详情:", x + 10, y + 20);
      sketch.textStyle(sketch.NORMAL);
      
      // 绘制计算过程
      sketch.textSize(12);
      sketch.text(`L' = L × √(1-v²/c²)`, x + 10, y + 45);
      sketch.text(`L' = ${properLength} × √(1-${velocity.toFixed(2)}²)`, x + 10, y + 65);
      sketch.text(`L' = ${properLength} × ${(1/gamma).toFixed(3)} = ${contractedLength.toFixed(2)}`, x + 10, y + 85);
      
      // 恢复文本对齐方式
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
    }
    
    // 绘制观察者 - 更精细的人物图形
    function drawObserver(sketch, x, y, color) {
      // 绘制头部
      sketch.fill(color);
      sketch.stroke(50);
      sketch.strokeWeight(1.5);
      sketch.ellipse(x, y - 15, 22, 22);
      
      // 绘制眼睛
      sketch.fill(255);
      sketch.noStroke();
      sketch.ellipse(x - 5, y - 16, 5, 5);
      sketch.ellipse(x + 5, y - 16, 5, 5);
      
      // 绘制瞳孔
      sketch.fill(0);
      sketch.ellipse(x - 5, y - 16, 2, 2);
      sketch.ellipse(x + 5, y - 16, 2, 2);
      
      // 绘制嘴巴
      sketch.noFill();
      sketch.stroke(50);
      sketch.strokeWeight(1);
      sketch.arc(x, y - 10, 10, 6, 0, sketch.PI);
      
      // 绘制身体
      sketch.stroke(color);
      sketch.strokeWeight(3);
      sketch.line(x, y - 4, x, y + 15);
      
      // 绘制手臂
      sketch.line(x, y, x - 12, y + 8);
      sketch.line(x, y, x + 12, y + 8);
      
      // 绘制腿
      sketch.line(x, y + 15, x - 8, y + 35);
      sketch.line(x, y + 15, x + 8, y + 35);
    }
    
    // 绘制视线 - 更精细的虚线
    function drawViewLines(sketch, observerX, observerY, objectStartX, objectEndX, objectY, color) {
      sketch.stroke(color);
      sketch.strokeWeight(1.5);
      sketch.setLineDash([8, 4]);
      sketch.line(observerX, observerY, objectStartX, objectY);
      sketch.line(observerX, observerY, objectEndX, objectY);
      sketch.setLineDash([]);
    }
    
    // 绘制标尺 - 更美观的标尺
    function drawRuler(sketch, x, y, width, height, color) {
      const divisions = 20;
      const divisionWidth = width / divisions;
      
      // 绘制标尺背景
      sketch.fill(255, 255, 255, 200);
      sketch.stroke(color);
      sketch.strokeWeight(1);
      sketch.rect(x, y, width, height, 3);
      
      // 绘制刻度
      for (let i = 0; i <= divisions; i++) {
        const divX = x + i * divisionWidth;
        const divHeight = i % 5 === 0 ? height * 0.8 : height * 0.4;
        sketch.stroke(color);
        sketch.strokeWeight(i % 5 === 0 ? 1.5 : 1);
        sketch.line(divX, y, divX, y + divHeight);
        
        if (i % 5 === 0) {
          sketch.fill(color);
          sketch.noStroke();
          sketch.textSize(10);
          sketch.text(i, divX, y + height + 10);
        }
      }
    }
    
    // 绘制列车函数 - 更精细的列车设计
    function drawTrain(sketch, x, y, length, height, color, windowColor, wheelColor, label) {
      // 绘制列车主体
      sketch.fill(color);
      sketch.stroke(50);
      sketch.strokeWeight(2);
      sketch.rect(x, y - height / 2, length, height, 5);
      
      // 绘制车窗
      const windowCount = Math.max(1, Math.floor(length / 30));
      const windowSpacing = length / (windowCount + 1);
      
      sketch.fill(windowColor);
      sketch.strokeWeight(1);
      sketch.stroke(100);
      
      for (let i = 1; i <= windowCount; i++) {
        const windowX = x + i * windowSpacing - 10;
        const windowY = y - height / 4;
        sketch.rect(windowX, windowY, 20, height / 2, 3);
        
        // 绘制窗户内部细节
        sketch.line(windowX + 10, windowY, windowX + 10, windowY + height / 2);
        sketch.line(windowX, windowY + height / 4, windowX + 20, windowY + height / 4);
      }
      
      // 绘制车轮
      const wheelCount = Math.max(2, Math.floor(length / 40));
      const wheelSpacing = length / (wheelCount - 1);
      
      for (let i = 0; i < wheelCount; i++) {
        const wheelX = x + i * wheelSpacing;
        const wheelY = y + height / 2 + 10;
        
        // 绘制轮毂
        sketch.fill(wheelColor);
        sketch.stroke(30);
        sketch.strokeWeight(1.5);
        sketch.ellipse(wheelX, wheelY, 20, 20);
        
        // 绘制轮辐
        sketch.stroke(100);
        sketch.strokeWeight(1);
        for (let j = 0; j < 8; j++) {
          const angle = j * sketch.PI / 4;
          sketch.line(wheelX, wheelY, 
                     wheelX + 8 * sketch.cos(angle), 
                     wheelY + 8 * sketch.sin(angle));
        }
        
        // 绘制轮缘
        sketch.noFill();
        sketch.stroke(30);
        sketch.strokeWeight(2);
        sketch.ellipse(wheelX, wheelY, 16, 16);
      }
      
      // 绘制标签 - 添加背景使文字更清晰
      sketch.fill(255, 255, 255, 180);
      sketch.stroke(color);
      sketch.strokeWeight(1);
      sketch.rect(x + length / 2 - 70, y - height / 2 - 25, 140, 20, 5);
      
      sketch.fill(color);
      sketch.noStroke();
      sketch.textSize(14);
      sketch.text(label, x + length / 2, y - height / 2 - 15);
      
      // 绘制长度标记 - 更美观的箭头
      sketch.stroke(color);
      sketch.strokeWeight(2);
      sketch.line(x, y + height / 2 + 30, x + length, y + height / 2 + 30);
      
      // 绘制箭头
      sketch.fill(color);
      sketch.noStroke();
      
      // 左箭头
      sketch.triangle(
        x, y + height / 2 + 30,
        x + 10, y + height / 2 + 25,
        x + 10, y + height / 2 + 35
      );
      
      // 右箭头
      sketch.triangle(
        x + length, y + height / 2 + 30,
        x + length - 10, y + height / 2 + 25,
        x + length - 10, y + height / 2 + 35
      );
    }
    
    // 设置虚线样式
    sketch.setLineDash = function(pattern) {
      sketch.drawingContext.setLineDash(pattern);
    };
    
    // 窗口大小改变时调整画布大小
    sketch.windowResized = function() {
      const container = document.getElementById('length-contraction-animation');
      sketch.resizeCanvas(container.offsetWidth, container.offsetHeight);
    };
  }, container); // 直接将容器传递给p5构造函数
}

// 更新长度收缩计算结果
function updateLengthContractionResults(velocity, properLength, gamma) {
  const contractedLength = properLength / gamma;
  document.getElementById('lorentz-factor-length').textContent = gamma.toFixed(3);
  document.getElementById('contracted-length').textContent = contractedLength.toFixed(2) + " 米";
} 