const cols = 15; 
const rows = 12; 
const board = document.getElementById("board");

let jackPos = null; 
let kinemonPos = null; 
let currentPlayer = "kinemon"; 
let jackHealth = 100;
let kinemonHealth = 100;
let jackWeaponDamage = 10;
let kinemonWeaponDamage = 10;
let isDefending = {jack: false, kinemon: false};
let obstacles = [];
let weapons = []; 
const weaponTypes = [
  { name: "Shuriken", damage: 10, image: "shuriken.png" },
  { name: "Arc", damage: 15, image: "bow.png" },
  { name: "Massue", damage: 20, image: "massue.png" },
  { name: "Katana", damage: 25, image: "katana.png" },
  { name: "Double Lame", damage: 30, image: "double.png" },
];



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


function generateObstacles(count) {
  obstacles = []; 
  while (obstacles.length < count) {
    let newObstacle = generateRandomPos();

    if (
      !verifyPos(newObstacle, jackPos) &&
      !verifyPos(newObstacle, kinemonPos) &&
      !obstacles.some((obstacle) => verifyPos(newObstacle, obstacle))
    ) {
      obstacles.push(newObstacle);
    }
  }
}

function generateWeapons(maxWeapons = 4) {
  weapons = []; 

  while (weapons.length < maxWeapons) {
    let newWeaponPos = generateRandomPos();
   
    if (
      !weapons.some((weapon) => verifyPos(newWeaponPos, weapon.position)) &&
      !obstacles.some((obs) => isSamePos(newWeaponPos, obs)) &&
      !isSamePos(newWeaponPos, jackPos) &&
      !isSamePos(newWeaponPos, kinemonPos)
    ) {
      const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
      weapons.push({ ...weaponType, position: newWeaponPos });
    }
  }
}

function spawnNewWeapon() {
  let newWeaponPos;
  do {
    newWeaponPos = generateRandomPos();
  } while (
    weapons.some((weapon) => verifyPos(newWeaponPos, weapon.position)) || //as être adjacent à une autre arme
    obstacles.some((obs) => isSamePos(newWeaponPos, obs)) || //pas être sur un obstacle
    isSamePos(newWeaponPos, jackPos) || //pas être sur Jack
    isSamePos(newWeaponPos, kinemonPos) //pas être sur Kinemon
  );

  const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
  weapons.push({ ...weaponType, position: newWeaponPos });
  renderBoard();
}


function startCombat(attacker) {

  document.getElementById("jack-combat-buttons").style.display = "none";
  document.getElementById("kinemon-combat-buttons").style.display = "none";

  document.getElementById(`${attacker}-combat-buttons`).style.display = "flex";

  let currentAttacker = attacker;
  let currentDefender = currentAttacker === "jack" ? "kinemon" : "jack";

  const attackBtn = document.getElementById(`${currentAttacker}-attack-btn`);
  const defendBtn = document.getElementById(`${currentAttacker}-defend-btn`);
  const swordSound = document.getElementById("sword-sound");

  attackBtn.onclick = () => {
    const damage = currentAttacker === "jack" ? jackWeaponDamage : kinemonWeaponDamage;
    const defenderStats = currentDefender === "jack" ? document.getElementById("jack-stats") : document.getElementById("kinemon-stats");

    if (isDefending[currentDefender]) {
      isDefending[currentDefender] = false; 

    }else{
      swordSound.currentTime = 0; 
      swordSound.play();

      if (currentDefender === "jack") {
        jackHealth = Math.max(jackHealth - damage, 0);
        document.getElementById("healthbar_jack").value = jackHealth;
        document.getElementById("jack-health").textContent = jackHealth ;
      } else {
        kinemonHealth = Math.max(kinemonHealth - damage, 0);
        document.getElementById("healthbar_kinamon").value = kinemonHealth;
        document.getElementById("kinemon-health").textContent = kinemonHealth;
      }

      defenderStats.classList.add(`flash-${currentDefender}`);
      setTimeout(() => defenderStats.classList.remove(`flash-${currentDefender}`), 1000);
    }

    checkVictory();
    switchTurn();
  };

  defendBtn.onclick = () => {
    isDefending[currentAttacker] = true;
    switchTurn();
  };
}

function animateDamage(statsId) {
  const statsElement = document.getElementById(statsId);
  statsElement.classList.add("tremble", "flash");
  setTimeout(() => {
    statsElement.classList.remove("tremble", "flash");
  }, 1000);
}

function switchTurn()
{
    [currentAttacker, currentDefender] = [currentDefender, currentAttacker];

    document.getElementById(`${currentDefender}-combat-buttons`).style.display = "none";

    // Afficher les boutons du nouvel attaquant
    document.getElementById(`${currentAttacker}-combat-buttons`).style.display = "flex";

}


function checkVictory()
{
    if(jackHealth <=0 || kinemonHealth <= 0)
    {
      const winner = jackHealth > 0 ? "Jack" : "Kinemon";
        alert(`${winner} a gagné !`);
      restartGame();
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

function restartGame() {
  jackHealth = 100;
  kinemonHealth = 100;
  document.getElementById("jack-combat-buttons").style.display = "none";
  document.getElementById("kinemon-combat-buttons").style.display = "none";
  isDefending = { jack: false, kinemon: false };
  placeRandomly();
  generateObstacles(10);
  renderBoard();
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
            !obstacles.some((obstacle) => obstacle.x === newX && obstacle.y === newY) && //pas d'obstacle
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
      const weapon = weapons.find((weapon) => isSamePos(weapon.position, jackPos));
      if (weapon) {
        jackWeaponDamage = weapon.damage;
        document.getElementById("jack-weapon").textContent = weapon.name;
        document.getElementById("jack-damage").textContent = `${weapon.damage} points`;
        document.getElementById("jack-current").src = weapon.image;
        weapons = weapons.filter((w) => !isSamePos(w.position, jackPos)); //supprime arme recup
        spawnNewWeapon();  //fais apparaitre une autre apres 2 tours
      }
    } else {
      kinemonPos = { x, y };
      const weapon = weapons.find((weapon) => isSamePos(weapon.position, kinemonPos));
      if (weapon) {
        kinemonWeaponDamage = weapon.damage;
        document.getElementById("kinemon-weapon").textContent = weapon.name;
        document.getElementById("kinemon-damage").textContent = `${weapon.damage} points`;
        document.getElementById("kinemon-current").src = weapon.image;
        weapons = weapons.filter((w) => !isSamePos(w.position, kinemonPos)); //Supprimer l'arme récupérée
        spawnNewWeapon(); //Réapparaître une arme après 2 tours
      }
    }
    currentPlayer = currentPlayer === "jack" ? "kinemon" : "jack";
  
    //Afficher grille avec cases valides en surbrillance
    renderBoard();
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

      if (obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y)) {
        const obstacleIcon = document.createElement("img");
        obstacleIcon.src = "obstacle.png";
        obstacleIcon.alt = "Obstacle";
        obstacleIcon.classList.add("obstacle-icon");
        cell.appendChild(obstacleIcon);
      }

      if (weapons.some((weapon) => isSamePos(weapon.position, { x, y }))) {
        const weapon = weapons.find((weapon) => isSamePos(weapon.position, { x, y }));
        const weaponIcon = document.createElement("img");
        weaponIcon.src = weapon.image;
        weaponIcon.alt = weapon.name;
        weaponIcon.classList.add("character-icon");
        cell.appendChild(weaponIcon);
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
document.getElementById("restart-btn").addEventListener("click", () => restartGame());
placeRandomly();
generateObstacles(10);
generateWeapons();
renderBoard();

