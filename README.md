# 说明

html + js 实现最质朴的俄罗斯方块游戏。<br/>

## DEMO运行起来
example/tetris.html 文件扔浏览器<br/>

## 引入TetrisJs

### 引用
```javascript
<script src='../lib/TetrisJS.js'></script>
```

## AstarPath API

### 创建实例 instance
__new TetrisJS(options)__
```javascript
  var TJS = new TetrisJS({
    screenSize: [col, row],
    intervals: 1000,
  })
```
or<br/>
__TetrisJS.create(options)__
```javascript
  var TJS = TetrisJS.create({
    screenSize: [col, row],
    intervals: 1000,
  })
```  

### 实例的属性 property  
#### instance.map Map
游戏渲染数据，渲染层可依据此数据渲染出游戏洁面
```javascript
  TJS.map
```  

#### instance.status Number
游戏运行状态
```javascript
  // 0 游戏初始化状态
  // 1 游戏准备状态
  // 2 游戏中
  // 3 游戏结束
  TJS.status
```  

#### instance.score Number
游戏得分
```javascript
  TJS.score
```  

#### instance.nextShap Object
下一次将会出现的方块数据
```javascript
  // type 方快类型
  // shapData 方块当前状态的数据
  const { type, shapData } = TJS.nextShap
```  

### 实例的方法 method
#### instance.ready void
进入游戏准备状态
```javascript
  TJS.ready()
```  

#### instance.play void
进入游戏中状态
```javascript
  TJS.play()
```  

#### instance.pause void
暂停游戏（依然是游戏中的状态）
```javascript
  TJS.pause()
```  

#### instance.pause void
游戏结束或失败状态
```javascript
  TJS.over()
```  

#### instance.again void
重新游戏（进入准备状态）
```javascript
  TJS.again()
```  

#### instance.again void
用户动作输入
```javascript
  /** 
   * left 左移动
   * right 右移动
   * lower 下移动
   * change 旋转方块
   * @param {string} action 用户动作枚举
  */
  TJS.action('left')
```  

#### instance.update void
监听渲染请求
```javascript
  /** 
   * @param {function} callback 回调函数
  */
  TJS.update(() => {
    // 对游戏进行渲染
  })
```  

### options配置及初始值
```javascript
  // 可配置信息
  let options = {
    // 场景尺寸
    screenSize: [11, 17],
    // 心跳间隔（可作为难度依据）
    intervals: 1000,
  };
```  

# License
__MIT__
