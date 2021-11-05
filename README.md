##本系统在原若依系统上进行了如下修改

1.整合p6spy.jar,直接输出完整SQL
2.整合mybatisPlus
3.修改部门id为字符串类型
4.修改用户id为字符串类型
5.添加开关控制密码是否使用加密
6.新增业务模块,用户可以直接在业务模块里进行业务代码撰写

## 开发

```bash
# 克隆项目
git clone https://gitee.com/y_project/RuoYi-Vue

# 进入项目目录
cd ruoyi-ui

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm run dev
```

浏览器访问 http://localhost:80

## 发布

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```