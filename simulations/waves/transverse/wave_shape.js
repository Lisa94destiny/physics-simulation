// y-x 波形图相关代码
let waveShapeInstance;

// y-x 波形图
const waveShapeSketch = function(p) {
    let canvasWidth, canvasHeight;
    const margin = { top: 50, right: 20, bottom: 40, left: 40 }; // 增加顶部边距，使图形下移
    let plotWidth, plotHeight;
    let selectedX = null;
    
    p.setup = function() {
        const container = document.getElementById('wave-shape-container');
        canvasWidth = container.offsetWidth;
        canvasHeight = container.offsetHeight || 300; // 确保高度匹配HTML设置
        
        const canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('wave-shape-container');
        
        // 计算实际绘图区域
        plotWidth = canvasWidth - margin.left - margin.right;
        plotHeight = canvasHeight - margin.top - margin.bottom;
        
        // 点击事件监听
        canvas.mouseClicked(handleMouseClick);
        
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
        p.text("横波空间分布 (y-x图)", 10, 10);
        
        // 绘制网格
        if (showGrid) {
            drawGrid();
        }
        
        // 绘制坐标轴
        drawAxes();
        
        // 绘制波形
        drawWaveShape();
        
        // 如果有选中的点，绘制标记
        if (selectedX !== null) {
            drawSelectedPoint(selectedX);
        }
        
        // 确保提示文字始终为暗灰色，重置所有绘图设置
        p.push();
        p.noStroke();
        p.fill(120, 120, 120); // 更明确的暗灰色RGB值
        p.textSize(10);
        p.textAlign(p.RIGHT, p.BOTTOM);
        p.text("点击曲线上的位置可查看该点的时间振动图", canvasWidth - 10, canvasHeight - 5);
        p.pop();
    };
    
    // 处理鼠标点击
    function handleMouseClick() {
        // 检查鼠标是否在绘图区域内
        if (p.mouseX >= margin.left && p.mouseX <= canvasWidth - margin.right &&
            p.mouseY >= margin.top && p.mouseY <= canvasHeight - margin.bottom) {
            
            // 将鼠标位置转换为物理坐标
            const physicalX = (p.mouseX - margin.left) / plotWidth * 2 * wavelength - wavelength;
            
            // 保存选中的x位置
            selectedX = physicalX;
            selectedParticleX = physicalX;
            
            // 重置y-t图的时间历史
            resetMotionHistory();
            
            // 重绘
            p.redraw();
        }
    }
    
    // 绘制波形
    function drawWaveShape() {
        p.stroke(94, 106, 210);
        p.strokeWeight(2);
        p.noFill();
        
        p.beginShape();
        for (let i = 0; i <= 100; i++) {
            // 将[0, 100]映射到[-wavelength, wavelength]
            const x = (i / 100) * 2 * wavelength - wavelength;
            
            // 计算y值 - 使用波动方程
            const y = amplitude * Math.sin(waveNumber * x - direction * angularFrequency * time);
            
            // 将物理坐标映射到像素坐标
            const px = p.map(x, -wavelength, wavelength, margin.left, canvasWidth - margin.right);
            const py = p.map(y, amplitude, -amplitude, margin.top, canvasHeight - margin.bottom);
            
            p.vertex(px, py);
        }
        p.endShape();
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
        
        // x轴刻度
        p.textSize(10);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.fill(100);
        
        // 中心点
        const centerX = margin.left + plotWidth / 2;
        p.line(centerX, middleY - 5, centerX, middleY + 5);
        p.text("0", centerX, middleY + 18);
        
        // -λ/2点
        const minusHalfLambda = margin.left + plotWidth / 4;
        p.line(minusHalfLambda, middleY - 5, minusHalfLambda, middleY + 5);
        p.text("-λ/2", minusHalfLambda, middleY + 18);
        
        // +λ/2点
        const plusHalfLambda = margin.left + plotWidth * 3 / 4;
        p.line(plusHalfLambda, middleY - 5, plusHalfLambda, middleY + 5);
        p.text("+λ/2", plusHalfLambda, middleY + 18);
        
        // y轴刻度
        p.textAlign(p.RIGHT, p.CENTER);
        
        // y = 0 (现在在中心)
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
        p.text("x (m)", margin.left + plotWidth / 2, canvasHeight - 10);
        
        p.push();
        p.translate(15, margin.top + plotHeight / 2);
        p.rotate(-p.HALF_PI);
        p.text("y (m)", 0, 0);
        p.pop();
    }
    
    // 绘制网格
    function drawGrid() {
        p.stroke(240);
        p.strokeWeight(0.5);
        
        // 垂直网格线
        for (let i = 0; i <= 4; i++) {
            const x = margin.left + (i / 4) * plotWidth;
            p.line(x, margin.top, x, canvasHeight - margin.bottom);
        }
        
        // 水平网格线 - 确保中间有一条线
        // 计算中心y位置
        const middleY = margin.top + plotHeight / 2;
        
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
    
    // 绘制选中的点
    function drawSelectedPoint(x) {
        // 计算物理y值
        const y = amplitude * Math.sin(waveNumber * x - direction * angularFrequency * time);
        
        // 将物理坐标映射到像素坐标
        const px = p.map(x, -wavelength, wavelength, margin.left, canvasWidth - margin.right);
        const py = p.map(y, amplitude, -amplitude, margin.top, canvasHeight - margin.bottom);
        
        // 绘制选中点
        p.fill(245, 158, 11); // 橙色
        p.stroke(200, 75, 0);
        p.strokeWeight(1);
        p.ellipse(px, py, 8, 8);
        
        // 计算中心y位置（平衡位置）
        const middleY = margin.top + plotHeight / 2;
        
        // 垂直线到x轴
        p.stroke(200, 75, 0, 150);
        p.strokeWeight(1);
        p.line(px, py, px, middleY);
        
        // 水平线到y轴
        p.line(px, py, margin.left, py);
        
        // 显示坐标值
        p.fill(50);
        p.noStroke();
        p.textSize(10);
        p.textAlign(p.CENTER, p.TOP);
        
        // 在选定点下方显示x坐标
        if (py < middleY) {
            p.text("x = " + x.toFixed(2) + " m", px, middleY + 20);
        } else {
            // 如果点在x轴下方，则在上方显示
            p.text("x = " + x.toFixed(2) + " m", px, middleY - 15);
        }
        
        // 显示y坐标
        p.textAlign(p.RIGHT, p.CENTER);
        p.text("y = " + y.toFixed(2) + " m", margin.left - 10, py);
    }
    
    p.windowResized = function() {
        const container = document.getElementById('wave-shape-container');
        canvasWidth = container.offsetWidth;
        p.resizeCanvas(canvasWidth, canvasHeight);
        
        // 重新计算绘图区域
        plotWidth = canvasWidth - margin.left - margin.right;
        plotHeight = canvasHeight - margin.top - margin.bottom;
    };
};

// 初始化波形图
function initWaveShape() {
    waveShapeInstance = new p5(waveShapeSketch);
} 