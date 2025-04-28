// 全局变量
let isCommonPoint = true; // 是否为共点力模式
let isComposition = true; // 是否为力的合成模式
let showGrid = false; // 修改为默认不显示
let showComponents = false; // 修改为默认不显示
let showAngles = false; // 修改为默认不显示

// 获取DOM元素
const commonPointBtn = document.getElementById('common-point');
const headTailBtn = document.getElementById('head-tail');
const compositionBtn = document.getElementById('composition');
const decompositionBtn = document.getElementById('decomposition');
const resetBtn = document.getElementById('reset-btn');
const saveBtn = document.getElementById('save-btn');
const presetSelect = document.getElementById('preset');

// 力1控制元素
const force1Slider = document.getElementById('force1');
const force1Input = document.getElementById('force1-input');
const force1Value = document.getElementById('force1-value');
const angle1Slider = document.getElementById('angle1');
const angle1Input = document.getElementById('angle1-input');
const angle1Value = document.getElementById('angle1-value');

// 力2控制元素
const force2Slider = document.getElementById('force2');
const force2Input = document.getElementById('force2-input');
const force2Value = document.getElementById('force2-value');
const angle2Slider = document.getElementById('angle2');
const angle2Input = document.getElementById('angle2-input');
const angle2Value = document.getElementById('angle2-value');

// 显示控制元素
const showGridCheck = document.getElementById('show-grid');
const showComponentsCheck = document.getElementById('show-components');
const showAnglesCheck = document.getElementById('show-angles');

// 结果显示元素
const resultantForceEl = document.getElementById('resultant-force');
const resultantAngleEl = document.getElementById('resultant-angle');
const horizontalComponentEl = document.getElementById('horizontal-component');
const verticalComponentEl = document.getElementById('vertical-component');

