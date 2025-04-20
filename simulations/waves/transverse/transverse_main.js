// 全局变量
let isPaused = true; // 默认暂停状态
let showParticles = true;
let showWavefront = true;
let showGrid = false;
let time = 0; // 全局时间计数器
let selectedParticleX = null; // 保存用户选择的粒子X坐标

// 波动参数
let amplitude = 0.5; // 振幅，单位：m
let wavelength = 1.0; // 波长，单位：m
let period = 1.0; // 周期，单位：s
let waveSpeed = 1.0; // 波速，单位：m/s，根据波长和周期计算
let direction = 1; // 传播方向：1表示向右，-1表示向左

// 派生参数
let frequency, angularFrequency, waveNumber;

// DOM元素
let pauseBtn, resetBtn, startBtn;
let showParticlesCheck, showWavefrontCheck, showGridCheck;
let directionRightRadio, directionLeftRadio;

// 计算派生参数
function calculateDerivedParameters() {
    frequency = 1 / period; // 频率=1/周期
    angularFrequency = 2 * Math.PI * frequency; // 角频率
    waveNumber = 2 * Math.PI / wavelength; // 波数
    waveSpeed = wavelength / period; // 波速=波长/周期
    
    // 更新显示
    document.getElementById('frequency').innerText = frequency.toFixed(2) + ' Hz';
    document.getElementById('angular-frequency').innerText = angularFrequency.toFixed(2) + ' rad/s';
    document.getElementById('wave-number').innerText = waveNumber.toFixed(2) + ' rad/m';
}

// 初始化所有控件
function initControls() {
    // 获取DOM元素
    pauseBtn = document.getElementById('pause-btn');
    resetBtn = document.getElementById('reset-btn');
    startBtn = document.getElementById('start-btn');
    showParticlesCheck = document.getElementById('show-particles');
    showWavefrontCheck = document.getElementById('show-wavefront');
    showGridCheck = document.getElementById('show-grid');
    directionRightRadio = document.getElementById('direction-right');
    directionLeftRadio = document.getElementById('direction-left');
    
    // 事件监听
    pauseBtn.addEventListener('click', function() {
        isPaused = true;
        this.innerHTML = '<i class="fas fa-pause mr-2"></i>暂停';
        startBtn.innerHTML = '<i class="fas fa-play mr-2"></i>开始';
    });
    
    startBtn.addEventListener('click', function() {
        isPaused = false;
        this.innerHTML = '<i class="fas fa-play mr-2"></i>运行中...';
        pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>暂停';
    });
    
    resetBtn.addEventListener('click', function() {
        // 重置参数到初始值
        time = 0;
        selectedParticleX = null;
        motionHistory = []; // 清空运动历史
        
        document.getElementById('period-input').value = 1.0;
        document.getElementById('period-value').textContent = 1.0;
        period = 1.0;
        
        document.getElementById('wavelength').value = 1.0;
        document.getElementById('wavelength-value').textContent = 1.0;
        wavelength = 1.0;
        
        document.getElementById('amplitude').value = 0.5;
        document.getElementById('amplitude-value').textContent = 0.5;
        amplitude = 0.5;
        
        directionRightRadio.checked = true;
        directionLeftRadio.checked = false;
        direction = 1;
        
        // 重置显示选项
        showParticlesCheck.checked = true;
        showParticles = true;
        
        showWavefrontCheck.checked = true;
        showWavefront = true;
        
        showGridCheck.checked = false;
        showGrid = false;
        
        // 重新计算派生参数
        calculateDerivedParameters();
        
        isPaused = true; // 重置后暂停
        pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>暂停';
        startBtn.innerHTML = '<i class="fas fa-play mr-2"></i>开始';
    });
    
    // 参数变化监听
    document.getElementById('period-input').addEventListener('input', function() {
        period = parseFloat(this.value);
        document.getElementById('period-value').textContent = this.value;
        calculateDerivedParameters();
    });
    
    document.getElementById('wavelength').addEventListener('input', function() {
        wavelength = parseFloat(this.value);
        document.getElementById('wavelength-value').textContent = this.value;
        calculateDerivedParameters();
    });
    
    document.getElementById('amplitude').addEventListener('input', function() {
        amplitude = parseFloat(this.value);
        document.getElementById('amplitude-value').textContent = this.value;
    });
    
    directionRightRadio.addEventListener('change', function() {
        if (this.checked) direction = 1;
    });
    
    directionLeftRadio.addEventListener('change', function() {
        if (this.checked) direction = -1;
    });
    
    showParticlesCheck.addEventListener('change', function() {
        showParticles = this.checked;
    });
    
    showWavefrontCheck.addEventListener('change', function() {
        showWavefront = this.checked;
    });
    
    showGridCheck.addEventListener('change', function() {
        showGrid = this.checked;
    });
}

// 窗口加载完成后初始化
window.addEventListener('load', function() {
    // 初始化控件
    initControls();
    
    // 计算初始派生参数
    calculateDerivedParameters();
    
    // 创建p5实例
    initWaveAnimation();
    initWaveShape();
    initParticleMotion();
}); 