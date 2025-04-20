# 高中物理可视化教学平台

https://lisa94destiny.github.io/physics-simulation/

这是一个专为高中物理教学设计的交互式可视化模拟平台。通过直观的动画和交互控制，帮助学生更好地理解物理概念和原理。

## 作者信息

- Lisa（stardust）
- AI探索者，物理教育者，开源~
- 个人公众号：Lisa是个机器人
- 欢迎各位老师来交流讨论提需求~

## 项目特点

- 📊 **交互式模拟**：学生可以通过调整参数，观察物理现象的变化
- 🎯 **直观可视化**：将抽象的物理概念转化为直观的视觉效果
- 📱 **响应式设计**：适配各种设备，从手机到电脑都有良好体验（推荐电脑学习）
- 🧠 **探究式学习**：鼓励学生通过观察和实验发现物理规律
- 🔍 **全站搜索功能**：快速查找感兴趣的物理实验，支持模糊搜索
- 🌐 **初高中知识衔接**：为未来的初中物理网站提供接口，实现知识的无缝衔接

## 五大领域

本平台涵盖高中物理的五大核心领域：

1. **力学**：研究物体运动与力的相互关系，包括牛顿力学、动量守恒、能量守恒等
2. **电磁学**：探索电场、磁场及其相互作用，包括电路、电磁感应等
3. **振动与波动**：研究周期性运动和波的传播特性，包括简谐运动、机械波等
4. **光学与现代物理**：涵盖几何光学、波动光学和现代物理基础知识
5. **交叉领域与实验技能**：物理与其他学科的交叉应用，以及实验设计与数据分析等技能

各领域已添加详细分类页面，可访问对应页面查看更多内容：
- 力学：<a href="./categories/mechanics.html" target="_blank">/categories/mechanics.html</a>
- 电磁学：<a href="./categories/electromagnetism.html" target="_blank">/categories/electromagnetism.html</a>
- 振动与波动：<a href="./categories/waves.html" target="_blank">/categories/waves.html</a>
- 光学与现代物理：<a href="./categories/optics-modern.html" target="_blank">/categories/optics-modern.html</a>
- 交叉领域与实验技能：<a href="./categories/interdisciplinary.html" target="_blank">/categories/interdisciplinary.html</a>

## 热门模拟实验

1. **动量守恒模型**：
   - 一维碰撞：探索弹性、非弹性和完全非弹性碰撞中的动量守恒
   - 二维碰撞：研究平面上的碰撞现象（开发中）
2. **电磁感应实验**：探索移动导体棒在磁场中产生感应电动势的现象和规律（开发中）
3. **波的二维干涉**：观察两个波源在二维平面上产生的干涉图样
4. **双缝干涉**：探索光的波动性，通过双缝干涉现象测量光的波长
5. **交叉领域与实验技能**：学习物理实验数据的统计分析、误差处理和图形可视化技巧（开发中）
五大领域，更多模块开发中...

## 站点功能

1. **全站搜索**：在任意页面点击导航栏的搜索图标，快速查找实验
   - 支持模糊搜索和标签搜索
   - 提供热门推荐实验
   - 搜索结果高亮显示匹配文本
2. **直观导航**：通过分类卡片和导航菜单快速访问不同领域
3. **实验过滤**：在子页面中按难度和分类筛选实验
4. **移动端适配**：响应式设计，支持各种设备访问

## 社交媒体

- GitHub: <a href="https://github.com/Lisa94destiny" target="_blank">https://github.com/Lisa94destiny</a>
- 微信公众号: Lisa是个机器人（关注开发最新动态）
- REDnote: 
- Twitter/X: <a href="https://x.com/AIstardustX" target="_blank">@AIstardustX</a>

## 使用方法

方法一：打开链接直接使用 <a href="https://lisa94destiny.github.io/physics-simulation/" target="_blank">https://lisa94destiny.github.io/physics-simulation/</a>

方法二：
1. 克隆或下载本仓库
2. 打开 `index.html` 文件即可开始使用
3. 点击任意模拟实验卡片，进入对应的模拟页面
4. 根据页面指引，调整参数，观察物理现象变化
5. 使用搜索功能快速查找需要的实验

## 项目结构

```
物理可视化教学/
├── index.html          # 主页面
├── README.md           # 项目说明文档
├── 技术栈说明.md        # 技术栈详细说明
├── assets/             # 静态资源文件夹
│   ├── css/            # 样式文件
│   ├── js/             # 通用JavaScript文件
│   └── images/         # 图片资源
├── categories/         # 物理学五大领域分类页面
│   ├── mechanics.html           # 力学
│   ├── electromagnetism.html    # 电磁学
│   ├── waves.html               # 振动与波动
│   ├── optics-modern.html       # 光学与现代物理
│   ├── interdisciplinary.html   # 交叉领域与实验技能
│   └── search.js                # 全站搜索组件
├── simulations/        # 模拟实验页面
│   ├── mechanics/              # 力学实验
│   │   └── momentum-conservation.html  # 动量守恒
│   ├── electromagnetism/       # 电磁学实验
│   │   ├── electric-field.html         # 电场可视化
│   │   └── magnetic-field.html         # 磁场与电流
│   ├── waves/                  # 振动与波动实验
│   │   ├── transverse/                 # 横波理解
│   │   ├── harmonic.html               # 简谐运动
│   │   ├── wave2d.html                 # 波的二维干涉
│   │   ├── spring.html                 # 弹簧振子
│   │   ├── doppler.html                # 多普勒效应
│   │   └── wave-sum.html               # 机械波叠加
│   ├── optics-modern/          # 光学与现代物理实验
│   │   ├── double-slit.html            # 双缝干涉
│   │   └── relativity/                 # 相对论
│   │       └── relativity.html         # 狭义相对论
│   └── interdisciplinary/      # 交叉领域实验
│       └── data-analysis.html          # 数据分析
├── logs/               # 错误和运行日志
└── versions/           # 版本历史记录
```

## 版本历史

当前版本：1.0.0 (2025年3月)
- 添加全站搜索功能
- 优化用户界面和导航体验
- 统一各页面风格和交互模式
- 增加与初中物理的知识衔接接口

## 许可证

© 2025 物理可视化教学平台. 保留所有权利.