// p5.js 代码
let sketch = function(p) {
    // 画布参数
    let canvasWidth, canvasHeight;
    let centerX, centerY;
    let scale = 3; // 像素/牛顿的比例
    
    // 颜色定义
    let force1Color, force2Color, resultantColor;
    let gridColor, componentColor;
    
    p.setup = function() {
        // 创建画布
        const container = document.getElementById('canvas-container');
        canvasWidth = container.offsetWidth;
        canvasHeight = 500;
        let canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('canvas-container');
        
        // 设置中心点
        centerX = canvasWidth / 2;
        centerY = canvasHeight / 2;
        
        // 初始化颜色
        force1Color = p.color(94, 106, 210); // 蓝紫色
        force2Color = p.color(245, 158, 11); // 橙色
        resultantColor = p.color(16, 185, 129); // 绿色
        gridColor = p.color(229, 231, 235); // 浅灰色
        componentColor = p.color(107, 114, 128, 150); // 半透明灰色
        
        // 设置帧率
        p.frameRate(30);
    };
    
    p.draw = function() {
        // 清空背景
        p.background(255);
        
        // 绘制网格
        if (showGrid) {
            drawGrid();
        }
        
        // 获取当前力的参数
        let f1 = parseFloat(force1Slider.value);
        let a1 = parseFloat(angle1Slider.value);
        let f2 = parseFloat(force2Slider.value);
        let a2 = parseFloat(angle2Slider.value);
        
        // 计算分量
        let f1x = f1 * p.cos(p.radians(a1));
        let f1y = f1 * p.sin(p.radians(a1));
        let f2x = f2 * p.cos(p.radians(a2));
        let f2y = f2 * p.sin(p.radians(a2));
        
        // 计算合力
        let frx = f1x + f2x;
        let fry = f1y + f2y;
        let fr = p.sqrt(frx * frx + fry * fry);
        let ar = p.degrees(p.atan2(fry, frx));
        if (ar < 0) ar += 360;
        
        // 更新结果显示
        updateResults(fr, ar, frx, fry);
        
        // 根据模式绘制力
        if (isCommonPoint) {
            // 绘制共点力
            if (showComponents) {
                drawComponents(f1x, f1y, f2x, f2y);
            }
            
            // 绘制力向量
            drawForce(centerX, centerY, f1, a1, force1Color);
            drawForce(centerX, centerY, f2, a2, force2Color);
            
            if (isComposition) {
                // 如果是合成模式，绘制平行四边形辅助线
                p.push();
                p.stroke(componentColor);
                p.strokeWeight(2);
                
                let x1 = centerX + f1x * scale;
                let y1 = centerY - f1y * scale;
                let x2 = centerX + f2x * scale;
                let y2 = centerY - f2y * scale;
                let xr = centerX + (f1x + f2x) * scale;
                let yr = centerY - (f1y + f2y) * scale;
                
                drawDashedLine(x1, y1, xr, yr);
                drawDashedLine(x2, y2, xr, yr);
                p.pop();
                
                drawForce(centerX, centerY, fr, ar, resultantColor, true);
            } else {
                // 绘制分解结果
                drawDecompositionResult(f1, a1, f2, a2);
            }
        } else {
            // 绘制首尾相接力
            let startX = centerX - scale * fr / 2;
            let startY = centerY;
            drawForce(startX, startY, f1, a1, force1Color);
            let endX = startX + scale * f1 * p.cos(p.radians(a1));
            let endY = startY - scale * f1 * p.sin(p.radians(a1));
            drawForce(endX, endY, f2, a2, force2Color);
            if (isComposition) {
                drawForce(startX, startY, fr, ar, resultantColor, true);
            } else {
                // 在首尾相接模式下也绘制分解结果
                let diffX = f1x - f2x;
                let diffY = f1y - f2y;
                let diffMagnitude = p.sqrt(diffX * diffX + diffY * diffY);
                let diffAngle = p.degrees(p.atan2(diffY, diffX));
                
                drawForce(startX, startY, diffMagnitude, diffAngle, resultantColor, true);
            }
        }
        
        // 绘制角度
        if (showAngles) {
            drawAngles(f1, a1, f2, a2);
        }
    };
    
    // 绘制网格
    function drawGrid() {
        p.stroke(gridColor);
        p.strokeWeight(1);
        
        // 绘制水平线
        for (let y = 0; y <= canvasHeight; y += 50) {
            p.line(0, y, canvasWidth, y);
        }
        
        // 绘制垂直线
        for (let x = 0; x <= canvasWidth; x += 50) {
            p.line(x, 0, x, canvasHeight);
        }
        
        // 绘制坐标轴
        p.stroke(0);
        p.strokeWeight(2);
        p.line(0, centerY, canvasWidth, centerY);
        p.line(centerX, 0, centerX, canvasHeight);
        
        // 绘制刻度
        drawGridLabels();
    }
    
    // 绘制网格刻度
    function drawGridLabels() {
        p.noStroke();
        p.fill(100);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(12);
        
        // X轴刻度
        for (let x = 50; x <= canvasWidth/2; x += 50) {
            let value = Math.round(x/scale);
            if (x !== centerX) {
                p.text(value, centerX + x, centerY + 20);
                p.text(-value, centerX - x, centerY + 20);
            }
        }
        
        // Y轴刻度
        for (let y = 50; y <= canvasHeight/2; y += 50) {
            let value = Math.round(y/scale);
            if (y !== centerY) {
                p.text(value, centerX - 25, centerY - y);
                p.text(-value, centerX - 25, centerY + y);
            }
        }
    }
    
    // 绘制力向量
    function drawForce(x, y, magnitude, angle, color, isDashed = false) {
        let dx = magnitude * scale * p.cos(p.radians(angle));
        let dy = -magnitude * scale * p.sin(p.radians(angle));
        
        p.push();
        p.stroke(color);
        p.strokeWeight(3);
        if (isDashed) {
            drawDashedLine(x, y, x + dx, y + dy);
        } else {
            p.line(x, y, x + dx, y + dy);
        }
        
        // 绘制箭头
        let arrowSize = 12;
        let arrowAngle = p.radians(25);
        let endAngle = p.radians(angle);
        
        p.fill(color);
        p.noStroke();
        let arrowX1 = x + dx - arrowSize * p.cos(endAngle - arrowAngle);
        let arrowY1 = y + dy + arrowSize * p.sin(endAngle - arrowAngle);
        let arrowX2 = x + dx - arrowSize * p.cos(endAngle + arrowAngle);
        let arrowY2 = y + dy + arrowSize * p.sin(endAngle + arrowAngle);
        
        p.triangle(
            x + dx, y + dy,
            arrowX1, arrowY1,
            arrowX2, arrowY2
        );
        
        // 根据颜色判断是哪个力，添加F1或F2标注
        let forceLabel = "";
        if (p.red(color) === 94 && p.green(color) === 106 && p.blue(color) === 210) {
            forceLabel = "F₁";
        } else if (p.red(color) === 245 && p.green(color) === 158 && p.blue(color) === 11) {
            forceLabel = "F₂";
        } else if (p.red(color) === 16 && p.green(color) === 185 && p.blue(color) === 129) {
            if (isComposition) {
                forceLabel = "F";
            } else {
                forceLabel = "F₁-F₂";
            }
        }
        
        // 标注力的大小、角度和标识
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(12);
        p.fill(color);
        let labelX = x + dx/2 + 10;
        let labelY = y + dy/2;
        
        if (forceLabel) {
            p.text(`${forceLabel}: ${magnitude.toFixed(1)}N, ${angle.toFixed(0)}°`, labelX, labelY);
        } else {
            p.text(`${magnitude.toFixed(1)}N, ${angle.toFixed(0)}°`, labelX, labelY);
        }
        
        p.pop();
    }
    
    // 绘制虚线
    function drawDashedLine(x1, y1, x2, y2) {
        let dashLength = 5;
        let gapLength = 5;
        let dx = x2 - x1;
        let dy = y2 - y1;
        let distance = p.sqrt(dx * dx + dy * dy);
        let dashCount = Math.floor(distance / (dashLength + gapLength));
        let xStep = dx / dashCount;
        let yStep = dy / dashCount;
        
        for (let i = 0; i < dashCount; i++) {
            let x = x1 + i * xStep;
            let y = y1 + i * yStep;
            p.line(x, y, x + xStep * dashLength/(dashLength + gapLength), 
                  y + yStep * dashLength/(dashLength + gapLength));
        }
    }
    
    // 绘制分量
    function drawComponents(f1x, f1y, f2x, f2y) {
        p.push();
        p.stroke(componentColor);
        p.strokeWeight(2);
        
        // 力1的分量
        let x1 = centerX + f1x * scale;
        let y1 = centerY - f1y * scale;
        p.line(centerX, centerY, x1, centerY); // x分量
        p.line(x1, centerY, x1, y1); // y分量
        
        // 力2的分量
        let x2 = centerX + f2x * scale;
        let y2 = centerY - f2y * scale;
        p.line(centerX, centerY, x2, centerY); // x分量
        p.line(x2, centerY, x2, y2); // y分量
        
        // 添加分力标注
        p.textSize(12);
        p.fill(componentColor);
        p.noStroke();
        
        // 力1分量标注
        p.text(`F₁ₓ = ${Math.abs(f1x).toFixed(1)}N`, (centerX + x1)/2, centerY + 15);
        p.text(`F₁ᵧ = ${Math.abs(f1y).toFixed(1)}N`, x1 + 15, (centerY + y1)/2);
        
        // 力2分量标注
        p.text(`F₂ₓ = ${Math.abs(f2x).toFixed(1)}N`, (centerX + x2)/2, centerY - 15);
        p.text(`F₂ᵧ = ${Math.abs(f2y).toFixed(1)}N`, x2 - 15, (centerY + y2)/2);
        
        p.pop();
    }
    
    // 绘制角度
    function drawAngles(f1, a1, f2, a2) {
        p.push();
        p.noFill();
        p.strokeWeight(2);
        
        // 力1的角度
        p.stroke(force1Color);
        p.arc(centerX, centerY, 40, 40, -p.radians(a1), 0);
        
        // 力2的角度
        p.stroke(force2Color);
        p.arc(centerX, centerY, 60, 60, -p.radians(a2), 0);
        
        p.pop();
    }
    
    // 更新结果显示
    function updateResults(fr, ar, frx, fry) {
        if (isComposition) {
            resultantForceEl.textContent = `${fr.toFixed(2)} N`;
            resultantAngleEl.textContent = `${ar.toFixed(2)}°`;
            horizontalComponentEl.textContent = `${frx.toFixed(2)} N`;
            verticalComponentEl.textContent = `${fry.toFixed(2)} N`;
            document.getElementById('calculation-mode').textContent = "合力计算结果：";
        } else {
            // 计算F1-F2的结果
            let f1 = parseFloat(force1Slider.value);
            let a1 = parseFloat(angle1Slider.value);
            let f2 = parseFloat(force2Slider.value);
            let a2 = parseFloat(angle2Slider.value);
            
            // 计算F1和F2的分量
            let f1x = f1 * p.cos(p.radians(a1));
            let f1y = f1 * p.sin(p.radians(a1));
            let f2x = f2 * p.cos(p.radians(a2));
            let f2y = f2 * p.sin(p.radians(a2));
            
            // 计算差值
            let diffX = f1x - f2x;
            let diffY = f1y - f2y;
            let diffMagnitude = p.sqrt(diffX * diffX + diffY * diffY);
            let diffAngle = p.degrees(p.atan2(diffY, diffX));
            if (diffAngle < 0) diffAngle += 360;
            
            resultantForceEl.textContent = `${diffMagnitude.toFixed(2)} N`;
            resultantAngleEl.textContent = `${diffAngle.toFixed(2)}°`;
            horizontalComponentEl.textContent = `${diffX.toFixed(2)} N`;
            verticalComponentEl.textContent = `${diffY.toFixed(2)} N`;
            document.getElementById('calculation-mode').textContent = "F₁-F₂ 的结果：";
        }
    }
    
    // 绘制分解结果
    function drawDecompositionResult(f1, a1, f2, a2) {
        // 计算F1-F2的结果
        let f1x = f1 * p.cos(p.radians(a1));
        let f1y = f1 * p.sin(p.radians(a1));
        let f2x = f2 * p.cos(p.radians(a2));
        let f2y = f2 * p.sin(p.radians(a2));
        
        let diffX = f1x - f2x;
        let diffY = f1y - f2y;
        let diffMagnitude = p.sqrt(diffX * diffX + diffY * diffY);
        let diffAngle = p.degrees(p.atan2(diffY, diffX));
        
        // 绘制差值向量（使用虚线）
        p.push();
        p.stroke(resultantColor);
        p.strokeWeight(2);
        drawDashedLine(centerX, centerY, 
                      centerX + diffX * scale, 
                      centerY - diffY * scale);
        
        // 绘制箭头
        let arrowSize = 12;
        let arrowAngle = p.radians(25);
        let endAngle = p.radians(diffAngle);
        
        p.fill(resultantColor);
        p.noStroke();
        let endX = centerX + diffX * scale;
        let endY = centerY - diffY * scale;
        let arrowX1 = endX - arrowSize * p.cos(endAngle - arrowAngle);
        let arrowY1 = endY + arrowSize * p.sin(endAngle - arrowAngle);
        let arrowX2 = endX - arrowSize * p.cos(endAngle + arrowAngle);
        let arrowY2 = endY + arrowSize * p.sin(endAngle + arrowAngle);
        
        p.triangle(endX, endY, arrowX1, arrowY1, arrowX2, arrowY2);
        
        // 标注差值
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(12);
        p.fill(resultantColor);
        let labelX = centerX + diffX * scale / 2 + 10;
        let labelY = centerY - diffY * scale / 2;
        p.text(`F₁-F₂ = ${diffMagnitude.toFixed(1)}N, ${diffAngle.toFixed(0)}°`, labelX, labelY);
        
        p.pop();
    }
    
    // 窗口大小改变时调整画布
    p.windowResized = function() {
        const container = document.getElementById('canvas-container');
        canvasWidth = container.offsetWidth;
        p.resizeCanvas(canvasWidth, canvasHeight);
        centerX = canvasWidth / 2;
        centerY = canvasHeight / 2;
    };
};

