// y-t 质点运动图相关代码
let particleMotionInstance;
let motionHistory = []; // 用于存储运动历史
let motionStartTime = 0; // 记录开始绘制的时间点
let maxDisplayTime = 4; // 最大显示时间跨度(秒)

// 重置运动历史
function resetMotionHistory() {
    motionHistory = [];
    motionStartTime = time; // 记录选中点击时的时间
}

// y-t 质点运动图
const particleMotionSketch = function(p) {
    let canvasWidth, canvasHeight;
    const margin = { top: 50, right: 20, bottom: 40, left: 70 }; // 增加顶部边距和左侧边距
    let plotWidth, plotHeight;
    const maxHistoryPoints = 300; // 最大历史点数量
    
    p.setup = function() {
        const container = document.getElementById('particle-motion-container');
        canvasWidth = container.offsetWidth;
        canvasHeight = container.offsetHeight || 300; // 确保高度匹配HTML设置
        
        const canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('particle-motion-container');
        
        // 计算实际绘图区域
        plotWidth = canvasWidth - margin.left - margin.right;
        plotHeight = canvasHeight - margin.top - margin.bottom;
        
        // 设置帧率
        p.frameRate(60);
    };
    
    p.draw = function() {
        p.background(255);
        
        // 显示图表标题
        p.fill(75);
        p.noStroke();
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);
        p.text("质点振动图 (y-t图)", 10, 10);
        
        // 绘制网格
        if (showGrid) {
            drawGrid();
        }
        
        // 绘制坐标轴
        drawAxes();
        
        // 如果有选中的质点，绘制其运动图
        if (selectedParticleX !== null) {
            // 如果没有暂停，添加新的数据点
            if (!isPaused) {
                addDataPoint(selectedParticleX, time);
            }
            
            // 绘制运动历史
            drawMotionHistory();
            
            // 显示选中质点的信息
            p.fill(50);
            p.noStroke();
            p.textSize(12);
            p.textAlign(p.LEFT, p.TOP);
            p.text("选中位置: x = " + selectedParticleX.toFixed(2) + " m", margin.left, margin.top - 20);
        } else {
            // 提示用户选择质点
            p.fill(150);
            p.noStroke();
            p.textSize(14);
            p.textAlign(p.CENTER, p.CENTER);
            p.text("请在上方y-x图中点击选择一个质点位置", canvasWidth / 2, canvasHeight / 2);
        }
    };
    
    // 添加数据点到历史记录
    function addDataPoint(x, currentTime) {
        // 计算物理y值 - 使用波动方程
        const y = amplitude * Math.sin(waveNumber * x - direction * angularFrequency * currentTime);
        
        // 仅当时间大于等于选中时刻才记录
        if (currentTime >= motionStartTime) {
            motionHistory.push({
                time: currentTime - motionStartTime, // 相对时间，从0开始
                displacement: y
            });
            
            // 限制历史点数量
            if (motionHistory.length > maxHistoryPoints) {
                // 当超过最大点数时，保留后面的点
                motionHistory.shift();
            }
        }
    }
    
    // 绘制运动历史
    function drawMotionHistory() {
        if (motionHistory.length < 2) return;
        
        // 获取数据的时间范围
        let latestTime = motionHistory[motionHistory.length - 1].time;
        let displayEndTime = Math.max(maxDisplayTime, latestTime);
        
        p.stroke(94, 106, 210);
        p.strokeWeight(2);
        p.noFill();
        
        p.beginShape();
        for (let i = 0; i < motionHistory.length; i++) {
            const data = motionHistory[i];
            
            // 将物理坐标映射到像素坐标
            const px = p.map(data.time, 0, displayEndTime, margin.left, canvasWidth - margin.right);
            const py = p.map(data.displacement, amplitude, -amplitude, margin.top, canvasHeight - margin.bottom);
            
            p.vertex(px, py);
        }
        p.endShape();
        
        // 绘制当前点 - 显示当前位移
        if (motionHistory.length > 0) {
            // 获取当前数据
            const currentData = motionHistory[motionHistory.length - 1];
            
            // 计算当前位置
            const px = p.map(currentData.time, 0, displayEndTime, margin.left, canvasWidth - margin.right);
            const py = p.map(currentData.displacement, amplitude, -amplitude, margin.top, canvasHeight - margin.bottom);
            
            p.fill(245, 158, 11); // 橙色
            p.stroke(200, 75, 0);
            p.strokeWeight(1);
            p.ellipse(px, py, 8, 8);
            
            // 添加文本说明此点位置
            p.fill(200, 75, 0);
            p.noStroke();
            p.textSize(10);
            p.textAlign(p.LEFT, p.CENTER);
            p.text("当前位置", px + 10, py);
        }
    }
    
    // 绘制坐标轴
    function drawAxes() {
        p.stroke(100);
        p.strokeWeight(1);
        
        // 计算中心y位置（平衡位置）
        const middleY = margin.top + plotHeight / 2;
        
        // x轴 - 现在位于中心位置
        p.line(margin.left, middleY, canvasWidth - margin.right, middleY);
        
        // y轴
        p.line(margin.left, margin.top, margin.left, canvasHeight - margin.bottom);
        
        // 计算最大显示时间
        let displayEndTime = maxDisplayTime;
        if (motionHistory.length > 0) {
            const latestTime = motionHistory[motionHistory.length - 1].time;
            displayEndTime = Math.max(maxDisplayTime, latestTime);
        }
        
        // x轴刻度 - 均匀分布5个刻度
        p.textSize(10);
        p.textAlign(p.CENTER, p.TOP);
        p.fill(100);
        
        const timeStep = displayEndTime / 4; // 计算时间步长
        
        for (let i = 0; i <= 4; i++) {
            const t = i * timeStep;
            const x = margin.left + (i / 4) * plotWidth;
            p.line(x, middleY - 3, x, middleY + 3);
            p.text(t.toFixed(1) + "s", x, middleY + 5);
        }
        
        // y轴刻度
        p.textAlign(p.RIGHT, p.CENTER);
        
        // y = 0 (在中心)
        p.line(margin.left - 5, middleY, margin.left, middleY);
        p.text("0", margin.left - 8, middleY);
        
        // y = +A
        const posA = margin.top;
        p.line(margin.left - 5, posA, margin.left, posA);
        p.text("+A", margin.left - 8, posA);
        
        // y = -A
        const negA = canvasHeight - margin.bottom;
        p.line(margin.left - 5, negA, margin.left, negA);
        p.text("-A", margin.left - 8, negA);
        
        // 轴标签
        p.textAlign(p.CENTER, p.TOP);
        p.text("t (s)", margin.left + plotWidth / 2, canvasHeight - 10);
        
        p.push();
        p.translate(25, margin.top + plotHeight / 2);
        p.rotate(-p.HALF_PI);
        p.text("y (m)", 0, 0);
        p.pop();
    }
    
    // 绘制网格
    function drawGrid() {
        p.stroke(240);
        p.strokeWeight(0.5);
        
        // 计算中心y位置
        const middleY = margin.top + plotHeight / 2;
        
        // 计算最大显示时间
        let displayEndTime = maxDisplayTime;
        if (motionHistory.length > 0) {
            const latestTime = motionHistory[motionHistory.length - 1].time;
            displayEndTime = Math.max(maxDisplayTime, latestTime);
        }
        
        // 垂直网格线
        for (let i = 0; i <= 4; i++) {
            const x = margin.left + (i / 4) * plotWidth;
            p.line(x, margin.top, x, canvasHeight - margin.bottom);
        }
        
        // 水平网格线 - 确保中间有一条线
        // 上半部分
        for (let i = 0; i <= 2; i++) {
            const y = middleY - (i / 2) * (plotHeight / 2);
            p.line(margin.left, y, canvasWidth - margin.right, y);
        }
        
        // 下半部分
        for (let i = 1; i <= 2; i++) {
            const y = middleY + (i / 2) * (plotHeight / 2);
            p.line(margin.left, y, canvasWidth - margin.right, y);
        }
    }
    
    p.windowResized = function() {
        const container = document.getElementById('particle-motion-container');
        canvasWidth = container.offsetWidth;
        p.resizeCanvas(canvasWidth, canvasHeight);
        
        // 重新计算绘图区域
        plotWidth = canvasWidth - margin.left - margin.right;
        plotHeight = canvasHeight - margin.top - margin.bottom;
    };
};

// 初始化质点运动图
function initParticleMotion() {
    particleMotionInstance = new p5(particleMotionSketch);
} 