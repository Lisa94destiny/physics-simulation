// 相对论可视化模拟 - 光锥与因果关系模块

// 光锥可视化
function setupLightConeSketch() {
  // 确保容器存在
  const container = document.getElementById('light-cone-animation');
  console.log("光锥容器:", container);
  if (!container) {
    console.error('找不到光锥动画容器');
    // 检查所有可能的容器ID
    console.log("检查所有可能的容器:");
    console.log("light-cone-animation:", document.getElementById('light-cone-animation'));
    console.log("light-cone-content:", document.getElementById('light-cone-content'));
    
    // 如果容器不存在，可能是因为标签页尚未显示，尝试先显示标签页
    const lightConeTab = document.getElementById('tab-light-cone');
    if (lightConeTab) {
      console.log("尝试点击光锥标签页");
      lightConeTab.click();
      
      // 延迟一点时间后再次尝试获取容器
      setTimeout(() => {
        const containerRetry = document.getElementById('light-cone-animation');
        if (containerRetry) {
          console.log("成功获取光锥容器（重试）");
          initLightConeSketch(containerRetry);
        } else {
          console.error("重试后仍然找不到光锥容器");
        }
      }, 300);
    }
    return;
  }
  
  // 如果容器存在但不可见，可能会导致画布尺寸计算错误
  if (container.offsetWidth === 0 || container.offsetHeight === 0) {
    console.warn("光锥容器尺寸为零，可能是因为它不可见");
    
    // 尝试先显示标签页
    const lightConeTab = document.getElementById('tab-light-cone');
    if (lightConeTab) {
      console.log("尝试点击光锥标签页");
      lightConeTab.click();
      
      // 延迟一点时间后再次尝试初始化
      setTimeout(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          console.log("容器现在可见，初始化光锥动画");
          initLightConeSketch(container);
        } else {
          console.error("容器仍然不可见，无法初始化光锥动画");
        }
      }, 300);
    }
    return;
  }
  
  // 正常初始化
  initLightConeSketch(container);
}

