const cols = 15; 
const rows = 12; 
const board = document.getElementById("board");

let jackPos = null; 
let kinemonPos = null; 
let currentPlayer = "jack"; 
let jackHealth = 100;
let kinemonHealth = 100;
let jackWeaponDamage = 10;
let kinemonWeaponDamage = 10;
let isDefending = {jack: false, kinemon: false};


//Générer une pos aléatoire
function generateRandomPos() {
  return {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows),
  };
}

//Verif pos identiques/adjacentes
function verifyPos(pos1,pos2)
{
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return (dx === 0 && dy === 0) || (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

function isSamePos(pos1, pos2) {
    return pos1 && pos2 && pos1.x === pos2.x && pos1.y === pos2.y;
}

function areAdjacent() {
    return verifyPos(jackPos, kinemonPos) && !isSamePos(jackPos, kinemonPos);
  }

//Attribuer pos aléatoire
function placeRandomly() {
    let randomPos = generateRandomPos(); 
    jackPos = randomPos; 
    do {
        randomPos = generateRandomPos();
    } while (verifyPos(randomPos, jackPos));
        kinemonPos = randomPos;
}

function startCombat(attacker)
{
    const combatPanel = document.getElementById("combat-panel");
    combatPanel.style.display = "block";
    
    const attackBtn = document.getElementById("attack-btn");
    const defendBtn = document.getElementById("defend-btn");
    const combatLog = document.getElementById("combat-log");

    combatLog.textContent = `${attacker} commence le combat !`;

    let currentAttacker = attacker;
    let currentDefender = currentAttacker === "jack" ? "kinemon" : "jack";

    attackBtn.onclick = () => {
        const damage = currentAttacker === "jack" ? jackWeaponDamage : kinemonWeaponDamage;
        if(isDefending[currentDefender])
        {
            combatLog.textContent = `${currentDefender} a bloqué l'attaque de ${currentAttacker}!`;
            isDefending[currentDefender] = false;
        }else{
            if(currentDefender === "jack") jackHealth -= damage;
            combatLog.textContent = `${currentAttacker} inflige ${damage} points de dégâts à ${currentDefender} !`;
        }
        checkVictory();
        switchTurn();
    };
}

function switchTurn()
{
    [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
}


function checkVictory()
{
    if(jackHealth <=0 || kinemonHealth <= 0)
    {
        const winner = jackHealth > 0 ? "Jack" : "Kinemon";
        showWinner(winner);
    }
}

function showWinner()
{
    const combatPanel = document.getElementById("combat-panel");
    const restartPanel = document.getElementById("restart-panel");
    const winnerMessage = document.getElementById("winner-message");

    combatPanel.style.display ="none";
    restartPanel.style.display = "block";
    winnerMessage.textContent = `${winner} a gagné !`;
}

function restartGame()
{
    const restartPanel = document.getElementById("restart-panel");
    restartPanel.style.display = "none";
    jackHealth = 100;
    kinemonHealth = 100;
    isDefending = { jack: false, kinemon: false };
    placeRandomly();
    renderBoard();
    highlightValidMoves(currentPlayer);
}


function highlightValidMoves(character) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => cell.classList.remove("valid")); //garder que les cases du joueur en cours
  
    const characterPos = character === "jack" ? jackPos : kinemonPos;
  
    //Directions haut, bas, gauche, droite
    const directions = [
      { dx: 0, dy: -1 }, //haut
      { dx: 0, dy: 1 },  //bas
      { dx: -1, dy: 0 }, //gauche
      { dx: 1, dy: 0 },  //droite
    ];
  
    directions.forEach(({ dx, dy }) => { //parcourir cases dispo
      for (let step = 1; step <= 3; step++) {
        const newX = characterPos.x + dx * step;
        const newY = characterPos.y + dy * step;
  
        //Vérif limite grille et cases occupées
        if (newX >= 0 && newX < cols &&   //limite grille en x
            newY >= 0 &&newY < rows &&    //limite grille en y
            !(newX === jackPos.x && newY === jackPos.y) &&  //pas occupée par jack
            !(newX === kinemonPos.x && newY === kinemonPos.y)   //pas occupée par jack
        ) {
          const cell = Array.from(cells).find(
            (c) => parseInt(c.dataset.x) === newX && parseInt(c.dataset.y) === newY);
          if (cell) {
            cell.classList.add("valid");
            cell.addEventListener("click", () => moveCharacter(character, newX, newY));
          }
        } else {
          break; //stop la direction si case pas valide
        }
      }
    });
}
  
function moveCharacter(character, x, y) {
    if (character === "jack") {
      jackPos = { x, y };
    } else {
      kinemonPos = { x, y };
    }
  
    
    currentPlayer = currentPlayer === "jack" ? "kinemon" : "jack";
  
    //Afficher grille avec cases valides en surbrillance 
    renderBoard();
    highlightValidMoves(currentPlayer);
  }

//Génerer grille
function generateBoard() {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;

      if (x === jackPos.x && y === jackPos.y) {
        const JackIcon = document.createElement("img");
        JackIcon.src = "jack.png";
        JackIcon.alt = "Jack";
        JackIcon.classList.add("character-icon");
        cell.appendChild(JackIcon);
      }

      if (x === kinemonPos.x && y === kinemonPos.y) {
        const kinemonIcon = document.createElement("img");
        kinemonIcon.src = "kinemon.png";
        kinemonIcon.alt = "Kinemon";
        kinemonIcon.classList.add("character-icon");
        cell.appendChild(kinemonIcon);
      }

      board.appendChild(cell);
    }
  }
}

function updateStats() {
    document.getElementById("jack-position").textContent = `(${jackPos.y}, ${jackPos.x})`;
    document.getElementById("kinemon-position").textContent = `(${kinemonPos.y}, ${kinemonPos.x})`;
    document.getElementById("jack-health").textContent = jackHealth;
    document.getElementById("kinemon-health").textContent = kinemonHealth;
  }



//Affiche grille
function renderBoard() {
  generateBoard();
  updateStats();
  if(areAdjacent())
    {
        startCombat(currentPlayer);
    }else{
        highlightValidMoves(currentPlayer);
    }
}


//Initialisation
document.getElementById("restart-btn").addEventListener("click", () => restartGame);
placeRandomly();
renderBoard();
highlightValidMoves();
