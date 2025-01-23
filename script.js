const cols = 15; //Nombre de colonnes
const rows = 12; //Nombre de lignes
const board = document.getElementById("board");

const jack = {
  name: "Jack",
  image: "jack.png",
  position: { x:3 , y: 0 }, // Coin haut gauche
};

const kinemon = {
  name: "Kinemon",
  image: "kinemon.png",
  position: { x: 14, y: 11 }, // Coin bas droit
};

function generateRandomPos(){
  return{
    x: Math.floor(Math.random()*cols),
    y: Math.floor(Math.random()*rows),
  };
}

function verifyPos(pos1,pos2){
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  return dx <= 1 && dy <= 1;
}

let currentPlayer = jack; // Le joueur actif

// Générer la grille
function generateBoard() {
  board.innerHTML = "";
  board.style.gridTemplateColumns = 'repeat(${cols}, 1fr)';
  board.style.gridTemplateRows = 'repeat(${rows}, 1fr)';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      board.appendChild(cell);
    }
  }
}

// Placer un personnage
function placeCharacter(character) {

  const cells = document.querySelectorAll(".cell");
  const cell = Array.from(cells).find((c) => parseInt(c.dataset.x) === character.position.x && parseInt(c.dataset.y) === character.position.y);
  const icon = document.createElement("img");
  icon.src = character.image;
  icon.alt = character.name;
  icon.classList.add("character-icon");
  cell.appendChild(icon);
}

// Rendre les cases cliquables pour déplacement
function highlightValidMoves(character) {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => cell.classList.remove("valid"));

  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 3 && (dx === 0 || dy === 0)) {
        const newX = character.position.x + dx;
        const newY = character.position.y + dy;

        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
          const cell = Array.from(cells).find(
            (c) =>
              parseInt(c.dataset.x) === newX && parseInt(c.dataset.y) === newY
          );
          if (cell) {
            cell.classList.add("valid");
            cell.addEventListener("click", () => moveCharacter(character, newX, newY));
          }
        }
      }
    }
  }
}

// Déplacer un personnage
function moveCharacter(character, x, y) {
  character.position = { x, y };
  currentPlayer = currentPlayer === jack ? kinemon : jack; // Change le tour
  renderBoard();
}

// Mettre à jour les positions dans l'interface
function updateStats() {
  document.getElementById("jack-position").textContent = `(${jack.position.y}, ${jack.position.x})`;
  document.getElementById("kinemon-position").textContent = `(${kinemon.position.y}, ${kinemon.position.x})`;
}

// Rendre la grille
function renderBoard() {
  generateBoard();
  placeCharacter(jack);
  placeCharacter(kinemon);
  updateStats();
  highlightValidMoves(currentPlayer);
}

// Initialisation
renderBoard();
