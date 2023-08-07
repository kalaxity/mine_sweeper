import { useState } from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Cell value="o" />
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

export default App;
