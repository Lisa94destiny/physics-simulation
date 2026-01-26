// 全局变量
let scene, camera, renderer, controls;
let charges = [];
let fieldLines = [];
let equipotentialSurfaces = [];
let chargeMeshes = [];
let chargeLabels = [];

// 显示控制
let showFieldLines = true;
let showEquipotential = true;
let showChargesLabel = true;
let showGGBStyle = false; // GGB风格等势面
let fieldLineDensity = 48;
let equipotentialValue = 2000; // 单个可调节等势面的电势值
let equipotentialLinesCount = 10; // 固定等势线数量
let showEquipotentialLines = true; // 是否显示固定等势线
let ggbSurfaces = []; // GGB风格等势面对象数组

// 物理常量
const k = 8.99e9; // 静电力常量 N·m²/C²

// 电荷类
class Charge {
    constructor(x, y, z, q, color) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.q = q; // 电荷量（单位：微库仑 μC）
        this.color = color;
    }

    // 计算某点的电场强度
    getElectricField(px, py, pz) {
        const dx = px - this.x;
        const dy = py - this.y;
        const dz = pz - this.z;
        const r2 = dx * dx + dy * dy + dz * dz;
        const r = Math.sqrt(r2);

        if (r < 0.1) return { x: 0, y: 0, z: 0 }; // 避免除以零

        const E = k * Math.abs(this.q) * 1e-6 / r2;
        const sign = this.q > 0 ? 1 : -1;

        return {
            x: sign * E * dx / r,
            y: sign * E * dy / r,
            z: sign * E * dz / r
        };
    }

    // 计算某点的电势
    getPotential(px, py, pz) {
        const dx = px - this.x;
        const dy = py - this.y;
        const dz = pz - this.z;
        const r = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (r < 0.1) return this.q > 0 ? Infinity : -Infinity;

        return k * this.q * 1e-6 / r;
    }
}

// 初始化场景
function init() {
    const container = document.getElementById('canvas-container');
    const width = container.offsetWidth;
    const height = 600;

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // 创建相机
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 12, 20);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 添加轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 80;

    // 添加环境光和方向光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // 添加坐标平面
    addCoordinatePlane();

    // 初始化电荷
    initCharges();

    // 创建电场线和等势面
    createFieldVisualization();

    // 设置事件监听器
    setupEventListeners();

    // 开始动画循环
    animate();
}

// 添加坐标平面
function addCoordinatePlane() {
    // 不添加任何辅助线或框架
}

// 初始化电荷
function initCharges() {
    charges = [];
    const chargeCount = parseInt(document.getElementById('charge-count').value);

    switch(chargeCount) {
        case 1:
            // 单个正电荷
            charges.push(new Charge(0, 0, 0, 1, 0xff4444));
            break;
        case 2:
            // 两个电荷（一正一负）
            charges.push(new Charge(-2, 0, 0, 1, 0xff4444));
            charges.push(new Charge(2, 0, 0, -1, 0x4444ff));
            break;
        case 3:
            // 三个电荷（两个正一个负）
            charges.push(new Charge(-2, 0, 0, 1, 0xff4444));
            charges.push(new Charge(2, 0, 0, 1, 0xff4444));
            charges.push(new Charge(0, 0, 2, -1, 0x4444ff));
            break;
    }

    // 更新电荷控制面板
    updateChargeControls();
    // 创建电荷球体
    createChargeSpheres();
    // 更新电场信息
    updateFieldInfo();
}

