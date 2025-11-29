const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const playerEl = document.getElementById('player');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('reset');
const aiToggle = document.getElementById('aiToggle');
const difficultySelect = document.getElementById('difficulty');

let board = Array(9).fill('');
let current = 'X';
let running = true;
let vsAI = false;
let difficulty = difficultySelect ? difficultySelect.value : 'medium';

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
  if(difficulty === 'easy') return easyAI();
  if(difficulty === 'medium') return mediumAI();
  return hardAI();
}

function easyAI(){
  const empties = board.map((v,i)=> v?null:i).filter(v=>v!==null);
  if(empties.length){
    const choice = empties[Math.floor(Math.random()*empties.length)];
    board[choice] = 'O';
  }
  renderAfterAI();
}

function mediumAI(){
  // prova a vincere
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
  // preferisci centro
  if(!board[4]){ board[4] = 'O'; return renderAfterAI(); }
  // poi angoli
  const corners = [0,2,6,8].filter(i=>!board[i]);
  if(corners.length){ board[corners[Math.floor(Math.random()*corners.length)]] = 'O'; return renderAfterAI(); }
  // altrimenti una qualunque
  easyAI();
}

function hardAI(){
  // Minimax per giocare ottimamente
  const best = minimax(board.slice(), 'O');
  if(best.index !== undefined && !board[best.index]) board[best.index] = 'O';
  renderAfterAI();
}

function minimax(newBoard, player){
  const avail = newBoard.map((v,i)=> v?null:i).filter(v=>v!==null);
  const winner = checkWinnerStatic(newBoard);
  if(winner === 'O') return {score: 10};
  if(winner === 'X') return {score: -10};
  if(avail.length === 0) return {score: 0};

  const moves = [];
  for(const i of avail){
    const move = {};
    move.index = i;
    newBoard[i] = player;
    if(player === 'O'){
      const result = minimax(newBoard, 'X');
      move.score = result.score;
    } else {
      const result = minimax(newBoard, 'O');
      move.score = result.score;
    }
    newBoard[i] = '';
    moves.push(move);
  }

  let bestMove;
  if(player === 'O'){
    let bestScore = -Infinity;
    for(const m of moves){ if(m.score > bestScore){ bestScore = m.score; bestMove = m; } }
  } else {
    let bestScore = Infinity;
    for(const m of moves){ if(m.score < bestScore){ bestScore = m.score; bestMove = m; } }
  }
  return bestMove;
}

function checkWinnerStatic(b){
  for(const [a,b1,c] of wins){
    if(b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  return null;
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

if(difficultySelect){
  difficultySelect.addEventListener('change', (e)=>{
    difficulty = e.target.value;
  });
}

// init
updateStatus('Turno di X');
render();
