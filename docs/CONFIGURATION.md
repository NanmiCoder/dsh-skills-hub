# 高级配置

日常使用可直接在桌面端安装和管理插件，无需修改配置。以下内容供需要自定义安装目录、数据源或移除权限的用户参考。

配置写在插件行中：

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


## 技能发现范围

列表覆盖配置的安装目录、`$DSH_HOME/skills` 与共享 agents 用户技能目录。支持目录式技能、平铺 Markdown 和符号链接；同名但不同路径的技能分别展示。删除符号链接时仅移除链接，保留目标文件。项目级与内置技能不在此列表中。

接口和路径校验规则见[实现约定](./CONTRACT.md)。