// 创建p5实例
new p5(sketch);

// 事件监听
commonPointBtn.addEventListener('click', function() {
    isCommonPoint = true;
    this.classList.remove('bg-gray-600');
    this.classList.add('bg-indigo-600');
    headTailBtn.classList.remove('bg-indigo-600');
    headTailBtn.classList.add('bg-gray-600');
});

headTailBtn.addEventListener('click', function() {
    isCommonPoint = false;
    this.classList.remove('bg-gray-600');
    this.classList.add('bg-indigo-600');
    commonPointBtn.classList.remove('bg-indigo-600');
    commonPointBtn.classList.add('bg-gray-600');
});

decompositionBtn.addEventListener('click', function() {
    isComposition = false;
    this.classList.remove('bg-gray-600');
    this.classList.add('bg-indigo-600');
    compositionBtn.classList.remove('bg-indigo-600');
    compositionBtn.classList.add('bg-gray-600');
    
    // 立即更新计算模式指示和结果
    let f1 = parseFloat(force1Slider.value);
    let a1 = parseFloat(angle1Slider.value);
    let f2 = parseFloat(force2Slider.value);
    let a2 = parseFloat(angle2Slider.value);
    
    // 计算F1和F2的分量
    let f1x = f1 * Math.cos(Math.PI * a1 / 180);
    let f1y = f1 * Math.sin(Math.PI * a1 / 180);
    let f2x = f2 * Math.cos(Math.PI * a2 / 180);
    let f2y = f2 * Math.sin(Math.PI * a2 / 180);
    
    // 计算差值
    let diffX = f1x - f2x;
    let diffY = f1y - f2y;
    let diffMagnitude = Math.sqrt(diffX * diffX + diffY * diffY);
    let diffAngle = Math.atan2(diffY, diffX) * 180 / Math.PI;
    if (diffAngle < 0) diffAngle += 360;
    
    // 更新显示
    resultantForceEl.textContent = `${diffMagnitude.toFixed(2)} N`;
    resultantAngleEl.textContent = `${diffAngle.toFixed(2)}°`;
    horizontalComponentEl.textContent = `${diffX.toFixed(2)} N`;
    verticalComponentEl.textContent = `${diffY.toFixed(2)} N`;
    document.getElementById('calculation-mode').textContent = "F₁-F₂ 的结果：";
});

