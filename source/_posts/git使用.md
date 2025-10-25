---
title: git使用
date: 2025-10-24 22:47:09
tags: git
---

使用git并关联到远程仓库的步骤如下

```bash
# 1. 进入项目目录
cd my-awesome-project

# 2. 初始化Git（如果还没初始化）
git init

# 3. 检查当前状态
git status

# 4. 添加所有文件到暂存区
git add .

# 5. 提交更改
git commit -m "初始提交：项目基础框架"

# 6. 添加远程仓库
git remote add origin https://github.com/yourusername/my-awesome-project.git

# 7. 首次推送（-u参数设置上游分支）
git push -u origin main

# 后续推送只需要：
git push
```

**（1）git push出现have no upstream branch问题**
{% asset_img 59.png have no upstream branch %}

是因为本地当前分支没有和远端的分支进行相关联。

解决方案如下：
1. 运行 ``git push --set-upstream origin master`` . 其中的origin是你在clone远程代码时，git为你创建的指向这个远程代码库的标签，它指向repository。master是你远程的branch，可以用git branch -a查看所有分支，远程分支是红色的部分。然后确定好这两个值后，将值换掉即可。
2. 运行 ``git push -u origin master`` 可根据具体需要吧master分支改成自己的分支这种方式无需确保远端相应分支存在，因为不存在的话，会自动创建该分支并与本地分支进行关联。

运行1后发现如下错误：
{% asset_img 23.png %}

这个错误表示你的本地仓库中没有 `master` 分支，或者 `master` 分支是空的。这是因为没有向本地git仓库提交任何内容，解决这个问题，先检查status，再设置跟踪状态：
```bash
git branch -a
git status
git add .
```

{% asset_img 48.png %}

```bash
git commit -m "first提交"
```

最后检查github，发现提交成功

{% asset_img 31.png %}

**(2) 新clone了一个仓库发现commit不了**

{% asset_img 39.png %}

通过以下命令进行检查：
```bash
git remote -v
```
检查发现原来已经设置好了remote仓库。

**(3) 修改上一次的commit信息**
```bash
git commit --amend
git commit --amend -m "new message"
```
