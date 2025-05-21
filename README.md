# Temporal RPA 引擎

基于Temporal的RPA（机器人流程自动化）流程编排引擎，使用Playwright进行浏览器自动化。

## 项目架构

项目采用monorepo架构，包含以下主要模块：

- **设计器 (Designer)**: React前端应用，提供可视化工作流设计界面
- **API服务 (API)**: NestJS应用，处理前端请求并与Temporal交互
- **工作器 (Worker)**: Temporal Worker，执行RPA工作流和活动
- **共享库 (Shared)**: 共享类型、接口和工具

## 技术栈

- **前端**: React, TypeScript, Ant Design, React Flow
- **后端**: NestJS, TypeScript
- **工作流**: Temporal, TypeScript
- **浏览器自动化**: Playwright
- **包管理**: pnpm

## 快速开始

### make 命令

```bash
make install
make start-all

# 查看帮助信息
make help
```

### 安装依赖

```bash
# 安装工程依赖
pnpm install
```

### 运行Temporal服务

Temporal是工作流引擎的核心组件，需要先启动Temporal服务。

```bash
# 启动Temporal服务（开发模式）
pnpm temporal:dev-server
```

该命令将启动一个本地Temporal开发服务器，数据将保存在`temporal.db`文件中。

### 启动API服务

```bash
pnpm start:api
```

API服务将在 http://localhost:3001 上运行，提供REST API接口。

### 启动Worker

```bash
pnpm start:worker
```

Worker将连接到Temporal服务并注册工作流和活动。

### 启动前端设计器

```bash
pnpm start:designer
```

设计器将在 http://localhost:3000 上运行。

## 功能特点

- 可视化工作流设计器，支持拖拽节点和连线
- 支持多种RPA操作类型：
  - 浏览器操作（导航、点击、输入等）
  - 延迟
  - API调用
  - JavaScript脚本执行
  - 条件分支
- 工作流执行状态监控
- 基于Temporal的可靠工作流执行
  - 支持长时间运行的工作流
  - 自动重试失败的活动
  - 工作流执行历史记录

## 配置

### API服务配置

编辑 `packages/api/src/main.ts` 文件，可以修改端口等配置。

### Worker配置

编辑 `packages/worker/src/worker.ts` 文件，可以修改Temporal连接等配置。

### 设计器配置

编辑 `packages/designer/vite.config.ts` 文件，可以修改前端服务配置。

## 开发指南

### 创建新节点类型

1. 在 `packages/shared/src/types.ts` 文件中添加新的节点类型
2. 在 `packages/worker/src/workflows/rpa-workflow.ts` 中实现处理逻辑
3. 在设计器中添加节点UI和属性表单

### 添加新的浏览器活动

1. 在 `packages/shared/src/types.ts` 文件中添加新的浏览器动作类型
2. 在 `packages/worker/src/activities/browser-activities.ts` 中实现浏览器活动
3. 在设计器的表单中添加新的选项和对应属性

## 后续改进方向

- 增加用户认证和权限控制
- 添加更多浏览器自动化操作
- 支持工作流导入/导出
- 添加数据存储（替代内存存储）
- 增加错误处理和日志记录
- 添加更多UI组件和自定义样式支持
