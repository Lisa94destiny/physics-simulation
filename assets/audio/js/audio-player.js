// 音频播放器组件
class AudioPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.playerElement = null;
        this.progressBar = null;
        this.volumeControl = null;
        this.speedControl = null;
        this.audioUrl = 'https://minimax-algeng-chat-tts.oss-cn-wulanchabu.aliyuncs.com/audio%2Ftts-mp3-20250421024917-McomgbDL.mp3?Expires=86401745174957&OSSAccessKeyId=LTAI5tGLnRTkBjLuYPjNcKQ8&Signature=66%2F93uIyxt9MWwSCfQfmJ4jdbwg%3D';
        // 本地音频备份文件
        this.fallbackAudioUrl = '../introduction.mp3';
    }

    // 初始化播放器
    init() {
        // 创建音频元素
        this.audio = new Audio();
        
        // 创建底部播放器容器
        this.createPlayerElement();
        
        // 绑定事件
        this.bindEvents();
        
        // 加载音频
        this.loadAudio();
    }

    // 加载音频文件
    loadAudio() {
        // 首先尝试远程URL
        this.audio.src = this.audioUrl;
        
        // 添加错误处理，如果远程加载失败则使用本地备份
        this.audio.onerror = () => {
            console.log('远程音频加载失败，使用本地备份');
            this.audio.src = this.fallbackAudioUrl;
        };
        
        // 预加载音频
        this.audio.load();
    }

    // 创建播放器元素
    createPlayerElement() {
        // 创建播放器容器
        this.playerElement = document.createElement('div');
        this.playerElement.className = 'fixed bottom-0 left-0 right-0 bg-indigo-100 shadow-lg transform translate-y-full transition-transform duration-300 z-50';
        this.playerElement.style.minHeight = '64px';
        
        // 播放器内容
        const playerContent = `
            <div class="w-full px-4 py-2">
                <div class="flex items-center justify-between">
                    <!-- 播放按钮和时间 -->
                    <div class="flex items-center space-x-4 w-1/5">
                        <div class="flex items-center space-x-2">
                            <button id="play-pause-btn" class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 focus:outline-none shadow-md">
                                <i class="fas fa-play text-sm" id="play-icon"></i>
                                <i class="fas fa-pause hidden text-sm" id="pause-icon"></i>
                            </button>
                            <button id="restart-btn" class="w-8 h-8 rounded-full bg-indigo-200 text-indigo-600 flex items-center justify-center hover:bg-indigo-300 focus:outline-none shadow-md">
                                <i class="fas fa-redo-alt text-xs"></i>
                            </button>
                        </div>
                        <div class="flex items-center space-x-1">
                            <span id="current-time" class="text-sm text-gray-700">0:00</span>
                            <span class="text-sm text-gray-700">/</span>
                            <span id="duration" class="text-sm text-gray-700">0:00</span>
                        </div>
                    </div>
                    
                    <!-- 进度条 -->
                    <div class="flex-grow mx-4">
                        <div class="h-3 bg-indigo-200 rounded-full overflow-hidden shadow-inner">
                            <div id="progress-bar" class="h-full bg-indigo-500 w-0 rounded-full"></div>
                        </div>
                    </div>
                    
                    <!-- 音量和速度控制 -->
                    <div class="flex items-center space-x-4 w-1/5 justify-end">
                        <div class="flex items-center">
                            <button id="volume-btn" class="w-8 h-8 flex items-center justify-center text-gray-700">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <input type="range" id="volume-control" min="0" max="1" step="0.1" value="1" 
                                class="w-16 h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer">
                        </div>
                        <div class="relative">
                            <button id="speed-btn" class="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center hover:bg-indigo-300 focus:outline-none">
                                <span class="text-xs font-semibold">1x</span>
                            </button>
                            <div id="speed-dropdown" class="absolute bottom-full right-0 mb-2 bg-white border border-indigo-200 rounded shadow-lg hidden">
                                <div class="text-sm py-1">
                                    <button class="speed-option w-full px-3 py-1 text-left hover:bg-indigo-100" data-speed="0.5">0.5x</button>
                                    <button class="speed-option w-full px-3 py-1 text-left hover:bg-indigo-100" data-speed="0.75">0.75x</button>
                                    <button class="speed-option w-full px-3 py-1 text-left hover:bg-indigo-100 bg-indigo-500 text-white" data-speed="1">1x</button>
                                    <button class="speed-option w-full px-3 py-1 text-left hover:bg-indigo-100" data-speed="1.25">1.25x</button>
                                    <button class="speed-option w-full px-3 py-1 text-left hover:bg-indigo-100" data-speed="1.5">1.5x</button>
                                    <button class="speed-option w-full px-3 py-1 text-left hover:bg-indigo-100" data-speed="2">2x</button>
                                </div>
                            </div>
                        </div>
                        <button id="close-player-btn" class="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-indigo-600">
                            <i class="fas fa-times text-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.playerElement.innerHTML = playerContent;
        document.body.appendChild(this.playerElement);
        
        // 获取播放器中的元素
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.playIcon = document.getElementById('play-icon');
        this.pauseIcon = document.getElementById('pause-icon');
        this.restartBtn = document.getElementById('restart-btn');
        this.progressBar = document.getElementById('progress-bar');
        this.currentTimeDisplay = document.getElementById('current-time');
        this.durationDisplay = document.getElementById('duration');
        this.volumeControl = document.getElementById('volume-control');
        this.speedControl = document.getElementById('speed-control');
        this.speedBtn = document.getElementById('speed-btn');
        this.speedDropdown = document.getElementById('speed-dropdown');
        this.closePlayerBtn = document.getElementById('close-player-btn');
    }
    
    // 绑定事件
    bindEvents() {
        // 播放/暂停按钮
        this.playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        // 重新开始按钮
        this.restartBtn.addEventListener('click', () => {
            this.restart();
        });
        
        // 音量控制
        this.volumeControl.addEventListener('input', () => {
            this.setVolume(this.volumeControl.value);
        });
        
        // 速度控制
        this.speedBtn.addEventListener('click', () => {
            // 切换下拉菜单显示
            this.speedDropdown.classList.toggle('hidden');
        });
        
        // 速度选项点击事件
        const speedOptions = document.querySelectorAll('.speed-option');
        speedOptions.forEach(option => {
            option.addEventListener('click', () => {
                const speed = option.getAttribute('data-speed');
                this.setPlaybackRate(speed);
                this.speedBtn.querySelector('span').textContent = `${speed}x`;
                this.speedDropdown.classList.add('hidden');
                
                // 更新选中状态
                speedOptions.forEach(opt => {
                    if (opt.getAttribute('data-speed') === speed) {
                        opt.classList.add('bg-indigo-500', 'text-white');
                    } else {
                        opt.classList.remove('bg-indigo-500', 'text-white');
                    }
                });
            });
        });
        
        // 关闭按钮
        this.closePlayerBtn.addEventListener('click', () => {
            this.hidePlayer();
        });
        
        // 点击播放器外部时隐藏速度下拉菜单
        document.addEventListener('click', (e) => {
            if (e.target !== this.speedBtn && !this.speedBtn.contains(e.target) && 
                !this.speedDropdown.contains(e.target)) {
                this.speedDropdown.classList.add('hidden');
            }
        });
        
        // 音频事件
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });
        
        this.audio.addEventListener('ended', () => {
            this.playIcon.classList.remove('hidden');
            this.pauseIcon.classList.add('hidden');
            this.isPlaying = false;
        });
        
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateDuration();
        });
        
        // 进度条点击事件 - 允许用户通过点击进度条跳转
        const progressContainer = this.progressBar.parentElement;
        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = pos * this.audio.duration;
        });
    }
    
    // 显示播放器
    showPlayer() {
        this.playerElement.classList.remove('translate-y-full');
    }
    
    // 隐藏播放器
    hidePlayer() {
        this.playerElement.classList.add('translate-y-full');
        this.pause();
    }
    
    // 播放
    play() {
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // 播放成功
                this.playIcon.classList.add('hidden');
                this.pauseIcon.classList.remove('hidden');
                this.isPlaying = true;
            }).catch(error => {
                // 播放失败，可能是浏览器策略限制
                console.error('播放失败:', error);
                // 提示用户交互
                alert('请点击播放按钮开始播放音频');
            });
        }
    }
    
    // 暂停
    pause() {
        this.audio.pause();
        this.playIcon.classList.remove('hidden');
        this.pauseIcon.classList.add('hidden');
        this.isPlaying = false;
    }
    
    // 切换播放/暂停
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    // 重新开始
    restart() {
        this.audio.currentTime = 0;
        this.play();
    }
    
    // 设置音量
    setVolume(value) {
        this.audio.volume = value;
    }
    
    // 设置播放速度
    setPlaybackRate(value) {
        this.audio.playbackRate = value;
    }
    
    // 更新进度条
    updateProgress() {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        // 更新当前时间显示
        this.currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
    }
    
    // 更新总时长显示
    updateDuration() {
        this.durationDisplay.textContent = this.formatTime(this.audio.duration);
    }
    
    // 格式化时间为 mm:ss
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // 下载音频并保存到本地
    downloadAudio() {
        // 使用XMLHttpRequest下载音频
        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.audioUrl, true);
        xhr.responseType = 'blob';
        
        xhr.onload = () => {
            if (xhr.status === 200) {
                // 下载成功，保存到本地
                const blob = xhr.response;
                
                // 创建下载链接
                const a = document.createElement('a');
                const url = URL.createObjectURL(blob);
                a.href = url;
                a.download = 'introduction.mp3';
                document.body.appendChild(a);
                a.click();
                
                // 清理
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
            } else {
                console.error('音频下载失败');
            }
        };
        
        xhr.onerror = () => {
            console.error('音频下载请求失败');
        };
        
        xhr.send();
    }
}

// 在页面加载完成后添加音频按钮
document.addEventListener('DOMContentLoaded', () => {
    // 创建音频播放按钮
    const audioButton = document.createElement('a');
    audioButton.id = 'audio-guide-btn';
    audioButton.href = "#";
    audioButton.className = 'inline-block bg-white text-indigo-600 font-medium px-6 py-3 rounded-lg shadow-md hover:bg-gray-50 transition duration-300 btn ml-4';
    audioButton.innerHTML = '<i class="fas fa-headphones mr-2"></i>上手导引';
    
    // 将按钮添加到页面
    const exploreButton = document.querySelector('a[href="#simulations"]');
    if (exploreButton && exploreButton.parentNode) {
        exploreButton.parentNode.appendChild(audioButton);
    }
    
    // 初始化音频播放器
    const audioPlayer = new AudioPlayer();
    audioPlayer.init();
    
    // 为移动端添加音频按钮
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        const mobileMenuContent = mobileMenu.querySelector('.px-2.pt-2.pb-3.space-y-1');
        if (mobileMenuContent) {
            const mobileAudioButton = document.createElement('a');
            mobileAudioButton.href = "#";
            mobileAudioButton.className = 'block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50';
            mobileAudioButton.innerHTML = '<i class="fas fa-headphones mr-2"></i>上手导引';
            
            mobileMenuContent.appendChild(mobileAudioButton);
            
            // 点击事件
            mobileAudioButton.addEventListener('click', (e) => {
                e.preventDefault();
                // 关闭移动端菜单
                mobileMenu.classList.add('hidden');
                // 显示音频播放器并开始播放
                audioPlayer.showPlayer();
                audioPlayer.play();
            });
        }
    }
    
    // 点击按钮时显示播放器并开始播放
    audioButton.addEventListener('click', (e) => {
        e.preventDefault();
        audioPlayer.showPlayer();
        audioPlayer.play();
    });
}); 