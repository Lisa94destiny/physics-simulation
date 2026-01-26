// 相对论可视化模拟 - 洛伦兹变换模块

// 洛伦兹变换可视化
function setupLorentzSketch() {
  // 确保容器存在
  const container = document.getElementById('lorentz-animation');
  console.log("洛伦兹变换容器:", container);
  if (!container) {
    console.error('找不到洛伦兹变换动画容器');
    // 检查所有可能的容器ID
    console.log("检查所有可能的容器:");
    console.log("lorentz-animation:", document.getElementById('lorentz-animation'));
    console.log("lorentz-content:", document.getElementById('lorentz-content'));
    
    // 如果容器不存在，可能是因为标签页尚未显示，尝试先显示标签页
    const lorentzTab = document.getElementById('tab-lorentz');
    if (lorentzTab) {
      console.log("尝试点击洛伦兹变换标签页");
      lorentzTab.click();
      
      // 延迟一点时间后再次尝试获取容器
      setTimeout(() => {
        const containerRetry = document.getElementById('lorentz-animation');
        if (containerRetry) {
          console.log("成功获取洛伦兹变换容器（重试）");
          initLorentzSketch(containerRetry);
        } else {
          console.error("重试后仍然找不到洛伦兹变换容器");
        }
      }, 300);
    }
    return;
  }
  
  // 如果容器存在但不可见，可能会导致画布尺寸计算错误
  if (container.offsetWidth === 0 || container.offsetHeight === 0) {
    console.warn("洛伦兹变换容器尺寸为零，可能是因为它不可见");
    
    // 尝试先显示标签页
    const lorentzTab = document.getElementById('tab-lorentz');
    if (lorentzTab) {
      console.log("尝试点击洛伦兹变换标签页");
      lorentzTab.click();
      
      // 延迟一点时间后再次尝试初始化
      setTimeout(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          console.log("容器现在可见，初始化洛伦兹变换动画");
          initLorentzSketch(container);
        } else {
          console.error("容器仍然不可见，无法初始化洛伦兹变换动画");
        }
      }, 300);
    }
    return;
  }
  
  // 正常初始化
  initLorentzSketch(container);
}

