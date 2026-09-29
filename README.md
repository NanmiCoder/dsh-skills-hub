<p align="right">
  <strong>简体中文</strong> · <a href="./README_EN.md">English</a>
</p>

<p align="center">
  <img src="./assets/readme/hero-zh.png" width="100%" alt="Skills Hub：发现技能，装进你的工作流。3D 技能文档汇入蓝色收纳座的概念插画。">
</p>

<p align="center">
  <strong>DeepSeek Harness 的技能市场与本机技能管理器</strong><br>
  浏览 ClawHub 与 SkillHub，读懂 SKILL.md，再安装到你的 Harness。
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> · <a href="./docs/COMPATIBILITY.md">兼容性</a> · <a href="./docs/RELEASE.md">发布指南</a> · <a href="./LICENSE">MIT</a>
</p>

## 技能发现和本机管理，在同一个面板里

**Skills Hub** 把两个技能市场与本机用户技能放进 Harness 侧栏。无需在网站、下载目录和技能文件夹之间来回切换：搜索、查看文档、确认安装，再到「已安装技能」里统一管理。

<p align="center">
  <img src="./assets/readme/marketplace.png" width="100%" alt="Skills Hub 在 DeepSeek Harness 中的实际界面：技能卡片、搜索与筛选、来源健康状态，以及已安装技能入口。">
</p>

*实际 Harness 0.2.0-rc.2 界面；市场内容随上游更新。顶部 3D Hero 为概念插画。*

| 你要做的事 | Skills Hub 怎么帮你 |
| --- | --- |
| **找一个技能** | 聚合 ClawHub 与 SkillHub，支持搜索和筛选；向下滚动自动加载更多。 |
| **先看清，再安装** | 渲染 Markdown、表格和代码块，预览包内文件与上游安全报告；列表和详情都有骨架屏。 |
| **整理已安装技能** | 搜索市场安装和本机用户技能，查看来源、实际路径与正文，再确认卸载。 |

## 快速开始

**插件 `0.0.1` · 宿主 `0.2.0-rc.2`**。面向 DeepSeek Harness 0.2.0 桌面端产品线；其他宿主版本尚未验证。[查看验收范围 →](./docs/COMPATIBILITY.md)

在 **DeepSeek Harness 桌面端 → 插件 → 添加插件** 中，粘贴下面任意一种内容：

**GitHub 仓库地址（推荐）**

```text
https://github.com/NanmiCoder/dsh-skills-hub
```

**或 npm 包名**

```text
@nanmicoder/dsh-skills-hub
```

点击 **安装**，完成后点击 **立即启用**，再从侧栏进入 **技能市场**。整个过程无需打开终端。若安装源暂未同步新版本，可切换到 npm 官方源后重试。

1. **浏览**：搜索关键词，或按来源、安全状态筛选。
2. **预览**：打开技能，阅读概览和文件内容。
3. **安装**：核对来源并确认；在「已安装技能」中查看、搜索或卸载。

> 包名必须带 `@nanmicoder/`。npm 上不带 scope 的 `dsh-skills-hub` 属于其他作者。

<details>
<summary><strong>高级用法：命令行与源码安装</strong></summary>

仅适用于使用 CLI、自定义 profile 或本地开发的用户。按指定版本安装：

```sh
dsh plugin --profile desktop add @nanmicoder/dsh-skills-hub@0.0.1
```

将 `desktop` 替换为需要使用的 profile 名称。通过 CLI 安装后，完全退出并重新打开对应的 Harness 实例。

从源码构建：

需要 Node.js `^22.19.0 || >=24` 和 pnpm `10.33.0`。

```sh
pnpm install --frozen-lockfile
pnpm pack --pack-destination artifacts
dsh plugin --profile desktop add ./artifacts/nanmicoder-dsh-skills-hub-0.0.1.tgz
```

同样需要完全重启 Harness。构建产物随源码保留，打包前会重新构建和检查。

</details>

## 已安装管理，路径清楚，操作明确

列表覆盖配置的安装目录、`$DSH_HOME/skills` 与共享 agents 用户技能目录。目录式技能、平铺 Markdown 和符号链接都能识别；同名但不同路径的技能分别展示。

- **确认后卸载**：展示将要删除的实际位置。
- **链接只删链接**：保留它指向的原始技能文件。
- **管理用户技能**：项目级和内置技能不在这个主机级列表中。

安装过程不执行技能脚本，也不会覆盖已有目录。技能可能指示 agent 后续运行第三方代码；安全标签来自上游报告，不代表独立审计。请在安装前查看内容和发布者。

<details>
<summary><strong>配置与移除插件</strong></summary>

默认配置即可使用。高级配置写在插件行中：

```yaml
- id: skills-hub
  name: '@nanmicoder/dsh-skills-hub'
  config:
    allowUninstall: false
    timeoutMs: 30000
```

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `skillsRoot` | `null` | 安装目录；默认是 Harness 用户技能目录。 |
| `clawhubBaseUrl` | `https://clawhub.ai` | ClawHub API 地址。 |
| `skillhubBaseUrl` | `https://api.skillhub.cn` | SkillHub API 地址。 |
| `timeoutMs` | `15000` | 单次上游请求超时，单位毫秒。 |
| `requestRetries` | `1` | 网络及服务器错误重试次数。 |
| `allowUninstall` | `true` | 是否允许在面板卸载技能。 |
| `pageSize` | `24` | 市场分页大小。 |

移除插件本身：在桌面端 **插件** 页面打开 **@nanmicoder/dsh-skills-hub**，点击 **卸载**。

这不会删除已安装的技能。文件扫描范围与接口见[实现约定](./docs/CONTRACT.md)。

</details>

## 开发与发布

```sh
pnpm install --frozen-lockfile
pnpm check       # 类型、构建、回归测试与版本检查
pnpm pack:check  # 另检查 npm 包内容及运行时依赖闭包
```

[贡献指南](./CONTRIBUTING.md) · [维护规范](./AGENTS.md) · [兼容性与验收](./docs/COMPATIBILITY.md) · [0.0.1 发布流程](./docs/RELEASE.md)

MIT 许可证。详见 [LICENSE](./LICENSE)。
