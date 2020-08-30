/**
 * 
 * 经典的小游戏俄罗斯方块
 * 游戏核心处理逻辑
 * 该代码由其作者applelee公开
 * 任何人或机构可以随意使用，但任何使用该代码产生的后果，作者不负任何责任
 * 
 * 版本2020-08-30
*/

(function (w) {
  // 可配置信息
  let options = {
    // 场景尺寸
    screenSize: [11, 17],
    // 心跳间隔（可作为难度依据）
    intervals: 1000,
  };

  // 场景尺寸
  let screenSize, intervals;
  
  // 游戏状态 0初始化，1准备，2开始，3结束
  let status = 0;
  // 场景信息
  let screenMap = new Map();
  // 暂停
  let isPause = true;
  // 当前方块
  let currentShapData = null;
  // 下一个方块
  let nextShapData = null
  // 当前方块类型索引
  let currentShapIndex = '';
  // 下一个方块类型索引
  let nextShapIndex = '';
  // 当前方块矢量
  let currentShapVector = [0, 0];
  // 当前方块变化状态
  let currentShapStatus = 0;
  // 方块默认变化装填
  let defaultShapStatus = 0;
  // 静止方块集合
  let stillShaps = new Set();
  // 背景type
  let BG = 'bg';
  // 消几行方块
  let score = 0;
  // 心跳监听回调函数
  let updateCB = () => {};

  // 方块类型索引
  let shapIndexs = ['I', 'L', 'J', 'Z', 'S', 'T', 'O'];
  // 方块与其变化数据
  let shapDatas = {
    'I': [
      [[0,0],[1,0],[2,0],[3,0]],
      [[1,-1],[1,0],[1,1],[1,2]],
    ],
    'L':[
      [[0,0],[1,0],[2,0],[0,1]],
      [[0,0],[1,0],[1,1],[1,2]],
      [[2,0],[0,1],[1,1],[2,1]],
      [[0,0],[0,1],[0,2],[1,2]],
    ],
    'J':[
      [[0,0],[1,0],[2,0],[2,1]],
      [[1,0],[1,1],[1,2],[0,2]],
      [[0,0],[0,1],[1,1],[2,1]],
      [[0,0],[1,0],[0,1],[0,2]],
    ],
    'Z':[
      [[0,0],[1,0],[1,1],[2,1]],
      [[1,0],[1,1],[0,1],[0,2]],
    ],
    'S':[
      [[1,0],[2,0],[0,1],[1,1]],
      [[0,0],[0,1],[1,1],[1,2]],
    ],
    'T':[
      [[0,0],[1,0],[2,0],[1,1]],
      [[1,-1],[1,0],[1,1],[0,0]],
      [[0,0],[1,0],[2,0],[1,-1]],
      [[1,-1],[1,0],[1,1],[2,0]],
    ],
    'O':[
      [[1,0],[2,0],[1,1],[2,1]],
    ],
  };

  const TetrisJS = function (opt = {}) {
    init(opt);
  }

  // 工厂函数
  TetrisJS.create = (opt = {}) => {
    return new TetrisJS(opt);
  }

  TetrisJS.prototype = {
    // 返回游戏渲染数据
    get map () {
      return screenMap;
    },
    // 返回游戏状态
    get status () {
      return status;
    },
    // 返回消了多少层（得分）
    get score () {
      return score;
    },
    // 返回以一个方块
    get nextShap () {
      return {
        type: nextShapIndex,
        shapData: nextShapData[defaultShapStatus],
      }
    },
  }

  // 开始前准备
  TetrisJS.prototype.ready = function () {
    if (status === 0) {
      // 创建场景
      createScreen();
      // 设置方块
      addShapToScreen();
      
      status = 1;
    }
  }
  
  // 游戏开始方法
  TetrisJS.prototype.play = function () {
    if (status === 1) {
      status = 2;
    }

    if (isPause) {
      isPause = false;
      heartbeat();
    }
  }

  // 游戏暂停方法
  TetrisJS.prototype.pause = function () {
    isPause = true;
  }

  // 游戏暂停方法
  TetrisJS.prototype.over = function () {
    status = 3;
  }

  // 再次游戏
  TetrisJS.prototype.again = function (opt = {}) {
    init(opt);

    // 准备阶段
    this.ready();
  }

  // 游戏每次心跳监听方法
  TetrisJS.prototype.update = function (cb) {
    updateCB = cb;
  }

  // 动作
  TetrisJS.prototype.action = function (name) {
    const [x, y] = currentShapVector;
    
    if (status !== 2 || isPause) return;

    if (name === 'left') shapMove([x - 1, y]);
    else if (name === 'right') shapMove([x + 1, y]);
    else if (name === 'lower') shapMove([x, y + 1], true);
    else if (name === 'change') changeShapStatus();
  }

  // 初始化
  const init = (opt = {}) => {
    options = {
      ...options,
      ...opt,
    };

    screenSize = options.screenSize;
    intervals = options.intervals;

    currentShapVector = [0, 0];
    stillShaps = new Set();
    status = 0;
    score = 0;
    isPause = true;
    
    // 下一个方块数据
    const { datas, index } = getShapData();
    nextShapData = datas;
    nextShapIndex = index;
  }

  // 创建场景
  const createScreen = () => {
    const [width, height] = screenSize;

    for (let i = 0; i < height; i ++) {
      for (let j = 0; j < width; j ++) {
        const vector = [j, i];
        screenMap.set(vectorTransformString(vector), {
          type: BG,
          vector: vector,
        });
      }
    }
  }

  // 加入方块到场景
  const addShapToScreen = () => {
    const [width] = screenSize;

    currentShapData = nextShapData;
    currentShapIndex = nextShapIndex;
    // 设置当前方块状态
    currentShapStatus = 0;
    // 设置当前方块开始位置
    currentShapVector = [Math.floor(width/2) - (((width & 1) === 0) && currentShapIndex === 'I' ? 2 : 1), 0];

    // 将当前方块加入到场景中
    const shapStatusData = correctShapData(currentShapVector);
    shapRefresh(shapStatusData, currentShapIndex, false);

    const { datas, index } = getShapData();
    nextShapData = datas;
    nextShapIndex = index;

    // 判断游戏是否失败
    if (isGameOver(shapStatusData)) {
      status = 3;
    }

    // 更新场景
    updateCB();
  }

  // 心跳函数
  const heartbeat = () => {
    if (isPause || status === 3) return;

    // 方块下降
    if (status === 2) {
      const [x, y] = currentShapVector;
      shapMove([x, y + 1], true);
    }

    setTimeout(() => {
      heartbeat();
    }, intervals);
  }

  //随机方块索引
  const getShapData = () => {
    const randomNum = (Math.random() * shapIndexs.length) << 0;
    const index = shapIndexs[randomNum];
    return {
      index,
      datas: shapDatas[index],
    }
  }

  // 方块移动
  const shapMove = ([X, Y], isLower = false) => {
    const [, y] = currentShapVector;
    const shapStatusData = correctShapData([X, Y]);

    // 判断方块是否静止
    if (isLower === true && isShapDead([X, Y])) {
      // 消方块
      fireShapRow();
      // 添加新方块
      addShapToScreen();
      return;
    }

    // 判断能否移动
    if (isOverFlow(shapStatusData) || isShapHit(shapStatusData)) return;

    // 更新方块位置
    shapUpdate([X, Y]);
  }

  // 更新方块位置
  const shapUpdate = vector => {
    let shapStatusData = correctShapData(currentShapVector);
    // 清楚方块原位置信息
    shapRefresh(shapStatusData, BG);
    shapStatusData = correctShapData(vector);
    // 更新方块新位置信息
    shapRefresh(shapStatusData, currentShapIndex);
    currentShapVector = vector;
    updateCB();
  }

  // 修正方块数据
  const correctShapData = ([X, Y], status = currentShapStatus) => {
    return currentShapData[status].map(([x, y]) => [x + X, y + Y]);
  }
  
  // 方块数据写入场景
  const shapRefresh = (data, type, isRefresh = true) => {
    data.forEach(vector => {
      const key = vectorTransformString(vector);
      
      // 不覆盖其它方块
      if (!isRefresh && screenMap.get(key).type !== BG) return;

      screenMap.set(key, {
        type,
        vector,
      });
    });
  }

  // 消除满足整行条件的方块
  const fireShapRow = () => {
    // 获取整行方块的行号
    const fullRow = getFullRow();

    // 消方块并填补消失方块的位置
    shapComplement(fullRow);
  }

  // 获取整行方块的场景信息
  const getFullRow = () => {
    const [width, height] = screenSize;
    const row = [];

    for (let i = height - 1; i >= 0; i --) {
      let isFull = true;
      for (let j = 0; j < width; j ++) {
        const data = screenMap.get(vectorTransformString([j, i]));
        if (data.type === BG) {
          isFull = false;
          break;
        }
      }
      if (isFull) row.push(i);
    }
    score += row.length;
    return row;
  }

  // 消除方块
  // const fireShaps = row => {
  //   const [width] = screenSize;
  //   row.forEach(r => {
  //     for (let c = 0; c < width; c ++) {
  //       const key = vectorTransformString([c, r]);
  //       screenMap.set(key, {
  //         type: BG,
  //         vector: [c, r],
  //       });
  //       stillShaps.delete(key);
  //     }
  //   })
  // }

  // 方块补位
  const shapComplement = row => {
    const [col] = screenSize;
    const ascRow = ascOrder([...row]);

    ascRow.forEach(r => {
      for (let i = r; i >= 0; i --) {
        for (let j = 0; j < col; j ++) {
          // 消方块
          if (i === r) {
            const key = vectorTransformString([j, i]);
            screenMap.set(key, {
              type: BG,
              vector: [j, i],
            });
            stillShaps.delete(key);
            continue;
          }

          const key = vectorTransformString([j, i]);
          const newKey = vectorTransformString([j, i + 1]);
          const grid = screenMap.get(key);
          const newGrid = screenMap.get(newKey);

          if (grid.type !== BG && newGrid.type === BG) {
            screenMap.set(key, {
              type: BG,
              vector: [j, i],
            });
            screenMap.set(newKey, {
              type: grid.type,
              vector: [j, i + 1],
            });
            stillShaps.delete(key);
            stillShaps.add(newKey);
          }
        }
      }
    });
  }

  // 改变当前方块状态
  const changeShapStatus = () => {
    const len = currentShapData.length;
    const tempStatus = (currentShapStatus + 1) % len;
    const tempStatusData = correctShapData(currentShapVector, tempStatus);

    if (isOverFlow(tempStatusData) || isShapHit(tempStatusData)) return;
    shapRefresh(correctShapData(currentShapVector), BG);
    shapRefresh(tempStatusData, currentShapIndex);
    currentShapStatus = tempStatus;
    // 强制渲染
    updateCB();
  }

  // 方块是否停止
  const isShapDead = vector => {
    const shapStatusData = correctShapData(vector);
    if (isOverFlow(shapStatusData) || isShapHit(shapStatusData)) {
      const currentShapStatusData = correctShapData(currentShapVector).map(v => vectorTransformString(v));
      stillShaps = new Set([...stillShaps, ...currentShapStatusData])
      return true;
    };
    return false;
  }

  // 是否溢出场景
  const isOverFlow = vectors => {
    const [width, height] = screenSize;
    return vectors.some(([x, y]) => {
      return x < 0 || x >= width || y >= height;
    });
  }

  // 是否发生碰撞
  const isShapHit = vectors => {
    return vectors.some(v => stillShaps.has(vectorTransformString(v)));
  }

  // 游戏是否失败
  const isGameOver = data => {
    const [, y] = currentShapVector;

    if (y <= 0 && isShapHit(data)) {
      return true;
    }
    return false;
  }

  // 升序数组
  const ascOrder = (sa, na = []) => {
    if (sa.length <= 0) return na;

    const maxNum = Math.min(...sa)
    const ind = sa.indexOf(maxNum)
    na.push(sa.splice(ind, 1)[0])

    return ascOrder(sa, na)
}

  // 缓动函数
  const fade = t => {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  // 矢量转换成字符串
  const vectorTransformString = ([x, y]) => `${x}_${y}`;

  // 字符串转还原成矢量
  const stringTransformVector = str => {
    const [x, y] = str.split('_');
    return [Number(x), Number(y)];
  };

  w.TetrisJS = TetrisJS;
})(window);
