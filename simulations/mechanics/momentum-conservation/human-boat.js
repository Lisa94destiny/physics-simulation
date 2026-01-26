// 全局变量
let human; // 人物对象
let boat; // 船对象
let water; // 水面对象
let isRunning = false; // 是否正在运行

// 配置参数
let config = {
    humanMass: 70, // 人的质量(kg)
    boatMass: 200, // 船的质量(kg)
    walkingSpeed: 2, // 人走路速度(m/s)
    waterResistance: 0.1, // 水的阻力系数
    showVelocity: true, // 显示速度矢量
    showMomentum: true, // 显示动量矢量
    showCenterOfMass: true // 显示质心
};

// 比例尺和位置常量
const SCALE = 30; // 像素/米
const WATER_HEIGHT = 30; // 水面高度
const BOAT_WIDTH = 200; // 船宽度
const BOAT_HEIGHT = 40; // 船高度
const BOAT_Y = 350; // 船的Y坐标
const HUMAN_WIDTH = 20; // 人物宽度
const HUMAN_HEIGHT = 50; // 人物高度

// 颜色定义
const COLORS = {
    human: '#10B981',
    boat: '#F59E0B',
    water: 'rgba(94, 106, 210, 0.3)',
    velocity: '#10B981',
    momentum: '#6366F1',
    centerOfMass: '#EF4444',
    background: '#FFFFFF',
    reference: 'rgba(0, 0, 0, 0.1)' // 参考线颜色
};

// 人物类
class Human {
    constructor(x, y, mass, width, height) {
        this.position = createVector(x, y);
        this.relativePosition = createVector(0, 0); // 相对于船的位置
        this.velocity = createVector(0, 0);
        this.targetVelocity = createVector(0, 0);
        this.mass = mass;
        this.width = width;
        this.height = height;
        this.walkingDirection = 0; // 0: 静止, -1: 向左, 1: 向右
    }
    
    // 获取动量
    getMomentum() {
        return p5.Vector.mult(this.velocity, this.mass);
    }
    
    // 设置走路方向
    setWalkingDirection(direction) {
        this.walkingDirection = direction;
        this.updateTargetVelocity();
    }
    
    // 更新目标速度
    updateTargetVelocity() {
        if (this.walkingDirection === 0) {
            this.targetVelocity.set(0, 0);
        } else {
            this.targetVelocity.set(this.walkingDirection * config.walkingSpeed, 0);
        }
    }
    
    // 更新位置和速度
    update(dt) {
        // 匀速运动到目标速度
        const acceleration = 5; // 加速度
        const dv = p5.Vector.sub(this.targetVelocity, this.velocity);
        if (dv.mag() > 0.01) {
            dv.normalize().mult(acceleration * dt);
            this.velocity.add(dv);
        } else {
            this.velocity.set(this.targetVelocity.x, this.targetVelocity.y);
        }
        
        // 更新相对于船的位置
        this.relativePosition.add(p5.Vector.mult(this.velocity, dt));
        
        // 限制人物在船上的移动范围
        const halfBoatWidth = BOAT_WIDTH / 2;
        if (this.relativePosition.x < -halfBoatWidth + this.width / 2) {
            this.relativePosition.x = -halfBoatWidth + this.width / 2;
            this.velocity.x = 0;
            this.targetVelocity.x = 0;
            this.walkingDirection = 0;
        } else if (this.relativePosition.x > halfBoatWidth - this.width / 2) {
            this.relativePosition.x = halfBoatWidth - this.width / 2;
            this.velocity.x = 0;
            this.targetVelocity.x = 0;
            this.walkingDirection = 0;
        }
        
        // 更新全局位置
        this.position.x = boat.position.x + this.relativePosition.x;
    }
    
