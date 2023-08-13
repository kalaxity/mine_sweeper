import { useState } from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Board width={5} height={5} bombCount={3} />
      </header>
    </div>
  );
}


// ============ Cell ============
type CellProps = {
  value: number,
  isOpened: boolean,
  onClick: React.MouseEventHandler // これでいい？
}

const Cell = (props: CellProps) => {
  const style = props.isOpened ? {} : { backgroundColor: "#6f6f6f" }

  let content: string;
  if (!props.isOpened) content = "";
  else if (props.value === -1) content = "💣";
  else if (props.value === 0) content = "";
  else content = props.value.toString();

  return (
    <button className='cell' onClick={props.onClick} style={style}> {content}</button >
  )
}


// ============ Board ============
type BoardProps = {
  width: number,
  height: number,
  bombCount: number,
}

const makeRandomInts = (min: number, max: number, count: number): Array<number> => {
  const nums: Set<number> = new Set<number>();
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min)) + min);
  }
  return Array.from(nums);
}

const Board = (props: BoardProps) => {
  const numberOfCells: number = props.height * props.width;
  const [isCellsOpened, setIsCellsOpened] = useState(Array(numberOfCells).fill(false));
  const dim1ToDim2 = (index: number): Array<number> => [index % props.width, Math.floor(index / props.width)];
  const dim2ToDim1 = (x: number, y: number): number => (y * props.width + x);

  const makeBoard = (): Array<number> => {
    let bombs: Array<number> = Array(numberOfCells).fill(0);
    const randomInts: Array<number> = makeRandomInts(0, numberOfCells, props.bombCount);
    for (let i of randomInts) {
      // set bomb
      bombs[i] = -1;
      // set number
      const [x, y] = dim1ToDim2(i);
      for (const dy of [-1, 0, 1]) {
        for (const dx of [-1, 0, 1]) {
          if (x + dx < 0 || x + dx >= props.width || y + dy < 0 || y + dy >= props.height) continue;
          const idx = dim2ToDim1(x + dx, y + dy);
          if (bombs[idx] === -1) continue; // idx == i のケースもここで排除できる
          ++bombs[idx];
        }
      }
    }
    return bombs;
  }
  const [cells, setCells] = useState(makeBoard()); // stateの意味は現状薄いが，クリック後に盤面生成する場合は役立つかも？
  const [isGameOver, setIsGameOver] = useState(false);

  const handleClick = (i: number) => {
    if (isGameOver) return;
    const _isCellsOpened: Array<boolean> = isCellsOpened.slice();
    _isCellsOpened[i] = true; // setState()は変更をリクエストするだけなので即時更新はされない．なのでまとめてsetしたほうがいい
    if (cells[i] !== 0) {
      setIsCellsOpened(_isCellsOpened);
      if (cells[i] === -1) {
        setIsGameOver(true);
        loseGame();
      } else if (_isCellsOpened.filter(c => c == false).length <= props.bombCount) {
        setIsGameOver(true);
        winGame();
      }
      return;
    }

    // 幅優先探索を用いて空白セルを連鎖的に消していく
    const cellQueue: Array<number> = [i];
    while (cellQueue.length > 0) {
      const idx = cellQueue.shift();
      if (idx === undefined) break;
      const [x, y] = dim1ToDim2(idx);
      for (const dy of [-1, 0, 1]) {
        for (const dx of [-1, 0, 1]) {
          if (x + dx < 0 || props.width <= x + dx || y + dy < 0 || props.height <= y + dy) continue;
          const idx_around: number = dim2ToDim1(x + dx, y + dy);
          if (idx === idx_around || _isCellsOpened[idx_around]) continue;
          _isCellsOpened[idx_around] = true;
          if (cells[idx_around] === 0) cellQueue.push(idx_around);
        }
      }
    }
    setIsCellsOpened(_isCellsOpened);
  }

  const render = (): Array<any> => {
    let ret: Array<any> = [];
    for (let i = 0; i < props.height; ++i) {
      let cellList: Array<any> = [];
      for (let j = 0; j < props.width; ++j) {
        const idx: number = i * props.width + j;
        cellList.push(
          <Cell value={cells[idx]} isOpened={isCellsOpened[idx]} onClick={() => handleClick(idx)} key={idx} />
        );
      }
      ret.push(<div className='row' key={i}>{cellList}</div>);
    }
    return ret;
  }

  return (
    <div className='column'>
      {render()}
    </div>
  )
}

const loseGame = () => {
  alert("game over");
}

const winGame = () => {
  alert("game clear!");
}

export default App;
