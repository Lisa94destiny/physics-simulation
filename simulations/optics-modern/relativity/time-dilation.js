// 相对论可视化模拟 - 时间膨胀模块

// 时钟类
class Clock {
  constructor(x, y, radius, label) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.label = label;
    this.angle = -Math.PI / 2; // 初始指向12点钟方向
    this.progress = 0;
  }
  
  update(time, maxTime) {
    // 更新时钟角度和进度
    this.angle = -Math.PI / 2 + (time / maxTime) * Math.PI * 2;
    this.progress = time / maxTime;
  }
  
  display(sketch) {
    // 绘制时钟外圈
    sketch.stroke(70);
    sketch.strokeWeight(2);
    sketch.fill(255);
    sketch.ellipse(this.x, this.y, this.radius * 2);
    
    // 绘制刻度
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6 - Math.PI / 2;
      const x1 = this.x + (this.radius - 10) * Math.cos(angle);
      const y1 = this.y + (this.radius - 10) * Math.sin(angle);
      const x2 = this.x + this.radius * Math.cos(angle);
      const y2 = this.y + this.radius * Math.sin(angle);
      
      sketch.stroke(70);
      sketch.strokeWeight(i % 3 === 0 ? 3 : 1);
      sketch.line(x1, y1, x2, y2);
    }
    
    // 绘制进度弧
    sketch.noStroke();
    sketch.fill(94, 106, 210, 100);
    sketch.arc(this.x, this.y, this.radius * 1.8, this.radius * 1.8, -Math.PI / 2, this.angle, sketch.PIE);
    
    // 绘制指针
    sketch.stroke(30);
    sketch.strokeWeight(3);
    sketch.line(
      this.x,
      this.y,
      this.x + this.radius * 0.8 * Math.cos(this.angle),
      this.y + this.radius * 0.8 * Math.sin(this.angle)
    );
    
    // 绘制中心点
    sketch.fill(30);
    sketch.noStroke();
    sketch.ellipse(this.x, this.y, 8);
    
    // 绘制标签
    sketch.fill(70);
    sketch.textSize(16);
    sketch.text(this.label, this.x, this.y - this.radius - 20);
  }
}

// 时间膨胀可视化
function setupTimeDilationSketch() {
  // 确保容器存在
  const container = document.getElementById('time-dilation-animation');
  if (!container) {
    console.error('找不到时间膨胀动画容器');
    return;
  }

  timeDilationSketch = new p5((sketch) => {
    // 动画参数
    let staticClock, movingClock;
    let time = 0;
    let lastTime = 0;
    let prevPlayState = false; // 记录上一帧的播放状态
    let pauseTime = 0; // 记录暂停时的时间
    
    sketch.setup = function() {
      // 创建画布
      const canvas = sketch.createCanvas(container.offsetWidth, container.offsetHeight);
      canvas.parent('time-dilation-animation');
      
      // 初始化时钟对象
      staticClock = new Clock(sketch.width * 0.25, sketch.height * 0.5, 60, "静止参考系");
      movingClock = new Clock(sketch.width * 0.75, sketch.height * 0.5, 60, "运动参考系");
      
      // 设置文本属性
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.textSize(14);
      
      // 初始化lastTime
      lastTime = sketch.millis() / 1000;
      
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
      pauseTime = 0;
      lastTime = sketch.millis() / 1000;
      
      // 重置时钟
      const properTime = parseFloat(document.getElementById('proper-time').value);
      staticClock.update(0, properTime);
      movingClock.update(0, properTime);
      
      console.log("时间膨胀动画已重置");
    }
    
    sketch.draw = function() {
      // 获取当前参数
      const velocity = parseFloat(document.getElementById('velocity').value);
      const properTime = parseFloat(document.getElementById('proper-time').value);
      const gamma = 1 / Math.sqrt(1 - velocity * velocity);
      
      // 获取当前的isPlaying状态
      const isPlayingNow = window.isPlayingState || false;
      
      // 检测播放状态变化
      if (isPlayingNow !== prevPlayState) {
        if (isPlayingNow) {
          // 从暂停到播放，更新lastTime以避免时间跳跃
          lastTime = sketch.millis() / 1000;
        } else {
          // 从播放到暂停，记录当前时间
          pauseTime = time;
        }
        prevPlayState = isPlayingNow;
      }
      
      // 更新时间
      if (isPlayingNow) {
        const currentTime = sketch.millis() / 1000;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        time += deltaTime * 0.5; // 减慢动画速度
        
        // 循环动画
        if (time > properTime) {
          time = 0;
        }
      } else {
        // 暂停状态，使用记录的暂停时间
        time = pauseTime;
      }
      
      // 计算时钟时间
      const staticTime = time;
      const movingTime = time / gamma; // 运动参考系时间变慢
      
      // 绘制背景
      sketch.background(245, 245, 250);
      
      // 绘制参考系
      drawReferenceFrame(sketch, sketch.width * 0.25, sketch.height * 0.2, 0);
      drawReferenceFrame(sketch, sketch.width * 0.75, sketch.height * 0.2, velocity);
      
      // 绘制时钟
      staticClock.update(staticTime, properTime);
      movingClock.update(movingTime, properTime);
      staticClock.display(sketch);
      movingClock.display(sketch);
      
      // 绘制时间信息
      sketch.fill(30);
      sketch.noStroke();
      sketch.textSize(16);
      sketch.text(`时间: ${staticTime.toFixed(1)} 秒`, sketch.width * 0.25, sketch.height * 0.85);
      sketch.text(`时间: ${movingTime.toFixed(1)} 秒`, sketch.width * 0.75, sketch.height * 0.85);
      
      // 绘制连接线，表示同时性
      sketch.stroke(100, 100, 255, 100);
      sketch.strokeWeight(2);
      sketch.line(
        staticClock.x + staticClock.radius * Math.cos(staticClock.angle),
        staticClock.y + staticClock.radius * Math.sin(staticClock.angle),
        movingClock.x + movingClock.radius * Math.cos(movingClock.angle),
        movingClock.y + movingClock.radius * Math.sin(movingClock.angle)
      );
      
      // 更新计算结果
      updateTimeDilationResults(velocity, properTime, gamma);
    };
    
    // 窗口大小改变时调整画布大小
    sketch.windowResized = function() {
      const container = document.getElementById('time-dilation-animation');
      sketch.resizeCanvas(container.offsetWidth, container.offsetHeight);
      
      // 重新定位时钟
      staticClock.x = sketch.width * 0.25;
      staticClock.y = sketch.height * 0.5;
      movingClock.x = sketch.width * 0.75;
      movingClock.y = sketch.height * 0.5;
    };
  }, container); // 直接将容器传递给p5构造函数
}

// 更新时间膨胀计算结果
function updateTimeDilationResults(velocity, properTime, gamma) {
  const dilatedTime = properTime * gamma;
  document.getElementById('lorentz-factor').textContent = gamma.toFixed(3);
  document.getElementById('dilated-time').textContent = dilatedTime.toFixed(2) + " 秒";
} 