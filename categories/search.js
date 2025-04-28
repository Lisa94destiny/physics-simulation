// 所有实验数据
const allExperiments = [
    {
        title: "双缝干涉",
        category: "光学与现代物理",
        url: "simulations/optics-modern/double-slit.html",
        tags: ["光的干涉", "衍射", "波动光学", "杨氏实验", "双缝"]
    },
    {
        title: "简谐运动",
        category: "振动与波动",
        url: "simulations/waves/harmonic.html",
        tags: ["简谐", "振动", "周期", "频率", "弹簧振子", "单摆"]
    },
    {
        title: "波的二维干涉",
        category: "振动与波动",
        url: "simulations/waves/wave2d.html",
        tags: ["波动", "干涉", "二维", "波面", "水波"]
    },
    {
        title: "弹簧振子",
        category: "振动与波动",
        url: "simulations/waves/spring.html",
        tags: ["弹簧", "振动", "胡克定律", "简谐运动"]
    },
    {
        title: "多普勒效应",
        category: "振动与波动",
        url: "simulations/waves/doppler.html",
        tags: ["多普勒", "频率移动", "声波", "波源运动"]
    },
    {
        title: "机械波叠加",
        category: "振动与波动",
        url: "simulations/waves/wave-sum.html",
        tags: ["波叠加", "干涉", "驻波", "行波"]
    },
    {
        title: "横波理解",
        category: "振动与波动",
        url: "simulations/waves/transverse.html",
        tags: ["横波", "波动", "振动方向", "传播方向", "波形"]
    },
    {
        title: "狭义相对论",
        category: "光学与现代物理",
        url: "simulations/optics-modern/relativity/relativity.html",
        tags: ["爱因斯坦", "相对论", "时间膨胀", "长度收缩", "相对性"]
    },
    {
        title: "动量守恒",
        category: "力学",
        url: "simulations/mechanics/momentum-conservation.html",
        tags: ["动量", "碰撞", "守恒", "弹性碰撞", "非弹性碰撞"]
    },
    {
        title: "力的合成与分解",
        category: "力学",
        url: "simulations/mechanics/force-composition.html",
        tags: ["力", "合成", "分解", "平行四边形法则", "三角形法则", "分力", "合力"]
    },
    {
        title: "电场可视化",
        category: "电磁学",
        url: "simulations/electromagnetism/electric-field.html",
        tags: ["电场", "静电场", "场强", "电力线", "点电荷"]
    },
    {
        title: "磁场与电流",
        category: "电磁学",
        url: "simulations/electromagnetism/magnetic-field.html",
        tags: ["安培力", "磁场", "洛伦兹力", "电流", "右手定则"]
    },
    {
        title: "速度选择器",
        category: "电磁学",
        url: "simulations/electromagnetism/velocity-selector.html",
        tags: ["电场", "磁场", "洛伦兹力", "电磁力", "带电粒子"]
    },
    {
        title: "数据分析实验",
        category: "交叉领域与实验技能",
        url: "simulations/interdisciplinary/data-analysis.html",
        tags: ["数据", "分析", "误差", "统计", "拟合"]
    }
];

// 热门推荐实验
const popularExperiments = [
    {
        title: "双缝干涉",
        category: "光学与现代物理",
        url: "simulations/optics-modern/double-slit.html"
    },
    {
        title: "力的合成与分解",
        category: "力学",
        url: "simulations/mechanics/force-composition.html"
    },
    {
        title: "简谐运动",
        category: "振动与波动",
        url: "simulations/waves/harmonic.html"
    },
    {
        title: "电场可视化",
        category: "电磁学",
        url: "simulations/electromagnetism/electric-field.html"
    }
];

