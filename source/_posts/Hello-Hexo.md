---
title: Hello Hexo
date: 2025-10-15 22:08:41
tags: 
    - SSH
    - Hexo
    - Nginx
---
## 1. 云服务器租用
## 2. 本地Hexo下载
## 3. 部署到服务器
## 4. Hexo创建并发布文章
```

# 清除之前生成的静态文件
hexo clean

# 生成静态文件，hexo generate 的简写
hexo g

# 本地启动，hexo server 的简写
hexo s

# 1. 创建新文章
hexo new "文章标题"

# 2. 编写内容（用你喜欢的编辑器）
vim source/_posts/文章标题.md

# 3. 本地预览
hexo server

# 4. 部署到服务器
hexo clean && hexo g -d

```