const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const playerEl = document.getElementById('player');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('reset');
const aiToggle = document.getElementById('aiToggle');

let board = Array(9).fill('');
let current = 'X';
let running = true;
let vsAI = false;

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function updateStatus(text){
  messageEl.textContent = text || '';
}

function checkWinner(){
  for(const [a,b,c] of wins){
    if(board[a] && board[a] === board[b] && board[a] === board[c]){
      return board[a];
    }
  }
  if(board.every(Boolean)) return 'draw';
  return null;
}

function handleMove(i){
  if(!running || board[i]) return;
  board[i] = current;
  render();
  const result = checkWinner();
  if(result){
    running = false;
    if(result === 'draw') updateStatus('Pareggio!');
    else updateStatus(`Ha vinto ${result}!`);
    return;
  }
  current = current === 'X' ? 'O' : 'X';
  playerEl.textContent = current;
  updateStatus(`Turno di ${current}`);
  if(vsAI && current === 'O'){
    setTimeout(aiMove, 350);
  }
}

function aiMove(){
  // semplice AI: prima cella libera o blocco/vittoria naive
  // controlla se può vincere
  for(let i=0;i<9;i++){
    if(!board[i]){
      board[i] = 'O';
      if(checkWinner() === 'O') return renderAfterAI();
      board[i] = '';
    }
  }
  // blocca X
  for(let i=0;i<9;i++){
    if(!board[i]){
      board[i] = 'X';
      if(checkWinner() === 'X'){
        board[i] = 'O';
        return renderAfterAI();
      }
      board[i] = '';
    }
  }
  // altrimenti scegli una casella a caso
  const empties = board.map((v,i)=> v?null:i).filter(v=>v!==null);
  if(empties.length){
    const choice = empties[Math.floor(Math.random()*empties.length)];
    board[choice] = 'O';
  }
  renderAfterAI();
}

function renderAfterAI(){
  render();
  const result = checkWinner();
  if(result){
    running = false;
    if(result === 'draw') updateStatus('Pareggio!');
    else updateStatus(`Ha vinto ${result}!`);
    return;
  }
  current = 'X';
  playerEl.textContent = current;
  updateStatus(`Turno di ${current}`);
}

function render(){
  cells.forEach((cell, i)=>{
    cell.textContent = board[i];
    cell.disabled = !!board[i] || !running;
  });
}

cells.forEach((cell, i)=>{
  cell.addEventListener('click', ()=> handleMove(i));
});

resetBtn.addEventListener('click', ()=>{
  board = Array(9).fill('');
  current = 'X';
  running = true;
  playerEl.textContent = current;
  updateStatus('Turno di X');
  render();
});

aiToggle.addEventListener('click', ()=>{
  vsAI = !vsAI;
  aiToggle.textContent = vsAI ? 'Gioca vs CPU (on)' : 'Gioca vs CPU (off)';
  // reset partita quando si cambia modalità
  resetBtn.click();
});

// init
updateStatus('Turno di X');
render();
