const MIN_HP = 0;
const MAX_HP = 100;
const HERO_MIN = 8;
const HERO_MAX = 15;
const ENEMY_MIN = 5;
const ENEMY_MAX = 14;
const HEAL_VALUE = 20;
const MAX_HEALS = 3;
const HEAL_COST = 1;
const CRIT_CHANCE = 10;
const CRIT_MULT = 2;
const DEFEND_DIVISOR = 2;
const PERCENT_MIN = 1;
const PERCENT_MAX = 100;
const MAX_LOGS = 5;

let heroHp = MAX_HP;
let enemyHp = MAX_HP;
let healsLeft = MAX_HEALS;
let isDefending = false;
let gameOver = false;
let logs = [];

const msgEl = document.getElementById('battle-msg');
const heroBox = document.getElementById('hero-box');
const enemyBox = document.getElementById('enemy-box');
const heroHpEl = document.getElementById('hero-hp');
const heroMaxEl = document.getElementById('hero-max');
const enemyHpEl = document.getElementById('enemy-hp');
const enemyMaxEl = document.getElementById('enemy-max');
const heroBar = document.getElementById('hero-bar');
const enemyBar = document.getElementById('enemy-bar');
const healsLeftEl = document.getElementById('heals-left');
const shieldStateEl = document.getElementById('shield-state');
const logListEl = document.getElementById('battle-log');

const btnAttack = document.getElementById('btn-attack');
const btnDefend = document.getElementById('btn-defend');
const btnHeal = document.getElementById('btn-heal');
const btnRestart = document.getElementById('btn-restart');

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addLog(text) {
    logs.unshift(text);
    if (logs.length > MAX_LOGS) {
        logs.pop();
    }
}

function renderBattle() {
    heroHpEl.textContent = heroHp;
    heroMaxEl.textContent = MAX_HP;
    enemyHpEl.textContent = enemyHp;
    enemyMaxEl.textContent = MAX_HP;

    heroBar.max = MAX_HP;
    enemyBar.max = MAX_HP;
    heroBar.value = heroHp;
    enemyBar.value = enemyHp;

    healsLeftEl.textContent = healsLeft;
    shieldStateEl.textContent = isDefending ? 'ON' : 'OFF';

    btnAttack.disabled = gameOver;
    btnDefend.disabled = gameOver;
    btnHeal.disabled = gameOver;

    logListEl.replaceChildren();
    for (const item of logs) {
        const li = document.createElement('li');
        li.textContent = item;
        logListEl.appendChild(li);
    }
}

function playTurn(action) {
    if (gameOver === true) {
        msgEl.textContent = 'Game is over! Press Restart.';
        return;
    }

    if (action === 'heal' && (healsLeft === MIN_HP || heroHp === MAX_HP)) {
        msgEl.textContent = 'Invalid move: no heals left or HP is already full!';
        msgEl.className = 'banner is-error';
        return;
    }

    msgEl.className = 'banner';

    if (action === 'attack') {
        isDefending = false;
        let dmg = getRandom(HERO_MIN, HERO_MAX);
        if (getRandom(PERCENT_MIN, PERCENT_MAX) <= CRIT_CHANCE) {
            dmg = dmg * CRIT_MULT;
            addLog(`Hero CRITICAL hit for ${dmg} DMG!`);
        } else {
            addLog(`Hero attacked for ${dmg} DMG.`);
        }
        enemyHp = Math.max(MIN_HP, enemyHp - dmg);
    } else if (action === 'defend') {
        isDefending = true;
        addLog('Hero is defending (next hit halved).');
    } else if (action === 'heal') {
        isDefending = false;
        healsLeft = healsLeft - HEAL_COST;
        heroHp = Math.min(MAX_HP, heroHp + HEAL_VALUE);
        addLog(`Hero healed +${HEAL_VALUE} HP.`);
    }

    if (enemyHp > MIN_HP) {
        let enemyDmg = getRandom(ENEMY_MIN, ENEMY_MAX);
        if (getRandom(PERCENT_MIN, PERCENT_MAX) <= CRIT_CHANCE) {
            enemyDmg = enemyDmg * CRIT_MULT;
        }
        if (isDefending === true) {
            enemyDmg = Math.floor(enemyDmg / DEFEND_DIVISOR);
            isDefending = false;
        }
        heroHp = Math.max(MIN_HP, heroHp - enemyDmg);
        addLog(`Enemy hit back for ${enemyDmg} DMG.`);
    }

    if (enemyHp === MIN_HP && heroHp > MIN_HP) {
        gameOver = true;
        msgEl.textContent = 'You Won!';
        msgEl.className = 'banner is-success';
        heroBox.classList.add('state-win');
        enemyBox.classList.add('state-loss');
    } else if (heroHp === MIN_HP && (enemyHp > MIN_HP || enemyHp === MIN_HP)) {
        gameOver = true;
        msgEl.textContent = 'You Lost!';
        msgEl.className = 'banner is-error';
        heroBox.classList.add('state-loss');
        enemyBox.classList.add('state-win');
    } else {
        msgEl.textContent = 'Turn completed. Choose your next move.';
    }

    renderBattle();
}

function restartGame() {
    heroHp = MAX_HP;
    enemyHp = MAX_HP;
    healsLeft = MAX_HEALS;
    isDefending = false;
    gameOver = false;
    logs = [];
    heroBox.classList.remove('state-win', 'state-loss');
    enemyBox.classList.remove('state-win', 'state-loss');
    msgEl.textContent = 'Game restarted! Make your move.';
    msgEl.className = 'banner';
    renderBattle();
}

btnAttack.addEventListener('click', () => playTurn('attack'));
btnDefend.addEventListener('click', () => playTurn('defend'));
btnHeal.addEventListener('click', () => playTurn('heal'));
btnRestart.addEventListener('click', restartGame);

restartGame();