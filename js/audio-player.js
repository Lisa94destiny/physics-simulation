// 音频播放器组件
class AudioPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.playerElement = null;
        this.progressBar = null;
        this.volumeControl = null;
        this.speedControl = null;
        this.audioUrl = 'https://minimax-algeng-chat-tts.oss-cn-wulanchabu.aliyuncs.com/audio%2Ftts-mp3-20250421020709-NCGeCjXc.mp3?Expires=86401745172429&OSSAccessKeyId=LTAI5tGLnRTkBjLuYPjNcKQ8&Signature=e5TdmpUgNuyRaHopJUrMM9rYbxg%3D';
        // 本地音频备份文件
        this.fallbackAudioUrl = 'assets/audio/introduction.mp3';
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
        this.playerElement.className = 'fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 transform translate-y-full transition-transform duration-300 z-50';
        this.playerElement.style.minHeight = '80px';
        
        // 播放器内容
        const playerContent = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex flex-wrap items-center justify-between">
                    <!-- 标题和控制按钮 -->
                    <div class="flex items-center space-x-4 mb-2 md:mb-0">
                        <h3 class="text-lg font-semibold text-gray-800">网站使用指南</h3>
                        <button id="play-pause-btn" class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 focus:outline-none">
                            <i class="fas fa-play" id="play-icon"></i>
                            <i class="fas fa-pause hidden" id="pause-icon"></i>
                        </button>
                        <button id="restart-btn" class="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 focus:outline-none">
                            <i class="fas fa-redo-alt"></i>
                        </button>
                    </div>
                    
                    <!-- 进度条和时间 -->
                    <div class="w-full md:w-1/2 lg:w-2/3 flex items-center space-x-2 my-2">
                        <span id="current-time" class="text-xs text-gray-500 w-12">0:00</span>
                        <div class="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div id="progress-bar" class="h-full bg-indigo-600 w-0 rounded-full"></div>
                        </div>
                        <span id="duration" class="text-xs text-gray-500 w-12">0:00</span>
                    </div>
                    
                    <!-- 音量和速度控制 -->
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-1">
                            <i class="fas fa-volume-down text-gray-500"></i>
                            <input type="range" id="volume-control" min="0" max="1" step="0.1" value="1" 
                                class="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                        </div>
                        <div class="flex items-center space-x-1">
                            <span class="text-sm text-gray-500">速度</span>
                            <select id="speed-control" class="text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1">
                                <option value="0.5">0.5x</option>
                                <option value="0.75">0.75x</option>
                                <option value="1" selected>1x</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </select>
                        </div>
                        <button id="close-player-btn" class="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 focus:outline-none">
                            <i class="fas fa-times"></i>
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
        this.speedControl.addEventListener('change', () => {
            this.setPlaybackRate(this.speedControl.value);
        });
        
        // 关闭按钮
        this.closePlayerBtn.addEventListener('click', () => {
            this.hidePlayer();
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
    
    // 点击按钮时显示播放器并开始播放
    audioButton.addEventListener('click', (e) => {
        e.preventDefault();
        audioPlayer.showPlayer();
        audioPlayer.play();
    });
}); 