compositionBtn.addEventListener('click', function() {
    isComposition = true;
    this.classList.remove('bg-gray-600');
    this.classList.add('bg-indigo-600');
    decompositionBtn.classList.remove('bg-indigo-600');
    decompositionBtn.classList.add('bg-gray-600');
    
    // 立即更新计算模式指示和结果
    let f1 = parseFloat(force1Slider.value);
    let a1 = parseFloat(angle1Slider.value);
    let f2 = parseFloat(force2Slider.value);
    let a2 = parseFloat(angle2Slider.value);
    
    // 计算分量
    let f1x = f1 * Math.cos(Math.PI * a1 / 180);
    let f1y = f1 * Math.sin(Math.PI * a1 / 180);
    let f2x = f2 * Math.cos(Math.PI * a2 / 180);
    let f2y = f2 * Math.sin(Math.PI * a2 / 180);
    
    // 计算合力
    let frx = f1x + f2x;
    let fry = f1y + f2y;
    let fr = Math.sqrt(frx * frx + fry * fry);
    let ar = Math.atan2(fry, frx) * 180 / Math.PI;
    if (ar < 0) ar += 360;
    
    // 更新显示
    resultantForceEl.textContent = `${fr.toFixed(2)} N`;
    resultantAngleEl.textContent = `${ar.toFixed(2)}°`;
    horizontalComponentEl.textContent = `${frx.toFixed(2)} N`;
    verticalComponentEl.textContent = `${fry.toFixed(2)} N`;
    document.getElementById('calculation-mode').textContent = "合力计算结果：";
});