// 实际初始化洛伦兹变换动画的函数
function initLorentzSketch(container) {
  // 如果已经初始化过，则不再重复初始化
  if (lorentzSketch) {
    console.log("洛伦兹变换动画已经初始化，跳过");
    return;
  }
  
  console.log("开始初始化洛伦兹变换动画，容器尺寸:", container.offsetWidth, container.offsetHeight);
  
  lorentzSketch = new p5((sketch) => {
    // 动画参数
    let time = 0;
    let lastTime = 0;
    let gridSize = 40;
    let originX, originY;
    let scale = 20; // 像素/米
    let prevPlayState = false; // 记录上一帧的播放状态
    let pauseTime = 0; // 记录暂停时的时间
    
    // 参考系颜色
    const staticColor = sketch.color(94, 106, 210); // 蓝色
    const movingColor = sketch.color(16, 185, 129); // 绿色
    const eventColor = sketch.color(249, 115, 22); // 橙色
    
    sketch.setup = function() {
      // 创建画布
      console.log("创建洛伦兹变换画布, 容器尺寸:", container.offsetWidth, container.offsetHeight);
      const canvas = sketch.createCanvas(container.offsetWidth, container.offsetHeight);
      canvas.parent('lorentz-animation');
      
      // 设置文本属性
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.textSize(14);
      
      // 初始化lastTime
      lastTime = sketch.millis() / 1000;
      
      // 设置坐标原点在画布中心
      originX = sketch.width / 2;
      originY = sketch.height / 2;
      
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
      console.log("洛伦兹变换动画已重置");
    }
    
    sketch.draw = function() {
      // 获取当前参数
      const velocity = parseFloat(document.getElementById('velocity').value);
      const eventTime = parseFloat(document.getElementById('event-time').value);
      const eventPosition = parseFloat(document.getElementById('event-position').value);
      const gamma = 1 / Math.sqrt(1 - velocity * velocity);
      
      // 计算洛伦兹变换后的坐标
      const transformedTime = gamma * (eventTime - velocity * eventPosition);
      const transformedPosition = gamma * (eventPosition - velocity * eventTime);
      
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
        time += deltaTime;
      } else {
        // 暂停状态，使用记录的暂停时间
        time = pauseTime;
      }
      
      // 绘制背景
      sketch.background(245, 245, 250);
      
      // 绘制网格和坐标轴
      drawGrid(sketch, originX, originY, sketch.width, sketch.height, gridSize);
      
      // 绘制静止参考系标题
      sketch.fill(staticColor);
      sketch.noStroke();
      sketch.textSize(18);
      sketch.text("静止参考系 (S)", sketch.width * 0.25, 30);
      
      // 绘制运动参考系标题
      sketch.fill(movingColor);
      sketch.textSize(18);
      sketch.text("运动参考系 (S')", sketch.width * 0.75, 30);
      
      // 绘制静止参考系坐标轴
      drawCoordinateSystem(sketch, originX, originY, staticColor, "x", "t");
      
      // 绘制运动参考系坐标轴（倾斜的）
      drawTransformedCoordinateSystem(sketch, originX, originY, movingColor, velocity, "x'", "t'");
      
      // 绘制事件点
      const eventX = originX + eventPosition * scale;
      const eventY = originY - eventTime * scale;
      drawEvent(sketch, eventX, eventY, eventColor, "事件");
      
      // 绘制变换后的事件点
      const transformedX = originX + transformedPosition * scale;
      const transformedY = originY - transformedTime * scale;
      drawEvent(sketch, transformedX, transformedY, eventColor, "变换后事件");
      
      // 绘制连接线
      sketch.stroke(eventColor);
      sketch.strokeWeight(1);
      sketch.setLineDash([5, 5]);
      sketch.line(eventX, eventY, transformedX, transformedY);
      sketch.setLineDash([]);
      
      // 绘制速度信息
      sketch.fill(70);
      sketch.textSize(16);
      sketch.text(`相对速度: ${velocity.toFixed(2)}c`, sketch.width * 0.5, sketch.height - 60);
      sketch.text(`洛伦兹因子 (γ): ${gamma.toFixed(3)}`, sketch.width * 0.5, sketch.height - 30);
      
      // 绘制公式
      sketch.fill(70);
      sketch.textSize(14);
      sketch.text("t' = γ(t - vx/c²)", sketch.width * 0.25, sketch.height - 90);
      sketch.text("x' = γ(x - vt)", sketch.width * 0.75, sketch.height - 90);
      
      // 更新计算结果
      updateLorentzResults(eventTime, eventPosition, transformedTime, transformedPosition);
    };
    
    // 绘制网格
    function drawGrid(sketch, originX, originY, width, height, gridSize) {
      sketch.stroke(220);
      sketch.strokeWeight(1);
      
      // 绘制垂直线
      for (let x = originX % gridSize; x < width; x += gridSize) {
        sketch.line(x, 0, x, height);
      }
      
      // 绘制水平线
      for (let y = originY % gridSize; y < height; y += gridSize) {
        sketch.line(0, y, width, y);
      }
    }
    
    // 绘制坐标系
    function drawCoordinateSystem(sketch, originX, originY, color, xLabel, tLabel) {
      sketch.stroke(color);
      sketch.strokeWeight(2);
      
      // x轴
      sketch.line(0, originY, sketch.width, originY);
      
      // t轴
      sketch.line(originX, sketch.height, originX, 0);
      
      // x轴箭头
      sketch.fill(color);
      sketch.noStroke();
      sketch.triangle(
        sketch.width - 10, originY,
        sketch.width - 20, originY - 5,
        sketch.width - 20, originY + 5
      );
      
      // t轴箭头
      sketch.triangle(
        originX, 10,
        originX - 5, 20,
        originX + 5, 20
      );
      
      // 坐标轴标签
      sketch.textSize(16);
      sketch.text(xLabel, sketch.width - 20, originY + 20);
      sketch.text(tLabel, originX + 20, 20);
    }
    
    // 绘制变换后的坐标系
    function drawTransformedCoordinateSystem(sketch, originX, originY, color, velocity, xLabel, tLabel) {
      const gamma = 1 / Math.sqrt(1 - velocity * velocity);
      const angle = Math.atan(velocity);
      const tAngle = Math.atan(velocity);
      
      sketch.stroke(color);
      sketch.strokeWeight(2);
      
      // 变换后的x'轴
      sketch.push();
      sketch.translate(originX, originY);
      sketch.rotate(tAngle);
      sketch.line(-sketch.width, 0, sketch.width, 0);
      
      // x'轴箭头
      sketch.fill(color);
      sketch.noStroke();
      sketch.triangle(
        sketch.width - 10, 0,
        sketch.width - 20, -5,
        sketch.width - 20, 5
      );
      
      // x'轴标签
      sketch.textSize(16);
      sketch.text(xLabel, sketch.width - 20, 20);
      sketch.pop();
      
      // 变换后的t'轴
      sketch.push();
      sketch.translate(originX, originY);
      sketch.rotate(-angle);
      sketch.line(0, sketch.height, 0, -sketch.height);
      
      // t'轴箭头
      sketch.fill(color);
      sketch.noStroke();
      sketch.triangle(
        0, -sketch.height + 10,
        -5, -sketch.height + 20,
        5, -sketch.height + 20
      );
      
      // t'轴标签
      sketch.textSize(16);
      sketch.text(tLabel, 20, -sketch.height + 30);
      sketch.pop();
    }
    
    // 绘制事件点
    function drawEvent(sketch, x, y, color, label) {
      sketch.fill(color);
      sketch.noStroke();
      sketch.ellipse(x, y, 10, 10);
      
      sketch.textSize(14);
      sketch.text(label, x, y - 15);
    }
    
    // 设置虚线样式
    sketch.setLineDash = function(pattern) {
      sketch.drawingContext.setLineDash(pattern);
    };
    
    // 窗口大小改变时调整画布大小
    sketch.windowResized = function() {
      const container = document.getElementById('lorentz-animation');
      if (container) {
        console.log("调整洛伦兹变换画布大小:", container.offsetWidth, container.offsetHeight);
        sketch.resizeCanvas(container.offsetWidth, container.offsetHeight);
        
        // 重新设置坐标原点
        originX = sketch.width / 2;
        originY = sketch.height / 2;
      }
    };
  }, container); // 直接将容器传递给p5构造函数
  
  console.log("洛伦兹变换动画初始化完成");
}

// 更新洛伦兹变换计算结果
function updateLorentzResults(eventTime, eventPosition, transformedTime, transformedPosition) {
  document.getElementById('transformed-time').textContent = transformedTime.toFixed(2) + " 秒";
  document.getElementById('transformed-position').textContent = transformedPosition.toFixed(2) + " 米";
} 