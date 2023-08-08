import { useState } from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Board width={3} height={3} />
      </header>
    </div>
  );
}

// ====== Cell ======
type CellProps = {
  value: string,
  onClick: React.MouseEventHandler // これでいい？
}

const Cell = (props: CellProps) => {
  return (
    <button className='cell' onClick={props.onClick}>{props.value}</button>
  )
}

// ====== Board ======
type BoardProps = {
  width: number,
  height: number
}

const Board = (props: BoardProps) => {
  const numberOfCells: number = props.height * props.height;
  // 数字(1~)と爆弾(-1)と虚無(0)をstateで管理して，開封状況をisCellsOpenedで管理したほうがよさそう
  const [isCellsOpened, setIsCellsOpened] = useState([Array(numberOfCells).fill(false)]);
  const [cells, setCells] = useState([Array(numberOfCells).fill(0)]);

  const handleClick = (i: number) => {
    alert("[test] " + i + " pushed!");
  }

  return (
    <div className='column'>
      <div className='row'>
        <Cell value='0' onClick={() => handleClick(0)} />
        <Cell value='0' onClick={() => handleClick(1)} />
        <Cell value='0' onClick={() => handleClick(2)} />
      </div>
      <div className='row'>
        <Cell value='0' onClick={() => handleClick(3)} />
        <Cell value='0' onClick={() => handleClick(4)} />
        <Cell value='0' onClick={() => handleClick(5)} />
      </div>
      <div className='row'>
        <Cell value='0' onClick={() => handleClick(6)} />
        <Cell value='0' onClick={() => handleClick(7)} />
        <Cell value='0' onClick={() => handleClick(8)} />
      </div>
    </div>
  )
}

export default App;