// 创建搜索组件元素
function createSearchComponent() {
    // 创建搜索图标
    const searchIcon = document.createElement('div');
    searchIcon.className = 'search-icon cursor-pointer flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50';
    searchIcon.innerHTML = '<i class="fas fa-search text-lg"></i>';
    
    // 创建搜索模态框
    const searchModal = document.createElement('div');
    searchModal.className = 'search-modal fixed inset-0 bg-gray-600 bg-opacity-50 flex items-start justify-center pt-10 md:pt-20 z-50 hidden';
    
    // 搜索框容器
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden';
    
    // 搜索框头部
    const searchHeader = document.createElement('div');
    searchHeader.className = 'search-header flex items-center p-4 border-b';
    searchHeader.innerHTML = `
        <i class="fas fa-search text-gray-500 mr-3"></i>
        <input type="text" class="search-input flex-1 outline-none text-lg" placeholder="搜索实验...">
        <button class="search-close ml-3 text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 搜索结果区域
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results max-h-60 md:max-h-80 overflow-y-auto p-4';
    
    // 初始状态：热门推荐
    const popularSection = document.createElement('div');
    popularSection.className = 'popular-section';
    popularSection.innerHTML = `
        <h3 class="text-sm font-medium text-gray-500 mb-3">热门推荐</h3>
        <div class="popular-items grid grid-cols-1 md:grid-cols-2 gap-3">
            ${popularExperiments.map(exp => `
                <a href="${getCorrectPath(exp.url)}" class="experiment-item flex items-center p-3 rounded-md hover:bg-gray-100">
                    <div class="icon text-primary mr-3"><i class="fas fa-flask"></i></div>
                    <div class="flex-1">
                        <div class="title font-medium">${exp.title}</div>
                        <div class="category text-sm text-gray-500">${exp.category}</div>
                    </div>
                </a>
            `).join('')}
        </div>
    `;
    
    searchResults.appendChild(popularSection);
    
    // 搜索结果区域
    const resultsSection = document.createElement('div');
    resultsSection.className = 'results-section hidden';
    resultsSection.innerHTML = '<h3 class="text-sm font-medium text-gray-500 mb-3">搜索结果</h3><div class="results-items"></div>';
    searchResults.appendChild(resultsSection);
    
    // 组装搜索模态框
    searchContainer.appendChild(searchHeader);
    searchContainer.appendChild(searchResults);
    searchModal.appendChild(searchContainer);
    
    // 添加到文档中
    document.body.appendChild(searchModal);
    
    // 添加响应式样式
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        @media (max-width: 640px) {
            .search-modal {
                padding-top: 1rem;
            }
            .search-container {
                max-width: 95%;
                margin: 0 2.5%;
            }
            .search-results {
                max-height: 60vh;
            }
        }
    `;
    document.head.appendChild(styleEl);
    
    // 搜索逻辑
    const searchInputEl = searchModal.querySelector('.search-input');
    const resultsItemsEl = searchModal.querySelector('.results-items');
    const popularSectionEl = searchModal.querySelector('.popular-section');
    const resultsSectionEl = searchModal.querySelector('.results-section');
    
    // 添加事件监听
    searchIcon.addEventListener('click', () => {
        searchModal.classList.remove('hidden');
        setTimeout(() => searchInputEl.focus(), 100);
    });
    
    searchModal.querySelector('.search-close').addEventListener('click', () => {
        searchModal.classList.add('hidden');
    });
    
    // 点击模态框背景关闭
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.classList.add('hidden');
        }
    });
    
    // 搜索输入框事件
    searchInputEl.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        if (query === '') {
            // 显示热门推荐
            popularSectionEl.classList.remove('hidden');
            resultsSectionEl.classList.add('hidden');
            return;
        }
        
        // 隐藏热门推荐，显示搜索结果
        popularSectionEl.classList.add('hidden');
        resultsSectionEl.classList.remove('hidden');
        
        // 模糊搜索逻辑
        const results = allExperiments.filter(exp => {
            // 搜索标题
            if (exp.title.toLowerCase().includes(query)) return true;
            
            // 搜索分类
            if (exp.category.toLowerCase().includes(query)) return true;
            
            // 搜索标签
            return exp.tags.some(tag => tag.toLowerCase().includes(query));
        });
        
        // 更新搜索结果
        if (results.length === 0) {
            resultsItemsEl.innerHTML = '<div class="text-center text-gray-500 py-4">没有找到匹配的实验</div>';
        } else {
            resultsItemsEl.innerHTML = results.map(exp => `
                <a href="${getCorrectPath(exp.url)}" class="experiment-item flex items-center p-3 rounded-md hover:bg-gray-100">
                    <div class="icon text-primary mr-3"><i class="fas fa-flask"></i></div>
                    <div class="flex-1">
                        <div class="title font-medium">${highlightMatch(exp.title, query)}</div>
                        <div class="category text-sm text-gray-500">${exp.category}</div>
                    </div>
                </a>
            `).join('');
            
            // 添加点击事件监听器
            resultsItemsEl.querySelectorAll('.experiment-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    // 先关闭搜索框，避免跳转问题
                    searchModal.classList.add('hidden');
                    
                    // 如果是移动设备，先延迟一下再跳转，确保模态框已关闭
                    if (window.innerWidth < 768) {
                        e.preventDefault();
                        const href = this.getAttribute('href');
                        setTimeout(() => {
                            window.location.href = href;
                        }, 100);
                    }
                });
            });
        }
    });
    
    // 键盘ESC关闭搜索
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !searchModal.classList.contains('hidden')) {
            searchModal.classList.add('hidden');
        }
    });
    
    return searchIcon;
}

