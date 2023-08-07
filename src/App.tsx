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
  value: string
}

const Cell = (props: CellProps) => {
  return (
    <button className='cell'>{props.value}</button>
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

  return (
    <div className='column'>
      <div className='row'>
        <Cell value='0' />
        <Cell value='0' />
        <Cell value='0' />
      </div>
      <div className='row'>
        <Cell value='0' />
        <Cell value='0' />
        <Cell value='0' />
      </div>
      <div className='row'>
        <Cell value='0' />
        <Cell value='0' />
        <Cell value='0' />
      </div>
    </div>
  )
}

export default App;