// 力1参数联动
force1Slider.addEventListener('input', function() {
    force1Input.value = this.value;
    force1Value.textContent = this.value;
});

force1Input.addEventListener('input', function() {
    force1Slider.value = this.value;
    force1Value.textContent = this.value;
});

angle1Slider.addEventListener('input', function() {
    angle1Input.value = this.value;
    angle1Value.textContent = this.value;
});

angle1Input.addEventListener('input', function() {
    angle1Slider.value = this.value;
    angle1Value.textContent = this.value;
});

// 力2参数联动
force2Slider.addEventListener('input', function() {
    force2Input.value = this.value;
    force2Value.textContent = this.value;
});

force2Input.addEventListener('input', function() {
    force2Slider.value = this.value;
    force2Value.textContent = this.value;
});

angle2Slider.addEventListener('input', function() {
    angle2Input.value = this.value;
    angle2Value.textContent = this.value;
});

angle2Input.addEventListener('input', function() {
    angle2Slider.value = this.value;
    angle2Value.textContent = this.value;
});

// 显示控制
showGridCheck.addEventListener('change', function() {
    showGrid = this.checked;
});

showComponentsCheck.addEventListener('change', function() {
    showComponents = this.checked;
});

showAnglesCheck.addEventListener('change', function() {
    showAngles = this.checked;
});

