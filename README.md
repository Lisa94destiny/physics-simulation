# 高中物理可视化教学平台

https://lisa94destiny.github.io/physics-simulation/

这是一个专为高中物理教学设计的交互式可视化模拟平台。通过直观的动画和交互控制，帮助学生更好地理解物理概念和原理。

## 作者信息

- Lisa（stardust）
- WeChat：ls94destiny
- AI探索者，物理教育者，开源~
- 欢迎各位老师来交流讨论提需求~

## 项目特点

- 📊 **交互式模拟**：学生可以通过调整参数，观察物理现象的变化
- 🎯 **直观可视化**：将抽象的物理概念转化为直观的视觉效果
- 📱 **响应式设计**：适配各种设备，从手机到电脑都有良好体验（推荐电脑学习）
- 🧠 **探究式学习**：鼓励学生通过观察和实验发现物理规律

## 包含的模拟实验

1. **双缝干涉测波长**：探索光的波动性，通过双缝干涉现象测量光的波长
2. **简谐运动辅助圆**：通过辅助圆理解简谐运动的数学描述和物理特性
3. **波的二维干涉**：观察两个波源在二维平面上产生的干涉图样
4. **弹簧振子简谐运动**：探索弹簧振子的简谐运动规律和能量转换过程
5. **多普勒效应**：模拟声源或观察者运动时，声波频率的变化现象
6. **机械波的叠加**：研究不同频率、振幅的机械波叠加后的波形变化
7. **狭义相对论**：模拟时间膨胀、长度收缩、同时性相对性等相对论效应
8. 更多模块开发中...（不要着急，一个人熬夜ing）


## 使用方法

方法一：打开链接直接使用 https://lisa94destiny.github.io/physics-simulation/

方法二：
1. 克隆或下载本仓库
2. 打开 `index.html` 文件即可开始使用
3. 点击任意模拟实验卡片，进入对应的模拟页面
4. 根据页面指引，调整参数，观察物理现象变化

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
├── simulations/        # 模拟实验页面
│   ├── double-slit.html    # 双缝干涉
│   ├── harmonic.html       # 简谐运动
│   ├── wave2d.html         # 波的二维干涉
│   ├── spring.html         # 弹簧振子
│   ├── doppler.html        # 多普勒效应
│   ├── wave-sum.html       # 机械波叠加
│   └── relativity.html     # 狭义相对论
├── logs/               # 错误和运行日志
└── versions/           # 版本历史记录
```

## 版本历史

当前版本：1.0.0 (2025年3月)

## 许可证

© 2025 物理可视化教学平台. 保留所有权利.