// 更新电荷控制面板
function updateChargeControls() {
    const container = document.getElementById('charges-container');
    container.innerHTML = '';

    charges.forEach((charge, index) => {
        const chargeType = charge.q > 0 ? 'positive' : 'negative';
        const chargeLabel = charge.q > 0 ? '正电荷' : '负电荷';
        const chargeColor = charge.q > 0 ? '#ef4444' : '#3b82f6';

        const html = `
            <div class="charge-item ${chargeType}" data-index="${index}">
                <div class="flex justify-between items-center mb-3">
                    <span class="font-medium text-gray-700">${chargeLabel} #${index + 1}</span>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">电量:</span>
                        <input type="number" class="charge-amount w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                               value="${Math.abs(charge.q)}" min="0.1" max="10" step="0.1" data-index="${index}">
                        <span class="text-sm text-gray-500">μC</span>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-2 mb-3">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">X</label>
                        <input type="number" class="charge-pos w-full px-2 py-1 border border-gray-300 rounded text-sm"
                               value="${charge.x.toFixed(1)}" step="0.5" data-index="${index}" data-axis="x">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Y</label>
                        <input type="number" class="charge-pos w-full px-2 py-1 border border-gray-300 rounded text-sm"
                               value="${charge.y.toFixed(1)}" step="0.5" data-index="${index}" data-axis="y">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Z</label>
                        <input type="number" class="charge-pos w-full px-2 py-1 border border-gray-300 rounded text-sm"
                               value="${charge.z.toFixed(1)}" step="0.5" data-index="${index}" data-axis="z">
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button class="toggle-sign px-3 py-1 text-xs rounded border ${charge.q > 0 ? 'bg-red-100 border-red-300 text-red-700' : 'bg-blue-100 border-blue-300 text-blue-700'}"
                            data-index="${index}">
                        ${charge.q > 0 ? '+' : '-'} 切换电性
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });

    // 添加事件监听
    container.querySelectorAll('.charge-amount').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            const sign = charges[index].q > 0 ? 1 : -1;
            charges[index].q = sign * parseFloat(e.target.value);
            recreateVisualization();
        });
    });

    container.querySelectorAll('.charge-pos').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            const axis = e.target.dataset.axis;
            charges[index][axis] = parseFloat(e.target.value);
            recreateVisualization();
        });
    });

    container.querySelectorAll('.toggle-sign').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);

            // 保存当前电场线密度和等势面数量
            const currentDensity = fieldLineDensity;
            const currentEquipotential = equipotentialValue;

            // 切换电性
            charges[index].q = -charges[index].q;
            charges[index].color = charges[index].q > 0 ? 0xff4444 : 0x4444ff;

            // 只更新电荷控制面板（不重新初始化电荷）
            updateChargeControls();

            // 恢复参数
            fieldLineDensity = currentDensity;
            equipotentialValue = currentEquipotential;

            // 重新创建可视化
            recreateVisualization();
        });
    });
}

// 创建电荷球体
function createChargeSpheres() {
    // 清除旧的电荷球体和标签
    chargeMeshes.forEach(mesh => scene.remove(mesh));
    chargeMeshes = [];
    chargeLabels.forEach(label => scene.remove(label));
    chargeLabels = [];

    charges.forEach((charge, index) => {
        // 创建纯色球体
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: charge.color,
            emissive: charge.color,
            emissiveIntensity: 0.3,
            shininess: 100
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(charge.x, charge.y, charge.z);
        scene.add(sphere);
        chargeMeshes.push(sphere);

        // 添加外发光效果
        const glowGeometry = new THREE.SphereGeometry(0.35, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: charge.color,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(charge.x, charge.y, charge.z);
        scene.add(glow);
        chargeMeshes.push(glow);

        // 使用Sprite创建始终面向相机的白色符号标注
        if (showChargesLabel) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 128;

            // 只绘制白色符号，无背景
            context.fillStyle = '#ffffff';
            context.font = 'bold 96px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(charge.q > 0 ? '+' : '-', 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: false  // 禁用深度测试，确保始终可见
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            // 放在球体中心位置
            sprite.position.set(charge.x, charge.y, charge.z);
            sprite.scale.set(0.5, 0.5, 0.5);
            // 设置渲染顺序，确保在球体之前渲染
            sprite.renderOrder = 1;
            scene.add(sprite);
            chargeLabels.push(sprite);
        }
    });
}

// 计算某点的总电场强度
function getTotalElectricField(x, y, z) {
    let Ex = 0, Ey = 0, Ez = 0;

    charges.forEach(charge => {
        const field = charge.getElectricField(x, y, z);
        Ex += field.x;
        Ey += field.y;
        Ez += field.z;
    });

    return { x: Ex, y: Ey, z: Ez };
}

// 计算某点的总电势
function getTotalPotential(x, y, z) {
    let potential = 0;

    charges.forEach(charge => {
        potential += charge.getPotential(x, y, z);
    });

    return potential;
}

// 创建电场线
function createFieldLines() {
    // 清除旧的电场线
    fieldLines.forEach(line => scene.remove(line));
    fieldLines = [];

    if (!showFieldLines) return;

    const lineCount = fieldLineDensity;
    const maxSteps = 2000;
    const stepSize = 0.03;
    const bounds = 50;

    const positiveCharges = charges.filter(c => c.q > 0);
    const negativeCharges = charges.filter(c => c.q < 0);

    // 计算每个电荷应该分配的电场线数量（确保总数不变）
    const totalCharges = charges.length;
    const linesPerCharge = Math.floor(lineCount / Math.max(totalCharges, 1));

    // 从正电荷出发的电场线
    positiveCharges.forEach(charge => {
        for (let i = 0; i < linesPerCharge; i++) {
            // 使用斐波那契球面分布获得更均匀的起点分布
            const phi = Math.acos(1 - 2 * (i + 0.5) / linesPerCharge);
            const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

            let x = charge.x + 0.4 * Math.sin(phi) * Math.cos(theta);
            let y = charge.y + 0.4 * Math.sin(phi) * Math.sin(theta);
            let z = charge.z + 0.4 * Math.cos(phi);

            const points = [{ x, y, z }];

            for (let step = 0; step < maxSteps; step++) {
                const field = getTotalElectricField(x, y, z);
                const magnitude = Math.sqrt(field.x * field.x + field.y * field.y + field.z * field.z);

                if (magnitude < 0.001) break;

                x += (field.x / magnitude) * stepSize;
                y += (field.y / magnitude) * stepSize;
                z += (field.z / magnitude) * stepSize;

                points.push({ x, y, z });

                // 检查是否到达负电荷
                let reachedCharge = false;
                charges.forEach(c => {
                    if (c.q < 0) {
                        const dx = x - c.x;
                        const dy = y - c.y;
                        const dz = z - c.z;
                        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.35) {
                            reachedCharge = true;
                        }
                    }
                });
                if (reachedCharge) break;

                // 检查是否超出边界
                if (Math.abs(x) > bounds || Math.abs(y) > bounds || Math.abs(z) > bounds) break;
            }

            // 创建电场线
            createFieldLine(points, charge.q > 0);
        }
    });

    // 从无穷远指向负电荷的电场线（反向追踪）
    negativeCharges.forEach(charge => {
        for (let i = 0; i < linesPerCharge; i++) {
            // 使用斐波那契球面分布
            const phi = Math.acos(1 - 2 * (i + 0.5) / linesPerCharge);
            const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

            // 从负电荷周围开始，向外追踪
            let x = charge.x + 0.4 * Math.sin(phi) * Math.cos(theta);
            let y = charge.y + 0.4 * Math.sin(phi) * Math.sin(theta);
            let z = charge.z + 0.4 * Math.cos(phi);

            const points = [{ x, y, z }];

            for (let step = 0; step < maxSteps; step++) {
                const field = getTotalElectricField(x, y, z);
                const magnitude = Math.sqrt(field.x * field.x + field.y * field.y + field.z * field.z);

                if (magnitude < 0.001) break;

                // 反向追踪（沿电场反方向）
                x -= (field.x / magnitude) * stepSize;
                y -= (field.y / magnitude) * stepSize;
                z -= (field.z / magnitude) * stepSize;

                points.push({ x, y, z });

                // 检查是否到达正电荷
                let reachedCharge = false;
                charges.forEach(c => {
                    if (c.q > 0) {
                        const dx = x - c.x;
                        const dy = y - c.y;
                        const dz = z - c.z;
                        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.35) {
                            reachedCharge = true;
                        }
                    }
                });
                if (reachedCharge) break;

                // 检查是否超出边界
                if (Math.abs(x) > bounds || Math.abs(y) > bounds || Math.abs(z) > bounds) break;
            }

            // 创建电场线（反向点顺序，使箭头指向负电荷）
            createFieldLine(points.reverse(), true);
        }
    });
}

// 创建单条电场线
function createFieldLine(points, forward) {
    if (points.length < 2) return;

    // 创建多条略微偏移的线以增加粗细效果
    const offsets = [
        { x: 0, y: 0, z: 0 },
        { x: 0.008, y: 0, z: 0 },
        { x: -0.008, y: 0, z: 0 },
        { x: 0, y: 0.008, z: 0 },
        { x: 0, y: -0.008, z: 0 }
    ];

    offsets.forEach(offset => {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        points.forEach(point => {
            vertices.push(point.x + offset.x, point.y + offset.y, point.z + offset.z);
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.LineBasicMaterial({
            color: 0xf59e0b,
            opacity: 0.6,
            transparent: true
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);
        fieldLines.push(line);
    });

    // 添加多个箭头
    if (points.length > 20) {
        const arrowCount = Math.floor(points.length / 25);
        for (let a = 1; a <= arrowCount; a++) {
            const arrowIndex = Math.floor(points.length * a / (arrowCount + 1));
            if (arrowIndex >= points.length - 1) continue;

            const arrowPoint = points[arrowIndex];
            const nextPoint = points[arrowIndex + 1];

            const dir = new THREE.Vector3(
                nextPoint.x - arrowPoint.x,
                nextPoint.y - arrowPoint.y,
                nextPoint.z - arrowPoint.z
            ).normalize();

            const arrowHelper = new THREE.ArrowHelper(
                dir,
                new THREE.Vector3(arrowPoint.x, arrowPoint.y, arrowPoint.z),
                0.3,
                0xf59e0b,
                0.1,
                0.07
            );
            scene.add(arrowHelper);
            fieldLines.push(arrowHelper);
        }
    }
}

// 创建固定等势线（虚线样式）
function createFixedEquipotentialLines() {
    if (!showEquipotentialLines) return;

    // 计算当前电荷配置下的合理电势范围
    const totalCharge = charges.reduce((sum, c) => sum + Math.abs(c.q), 0);
    if (totalCharge === 0) return;

    // 根据总电荷量动态计算电势范围
    // 测试点（距离原点约3个单位的位置）
    const testDistance = 3;
    let testPotential = 0;
    charges.forEach(charge => {
        testPotential += Math.abs(charge.q) * 1e-6 * k / testDistance;
    });

    // 电势范围设为测试电势的倍数，确保等势线在可视区域内
    const maxPotential = testPotential * 2.5;

    // 生成偶数条等势线（6条正、6条负、1条零电势）
    const positiveLines = 6;
    const negativeLines = 6;

    const potentials = [];
    // 生成负电势线
    for (let i = 1; i <= negativeLines; i++) {
        potentials.push(-maxPotential * i / positiveLines);
    }
    // 添加零电势线（白色）
    potentials.push(0);
    // 生成正电势线
    for (let i = 1; i <= positiveLines; i++) {
        potentials.push(maxPotential * i / positiveLines);
    }

    potentials.forEach(targetPotential => {
        let color;
        if (targetPotential === 0) {
            color = 0xffffff; // 零电势线白色
        } else if (targetPotential > 0) {
            color = 0x10b981; // 正电势线绿色
        } else {
            color = 0x3b82f6; // 负电势线蓝色
        }
        createEquipotentialOnPlane(targetPotential, color, 'z', 0); // XY平面
        createEquipotentialOnPlane(targetPotential, color, 'y', 0); // XZ平面
    });
}

// 在指定平面创建等势线
function createEquipotentialOnPlane(targetPotential, color, fixedAxis, fixedValue) {
    const range = 9;
    const gridStep = 0.25; // 网格步长
    const tolerance = 500; // 电势容差

    const lines = [];
    const gridSize = Math.ceil(range * 2 / gridStep);

    // 创建网格
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const x1 = -range + i * gridStep;
            const y1 = -range + j * gridStep;
            const x2 = x1 + gridStep;
            const y2 = y1 + gridStep;

            // 检查四条边
            const edges = [
                { p1: { x: x1, y: y1 }, p2: { x: x2, y: y1 } },
                { p1: { x: x2, y: y1 }, p2: { x: x2, y: y2 } },
                { p1: { x: x2, y: y2 }, p2: { x: x1, y: y2 } },
                { p1: { x: x1, y: y2 }, p2: { x: x1, y: y1 } }
            ];

            const points = [];

            edges.forEach(edge => {
                let p1 = {}, p2 = {}, pot1 = 0, pot2 = 0;

                if (fixedAxis === 'z') {
                    p1 = { x: edge.p1.x, y: edge.p1.y, z: fixedValue };
                    p2 = { x: edge.p2.x, y: edge.p2.y, z: fixedValue };
                } else {
                    p1 = { x: edge.p1.x, y: fixedValue, z: edge.p1.y };
                    p2 = { x: edge.p2.x, y: fixedValue, z: edge.p2.y };
                }

                pot1 = getTotalPotential(p1.x, p1.y, p1.z);
                pot2 = getTotalPotential(p2.x, p2.y, p2.z);

                // 检查边是否与等势线相交
                if ((pot1 - targetPotential) * (pot2 - targetPotential) <= 0) {
                    if (Math.abs(pot1 - pot2) > 0.01) {
                        const t = (targetPotential - pot1) / (pot2 - pot1);
                        if (t >= 0 && t <= 1) {
                            const ix = p1.x + t * (p2.x - p1.x);
                            const iy = p1.y + t * (p2.y - p1.y);
                            const iz = p1.z + t * (p2.z - p1.z);

                            // 检查是否离电荷太近
                            let tooClose = false;
                            charges.forEach(charge => {
                                const dx = ix - charge.x;
                                const dy = iy - charge.y;
                                const dz = iz - charge.z;
                                if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.5) {
                                    tooClose = true;
                                }
                            });

                            if (!tooClose) {
                                points.push({ x: ix, y: iy, z: iz });
                            }
                        }
                    }
                }
            });

            // 将点连接成线段
            if (points.length >= 2) {
                const geometry = new THREE.BufferGeometry();
                const vertices = [];
                points.forEach(p => vertices.push(p.x, p.y, p.z));
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

                const material = new THREE.LineBasicMaterial({
                    color: color,
                    opacity: 0.5,
                    transparent: true
                });

                const line = new THREE.Line(geometry, material);
                scene.add(line);
                lines.push(line);
            }
        }
    }

    equipotentialSurfaces.push(...lines);
}

// 创建等势面
function createEquipotentialSurfaces() {
    // 清除旧的等势面
    equipotentialSurfaces.forEach(surface => scene.remove(surface));
    equipotentialSurfaces = [];

    if (!showEquipotential && !showEquipotentialLines) return;

    const targetPotential = equipotentialValue;
    const isZero = Math.abs(targetPotential) < 100;

    // 创建可调节的单一等势面（高分辨率网格）
    if (showEquipotential) {
        const range = 10;
        const gridSize = 150; // 平衡质量和性能的网格密度
        const step = (range * 2) / gridSize;

        // 创建3D网格并采样电势
        const grid = [];
    for (let i = 0; i <= gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j <= gridSize; j++) {
            grid[i][j] = [];
            for (let k = 0; k <= gridSize; k++) {
                const x = -range + i * step;
                const y = -range + j * step;
                const z = -range + k * step;

                // 检查是否离电荷太近
                let tooClose = false;
                charges.forEach(charge => {
                    const dx = x - charge.x;
                    const dy = y - charge.y;
                    const dz = z - charge.z;
                    if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.35) {
                        tooClose = true;
                    }
                });

                if (tooClose) {
                    grid[i][j][k] = null;
                } else {
                    const potential = getTotalPotential(x, y, z);
                    grid[i][j][k] = { potential, x, y, z };
                }
            }
        }
    }

    // 构建等势面三角网格
    const vertices = [];
    const threshold = 100; // 固定阈值

    // 遍历所有立方体单元
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            for (let k = 0; k < gridSize; k++) {
                // 获取立方体的8个顶点
                const c = [
                    grid[i][j][k],
                    grid[i + 1][j][k],
                    grid[i + 1][j][k + 1],
                    grid[i][j][k + 1],
                    grid[i][j + 1][k],
                    grid[i + 1][j + 1][k],
                    grid[i + 1][j + 1][k + 1],
                    grid[i][j + 1][k + 1]
                ];

                // 跳过有空顶点的单元
                if (c.some(v => v === null)) continue;

                const potentials = c.map(v => v.potential);
                const minPot = Math.min(...potentials);
                const maxPot = Math.max(...potentials);

                // 检查是否跨越目标电势
                if ((minPot <= targetPotential && maxPot >= targetPotential) ||
                    Math.abs(minPot - targetPotential) < threshold ||
                    Math.abs(maxPot - targetPotential) < threshold) {

                    // 在这个立方体内找到等势面的近似位置
                    // 使用线性插值找到等势面与立方体边的交点
                    const edges = [
                        [0, 1], [1, 2], [2, 3], [3, 0],
                        [4, 5], [5, 6], [6, 7], [7, 4],
                        [0, 4], [1, 5], [2, 6], [3, 7]
                    ];

                    const intersections = [];

                    edges.forEach(edge => {
                        const v1 = c[edge[0]];
                        const v2 = c[edge[1]];
                        const p1 = v1.potential;
                        const p2 = v2.potential;

                        // 检查边是否与等势面相交
                        if ((p1 - targetPotential) * (p2 - targetPotential) <= 0) {
                            // 线性插值找到交点
                            if (Math.abs(p2 - p1) > 0.0001) {
                                const t = (targetPotential - p1) / (p2 - p1);
                                if (t >= 0 && t <= 1) {
                                    intersections.push({
                                        x: v1.x + t * (v2.x - v1.x),
                                        y: v1.y + t * (v2.y - v1.y),
                                        z: v1.z + t * (v2.z - v1.z)
                                    });
                                }
                            }
                        }
                    });

                    // 使用这些交点创建三角面
                    if (intersections.length >= 3) {
                        // 简单三角化
                        for (let m = 1; m < intersections.length - 1; m++) {
                            vertices.push(
                                intersections[0].x, intersections[0].y, intersections[0].z,
                                intersections[m].x, intersections[m].y, intersections[m].z,
                                intersections[m + 1].x, intersections[m + 1].y, intersections[m + 1].z
                            );
                        }
                    }
                }
            }
        }
    }

    // 创建完整的曲面网格
    if (vertices.length > 0) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        // 根据电势值决定颜色
        let color;
        if (isZero) {
            color = 0xffffff; // 零电势面白色
        } else if (targetPotential > 0) {
            color = 0x10b981; // 正电势面绿色
        } else {
            color = 0x3b82f6; // 负电势面蓝色
        }

        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        equipotentialSurfaces.push(mesh);
    }
    } // End of if (showEquipotential)

    // 创建固定多条等势线（虚线样式）
    createFixedEquipotentialLines();

    // 创建GGB风格等势面
    if (showGGBStyle) {
        createGGBEquipotentialSurfaces();
    }
}

// 创建GGB风格电势函数图像（黄色曲面）+ 等高线（黑色圈圈）
function createGGBEquipotentialSurfaces() {
    // 清除旧的GGB风格等势面
    ggbSurfaces.forEach(surface => scene.remove(surface));
    ggbSurfaces = [];

    // 创建黄色参考网格平面（xy平面，y=0）
    const gridSize = 16;
    const gridDivisions = 32;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0xFACC15);
    gridHelper.position.y = -3; // 放在底部作为参考
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    ggbSurfaces.push(gridHelper);

    // 创建电势函数图像：在xz平面上采样电势，用电势值作为y坐标
    const range = 6; // x和z方向的采样范围（聚焦在电荷附近）
    const resolution = 120; // 采样分辨率（提高精度）

    const vertices = [];
    const indices = [];
    const colors = [];
    const potentialGrid = []; // 存储电势网格用于等高线绘制

    // 计算电势范围用于归一化
    let maxPotentialFound = 0;
    let minPotentialFound = Infinity;

    // 第一遍采样：计算电势范围
    for (let i = 0; i <= resolution; i++) {
        potentialGrid[i] = [];
        for (let j = 0; j <= resolution; j++) {
            const x = -range + (2 * range * i) / resolution;
            const z = -range + (2 * range * j) / resolution;
            const y = 0; // 在xz平面上采样

            const potential = getTotalPotential(x, y, z);
            potentialGrid[i][j] = potential;

            if (Math.abs(potential) > maxPotentialFound) {
                maxPotentialFound = Math.abs(potential);
            }
            if (potential < minPotentialFound) {
                minPotentialFound = potential;
            }
        }
    }

    // 增加高度缩放，让山峰更明显
    const heightScale = 5 / maxPotentialFound; // 将最大电势映射到高度5

    // 第二遍采样：生成顶点
    for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
            const x = -range + (2 * range * i) / resolution;
            const z = -range + (2 * range * j) / resolution;
            const potential = potentialGrid[i][j];
            const y = potential * heightScale; // 用电势作为y坐标

            vertices.push(x, y, z);

            // 根据电势正负设置颜色
            if (potential > 0) {
                colors.push(1, 0.9, 0.2); // 黄色（正电势）
            } else {
                colors.push(0.2, 0.5, 1); // 蓝色（负电势）
            }
        }
    }

    // 创建三角形索引
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const i1 = i * (resolution + 1) + j;
            const i2 = i1 + resolution + 1;
            const i3 = i1 + 1;
            const i4 = i2 + 1;

            indices.push(i1, i2, i3);
            indices.push(i3, i2, i4);
        }
    }

    // 创建几何体
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // GGB风格材质：使用顶点颜色
    const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    ggbSurfaces.push(mesh);

    // 添加线框以突出山峰形状
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: 0.15,
        transparent: true
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);
    ggbSurfaces.push(wireframe);

    // 添加等高线（黑色圈圈）- 使用marching squares算法
    const contourLevels = 8;
    for (let level = 1; level <= contourLevels; level++) {
        const contourPotential = (maxPotentialFound * level) / (contourLevels + 1);
        createContourLineMarchingSquares(resolution, range, potentialGrid, contourPotential, heightScale, true);
        createContourLineMarchingSquares(resolution, range, potentialGrid, -contourPotential, heightScale, false);
    }
}

// 使用Marching Squares算法创建等高线
function createContourLineMarchingSquares(resolution, range, potentialGrid, targetPotential, heightScale, isPositive) {
    const contourSegments = [];

    // 遍历每个网格单元
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            // 获取单元的四个角点的电势
            const p00 = potentialGrid[i][j];
            const p10 = potentialGrid[i + 1][j];
            const p11 = potentialGrid[i + 1][j + 1];
            const p01 = potentialGrid[i][j + 1];

            // 检查哪些点在等势线上方/下方
            const v00 = (isPositive && p00 >= targetPotential) || (!isPositive && p00 <= targetPotential);
            const v10 = (isPositive && p10 >= targetPotential) || (!isPositive && p10 <= targetPotential);
            const v11 = (isPositive && p11 >= targetPotential) || (!isPositive && p11 <= targetPotential);
            const v01 = (isPositive && p01 >= targetPotential) || (!isPositive && p01 <= targetPotential);

            // 计算配置索引（0-15）
            const config = (v00 ? 8 : 0) | (v10 ? 4 : 0) | (v11 ? 2 : 0) | (v01 ? 1 : 0);

            // 跳过全在上方或全在下方的单元
            if (config === 0 || config === 15) continue;

            // 计算单元的坐标
            const x0 = -range + (2 * range * i) / resolution;
            const x1 = -range + (2 * range * (i + 1)) / resolution;
            const z0 = -range + (2 * range * j) / resolution;
            const z1 = -range + (2 * range * (j + 1)) / resolution;

            // 线性插值找到等高线与边的交点
            const interpolate = (v1, v2, x1, x2, p1, p2) => {
                if (v1 === v2) return null;
                const t = (targetPotential - p1) / (p2 - p1);
                return x1 + t * (x2 - x1);
            };

            const points = [];

            // 根据配置绘制线段（简化版marching squares）
            if (config === 1 || config === 14) {
                const z = interpolate(v01, v11, z0, z1, p01, p11);
                const x = interpolate(v01, v00, x1, x0, p01, p00);
                if (z !== null && x !== null) {
                    points.push(x, targetPotential * heightScale, z);
                }
            } else if (config === 2 || config === 13) {
                const x = interpolate(v11, v01, x1, x0, p11, p01);
                const z = interpolate(v11, v10, z1, z0, p11, p10);
                if (x !== null && z !== null) {
                    points.push(x, targetPotential * heightScale, z);
                }
            } else if (config === 3 || config === 12) {
                const x = interpolate(v01, v00, x1, x0, p01, p00);
                const z = interpolate(v11, v10, z1, z0, p11, p10);
                if (x !== null && z !== null) {
                    points.push(x, targetPotential * heightScale, z);
                }
            } else if (config === 4 || config === 11) {
                const z = interpolate(v10, v11, z0, z1, p10, p11);
                const x = interpolate(v10, v00, x1, x0, p10, p00);
                if (z !== null && x !== null) {
                    points.push(x, targetPotential * heightScale, z);
                }
            } else if (config === 5 || config === 10) {
                // saddle point - 需要特殊处理，简化为两条线段
                const x1a = interpolate(v01, v00, x1, x0, p01, p00);
                const z1a = interpolate(v10, v11, z0, z1, p10, p11);
                const x2a = interpolate(v01, v11, x1, x0, p01, p11);
                const z2a = interpolate(v10, v00, z1, z0, p10, p00);
                if (x1a !== null && z1a !== null) {
                    points.push(x1a, targetPotential * heightScale, z1a);
                    points.push(x2a, targetPotential * heightScale, z2a);
                }
            } else if (config === 6 || config === 9) {
                const z = interpolate(v10, v11, z0, z1, p10, p11);
                const x = interpolate(v01, v00, x1, x0, p01, p00);
                if (z !== null && x !== null) {
                    points.push(x, targetPotential * heightScale, z);
                }
            } else if (config === 7 || config === 8) {
                const x = interpolate(v10, v00, x1, x0, p10, p00);
                const z = interpolate(v01, v11, z0, z1, p01, p11);
                if (x !== null && z !== null) {
                    points.push(x, targetPotential * heightScale, z);
                }
            }

            // 将找到的点添加到线段数组
            for (let k = 0; k < points.length; k += 3) {
                contourSegments.push(
                    points[k], points[k + 1], points[k + 2],
                    points[k], points[k + 1], points[k + 2]
                );
            }
        }
    }

    if (contourSegments.length > 0) {
        const contourGeometry = new THREE.BufferGeometry();
        contourGeometry.setAttribute('position', new THREE.Float32BufferAttribute(contourSegments, 3));

        const contourMaterial = new THREE.LineBasicMaterial({
            color: 0x1f2937,
            linewidth: 2
        });

        const contourLine = new THREE.LineSegments(contourGeometry, contourMaterial);
        scene.add(contourLine);
        ggbSurfaces.push(contourLine);
    }
}

// 创建电场可视化
function createFieldVisualization() {
    createChargeSpheres();
    createFieldLines();
    createEquipotentialSurfaces();
}

// 重新创建电场可视化
function recreateVisualization() {
    // 清理GGB风格等势面
    ggbSurfaces.forEach(surface => scene.remove(surface));
    ggbSurfaces = [];
    createChargeSpheres();
    createFieldLines();
    createEquipotentialSurfaces();
    updateFieldInfo();
}

// 更新电场信息
function updateFieldInfo() {
    const container = document.getElementById('field-info');

    if (charges.length === 0) {
        container.innerHTML = '<p>当前没有电荷</p>';
        return;
    }

    let html = '<div class="space-y-2">';

    charges.forEach((charge, index) => {
        const chargeType = charge.q > 0 ? '正电荷' : '负电荷';
        const color = charge.q > 0 ? 'text-red-600' : 'text-blue-600';
        html += `
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span class="${color} font-medium">${chargeType} #${index + 1}</span>
                <span class="text-gray-600">Q = ${Math.abs(charge.q).toFixed(1)} μC</span>
                <span class="text-gray-500 text-sm">(${charge.x.toFixed(1)}, ${charge.y.toFixed(1)}, ${charge.z.toFixed(1)})</span>
            </div>
        `;
    });

    // 计算原点的电场和电势
    const originField = getTotalElectricField(0, 0, 0);
    const originPotential = getTotalPotential(0, 0, 0);
    const fieldMagnitude = Math.sqrt(originField.x ** 2 + originField.y ** 2 + originField.z ** 2);

    html += `
        <div class="mt-3 p-2 bg-indigo-50 rounded">
            <div class="text-sm font-medium text-gray-700">原点处电场</div>
            <div class="text-xs text-gray-600">E = ${fieldMagnitude.toExponential(2)} N/C</div>
        </div>
        <div class="p-2 bg-green-50 rounded">
            <div class="text-sm font-medium text-gray-700">原点处电势</div>
            <div class="text-xs text-gray-600">V = ${isFinite(originPotential) ? originPotential.toExponential(2) + ' V' : '无穷大'}</div>
        </div>
    `;

    html += '</div>';
    container.innerHTML = html;
}

// 设置事件监听器
function setupEventListeners() {
    // 电荷数量变化
    document.getElementById('charge-count').addEventListener('change', () => {
        // 保存当前参数
        const currentDensity = fieldLineDensity;
        const currentEquipotential = equipotentialValue;

        initCharges();

        // 恢复参数
        fieldLineDensity = currentDensity;
        equipotentialValue = currentEquipotential;

        recreateVisualization();
    });

    // 显示控制
    document.getElementById('show-field-lines').addEventListener('change', (e) => {
        showFieldLines = e.target.checked;
        createFieldLines();
    });

    document.getElementById('show-equipotential').addEventListener('change', (e) => {
        showEquipotential = e.target.checked;
        createEquipotentialSurfaces();
    });

    document.getElementById('show-equipotential-lines').addEventListener('change', (e) => {
        showEquipotentialLines = e.target.checked;
        createEquipotentialSurfaces();
    });

    document.getElementById('show-charges-label').addEventListener('change', (e) => {
        showChargesLabel = e.target.checked;
        // 电荷标签现在直接显示在球体上，通过重新创建来控制显示
        createChargeSpheres();
    });

    // GGB风格等势面
    document.getElementById('show-ggb-style').addEventListener('change', (e) => {
        showGGBStyle = e.target.checked;
        recreateVisualization();
    });

    // 电场线密度
    document.getElementById('field-line-density').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        fieldLineDensity = value;

        // 根据密度值显示标签
        let label = '中';
        if (value <= 32) label = '低';
        else if (value <= 64) label = '中';
        else if (value <= 96) label = '高';
        else if (value <= 128) label = '很高';
        else label = '极高';

        document.getElementById('density-value').textContent = label;

        createFieldLines();
    });

    // 等势面电势值
    document.getElementById('equipotential-value').addEventListener('input', (e) => {
        equipotentialValue = parseInt(e.target.value);
        const displayValue = equipotentialValue >= 0 ? '+' : '';
        document.getElementById('equipotential-display').textContent = displayValue + equipotentialValue + ' V';
        createEquipotentialSurfaces();
    });

    // 重置视角
    document.getElementById('reset-view-btn').addEventListener('click', () => {
        camera.position.set(0, 12, 20);
        controls.target.set(0, 0, 0);
        controls.update();
    });

    // 重置电荷
    document.getElementById('reset-charges-btn').addEventListener('click', () => {
        initCharges();
        recreateVisualization();
    });

    // 全屏功能
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const canvasContainer = document.getElementById('canvas-container');

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            canvasContainer.requestFullscreen().then(() => {
                // 进入全屏后调整渲染器大小
                setTimeout(() => {
                    const width = window.innerWidth;
                    const height = window.innerHeight;
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    renderer.setSize(width, height);
                }, 100);
            }).catch(err => {
                console.log(`全屏错误: ${err.message}`);
            });
            fullscreenBtn.innerHTML = '<i class="fas fa-compress mr-1"></i>退出';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand mr-1"></i>全屏';
        }
    });

    // 监听全屏变化事件
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            // 退出全屏后恢复原始大小
            const width = canvasContainer.offsetWidth;
            const height = 600;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            fullscreenBtn.innerHTML = '<i class="fas fa-expand mr-1"></i>全屏';
        }
    });

    // 窗口大小调整
    window.addEventListener('resize', () => {
        const container = document.getElementById('canvas-container');
        const width = container.offsetWidth;
        const height = 600;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// 页面加载完成后初始化
window.addEventListener('load', init);