// 初始化显示控制复选框状态
showGridCheck.checked = showGrid;
showComponentsCheck.checked = showComponents;
showAnglesCheck.checked = showAngles;

// 预设场景
presetSelect.addEventListener('change', function() {
    applyPreset(this.value);
});

// 重置按钮
resetBtn.addEventListener('click', function() {
    applyPreset('custom');
    presetSelect.value = 'custom';
});

// 保存按钮
saveBtn.addEventListener('click', function() {
    // 获取canvas元素
    const canvas = document.querySelector('#canvas-container canvas');
    // 创建下载链接
    const link = document.createElement('a');
    link.download = '力的合成与分解.png';
    link.href = canvas.toDataURL();
    link.click();
});

// 预设场景函数
function applyPreset(preset) {
    switch(preset) {
        case 'orthogonal':
            // 正交分解
            force1Slider.value = force1Input.value = 40;
            force2Slider.value = force2Input.value = 40;
            angle1Slider.value = angle1Input.value = 0;
            angle2Slider.value = angle2Input.value = 90;
            break;
            
        case 'symmetric':
            // 对称分解
            force1Slider.value = force1Input.value = 40;
            force2Slider.value = force2Input.value = 40;
            angle1Slider.value = angle1Input.value = 30;
            angle2Slider.value = angle2Input.value = 150;
            break;
            
        case 'parallel':
            // 平行力
            force1Slider.value = force1Input.value = 40;
            force2Slider.value = force2Input.value = 60;
            angle1Slider.value = angle1Input.value = 45;
            angle2Slider.value = angle2Input.value = 45;
            break;
            
        case 'opposite':
            // 反向力
            force1Slider.value = force1Input.value = 40;
            force2Slider.value = force2Input.value = 40;
            angle1Slider.value = angle1Input.value = 0;
            angle2Slider.value = angle2Input.value = 180;
            break;
            
        default:
            // 自定义/默认值
            force1Slider.value = force1Input.value = 40;
            force2Slider.value = force2Input.value = 40;
            angle1Slider.value = angle1Input.value = 45;
            angle2Slider.value = angle2Input.value = 135;
    }
    
    // 更新显示值
    force1Value.textContent = force1Slider.value;
    force2Value.textContent = force2Slider.value;
    angle1Value.textContent = angle1Slider.value;
    angle2Value.textContent = angle2Slider.value;
} 