    // 绘制人物
    display() {
        push();
        noStroke();
        fill(COLORS.human);
        
        // 绘制人物
        // 头部
        ellipse(this.position.x, this.position.y - this.height / 2 + 10, 20);
        
        // 身体
        rect(this.position.x - 8, this.position.y - this.height / 2 + 20, 16, 25);
        
        // 手臂
        rect(this.position.x - 15, this.position.y - this.height / 2 + 25, 7, 4);
        rect(this.position.x + 8, this.position.y - this.height / 2 + 25, 7, 4);
        
        // 腿部
        rect(this.position.x - 8, this.position.y - this.height / 2 + 45, 6, 5);
        rect(this.position.x + 2, this.position.y - this.height / 2 + 45, 6, 5);
        
        // 显示速度矢量
        if (config.showVelocity) {
            this.displayVector(this.velocity, 10, COLORS.velocity, "V");
        }
        
        // 显示动量矢量
        if (config.showMomentum) {
            this.displayVector(this.getMomentum(), 0.1, COLORS.momentum, "P");
        }
        
        pop();
        
        // 如果人在移动，显示一个行走方向指示
        if (abs(this.velocity.x) > 0.1) {
            push();
            noStroke();
            fill(COLORS.human);
            textSize(14);
            textAlign(CENTER);
            const direction = this.velocity.x > 0 ? "→" : "←";
            text(direction, this.position.x, this.position.y - this.height);
            pop();
        }
    }
    
    // 绘制矢量箭头
    displayVector(vector, scale, color, label) {
        if (vector.mag() > 0.01) {
            push();
            stroke(color);
            strokeWeight(2);
            
            // 计算箭头终点
            const end = p5.Vector.add(
                createVector(this.position.x, this.position.y - this.height / 4), 
                p5.Vector.mult(vector, scale)
            );
            const start = createVector(this.position.x, this.position.y - this.height / 4);
            
            line(start.x, start.y, end.x, end.y);
            
            // 绘制箭头
            const arrowSize = 8;
            const angle = vector.heading();
            
            translate(end.x, end.y);
            rotate(angle);
            fill(color);
            triangle(0, 0, -arrowSize, -arrowSize/2, -arrowSize, arrowSize/2);
            
            // 添加标签
            if (label) {
                rotate(-angle);
                noStroke();
                textSize(12);
                textAlign(CENTER, CENTER);
                text(label, 0, -10);
                
                // 添加速度或动量值
                if (label === "V") {
                    textSize(10);
                    text(vector.x.toFixed(2) + " m/s", 0, -25);
                } else if (label === "P") {
                    textSize(10);
                    text((vector.x).toFixed(2) + " kg·m/s", 0, -25);
                }
            }
            
            pop();
        }
    }
}

