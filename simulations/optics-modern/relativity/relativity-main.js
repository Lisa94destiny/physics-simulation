// 相对论可视化模拟 - 主JavaScript文件
// 负责初始化和公共功能

// 全局变量
// 不定义isPlaying，而是在需要时从window对象获取
let timeDilationSketch;
let lengthContractionSketch;
let lorentzSketch;
let lightConeSketch;
let isInitialized = false; // 添加初始化标志

// 绘制参考系
function drawReferenceFrame(sketch, x, y, velocity) {
  const frameWidth = 120;
  const frameHeight = 40;
  
  // 绘制参考系框架
  sketch.stroke(70);
  sketch.strokeWeight(2);
  sketch.fill(255);
  sketch.rect(x - frameWidth / 2, y - frameHeight / 2, frameWidth, frameHeight, 5);
  
  // 绘制速度信息
  sketch.fill(70);
  sketch.noStroke();
  sketch.textSize(14);
  if (velocity === 0) {
    sketch.text("v = 0", x, y);
  } else {
    sketch.text(`v = ${velocity.toFixed(2)}c`, x, y);
    
    // 绘制速度箭头
    sketch.stroke(94, 106, 210);
    sketch.strokeWeight(2);
    sketch.line(x - 30, y + frameHeight / 2 + 10, x + 30, y + frameHeight / 2 + 10);
    sketch.fill(94, 106, 210);
    sketch.noStroke();
    sketch.triangle(
      x + 30, y + frameHeight / 2 + 10,
      x + 20, y + frameHeight / 2 + 5,
      x + 20, y + frameHeight / 2 + 15
    );
  }
}

// 初始化所有可视化
function initVisualizations() {
  if (isInitialized) return; // 如果已经初始化，则直接返回
  
  console.log("初始化可视化...");
  
  // 初始化时间膨胀可视化
  if (typeof setupTimeDilationSketch === 'function') {
    console.log("初始化时间膨胀可视化...");
    setupTimeDilationSketch();
    console.log("时间膨胀可视化初始化完成");
  } else {
    console.error("找不到setupTimeDilationSketch函数");
  }
  
  // 初始化长度收缩可视化
  if (typeof setupLengthContractionSketch === 'function') {
    console.log("初始化长度收缩可视化...");
    setupLengthContractionSketch();
    console.log("长度收缩可视化初始化完成");
  } else {
    console.error("找不到setupLengthContractionSketch函数");
  }
  
  // 初始化洛伦兹变换可视化
  if (typeof setupLorentzSketch === 'function') {
    console.log("初始化洛伦兹变换可视化...");
    setupLorentzSketch();
    console.log("洛伦兹变换可视化初始化完成");
  } else {
    console.error("找不到setupLorentzSketch函数");
  }
  
  // 初始化光锥可视化
  if (typeof setupLightConeSketch === 'function') {
    console.log("初始化光锥可视化...");
    setupLightConeSketch();
    console.log("光锥可视化初始化完成");
  } else {
    console.error("找不到setupLightConeSketch函数");
  }
  
  isInitialized = true; // 标记为已初始化
  console.log("所有可视化初始化完成");
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM加载完成，准备初始化可视化...");
  
  // 初始化全局播放状态
  window.isPlayingState = false;
  
  // 监听播放/暂停按钮的点击事件，将isPlaying状态存储到window对象中
  const playPauseBtn = document.getElementById('play-pause');
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', function() {
      // 更新播放状态
      window.isPlayingState = !window.isPlayingState;
      console.log("播放状态更改为:", window.isPlayingState);
      
      // 更新按钮文本
      if (window.isPlayingState) {
        this.innerHTML = '<i class="fas fa-pause mr-2"></i>暂停';
      } else {
        this.innerHTML = '<i class="fas fa-play mr-2"></i>播放';
      }
    });
  } else {
    console.error("找不到播放/暂停按钮");
  }
  
  // 监听重置按钮的点击事件
  const resetBtn = document.getElementById('reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      // 重置播放状态
      window.isPlayingState = false;
      if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-play mr-2"></i>播放';
      }
      
      // 各个动画模块中已经添加了重置函数，这里只需要处理全局状态
      console.log("全局重置已触发");
    });
  } else {
    console.error("找不到重置按钮");
  }
  
  // 等待所有资源加载完成后再初始化可视化
  if (document.readyState === 'complete') {
    console.log("文档已完全加载，立即初始化可视化");
    setTimeout(initVisualizations, 500); // 延迟初始化，确保DOM完全渲染
  } else {
    console.log("文档尚未完全加载，等待load事件");
    window.addEventListener('load', function() {
      console.log("window.load事件触发，开始初始化可视化");
      setTimeout(initVisualizations, 500); // 延迟初始化，确保DOM完全渲染
    });
  }
  
  // 添加标签切换事件监听器
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.id.replace('tab-', '');
      console.log(`标签切换到: ${tabId}`);
      
      // 延迟一点时间后检查相应的动画是否已初始化
      setTimeout(() => {
        // 根据当前标签页重新初始化相应的动画
        if (tabId === 'time-dilation' && typeof setupTimeDilationSketch === 'function' && !timeDilationSketch) {
          console.log("初始化时间膨胀动画");
          setupTimeDilationSketch();
        } else if (tabId === 'length-contraction' && typeof setupLengthContractionSketch === 'function' && !lengthContractionSketch) {
          console.log("初始化长度收缩动画");
          setupLengthContractionSketch();
        } else if (tabId === 'lorentz' && typeof setupLorentzSketch === 'function' && !lorentzSketch) {
          console.log("初始化洛伦兹变换动画");
          setupLorentzSketch();
        } else if (tabId === 'light-cone' && typeof setupLightConeSketch === 'function' && !lightConeSketch) {
          console.log("初始化光锥动画");
          setupLightConeSketch();
        }
      }, 200);
    });
  });
});

// 不再需要额外的window.load事件监听器，因为我们已经在DOMContentLoaded中处理了 