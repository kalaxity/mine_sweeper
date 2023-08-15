import { useState } from 'react';
import './App.css';

function App() {
  const values: Record<string, number> = {
    width: 7,
    height: 7,
    bomb: 7
  };

  /**
   * 指定された寸法・爆弾数の盤面に変更する関数
   * @param e formから渡されるイベント（型不明）
   */
  const boardChangeHandler = (e: any) => { // 型がわからん．FormEventだと思ってたんだが…
    e.preventDefault();
    const form: HTMLFormElement = e.target;
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      values[key] = parseInt(value as string); // HACK: 型アサーションしたら動いた．なぜエラー出てたかは不明
    });
  }

  return (
    <div className="App">
      <header className='title'>💣Mine Sweeper💣</header>
      <Board width={values["width"]} height={values["height"]} bombCount={values["bomb"]} />
      <form onSubmit={boardChangeHandler}>
        <input name='width' type='number' defaultValue='7' min={3} max={1000} />
        <input name='height' type='number' defaultValue='7' min={3} max={1000} />
        <input name='bomb' type='number' defaultValue='7' min={1} max={(values["width"] * values["height"] > values["bomb"]) ? values["bomb"] : values["width"] * values["height"] - 1} />
        <input type='submit' value='変更！' />
      </form>
      <footer>
        右クリック（スマホの場合は長押し）でフラグを立てられます．<br />
        消す場合も同様です．
      </footer>
    </div>
  );
}


// ============ Cell ============
type CellProps = {
  value: number,
  isOpened: boolean,
  existsFlag: boolean,
  onClick: React.MouseEventHandler,
  onRightClick: React.MouseEventHandler,
}

const Cell = (props: CellProps) => {
  const style = props.isOpened ? {} : { backgroundColor: "#6f6f6f" }

  let content: string = "";
  if (!props.isOpened) {
    if (props.existsFlag) content = "🚩";
    else content = "";
  } else {
    if (props.value === -1) content = "💣";
    else if (props.value === 0) content = "";
    else content = props.value.toString();
  }

  return (
    <button className='cell' onClick={props.onClick} onContextMenu={(e) => { e.preventDefault(); props.onRightClick(e); }} style={style}>{content}</button>
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
  const [cells, setCells] = useState(Array(numberOfCells).fill(null));
  const [isGameOver, setIsGameOver] = useState(false);
  const [existsFlag, setExistsFlag] = useState(Array(numberOfCells).fill(false));

  const dim1ToDim2 = (index: number): Array<number> => [index % props.width, Math.floor(index / props.width)];
  const dim2ToDim1 = (x: number, y: number): number => (y * props.width + x);

  const makeBoard = (openedCellIndex: number): Array<number> => {
    let bombs: Array<number> = Array(numberOfCells).fill(0);
    const randomInts: Array<number> = makeRandomInts(0, numberOfCells, props.bombCount);
    for (let i of randomInts) {
      // 開封セルに爆弾が置かれないようにする
      if (i === openedCellIndex) continue;
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

  const handleRightClick = (i: number) => {
    if (isCellsOpened[i]) return;
    const tmp = existsFlag.slice();
    tmp[i] = !tmp[i];
    setExistsFlag(tmp);
  }

  const handleClick = (clickedCellIndex: number) => {
    if (isGameOver || existsFlag[clickedCellIndex]) return;
    const _isCellsOpened: Array<boolean> = isCellsOpened.slice();
    _isCellsOpened[clickedCellIndex] = true; // setState()は変更をリクエストするだけなので即時更新はされない．なのでまとめてsetしたほうがいい

    let _cells: Array<number> = cells.slice();

    // 1. 初回クリック時 → 盤面作成
    if (isCellsOpened.filter(c => c === true).length === 0) {
      _cells = makeBoard(clickedCellIndex);
      setCells(_cells);
    }

    // 2. クリックしたセルが空白でない場合
    if (_cells[clickedCellIndex] !== 0) {
      setIsCellsOpened(_isCellsOpened);
      if (_cells[clickedCellIndex] === -1) {
        setIsGameOver(true);
        loseGame();
      } else if (_isCellsOpened.filter(c => c === false).length <= props.bombCount) {
        setIsGameOver(true);
        winGame();
      }
      return;
    }

    // 3. クリックしたセルが空白の場合 → 幅優先探索を用いて空白セルを連鎖的に消していく
    const cellQueue: Array<number> = [clickedCellIndex];
    while (cellQueue.length > 0) {
      const idx: number = cellQueue.shift() as number;
      // if (idx === undefined) break;
      const [x, y] = dim1ToDim2(idx);
      for (const dy of [-1, 0, 1]) {
        for (const dx of [-1, 0, 1]) {
          if (x + dx < 0 || props.width <= x + dx || y + dy < 0 || props.height <= y + dy) continue;
          const idx_around: number = dim2ToDim1(x + dx, y + dy);
          if (idx === idx_around || _isCellsOpened[idx_around]) continue;
          _isCellsOpened[idx_around] = true;
          if (_cells[idx_around] === 0) cellQueue.push(idx_around);
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
          <Cell value={cells[idx]} isOpened={isCellsOpened[idx]} existsFlag={existsFlag[idx]} onClick={() => handleClick(idx)} onRightClick={() => handleRightClick(idx)} key={idx} />
        );
      }
      ret.push(<div className='row' key={i}>{cellList}</div>);
    }
    return ret;
  }

  return (
    <>
      <header className="App-header">
        爆弾数：{props.bombCount} / 残りセル数：{isCellsOpened.filter(c => c === false).length}
      </header>
      <div className='board'>
        {render()}
      </div>
    </>
  )
}

const loseGame = () => {
  alert("game over");
}

const winGame = () => {
  alert("game clear!");
}

export default App;