// 船类
class Boat {
    constructor(x, y, mass, width, height) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.initialPosition = x; // 记录初始位置
        this.mass = mass;
        this.width = width;
        this.height = height;
    }
    
    // 获取动量
    getMomentum() {
        return p5.Vector.mult(this.velocity, this.mass);
    }
    
    // 更新位置和速度
    update(dt) {
        // 计算水的阻力
        const resistance = this.velocity.copy().mult(-config.waterResistance);
        
        // 更新速度
        this.velocity.add(p5.Vector.mult(resistance, dt));
        
        // 更新位置
        this.position.add(p5.Vector.mult(this.velocity, dt));
        
        // 限制船不会移出画布
        const halfBoatWidth = this.width / 2;
        if (this.position.x - halfBoatWidth < 0) {
            this.position.x = halfBoatWidth;
            this.velocity.x = 0;
        } else if (this.position.x + halfBoatWidth > width) {
            this.position.x = width - halfBoatWidth;
            this.velocity.x = 0;
        }
    }
    
    // 绘制船
    display() {
        push();
        noStroke();
        fill(COLORS.boat);
        
        // 绘制船身
        beginShape();
        vertex(this.position.x - this.width/2, this.position.y);
        vertex(this.position.x - this.width/2 + 20, this.position.y + this.height);
        vertex(this.position.x + this.width/2 - 20, this.position.y + this.height);
        vertex(this.position.x + this.width/2, this.position.y);
        endShape(CLOSE);
        
        // 显示速度矢量
        if (config.showVelocity) {
            this.displayVector(this.velocity, 10, COLORS.velocity, "V");
        }
        
        // 显示动量矢量
        if (config.showMomentum) {
            this.displayVector(this.getMomentum(), 0.1, COLORS.momentum, "P");
        }
        
        pop();
        
        // 显示位移指示
        this.displayDisplacement();
        
        // 如果船在移动，显示一个运动方向指示
        if (abs(this.velocity.x) > 0.01) {
            push();
            noStroke();
            fill(COLORS.boat);
            textSize(14);
            textAlign(CENTER);
            const direction = this.velocity.x > 0 ? "→" : "←";
            text(direction, this.position.x, this.position.y + this.height + 20);
            pop();
        }
    }
    
    // 显示位移指示
    displayDisplacement() {
        if (abs(this.position.x - this.initialPosition) > 1) {
            push();
            stroke(COLORS.boat);
            strokeWeight(1);
            setLineDash([5, 3]); // 设置虚线样式
            line(this.initialPosition, this.position.y + this.height + 5, 
                 this.position.x, this.position.y + this.height + 5);
                 
            // 添加箭头
            const dir = this.position.x > this.initialPosition ? 1 : -1;
            const arrowX = this.position.x;
            const arrowY = this.position.y + this.height + 5;
            
            fill(COLORS.boat);
            noStroke();
            triangle(
                arrowX, arrowY,
                arrowX - dir * 5, arrowY - 3,
                arrowX - dir * 5, arrowY + 3
            );
            
            // 显示位移距离
            textSize(10);
            textAlign(CENTER);
            const displacement = abs(this.position.x - this.initialPosition) / SCALE;
            text(displacement.toFixed(2) + " m", (this.initialPosition + this.position.x) / 2, this.position.y + this.height + 20);
            pop();
        }
    }
    
    // 绘制矢量箭头
    displayVector(vector, scale, color, label) {
        if (vector.mag() > 0.01) {
            push();
            stroke(color);
            strokeWeight(2);
            
            // 计算箭头起点和终点
            const start = createVector(this.position.x, this.position.y + this.height / 2);
            const end = p5.Vector.add(start, p5.Vector.mult(vector, scale));
            
            line(start.x, start.y, end.x, end.y);
            
            // 绘制箭头
            const arrowSize = 8;
            const angle = vector.heading();
            
            translate(end.x, end.y);
            rotate(angle);
            fill(color);
            triangle(0, 0, -arrowSize, -arrowSize/2, -arrowSize, arrowSize/2);
            
            // 添加标签
            if (label) {
                rotate(-angle);
                noStroke();
                textSize(12);
                textAlign(CENTER, CENTER);
                text(label, 0, -10);
                
                // 添加速度或动量值
                if (label === "V") {
                    textSize(10);
                    text(vector.x.toFixed(2) + " m/s", 0, -25);
                } else if (label === "P") {
                    textSize(10);
                    text((vector.x).toFixed(2) + " kg·m/s", 0, -25);
                }
            }
            
            pop();
        }
    }
}

// 水面类
class Water {
    constructor(y, width, height) {
        this.position = createVector(width/2, y);
        this.width = width;
        this.height = height;
    }
    
    // 绘制水面
    display() {
        push();
        noStroke();
        fill(COLORS.water);
        rect(0, this.position.y, this.width, this.height);
        
        // 添加水波纹效果
        stroke(255, 255, 255, 50);
        strokeWeight(1);
        for (let i = 0; i < 8; i++) {
            const y = this.position.y + i * 8;
            beginShape();
            for (let x = 0; x < this.width; x += 20) {
                const waveHeight = sin(x * 0.02 + frameCount * 0.03) * 2;
                vertex(x, y + waveHeight);
            }
            endShape();
        }
        pop();
    }
}

// 设置虚线函数（用于位移指示器）
function setLineDash(list) {
    drawingContext.setLineDash(list);
}