// 实际初始化光锥动画的函数
function initLightConeSketch(container) {
  // 如果已经初始化过，则不再重复初始化
  if (lightConeSketch) {
    console.log("光锥动画已经初始化，跳过");
    return;
  }
  
  console.log("开始初始化光锥动画，容器尺寸:", container.offsetWidth, container.offsetHeight);
  
  lightConeSketch = new p5((sketch) => {
    // 动画参数
    let time = 0;
    let lastTime = 0;
    let gridSize = 40;
    let originX, originY;
    let scale = 20; // 像素/米
    let rotationAngle = 0;
    let coneOpacity = 150;
    let prevPlayState = false; // 记录上一帧的播放状态
    let pauseTime = 0; // 记录暂停时的时间
    let pauseRotation = 0; // 记录暂停时的旋转角度
    let coneAngle = Math.PI/4; // 光锥角度，默认45度（光速为1）
    
    // 颜色
    const futureColor = sketch.color(94, 106, 210, coneOpacity); // 蓝色
    const pastColor = sketch.color(16, 185, 129, coneOpacity); // 绿色
    const lightlikeColor = sketch.color(249, 115, 22); // 橙色
    const spacelikeColor = sketch.color(220, 38, 38, coneOpacity); // 红色
    const timelikeColor = sketch.color(79, 70, 229, coneOpacity); // 紫色
    
    sketch.setup = function() {
      // 创建画布
      console.log("创建光锥画布, 容器尺寸:", container.offsetWidth, container.offsetHeight);
      const canvas = sketch.createCanvas(container.offsetWidth, container.offsetHeight);
      canvas.parent('light-cone-animation');
      
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
      rotationAngle = 0;
      pauseTime = 0;
      pauseRotation = 0;
      lastTime = sketch.millis() / 1000;
      console.log("光锥动画已重置");
    }
    
    sketch.draw = function() {
      // 获取当前参数
      const velocity = parseFloat(document.getElementById('velocity').value);
      const eventSeparation = parseFloat(document.getElementById('event-separation').value);
      const gamma = 1 / Math.sqrt(1 - velocity * velocity);
      
      // 计算事件间隔
      const deltaT = eventSeparation;
      const deltaX = eventSeparation * 0.5;
      const spacetimeInterval = deltaT * deltaT - deltaX * deltaX;
      
      // 确定事件关系
      let relation = "类时";
      let relationColor = timelikeColor;
      if (spacetimeInterval < 0) {
        relation = "类空";
        relationColor = spacelikeColor;
      } else if (Math.abs(spacetimeInterval) < 0.01) {
        relation = "类光";
        relationColor = lightlikeColor;
      }
      
      // 获取当前的isPlaying状态
      const isPlayingNow = window.isPlayingState || false;
      
      // 检测播放状态变化
      if (isPlayingNow !== prevPlayState) {
        if (isPlayingNow) {
          // 从暂停到播放，更新lastTime以避免时间跳跃
          lastTime = sketch.millis() / 1000;
        } else {
          // 从播放到暂停，记录当前时间和旋转角度
          pauseTime = time;
          pauseRotation = rotationAngle;
        }
        prevPlayState = isPlayingNow;
      }
      
      // 更新时间和旋转角度
      if (isPlayingNow) {
        const currentTime = sketch.millis() / 1000;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        time += deltaTime;
        rotationAngle += deltaTime * 0.5;
      } else {
        // 暂停状态，使用记录的暂停时间和旋转角度
        time = pauseTime;
        rotationAngle = pauseRotation;
      }
      
      // 绘制背景
      sketch.background(245, 245, 250);
      
      // 绘制网格和坐标轴
      drawGrid(sketch, originX, originY, sketch.width, sketch.height, gridSize);
      drawCoordinateSystem(sketch, originX, originY, sketch.color(70), "x", "t");
      
      // 根据相对速度调整光锥角度（这是一个视觉效果，实际上光锥角度在所有参考系中都是45度）
      // 这里我们用一个视觉效果来展示相对速度对观察者感知的影响
      const observerEffect = Math.max(0.1, 1 - velocity * 0.5); // 视觉效果因子
      
      // 绘制光锥
      drawLightCone(sketch, originX, originY, scale, observerEffect);
      
      // 绘制事件点
      const event1X = originX;
      const event1Y = originY;
      drawEvent(sketch, event1X, event1Y, lightlikeColor, "事件A");
      
      // 绘制第二个事件点
      const event2X = originX + deltaX * scale;
      const event2Y = originY - deltaT * scale;
      drawEvent(sketch, event2X, event2Y, lightlikeColor, "事件B");
      
      // 绘制连接线
      sketch.stroke(relationColor);
      sketch.strokeWeight(2);
      sketch.line(event1X, event1Y, event2X, event2Y);
      
      // 绘制事件关系区域
      if (relation === "类时") {
        drawTimelikeRegion(sketch, originX, originY, scale, observerEffect);
      } else if (relation === "类空") {
        drawSpacelikeRegion(sketch, originX, originY, scale, observerEffect);
      }
      
      // 绘制信息 - 移到顶部，避免遮挡图像
      sketch.fill(70);
      sketch.textSize(16);
      sketch.text(`事件间隔: ${eventSeparation.toFixed(2)}`, sketch.width * 0.5, 30);
      
      // 绘制公式 - 移到底部，避免遮挡图像
      sketch.fill(70);
      sketch.textSize(14);
      sketch.text("s² = c²Δt² - Δx²", sketch.width * 0.2, sketch.height - 20);
      
      // 绘制结果信息 - 移到右下角，避免遮挡图像
      sketch.fill(70);
      sketch.textSize(16);
      sketch.text(`时空间隔 (s²): ${spacetimeInterval.toFixed(2)}`, sketch.width * 0.8, sketch.height - 40);
      sketch.text(`事件关系: ${relation}`, sketch.width * 0.8, sketch.height - 20);
      
      // 更新计算结果
      updateLightConeResults(spacetimeInterval, relation);
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
    
    // 绘制光锥
    function drawLightCone(sketch, originX, originY, scale, observerEffect) {
      // 计算光锥边界点
      const coneWidth = scale * 5 * observerEffect;
      const coneHeight = scale * 5;
      
      // 绘制未来光锥
      sketch.fill(futureColor);
      sketch.noStroke();
      sketch.beginShape();
      sketch.vertex(originX, originY);
      sketch.vertex(originX - coneWidth, originY - coneHeight);
      sketch.vertex(originX + coneWidth, originY - coneHeight);
      sketch.endShape(sketch.CLOSE);
      
      // 绘制过去光锥
      sketch.fill(pastColor);
      sketch.noStroke();
      sketch.beginShape();
      sketch.vertex(originX, originY);
      sketch.vertex(originX - coneWidth, originY + coneHeight);
      sketch.vertex(originX + coneWidth, originY + coneHeight);
      sketch.endShape(sketch.CLOSE);
      
      // 绘制光锥边界线
      sketch.stroke(lightlikeColor);
      sketch.strokeWeight(2);
      sketch.line(originX, originY, originX - coneWidth, originY - coneHeight);
      sketch.line(originX, originY, originX + coneWidth, originY - coneHeight);
      sketch.line(originX, originY, originX - coneWidth, originY + coneHeight);
      sketch.line(originX, originY, originX + coneWidth, originY + coneHeight);
    }
    
    // 绘制类时区域
    function drawTimelikeRegion(sketch, originX, originY, scale, observerEffect) {
      sketch.fill(timelikeColor);
      sketch.noStroke();
      
      // 计算类时区域边界
      const timelikeWidth = scale * 3 * observerEffect;
      const timelikeHeight = scale * 5;
      
      // 绘制未来类时区域
      sketch.beginShape();
      sketch.vertex(originX, originY);
      sketch.vertex(originX - timelikeWidth, originY - timelikeHeight);
      sketch.vertex(originX + timelikeWidth, originY - timelikeHeight);
      sketch.endShape(sketch.CLOSE);
      
      // 绘制过去类时区域
      sketch.beginShape();
      sketch.vertex(originX, originY);
      sketch.vertex(originX - timelikeWidth, originY + timelikeHeight);
      sketch.vertex(originX + timelikeWidth, originY + timelikeHeight);
      sketch.endShape(sketch.CLOSE);
    }
    
    // 绘制类空区域
    function drawSpacelikeRegion(sketch, originX, originY, scale, observerEffect) {
      sketch.fill(spacelikeColor);
      sketch.noStroke();
      
      // 计算类空区域边界
      const spacelikeWidth = scale * 5;
      const spacelikeHeight = scale * 3 * observerEffect;
      
      // 绘制右侧类空区域
      sketch.beginShape();
      sketch.vertex(originX, originY);
      sketch.vertex(originX + spacelikeWidth, originY - spacelikeHeight);
      sketch.vertex(originX + spacelikeWidth, originY + spacelikeHeight);
      sketch.endShape(sketch.CLOSE);
      
      // 绘制左侧类空区域
      sketch.beginShape();
      sketch.vertex(originX, originY);
      sketch.vertex(originX - spacelikeWidth, originY - spacelikeHeight);
      sketch.vertex(originX - spacelikeWidth, originY + spacelikeHeight);
      sketch.endShape(sketch.CLOSE);
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
      const container = document.getElementById('light-cone-animation');
      if (container) {
        console.log("调整光锥画布大小:", container.offsetWidth, container.offsetHeight);
        sketch.resizeCanvas(container.offsetWidth, container.offsetHeight);
        
        // 重新设置坐标原点
        originX = sketch.width / 2;
        originY = sketch.height / 2;
      }
    };
  }, container); // 直接将容器传递给p5构造函数
  
  console.log("光锥动画初始化完成");
}

// 更新光锥计算结果
function updateLightConeResults(spacetimeInterval, relation) {
  document.getElementById('spacetime-interval').textContent = spacetimeInterval.toFixed(2);
  document.getElementById('event-relation').textContent = relation;
} 