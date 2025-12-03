# LinkStream AI | 智能投屏助手

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/react-v19-61dafb.svg) ![TypeScript](https://img.shields.io/badge/typescript-v5-blue.svg)

[English](#linkstream-ai--intelligent-screen-mirroring) | [中文](#linkstream-ai--智能投屏助手-1)

---

# LinkStream AI | Intelligent Screen Mirroring

LinkStream AI is a next-generation web-based application designed for seamless USB device mirroring, simulated mobile environments, and powerful AI-assisted development. It combines the utility of screen projection with the intelligence of modern LLMs (Large Language Models) to assist developers, testers, and presenters.

## ✨ Key Features

### 📱 Advanced Screen Mirroring
*   **WebUSB Integration**: Connect Android devices directly via USB for low-latency mirroring (Chrome/Edge required).
*   **Virtual Device Simulator**: High-fidelity UI simulation with realistic bezels, dynamic island, and reflections.
*   **Interactive Workspace**:
    *   **Draggable & Resizable**: Freely move and scale the phone display on the canvas.
    *   **Web Browser Mode**: Switch the phone screen to a functional web browser for testing mobile responsive sites.

### 🧠 Multi-Model AI Hub
*   **Universal Model Support**: Configure and switch between multiple AI providers instantly via the Settings panel.
    *   **Google Gemini** (Default)
    *   **OpenAI (GPT-4/Turbo)**
    *   **DeepSeek**
    *   **Anthropic (Claude)**
    *   **Local Ollama** (Llama 3, Mistral, etc.)
    *   **Custom Base URLs**: Support for proxies and enterprise endpoints.
*   **Contextual Chat**: Discuss your app, debug issues, or brainstorm features directly within the interface.
*   **Smart Notes**: One-click generation of engineering notes based on your chat history using AI.

### 🛠️ Developer Tools
*   **Smart Notebook**: Built-in Markdown editor with live preview mode and auto-save.
*   **Screen Recording**: Record your session (video + microphone audio) directly to your local machine.
*   **System Logs**: Real-time activity timeline with status indicators.

### 🎨 Modern UI/UX
*   **Aurora Design System**: Beautiful glassmorphism effects and ambient background animations.
*   **Theme Support**: Toggle between "Midnight Aurora" (Dark) and "Frosted Daylight" (Light) modes.
*   **Bilingual**: Full support for English and Chinese (Simplified).

## 🚀 Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS (w/ Custom Animations & Glassmorphism)
*   **Icons**: Lucide React
*   **AI Integration**: Google GenAI SDK, REST API adapters for other providers
*   **Markdown**: React Markdown

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/linkstream-ai.git
    cd linkstream-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables (Optional)**
    Create a `.env` file for your default API key (optional, can be set in UI):
    ```env
    API_KEY=your_google_gemini_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

# LinkStream AI | 智能投屏助手

LinkStream AI 是下一代基于 Web 的应用程序，专为无缝 USB 设备投屏、模拟移动环境和强大的 AI 辅助开发而设计。它将屏幕投影的实用性与现代 LLM（大型语言模型）的智能相结合，为开发人员、测试人员和演示者提供全方位的支持。

## ✨ 核心功能

### 📱 高级屏幕投屏
*   **WebUSB 集成**: 通过 USB 直接连接 Android 设备，实现低延迟投屏（需使用 Chrome/Edge 浏览器）。
*   **虚拟设备模拟器**: 高保真 UI 模拟，包含逼真的边框、灵动岛和光影反射效果。
*   **交互式工作区**:
    *   **拖拽与缩放**: 在画布上自由移动手机位置并调整大小。
    *   **网页浏览器模式**: 将手机屏幕切换为功能齐全的网页浏览器，用于测试移动端响应式网站。

### 🧠 多模型 AI 中心
*   **通用模型支持**: 通过设置面板即时配置和切换多个 AI 服务商。
    *   **Google Gemini** (默认)
    *   **OpenAI (GPT-4/Turbo)**
    *   **DeepSeek (深度求索)**
    *   **Anthropic (Claude)**
    *   **本地 Ollama** (Llama 3, Mistral 等)
    *   **自定义 Base URL**: 支持代理地址和企业私有部署端点。
*   **上下文对话**: 直接在界面内讨论您的应用程序、调试问题或构思新功能。
*   **智能笔记**: 基于聊天历史记录，一键利用 AI 生成结构化的工程笔记。

### 🛠️ 开发者工具
*   **智能笔记本**: 内置 Markdown 编辑器，支持实时预览模式和自动保存。
*   **屏幕录制**: 直接录制您的操作会话（视频 + 麦克风音频）到本地。
*   **系统日志**: 带有状态指示器的实时活动时间轴。

### 🎨 现代 UI/UX
*   **极光设计系统**: 精美的毛玻璃特效和环境背景动画。
*   **主题支持**: 自由切换“午夜极光”（暗色）和“磨砂日光”（亮色）模式。
*   **双语支持**: 完美支持英文和简体中文。

## 🚀 技术栈

*   **前端框架**: React 19, TypeScript
*   **构建工具**: Vite
*   **样式库**: Tailwind CSS (自定义动画 & Glassmorphism)
*   **图标库**: Lucide React
*   **AI 集成**: Google GenAI SDK, 通用 REST API 适配器
*   **文档渲染**: React Markdown

## 📦 安装与设置

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-username/linkstream-ai.git
    cd linkstream-ai
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **设置环境变量 (可选)**
    创建一个 `.env` 文件用于配置默认 API Key（也可在 UI 界面中直接配置）：
    ```env
    API_KEY=your_google_gemini_key_here
    ```

4.  **启动开发服务器**
    ```bash
    npm run dev
    ```

---

## 📄 License

MIT License © 2024 LinkStream AI