// p5.js 初始化
function setup() {
    // 创建画布并放置到容器中
    const canvas = createCanvas(800, 500);
    canvas.parent('canvas-container');
    
    // 初始化对象
    resetSimulation();
    
    // 添加事件监听器
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 重置按钮
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
    
    // 向左走按钮
    document.getElementById('walk-left-btn').addEventListener('click', function() {
        if(!isRunning) isRunning = true;
        human.setWalkingDirection(-1);
    });
    
    // 向右走按钮
    document.getElementById('walk-right-btn').addEventListener('click', function() {
        if(!isRunning) isRunning = true;
        human.setWalkingDirection(1);
    });
    
    // 停止按钮
    document.getElementById('stop-btn').addEventListener('click', function() {
        human.setWalkingDirection(0);
    });
    
    // 参数控制
    document.getElementById('human-mass').addEventListener('input', function() {
        config.humanMass = parseInt(this.value);
        human.mass = config.humanMass;
        updateDisplay();
    });
    
    document.getElementById('boat-mass').addEventListener('input', function() {
        config.boatMass = parseInt(this.value);
        boat.mass = config.boatMass;
        updateDisplay();
    });
    
    document.getElementById('walking-speed').addEventListener('input', function() {
        config.walkingSpeed = parseFloat(this.value);
        human.updateTargetVelocity();
        updateDisplay();
    });
    
    document.getElementById('water-resistance').addEventListener('input', function() {
        config.waterResistance = parseFloat(this.value);
    });
    
    document.getElementById('show-velocity').addEventListener('change', function() {
        config.showVelocity = this.checked;
    });
    
    document.getElementById('show-momentum').addEventListener('change', function() {
        config.showMomentum = this.checked;
    });
    
    document.getElementById('show-center-of-mass').addEventListener('change', function() {
        config.showCenterOfMass = this.checked;
    });
}

// 重置模拟
function resetSimulation() {
    // 初始化水面
    water = new Water(BOAT_Y + BOAT_HEIGHT, width, height - BOAT_Y - BOAT_HEIGHT);
    
    // 初始化船
    boat = new Boat(width/2, BOAT_Y, config.boatMass, BOAT_WIDTH, BOAT_HEIGHT);
    
    // 初始化人物
    human = new Human(width/2, BOAT_Y - HUMAN_HEIGHT/2, config.humanMass, HUMAN_WIDTH, HUMAN_HEIGHT);
    
    // 重置状态
    isRunning = false;
    human.setWalkingDirection(0);
    
    // 更新显示
    updateDisplay();
}

// 更新UI显示
function updateDisplay() {
    // 更新人的速度显示
    document.getElementById('human-velocity').innerText = `v₁ = ${human.velocity.x.toFixed(2)} m/s`;
    
    // 更新船的速度显示
    document.getElementById('boat-velocity').innerText = `v₂ = ${boat.velocity.x.toFixed(2)} m/s`;
    
    // 计算总动量
    const totalMomentum = p5.Vector.add(human.getMomentum(), boat.getMomentum());
    document.getElementById('total-momentum').innerText = `p = ${totalMomentum.x.toFixed(2)} kg·m/s`;
    
    // 计算质心速度
    const totalMass = human.mass + boat.mass;
    const centerOfMassVelocity = p5.Vector.add(
        p5.Vector.mult(human.velocity, human.mass / totalMass),
        p5.Vector.mult(boat.velocity, boat.mass / totalMass)
    );
    document.getElementById('center-of-mass-velocity').innerText = `v_cm = ${centerOfMassVelocity.x.toFixed(2)} m/s`;
    
    // 动量守恒方程
    const m1v1 = human.mass * human.velocity.x;
    const m2v2 = boat.mass * boat.velocity.x;
    const sum = m1v1 + m2v2;
    document.getElementById('momentum-equation').innerText = 
        `${human.mass} × ${human.velocity.x.toFixed(2)} + ${boat.mass} × ${boat.velocity.x.toFixed(2)} = ${sum.toFixed(2)} kg·m/s`;
    
    // 验证船的速度是否符合理论值
    if (abs(human.velocity.x) > 0.01) {
        const theoreticalBoatVelocity = -human.mass * human.velocity.x / boat.mass;
        const actualBoatVelocity = boat.velocity.x;
        const velocityError = abs(theoreticalBoatVelocity - actualBoatVelocity);
        
        // 如果误差太大，重新调整船的速度
        if (velocityError > 0.01) {
            boat.velocity.x = theoreticalBoatVelocity;
        }
    }
}

