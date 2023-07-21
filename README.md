# react-dataMatrix-scanner 部署教程

# 从代码运行(一共四个需要运行，需要四个端口)
安装node和npm
```shell
sudo apt update
apt install nodejs
node --version
npm --version
```

## my-app
```shell
npx create-react-app my-app
```
替换src文件夹和package.json文件
```shell
cd my-app
npm install
```
如果安装这一步报错，运行
```shell
npm install --legacy-peer-deps
```
即可
### 1. my-app/src/App.js 用户扫码界面(运行在3000)
```shell
npm start
```
### 2. my-app/src/server.js 数据库后端(运行在8989)
```shell
cd src
node server.js
```
### 3. my-app/src/imageServer.js 图片储存后端(运行在8990)
```shell
node imageServer.js
```

## admin-app
### 4. admin-app/src/App.js 管理员后台界面(运行在3001)
```shell
npx create-react-app admin-app
cd admin-app
npm install
PORT=3001 npm start
```

# CORS链接修改
## nginx转发规则
my-app:3000 -> 15711
admin-app:3001 -> 15712
server.js:8989 -> 15789

所以要部署时需要根据自己的情况进行修改，需要修改的地方为：
## my-app/src/server.js
### 第44行-第47行
```javascript
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://www.xihelin.com:15711', 'https://www.xihelin.com:15712'],
    credentials: true
}));
```
### 第55行
```javascript
    const files = req.files.map(file => `https://www.xihelin.com:15789/uploads/${file.filename}`);
```
## my-app/src/imageServer.js
### 第8-11行
```javascript
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://www.xihelin.com:15711', 'https://www.xihelin.com:15712'],
    credentials: true,
};
```
## my-app/src/Scanner.js
### 第112行-第118行
```javascript
            const response = await axios.post('https://www.xihelin.com:15789/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000, // Add a timeout limit for axios request. 5000ms in this case

            });
```
## my-app/src/Login.js
### 第17行-第27行
```javascript
        try {
            const response = await axios.post('https://www.xihelin.com:15789/user/login', { username, password });
            if (response.data.success) {
                onLogin();
                setCookie('username', response.data.name, { path: '/' });  // 登录成功后，设置username cookie
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
        }
```
## admin-app/src/App.js
### 第22行
```javascript
        const response = await axios.get('https://www.xihelin.com:15789/data', { withCredentials: true });
```
### 第40行-第42行
```javascript
      await axios.delete(`https://www.xihelin.com:15789/data/${id}`, { withCredentials: true });
      // Then fetch data again after delete to keep the list updated
      const response = await axios.get('https://www.xihelin.com:15789/data', { withCredentials: true });
```
### 第104行
```javascript
      const response = await axios.get('https://www.xihelin.com:15789/users', { withCredentials: true });
```
### 第118行
```javascript
      await axios.delete(`https://www.xihelin.com:15789/user/${id}`);
```
### 第129行
```javascript
      await axios.post('https://www.xihelin.com:15789/user/create', newUser);
```

将上面的链接修改为自己的域名和转发的端口


# 从build运行(需要设置相同的nginx端口转发规则设置，域名也要一样，适合编译好之后在同一服务器运行，第一次搭建可以忽略这一个步骤)
安装serve来运行build文件夹
```shell
npm install -g serve
```
对两个文件夹中的build文件夹，使用命令：
```shell
serve -s my-app/build -l 3000
```
和
```shell
serve -s admin-app/build -l 3001
```
仍然要手动运行后端文件server.js和imageServer.js
```shell
cd my-app/src
node server.js
node imageServer.js
```

[关于从build运行，与ChatGPT对话链接](https://chat.openai.com/share/89b5e0d3-c413-4c18-baa6-dbc70303b377)
