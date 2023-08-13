import { useState } from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Board width={3} height={3} bombCount={2} />
      </header>
    </div>
  );
}

// ====== Cell ======
type CellProps = {
  value: number,
  isOpened: boolean,
  onClick: React.MouseEventHandler // これでいい？
}

const Cell = (props: CellProps) => {
  const display = (props: CellProps): string => {
    // 開封前
    if (!props.isOpened) return "▓"; // 開ける前は灰色になっている

    // 開封後
    if (props.value === -1) return "💣";
    if (props.value === 0) return "";
    return props.value.toString();
  }

  return (
    <button className='cell' onClick={props.onClick}>{display(props)}</button>
  )
}

// ====== Board ======
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
  // 数字(1~)と爆弾(-1)と虚無(0)をstateで管理して，開封状況をisCellsOpenedで管理したほうがよさそう
  const [isCellsOpened, setIsCellsOpened] = useState(Array(numberOfCells).fill(false));

  const dim1ToDim2 = (index: number): Array<number> => {
    return [Math.floor(index / props.width), index % props.width];
  }

  const dim2ToDim1 = (x: number, y: number): number => {
    return x * props.width + y;
  }

  const makeBoard = () => {
    // set bomb and number
    let bombs: Array<number> = Array(numberOfCells).fill(0);
    const randomInts: Array<number> = makeRandomInts(0, numberOfCells, props.bombCount);
    for (let i of randomInts) {
      // set bomb
      bombs[i] = -1;

      // set number
      const [x, y] = dim1ToDim2(i);
      for (const dx of [-1, 0, 1]) {
        for (const dy of [-1, 0, 1]) {
          if (x + dx < 0 || x + dx >= props.width || y + dy < 0 || y + dy >= props.height) continue;
          const idx = dim2ToDim1(x + dx, y + dy);
          if (bombs[idx] === -1) continue;
          ++bombs[idx];
        }
      }
    }
    return bombs;
  }
  const [cells, setCells] = useState(makeBoard());

  const handleClick = (i: number) => {
    const tmp = isCellsOpened.slice();
    tmp[i] = true;
    setIsCellsOpened(tmp);

    if (cells[i] === -1) finishGame();
  }

  return (
    <div className='column'>
      <div className='row'>
        <Cell value={cells[0]} isOpened={isCellsOpened[0]} onClick={() => handleClick(0)} />
        <Cell value={cells[1]} isOpened={isCellsOpened[1]} onClick={() => handleClick(1)} />
        <Cell value={cells[2]} isOpened={isCellsOpened[2]} onClick={() => handleClick(2)} />
      </div>
      <div className='row'>
        <Cell value={cells[3]} isOpened={isCellsOpened[3]} onClick={() => handleClick(3)} />
        <Cell value={cells[4]} isOpened={isCellsOpened[4]} onClick={() => handleClick(4)} />
        <Cell value={cells[5]} isOpened={isCellsOpened[5]} onClick={() => handleClick(5)} />
      </div>
      <div className='row'>
        <Cell value={cells[6]} isOpened={isCellsOpened[6]} onClick={() => handleClick(6)} />
        <Cell value={cells[7]} isOpened={isCellsOpened[7]} onClick={() => handleClick(7)} />
        <Cell value={cells[8]} isOpened={isCellsOpened[8]} onClick={() => handleClick(8)} />
      </div>
    </div>
  )
}

const finishGame = () => {
  alert("game over");
}

export default App;
