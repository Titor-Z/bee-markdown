# BEE MARKDOWN
简单轻巧的Markdown文档在线预览工具.

## USEAGE

##### 启动阅读器
``` bash
md start [port] 端口号, 默认2222
```

##### 初始化配置文件
``` bash
md init
```


##### 其它命令
```shell
md --help     (显示帮助信息)
md --version  (显示md版本号)
```

## 配置文件简述
配置文件为项目根目录下的<mark>.mdrc</mark>文件

- `entry`: `README.md` <br> 首页入口，默认根目录下的README.md文档。
- `useStyle`: `true` <br> 是否使用默认全局样式。默认为true。
- `port`: `2222` <br> 服务默认端口
- `routes`: `{}` <br> 用户自定义Link样式路由


## 更新历史
<dl>
  <dt>
    <h2>2.1.0 <em><sup>NEW</sup></em></h2>
    <small>12/10 2022</small>
  </dt>
  <dd>

  1. 优化了`bee-markdown-theme`的引入方式。
  2. 更新了说明文档。 
  </dd>
</dl>

<dl>
  <dt>
    <h2>2.0.4</h2>
    <small>11/30 2022</small>
  <dt>
  <dd>

  - 使用了[@Titor-Z/markdown-theme][theme]来替换系统原先的默认 **theme**。
  - 优化了默认的文档流输出，添加了完善的html输出标准。
  - 版本发布为 <em>2.0.0</em>
  </dd>
</dl>

[theme]: https://github.com/Titor-Z/markdown-theme/pkgs/npm/markdown-theme "Markdown Theme"