// 高亮匹配的文字
function highlightMatch(text, query) {
    if (!query) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    if (!lowerText.includes(lowerQuery)) return text;
    
    const index = lowerText.indexOf(lowerQuery);
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    
    return `${before}<span class="bg-yellow-200">${match}</span>${after}`;
}

// 初始化搜索组件
function initSearchComponent() {
    // 根据当前页面使用相应的主题颜色
    updateSearchThemeColor();
    
    // 获取导航栏，更通用的选择器以同时支持主页和子页面
    const navbar = document.querySelector('nav');
    if (navbar) {
        // 尝试寻找子页面的右侧导航区域
        let navbarRightSection = navbar.querySelector('.flex.items-center.space-x-4');
        
        // 如果找不到子页面的格式，尝试寻找主页面的导航区域
        if (!navbarRightSection) {
            navbarRightSection = navbar.querySelector('.hidden.md\\:flex.items-center.space-x-4');
        }
        
        // 如果还是找不到，就尝试创建一个新的导航区域
        if (!navbarRightSection) {
            // 尝试找到导航栏的容器
            const navContainer = navbar.querySelector('.flex.justify-between');
            if (navContainer) {
                navbarRightSection = document.createElement('div');
                navbarRightSection.className = 'flex items-center space-x-4';
                navContainer.appendChild(navbarRightSection);
            }
        }
        
        if (navbarRightSection) {
            const searchIcon = createSearchComponent();
            navbarRightSection.insertBefore(searchIcon, navbarRightSection.firstChild);
        } else {
            console.warn('找不到合适的导航区域来放置搜索图标');
        }
    }
}

// 更新搜索组件的主题颜色以匹配当前页面
function updateSearchThemeColor() {
    // 使用统一的蓝色，不根据当前页面变化
    let primaryColor = '#5E6AD2'; // 统一使用蓝色
    
    // 更新CSS变量
    document.documentElement.style.setProperty('--search-primary', primaryColor);
    
    // 动态添加样式
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .search-icon:hover { color: var(--search-primary) !important; }
        .search-results .icon { color: var(--search-primary) !important; }
        .search-input:focus { border-color: var(--search-primary) !important; }
    `;
    document.head.appendChild(styleEl);
}

// 在DOM加载完成后初始化搜索组件
document.addEventListener('DOMContentLoaded', initSearchComponent);

// 适配不同页面的路径问题
function getCorrectPath(url) {
    // 检查当前URL是否是file://协议打开的本地文件
    const isFileProtocol = window.location.protocol === 'file:';
    
    // 获取当前页面的路径
    const currentPath = window.location.pathname;
    
    // 标准化URL（去除可能的前导斜杠）
    let normalizedUrl = url;
    if (normalizedUrl.startsWith('/')) {
        normalizedUrl = normalizedUrl.substring(1);
    }
    
    // 判断是否在主页
    const isHomePage = currentPath.endsWith('index.html') || 
                      currentPath.endsWith('/') || 
                      currentPath.toLowerCase().endsWith('物理可视化教学/');
    
    // 如果在主页，直接返回URL
    if (isHomePage) {
        return normalizedUrl;
    }
    
    // 如果在子页面，需要添加一级相对路径
    // 对于file://协议，我们可能需要更特殊的处理
    if (isFileProtocol) {
        // 检查当前路径是否在categories目录下
        if (currentPath.includes('/categories/') || currentPath.includes('\\categories\\')) {
            return '../' + normalizedUrl;
        }
    }
    
    // 默认添加一级目录
    return '../' + normalizedUrl;
} 