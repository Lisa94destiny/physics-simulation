// 波动动画相关代码
let waveAnimationInstance;

// 横波动画
const waveAnimationSketch = function(p) {
    let canvasWidth, canvasHeight;
    const numParticles = 20; // 显示的质点数量
    const particleSpacing = 30; // 质点间距，像素
    let particleArray = []; // 存储质点的位置
    
    p.setup = function() {
        const container = document.getElementById('wave-animation-container');
        canvasWidth = container.offsetWidth;
        canvasHeight = container.offsetHeight || 200;
        
        const canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('wave-animation-container');
        
        // 初始化质点位置
        for (let i = 0; i < numParticles; i++) {
            particleArray.push({
                x: i * particleSpacing + 50, // 起始x位置
                y: canvasHeight / 2, // 初始y位置（中间）
                initialX: i * particleSpacing + 50 // 保存初始x位置用于计算
            });
        }
        
        // 设置帧率
        p.frameRate(60);
    };
    
    p.draw = function() {
        p.background(245, 247, 250);
        
        // 显示图表标题
        p.fill(75);
        p.noStroke();
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);
        p.text("横波动画", 10, 10);
        
        // 显示波速
        p.textAlign(p.RIGHT, p.TOP);
        p.fill(16, 185, 129); // 绿色
        p.textSize(12);
        p.text("波速: " + waveSpeed.toFixed(2) + " m/s", canvasWidth - 10, 10);
        
        // 如果未暂停，更新时间
        if (!isPaused) {
            time += 0.016; // 假设60fps，约16ms
        }
        
        // 绘制网格
        if (showGrid) {
            drawGrid();
        }
        
        // 平衡线
        p.stroke(200);
        p.strokeWeight(1);
        p.line(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
        
        // 绘制平衡位置文字标记
        p.fill(120);
        p.noStroke();
        p.textAlign(p.RIGHT);
        p.textSize(10);
        p.text("平衡位置", 45, canvasHeight / 2 - 5);
        
        // 更新并绘制质点位置
        updateParticles();
        
        // 绘制波前
        if (showWavefront) {
            drawWavefront();
        }
        
        // 绘制传播方向
        drawPropagationDirection();
        
        // 在底部添加提示文字
        p.fill(150); // 灰色
        p.textSize(10);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.text("调节波长时，此处动画不支持显示波长变化", canvasWidth / 2, canvasHeight - 5);
    };
    
    // 绘制网格
    function drawGrid() {
        p.stroke(220);
        p.strokeWeight(0.5);
        
        // 绘制垂直线
        for (let x = 0; x < canvasWidth; x += 50) {
            p.line(x, 0, x, canvasHeight);
        }
        
        // 绘制水平线
        for (let y = 0; y < canvasHeight; y += 50) {
            p.line(0, y, canvasWidth, y);
        }
    }
    
    // 绘制传播方向
    function drawPropagationDirection() {
        p.stroke(16, 185, 129); // 绿色
        p.strokeWeight(1.5);
        p.fill(16, 185, 129);
        
        // 根据当前传播方向绘制箭头，放在画布中间位置
        const arrowX = canvasWidth / 2;
        const arrowEndX = direction > 0 ? arrowX + 40 : arrowX - 40;
        
        // 箭头线
        p.line(arrowX, 30, arrowEndX, 30);
        
        // 箭头头部
        const headSize = 8;
        if (direction > 0) {
            p.triangle(
                arrowEndX, 30,
                arrowEndX - headSize, 30 - headSize / 2,
                arrowEndX - headSize, 30 + headSize / 2
            );
        } else {
            p.triangle(
                arrowEndX, 30,
                arrowEndX + headSize, 30 - headSize / 2,
                arrowEndX + headSize, 30 + headSize / 2
            );
        }
        
        // 添加标签
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.text("传播方向", arrowX, 35);
    }
    
    // 更新质点位置
    function updateParticles() {
        for (let i = 0; i < numParticles; i++) {
            const particle = particleArray[i];
            
            // 使用实际物理位置计算
            const xPos = (particle.initialX - 50) / particleSpacing * (wavelength / numParticles * 5);
            
            // 计算y位置 (振动位移)
            particle.y = canvasHeight / 2 - amplitude * 40 * 
                         Math.sin(waveNumber * xPos - direction * angularFrequency * time);
            
            // 绘制质点
            if (showParticles) {
                p.fill(94, 106, 210);
                p.noStroke();
                p.ellipse(particle.x, particle.y, 10, 10);
                
                // 连接线
                if (i > 0) {
                    p.stroke(94, 106, 210, 150);
                    p.strokeWeight(2);
                    p.line(particleArray[i-1].x, particleArray[i-1].y, particle.x, particle.y);
                }
            }
        }
    }
    
    // 绘制波前
    function drawWavefront() {
        p.stroke(16, 185, 129); // 绿色
        p.strokeWeight(2);
        p.noFill();
        
        p.beginShape();
        for (let x = 0; x < canvasWidth; x += 5) {
            // 将像素坐标转换为物理坐标
            const xPos = (x - 50) / particleSpacing * (wavelength / numParticles * 5);
            
            // 计算y位置
            const y = canvasHeight / 2 - amplitude * 40 * 
                      Math.sin(waveNumber * xPos - direction * angularFrequency * time);
            
            p.vertex(x, y);
        }
        p.endShape();
    }
    
    p.windowResized = function() {
        const container = document.getElementById('wave-animation-container');
        canvasWidth = container.offsetWidth;
        p.resizeCanvas(canvasWidth, canvasHeight);
        
        // 重新计算质点位置
        for (let i = 0; i < numParticles; i++) {
            particleArray[i] = {
                x: i * particleSpacing + 50,
                y: canvasHeight / 2,
                initialX: i * particleSpacing + 50
            };
        }
    };
};

// 初始化波动动画
function initWaveAnimation() {
    waveAnimationInstance = new p5(waveAnimationSketch);
} 