// 动力学模拟
function simulateDynamics() {
    if (!isRunning) return;
    
    const dt = 1/60; // 时间步长(秒)
    
    // 更新人和船的位置和速度
    human.update(dt);
    boat.update(dt);
    
    // 根据动量守恒计算船的速度
    // 人的动量变化等于人的当前动量减去目标动量
    const humanMomentumChange = p5.Vector.sub(human.getMomentum(), p5.Vector.mult(human.targetVelocity, human.mass));
    
    // 船的速度变化必须使系统总动量保持不变
    // 注意负号确保方向相反：人向右移动，船向左移动
    const boatVelocityChange = p5.Vector.div(humanMomentumChange, -boat.mass);
    boat.velocity.add(boatVelocityChange);
    
    // 更新显示
    updateDisplay();
}

// 计算系统质心
function calculateCenterOfMass() {
    const totalMass = human.mass + boat.mass;
    const centerX = (human.position.x * human.mass + boat.position.x * boat.mass) / totalMass;
    return createVector(centerX, boat.position.y - 30);
}

// 绘制物理参考信息
function drawPhysicsInfo() {
    push();
    stroke(COLORS.reference);
    strokeWeight(1);
    
    // 绘制起始位置参考线
    if (abs(boat.position.x - boat.initialPosition) > 1) {
        setLineDash([5, 5]);
        line(boat.initialPosition, 50, boat.initialPosition, height - 50);
    }
    
    // 恢复实线样式
    setLineDash([]);
    pop();
}

// p5.js 绘制循环
function draw() {
    // 清空画布
    background(COLORS.background);
    
    // 模拟系统动力学
    simulateDynamics();
    
    // 绘制物理参考信息
    drawPhysicsInfo();
    
    // 绘制水面
    water.display();
    
    // 绘制船
    boat.display();
    
    // 绘制人物
    human.display();
    
    // 显示质心
    if (config.showCenterOfMass) {
        push();
        const centerOfMass = calculateCenterOfMass();
        fill(COLORS.centerOfMass);
        noStroke();
        ellipse(centerOfMass.x, centerOfMass.y, 10);
        textAlign(CENTER);
        textSize(12);
        text("CM", centerOfMass.x, centerOfMass.y - 12);
        
        // 绘制质心的速度向量
        if (isRunning) {
            const totalMass = human.mass + boat.mass;
            const cmVelocity = p5.Vector.add(
                p5.Vector.mult(human.velocity, human.mass / totalMass),
                p5.Vector.mult(boat.velocity, boat.mass / totalMass)
            );
            
            if (cmVelocity.mag() > 0.01) {
                stroke(COLORS.centerOfMass);
                strokeWeight(2);
                
                // 计算箭头终点
                const start = createVector(centerOfMass.x, centerOfMass.y);
                const end = p5.Vector.add(start, p5.Vector.mult(cmVelocity, 10));
                
                line(start.x, start.y, end.x, end.y);
                
                // 绘制箭头
                const arrowSize = 6;
                const angle = cmVelocity.heading();
                
                translate(end.x, end.y);
                rotate(angle);
                fill(COLORS.centerOfMass);
                triangle(0, 0, -arrowSize, -arrowSize/2, -arrowSize, arrowSize/2);
                
                // 添加标签
                rotate(-angle);
                noStroke();
                textSize(10);
                text("v_cm = " + cmVelocity.x.toFixed(2) + " m/s", 0, -10);
            }
        }
        pop();
    }
    
    // 添加指导性文字
    if (!isRunning) {
        push();
        fill(100);
        textAlign(CENTER);
        textSize(16);
        text('点击"向左走"或"向右走"按钮开始实验', width/2, 80);
        pop();
    }
} 