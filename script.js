const container = document.getElementById('game-container');
const playerEl = document.getElementById('player');
const floatingCdEl = document.getElementById('floating-cd');
const parryStatusEl = document.getElementById('parry-status');
const skillStatusEl = document.getElementById('skill-status');

// 플레이어 검 요소 동적 생성
if (!document.getElementById('player-sword')) {
    const sw = document.createElement('div');
    sw.id = 'player-sword';
    playerEl.appendChild(sw);
}
const playerSwordEl = document.getElementById('player-sword');

// ================= 동적 UI 및 CSS 스타일 자동 생성 =================
const style = document.createElement('style');
style.innerHTML = `
    @media (min-width: 769px) { #mobile-controls { display: none !important; } }
    #mobile-controls { position: absolute; bottom: 30px; left: 0; width: 100%; display: flex; justify-content: space-between; padding: 0 30px; box-sizing: border-box; z-index: 100; pointer-events: none; touch-action: none; }
    #joystick-area { width: 130px; height: 130px; border-radius: 50%; background: rgba(0,0,0,0.4); position: relative; pointer-events: auto; }
    #joystick-knob { width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.8); position: absolute; top: 40px; left: 40px; }
    #action-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; pointer-events: auto; }
    .mob-btn { width: 60px; height: 60px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.5); color: white; font-size: 24px; display: flex; justify-content: center; align-items: center; user-select: none; }
    .mob-btn:active { background: rgba(255,255,255,0.5); }
    .mob-btn.hidden { display: none !important; }

    /* 플레이어 및 보스 인게임 외형 */
    #player { background: #3498db; border: 2px solid #fff; border-radius: 50%; display: flex; justify-content: center; align-items: center; z-index: 20; position: relative; transition: filter 0.2s; }
    #player-sword { position: absolute; width: 45px; height: 10px; background: #bdc3c7; left: 25px; top: 20px; border-radius: 5px; transform-origin: left center; transition: all 0.3s; z-index: -1; }
    .attack-anim #player-sword { animation: playerSwing 0.2s ease-out; }
    @keyframes playerSwing { 0% { transform: rotate(0deg); } 50% { transform: rotate(140deg); } 100% { transform: rotate(0deg); } }

    .ig-eyes { position: absolute; top: 12px; width: 100%; display: flex; justify-content: center; gap: 6px; z-index: 5; pointer-events: none; }
    .ig-eye { width: 12px; height: 12px; background: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 3px rgba(0,0,0,0.5); }
    .ig-pupil { width: 6px; height: 6px; background: black; border-radius: 50%; transition: 0.2s; }
    .eye-glow .ig-pupil { background: red; box-shadow: 0 0 10px red; transform: scale(1.2); }

    .ig-boss-weapon { position: absolute; top: 20px; left: -30px; width: 50px; height: 12px; background: #7f8c8d; border-radius: 4px; transform-origin: right center; animation: igBossWeaponIdle 2s infinite alternate; z-index: -1; }
    .boss-attack-anim .ig-boss-weapon { animation: igBossSwing 0.2s ease-out; }
    @keyframes igBossWeaponIdle { 0% { transform: rotate(-10deg); } 100% { transform: rotate(10deg); } }
    @keyframes igBossSwing { 0% { transform: rotate(0deg); } 50% { transform: rotate(-130deg); } 100% { transform: rotate(0deg); } }

    .boss-helmet { position: absolute; top: -10px; left: 5px; width: 40px; height: 20px; background: #7f8c8d; border-radius: 15px 15px 0 0; border: 2px solid #2c3e50; z-index: 6; }
    .boss-crown { position: absolute; top: -15px; left: 5px; width: 40px; height: 20px; background: linear-gradient(#f1c40f, #e67e22); clip-path: polygon(0 0, 20% 100%, 50% 0, 80% 100%, 100% 0, 100% 100%, 0 100%); z-index: 6; }

    /* 강력한 스턴(기절) 효과 CSS */
    .player-stunned { background: #9b59b6 !important; box-shadow: 0 0 20px #8e44ad, inset 0 0 15px #000 !important; animation: stunShake 0.1s infinite; filter: grayscale(0.3); }
    @keyframes stunShake { 0% { transform: translate(2px, 1px) rotate(0deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
    .stun-indicator { position: absolute; top: -35px; left: 50%; transform: translateX(-50%); color: #f1c40f; font-weight: bold; font-size: 18px; text-shadow: 0 0 10px red; white-space: nowrap; animation: blink 0.3s infinite; z-index: 50; }
    @keyframes blink { 0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); } 50% { opacity: 0.5; transform: translateX(-50%) scale(1.1); } }
    .stun-flash { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(142, 68, 173, 0.4); z-index: 999; pointer-events: none; animation: fadeOut 0.3s forwards; }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

    /* 오프닝 화면 */
    #opening-screen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(20, 25, 30, 0.95); z-index: 300; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
    .title-text { font-size: 48px; font-weight: bold; text-shadow: 0 0 20px #3498db; margin-bottom: 10px; text-align: center; line-height: 1.2; }
    .subtitle-text { font-size: 18px; color: #aaa; margin-bottom: 40px; }
    
    .clash-container { position: relative; width: 300px; height: 120px; margin-bottom: 30px; display: flex; align-items: center; }
    .clash-char { width: 50px; height: 50px; border-radius: 50%; position: absolute; border: 2px solid white; box-shadow: 0 0 15px rgba(255,255,255,0.5); display: flex; align-items: center; }
    .clash-player { background: #3498db; left: 0; animation: clashLeft 2.5s infinite; justify-content: flex-end; }
    .intro-sword { position: absolute; right: -30px; top: 20px; width: 40px; height: 8px; background: #bdc3c7; border-radius: 4px; transform-origin: left center; animation: introSwingPlayer 2.5s infinite; }
    .clash-boss { background: #8e44ad; right: 0; border: 4px solid #f1c40f; animation: clashRight 2.5s infinite; justify-content: flex-start; }
    .intro-boss-weapon { position: absolute; left: -40px; top: 20px; width: 50px; height: 12px; background: #2c3e50; border-radius: 4px; transform-origin: right center; animation: introSwingBoss 2.5s infinite; }
    .clash-spark { position: absolute; left: 135px; width: 30px; height: 30px; font-size: 40px; line-height: 30px; text-align: center; opacity: 0; animation: sparkAnim 2.5s infinite; z-index: 10; }
    
    @keyframes clashLeft { 0% { left: 0; } 15% { left: 100px; } 25% { left: 80px; } 35% { left: 100px; } 45% { left: 80px; } 55% { left: 100px; } 70% { left: 0; } 100% { left: 0; } }
    @keyframes clashRight { 0% { right: 0; } 15% { right: 100px; } 25% { right: 80px; } 35% { right: 100px; } 45% { right: 80px; } 55% { right: 100px; } 70% { right: 0; } 100% { right: 0; } }
    @keyframes introSwingPlayer { 0%, 10%, 25%, 45%, 70%, 100% { transform: rotate(-40deg); } 15%, 35%, 55% { transform: rotate(45deg); } }
    @keyframes introSwingBoss { 0%, 10%, 25%, 45%, 70%, 100% { transform: rotate(40deg); } 15%, 35%, 55% { transform: rotate(-45deg); } }
    @keyframes sparkAnim { 0%, 14% { opacity: 0; transform: scale(0.5); } 15% { opacity: 1; transform: scale(1.5); } 20% { opacity: 0; } 34% { opacity: 0; } 35% { opacity: 1; transform: scale(1.5); } 40% { opacity: 0; } 54% { opacity: 0; } 55% { opacity: 1; transform: scale(2); color: yellow; text-shadow: 0 0 20px red; } 65% { opacity: 0; } 100% { opacity: 0; } }

    .menu-btn { padding: 15px 40px; font-size: 24px; font-weight: bold; background: transparent; color: white; border: 2px solid #3498db; border-radius: 10px; cursor: pointer; transition: 0.2s; margin-top: 10px; width: 260px; }
    .menu-btn:hover { background: #3498db; box-shadow: 0 0 20px #3498db; transform: scale(1.05); }
    .menu-btn-tutorial { border-color: #f1c40f; color: #f1c40f; font-size: 18px; padding: 10px 30px; margin-top: 20px; }
    .menu-btn-tutorial:hover { background: #f1c40f; color: black; box-shadow: 0 0 20px #f1c40f; }

    #tutorial-modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 85%; max-width: 500px; background: rgba(10, 15, 20, 0.98); border: 2px solid #f1c40f; border-radius: 15px; padding: 25px; color: white; z-index: 400; display: none; box-shadow: 0 0 30px #f1c40f; overflow-y: auto; max-height: 80%; }
    .tut-header { font-size: 22px; color: #f1c40f; border-bottom: 1px solid #444; padding-bottom: 10px; margin-bottom: 15px; text-align: center; font-weight: bold; }
    .tut-section { margin-bottom: 15px; line-height: 1.6; font-size: 15px; }
    .tut-title { font-weight: bold; color: #3498db; margin-bottom: 8px; font-size: 18px; }
    .tut-close { display: block; margin: 20px auto 0; padding: 10px 30px; background: #3498db; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; }

    /* 즉시 반응하는 커스텀 증강 툴팁 UI */
    #augment-history { position: absolute; top: 10px; right: 10px; display: flex; gap: 12px; z-index: 50; flex-wrap: wrap-reverse; justify-content: flex-end; max-width: 300px; }
    .history-icon { position: relative; width: 40px; height: 40px; background: rgba(0,0,0,0.8); border: 1px solid #aaa; border-radius: 5px; display: flex; justify-content: center; align-items: center; font-size: 20px; box-shadow: 0 0 5px black; cursor: pointer; transition: 0.2s; }
    .history-icon:hover { border-color: #f1c40f; box-shadow: 0 0 10px #f1c40f; z-index: 60; }
    
    .custom-tooltip { visibility: hidden; background-color: rgba(10, 15, 20, 0.95); color: #fff; text-align: right; border: 2px solid #f1c40f; border-radius: 8px; padding: 12px; position: absolute; z-index: 1000; top: 120%; right: 0; white-space: nowrap; font-size: 14px; font-weight: normal; opacity: 0; transition: opacity 0.1s; pointer-events: none; box-shadow: 0 0 15px #f1c40f; line-height: 1.5; }
    .history-icon:hover .custom-tooltip { visibility: visible; opacity: 1; }

    .stack-badge { position: absolute; bottom: -6px; right: -6px; background: #e74c3c; color: white; font-size: 12px; font-weight: bold; border-radius: 50%; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center; border: 2px solid #fff; box-shadow: 0 0 5px black; z-index: 55; }

    /* ====================================================
       투사체 스타일 (뾰족한 반달/초승달 모양 원상복구) 
       ==================================================== */
    .slash { 
        position: absolute; pointer-events: none; z-index: 15; 
        display: flex; justify-content: center; align-items: center; 
        /* 완벽하게 날카로운 반달(초승달) 검기 모양 */
        clip-path: polygon(0% 0%, 100% 50%, 0% 100%, 30% 50%);
    }
    
    /* 특수 투사체 (클립패스와 그림자 호환) */
    .slash-elemental { background: transparent !important; clip-path: none !important; filter: drop-shadow(0 0 10px currentColor); }
    .slash-purple { background: #8e44ad !important; }
    
    /* 레이저와 체인은 반달 모양이 아니므로 clip-path 제거 */
    .slash-green { background: #2ecc71 !important; clip-path: none !important; border-radius: 10px !important; filter: drop-shadow(0 0 8px #2ecc71) !important; }
    .slash-chain { background: #95a5a6 !important; width: 50px !important; height: 6px !important; clip-path: none !important; border-radius: 0 !important; filter: drop-shadow(0 0 5px #7f8c8d) !important; }
    
    .slash-lightning { filter: drop-shadow(0 0 10px #00ffff) !important; }
    .slash-dark { filter: drop-shadow(0 0 15px #8e44ad) !important; }
    .unparryable-attack { background: #e74c3c !important; filter: drop-shadow(0 0 15px #e74c3c) !important; clip-path: none !important; border-radius: 50%; }
`;
document.head.appendChild(style);

// 오프닝 스크린 HTML 주입
container.insertAdjacentHTML('beforeend', `
    <div id="opening-screen">
        <div class="title-text">PARRY STRIKE<br><span style="font-size:24px; color:#e74c3c;">Boss Rush</span></div>
        <div class="subtitle-text">적의 패턴을 파악하고 전부 튕겨내세요!</div>
        
        <div class="clash-container">
            <div class="clash-char clash-player">
                <div class="ig-eyes"><div class="ig-eye"><div class="ig-pupil"></div></div><div class="ig-eye"><div class="ig-pupil"></div></div></div>
                <div class="intro-sword"></div>
            </div>
            <div class="clash-spark">💥</div>
            <div class="clash-char clash-boss">
                <div class="intro-crown"></div>
                <div class="ig-eyes"><div class="ig-eye"><div class="ig-pupil"></div></div><div class="ig-eye"><div class="ig-pupil"></div></div></div>
                <div class="intro-boss-weapon"></div>
            </div>
        </div>

        <button class="menu-btn" onclick="startGame()">▶ 게임 시작</button>
        <button class="menu-btn menu-btn-tutorial" onclick="showTutorial()">📖 패턴 요약 보기 (필독)</button>
    </div>

    <div id="tutorial-modal">
        <div class="tut-header">📖 생존 가이드 & 패턴 요약</div>
        <div class="tut-section">
            1️⃣ <b>우측 상단 증강 UI:</b> 마우스를 올리면 즉시 능력을 볼 수 있으며, 중복 시 숫자가 오릅니다.<br>
            2️⃣ <b>죽어도 초기화 안됨:</b> 한 번 얻은 능력치는 죽어도 초기화되지 않습니다!
        </div>
        <div class="tut-section">
            <div class="tut-title">⚠️ 보스 특수 공격 패턴</div>
            <span style="color:#f1c40f; font-weight:bold;">🟨 [노란색 ❗] 돌진 공격</span><br>
            - 패링 성공 시 100의 반동 데미지와 함께 보스가 기절합니다.<br><br>
            
            <span style="color:#8e44ad; font-weight:bold;">🟪 [보라색 반달] 강력한 스턴 검기</span><br>
            - <b>패링 가능!</b> 타이밍 맞춰 튕겨내세요. 방어에 실패해 맞으면 <b>2초간 스턴</b>에 걸립니다.<br><br>

            <span style="color:#7f8c8d; font-weight:bold;">⛓️ [회색 ⛓️] 체인 끌어오기</span><br>
            - 맞으면 보스 앞까지 강제로 끌려갑니다. 패링으로 막아내세요!<br><br>

            <span style="color:#2ecc71; font-weight:bold;">🟩 [초록색 ❗] 연사 레이저 빔</span><br>
            - 첫 타격만 패링해도 자동 패링 판정으로 '따다당' 전부 반사합니다.<br><br>

            <span style="color:#e74c3c; font-weight:bold;">🟥 [빨간색 ❌] 폭격 레이저</span><br>
            - <b>패링 불가! ❌</b> 오직 대시(Shift)의 무적 시간으로만 회피해야 합니다.
        </div>
        <button class="tut-close" onclick="closeTutorial()">확인 완료</button>
    </div>

    <div id="augment-history"></div>

    <div id="mobile-controls">
        <div id="joystick-area"><div id="joystick-knob"></div></div>
        <div id="action-btns">
            <div class="mob-btn" id="mob-dash">💨</div>
            <div class="mob-btn" id="mob-parry">🛡️</div>
            <div class="mob-btn" id="mob-attack">⚔️</div>
            <div class="mob-btn hidden" id="mob-skill">🌀</div>
        </div>
    </div>
`);

const dashStatusEl = document.createElement('div');
dashStatusEl.style.marginTop = '5px'; dashStatusEl.style.fontWeight = 'bold'; dashStatusEl.style.fontSize = '14px';
parryStatusEl.parentNode.insertBefore(dashStatusEl, parryStatusEl.nextSibling);

const originalBossEl = document.getElementById('boss');
const originalBossUiEl = document.getElementById('boss-ui');
if(originalBossEl) originalBossEl.style.display = 'none';
if(originalBossUiEl) originalBossUiEl.style.display = 'none';

let isPaused = true;
let isMobileEnv = false; 

const audioDead = new Audio('./Dead.mp3'); const audioAttack1 = new Audio('./Attack1.mp3'); const audioAttack2 = new Audio('./Attack2.mp3'); const audioParry = new Audio('./Parry.mp3'); const audioParryed = new Audio('./Parryed.mp3'); const audioSwing = new Audio('./Swing.mp3');
function playSound(type) {
    let sound; if (type === 'hit') sound = Math.random() < 0.5 ? audioAttack1 : audioAttack2; else if (type === 'dead') sound = audioDead; else if (type === 'parry') sound = audioParry; else if (type === 'parryed') sound = audioParryed; else if (type === 'swing') sound = audioSwing;
    if (sound) { sound.volume = 0.1; sound.currentTime = 0; sound.play().catch(e => {}); }
}

let GAME_WIDTH = container.clientWidth; let GAME_HEIGHT = container.clientHeight;
window.addEventListener('resize', () => { GAME_WIDTH = container.clientWidth; GAME_HEIGHT = container.clientHeight; });

const keys = { w: false, a: false, s: false, d: false };
let mousePos = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };

window.addEventListener('keydown', e => {
    if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true;
    if (e.code === 'Space') { e.preventDefault(); activateParry(); }
    if (e.key.toLowerCase() === 'r') { doSkill(); }
    if (e.key === 'Shift') { e.preventDefault(); doDash(); }
});
window.addEventListener('keyup', e => { if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });
window.addEventListener('contextmenu', e => e.preventDefault());

let isAttacking = false;
container.addEventListener('mousemove', e => { const rect = container.getBoundingClientRect(); mousePos.x = e.clientX - rect.left; mousePos.y = e.clientY - rect.top; });
container.addEventListener('mousedown', e => {
    if(e.target.closest('#mobile-controls') || e.target.closest('.modal') || e.target.closest('#opening-screen')) return;
    isMobileEnv = false;
    if (e.button === 0) isAttacking = true; else if (e.button === 2) activateParry();
});
window.addEventListener('mouseup', e => { if (e.button === 0) isAttacking = false; });
window.addEventListener('touchstart', () => { isMobileEnv = true; }, {passive: true});

let joyActive = false; let joyCenter = { x: 0, y: 0 }; let joystickDelta = { x: 0, y: 0 };
const joyArea = document.getElementById('joystick-area'); const joyKnob = document.getElementById('joystick-knob');
joyArea.addEventListener('touchstart', (e) => { joyActive = true; let rect = joyArea.getBoundingClientRect(); joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; updateJoystick(e.touches[0]); });
joyArea.addEventListener('touchmove', (e) => { if (joyActive) { e.preventDefault(); updateJoystick(e.touches[0]); } }, {passive: false});
joyArea.addEventListener('touchend', () => { joyActive = false; joyKnob.style.transform = `translate(0px, 0px)`; joystickDelta = { x: 0, y: 0 }; });
function updateJoystick(touch) { let dx = touch.clientX - joyCenter.x; let dy = touch.clientY - joyCenter.y; let dist = Math.hypot(dx, dy); let maxDist = 40; if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; } joyKnob.style.transform = `translate(${dx}px, ${dy}px)`; joystickDelta = { x: dx / maxDist, y: dy / maxDist }; }

const mobAttack = document.getElementById('mob-attack');
mobAttack.addEventListener('touchstart', (e) => { e.preventDefault(); isAttacking = true; }, {passive: false});
mobAttack.addEventListener('touchend', (e) => { e.preventDefault(); isAttacking = false; }, {passive: false});
document.getElementById('mob-parry').addEventListener('touchstart', (e) => { e.preventDefault(); activateParry(); }, {passive: false});
document.getElementById('mob-dash').addEventListener('touchstart', (e) => { e.preventDefault(); doDash(); }, {passive: false});
document.getElementById('mob-skill').addEventListener('touchstart', (e) => { e.preventDefault(); doSkill(); }, {passive: false});

const initPlayer = () => ({
    x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, speed: 2.5, radius: 25, hp: 100, maxHp: 100, exp: 0, maxExp: 200, level: 1, damage: 10,
    attackCount: 1, baseAttackCooldown: 30, attackCooldown: 0, attackQueue: 0, burstTimer: 0,
    isParrying: false, parryTimer: 0, parryCooldown: 0, autoParryTimer: 0,
    isDashing: false, dashTimer: 0, dashCooldown: 0, dashDir: {x: 1, y: 0},
    hasSkill: false, skillCooldown: 0, maxSkillCooldown: 600,
    isStunned: false, stunTimer: 0,
    isPulled: false, pullTimer: 0, pullTarget: null,
    lifesteal: 0, skillDamageMult: 2, weaponType: 'normal', dashDamage: false, parryHeal: false, waveChance: false, augments: []
});
let player = initPlayer();
let bossLevel = 1; let bosses = []; let projectiles = []; let blasters = [];

window.startGame = function() { document.getElementById('opening-screen').style.display = 'none'; isPaused = false; spawnBosses(); updateUI(); requestAnimationFrame(update); }
window.showTutorial = function() { document.getElementById('tutorial-modal').style.display = 'block'; }
window.closeTutorial = function() { document.getElementById('tutorial-modal').style.display = 'none'; }

function getDistance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
function getClosestBossTo(targetX, targetY) {
    if(bosses.length === 0) return null; let closest = bosses[0]; let minDist = getDistance(targetX, targetY, closest.x, closest.y);
    for(let i=1; i<bosses.length; i++) { let dist = getDistance(targetX, targetY, bosses[i].x, bosses[i].y); if(dist < minDist) { closest = bosses[i]; minDist = dist; } } return closest;
}

function spawnDamageText(x, y, damage, type = 'normal') {
    const el = document.createElement('div'); el.className = 'damage-text ' + (type === 'crit' ? 'crit-text' : type === 'fire' ? 'fire-text' : type === 'heal' ? 'heal-text' : type === 'player' ? 'player-dmg-text' : ''); el.innerText = isNaN(damage) ? damage : (type === 'heal' ? `+${damage} HP` : Math.floor(damage));
    el.style.left = x + 'px'; el.style.top = (y - 30) + 'px'; const randX = (Math.random() - 0.5) * 40; el.style.transform = `translateX(calc(-50% + ${randX}px))`; container.appendChild(el); setTimeout(() => el.remove(), 600);
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        let p = document.createElement('div'); p.className = 'particle'; p.style.backgroundColor = color; p.style.width = (Math.random() * 6 + 4) + 'px'; p.style.height = p.style.width; p.style.left = x + 'px'; p.style.top = y + 'px'; let angle = Math.random() * Math.PI * 2; let dist = Math.random() * 60 + 20; p.style.setProperty('--tx', Math.cos(angle) * dist + 'px'); p.style.setProperty('--ty', Math.sin(angle) * dist + 'px'); container.appendChild(p); setTimeout(() => p.remove(), 400);
    }
}
function spawnFireTrail(x, y) { let t = document.createElement('div'); t.className = 'fire-trail'; t.style.left = x + 'px'; t.style.top = y + 'px'; container.appendChild(t); setTimeout(() => t.remove(), 300); }
function createScreenFlash() { let flash = document.createElement('div'); flash.className = 'screen-flash'; container.appendChild(flash); setTimeout(() => flash.remove(), 300); }
function createDashShadow() { let shadow = document.createElement('div'); shadow.className = 'dash-shadow'; shadow.style.left = player.x + 'px'; shadow.style.top = player.y + 'px'; container.appendChild(shadow); setTimeout(() => shadow.remove(), 300); }

function spawnBosses() {
    bosses.forEach(b => { b.el.remove(); b.uiEl.remove(); }); bosses = [];
    for(let i = 0; i < bossLevel; i++) {
        const el = originalBossEl.cloneNode(true);
        el.style.display = 'flex'; el.style.position = 'absolute'; el.style.transform = 'translate(-50%, -50%)'; el.style.zIndex = '10'; el.style.justifyContent = 'center'; el.style.alignItems = 'center'; el.style.borderRadius = '50%';
        let eyeHtml = `<div class="ig-eyes"><div class="ig-eye"><div class="ig-pupil"></div></div><div class="ig-eye"><div class="ig-pupil"></div></div></div>`;
        
        if (bossLevel >= 5) { el.style.border = '4px solid #f1c40f'; el.style.backgroundColor = '#8e44ad'; el.innerHTML = '<div class="boss-crown"></div>' + eyeHtml + '<div class="ig-boss-weapon" style="background:linear-gradient(to right, #8e44ad, #2c3e50); width:60px; height:15px;"></div>'; } 
        else if (bossLevel >= 3) { el.style.border = '4px solid #95a5a6'; el.style.backgroundColor = '#c0392b'; el.innerHTML = '<div class="boss-helmet"></div>' + eyeHtml + '<div class="ig-boss-weapon" style="background:#2c3e50; width:55px;"></div>'; } 
        else { el.style.backgroundColor = '#e74c3c'; el.style.border = '2px solid white'; el.innerHTML = eyeHtml + '<div class="ig-boss-weapon"></div>'; }

        const uiEl = document.createElement('div'); uiEl.style.position = 'absolute'; uiEl.style.width = '100px'; uiEl.style.transform = 'translate(-50%, -15px)'; uiEl.style.textAlign = 'center'; uiEl.style.zIndex = '11';
        const nameEl = document.createElement('div'); nameEl.innerText = bossLevel >= 5 ? `Lv.${bossLevel} Demon Knight` : bossLevel >= 3 ? `Lv.${bossLevel} Armored Boss` : `Lv.${bossLevel} Boss`; nameEl.style.color = bossLevel >= 5 ? '#f1c40f' : '#fff'; nameEl.style.fontSize = '12px'; nameEl.style.fontWeight = 'bold'; nameEl.style.marginBottom = '2px'; nameEl.style.textShadow = '1px 1px 2px #000';
        const hpBg = document.createElement('div'); hpBg.style.width = '100%'; hpBg.style.height = '8px'; hpBg.style.backgroundColor = 'rgba(0,0,0,0.5)'; hpBg.style.border = '1px solid #000';
        const hpFill = document.createElement('div'); hpFill.style.width = '100%'; hpFill.style.height = '100%'; hpFill.style.backgroundColor = '#e74c3c'; hpFill.style.transition = 'width 0.1s';
        hpBg.appendChild(hpFill); uiEl.appendChild(nameEl); uiEl.appendChild(hpBg); container.appendChild(el); container.appendChild(uiEl);

        let maxHp = 50 + (bossLevel * 100); let spacing = GAME_WIDTH / (bossLevel + 1);
        bosses.push({ x: spacing * (i + 1), y: 100 + (Math.random() * 80), radius: 50, hp: maxHp, maxHp: maxHp, state: 'idle', stateTimer: Math.floor(Math.random() * 40), vx: 2 * (i % 2 === 0 ? 1 : -1), vy: 0, dashSpeed: 20 + bossLevel, dashHitDelay: 0, freezeStack: 0, isFrozen: false, freezeTimer: 0, el: el, uiEl: uiEl, hpFill: hpFill });
    }
    const topBossName = document.getElementById('boss-name'); if(topBossName) topBossName.innerText = `WAVE ${bossLevel} (적 ${bossLevel}마리)`;
}

function createBlaster(x, y, angle, owner) {
    playSound('parry'); const el = document.createElement('div'); el.className = 'gaster-blaster'; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    const eye = document.createElement('div'); eye.innerText = '❌'; eye.style.position = 'absolute'; eye.style.right = '-10px'; eye.style.top = '-15px'; eye.style.fontSize = '20px'; eye.style.textShadow = '0 0 10px #f00'; el.appendChild(eye);
    const telegraph = document.createElement('div'); telegraph.className = 'blaster-telegraph'; el.appendChild(telegraph); container.appendChild(el); blasters.push({ x, y, angle, timer: 35, el, telegraph, owner });
}

function takeDamage(amount) {
    player.hp -= amount; updateUI(); playSound('hit'); playerEl.classList.add('hit-flash'); container.classList.add('screen-shake');
    spawnDamageText(player.x, player.y, amount, 'player'); spawnParticles(player.x, player.y, '#e74c3c', 10);
    setTimeout(() => { playerEl.classList.remove('hit-flash'); container.classList.remove('screen-shake'); }, 300);
}

function bossHitEffect(targetBoss, x, y, damage, isCrit = false) {
    playSound('hit'); targetBoss.el.classList.add('boss-hit-flash'); setTimeout(() => targetBoss.el.classList.remove('boss-hit-flash'), 200);
    spawnDamageText(targetBoss.x, targetBoss.y, damage, isCrit ? 'crit' : 'normal'); spawnParticles(x, y, isCrit ? '#f1c40f' : '#e74c3c', 12);
    let impact = document.createElement('div'); impact.className = 'impact-effect'; impact.style.left = x + 'px'; impact.style.top = y + 'px'; impact.style.setProperty('--rot', `${Math.random() * 360}deg`); container.appendChild(impact); setTimeout(() => impact.remove(), 200);
}

function checkBossDeath(b) {
    if (b.hp <= 0) {
        playSound('dead'); b.el.remove(); b.uiEl.remove(); bosses = bosses.filter(boss => boss !== b);
        if (bosses.length === 0) { bossLevel++; player.hp = Math.min(player.maxHp, player.hp + 50); setTimeout(() => alert(`웨이브 클리어! 다음 단계(Lv.${bossLevel})로 진입합니다!\n(적 ${bossLevel}마리 등장, 체력 소폭 회복)`), 100); spawnBosses(); updateUI(); }
    }
}

function doAttack() {
    if(isPaused || player.isStunned || player.isPulled || player.attackCooldown > 0 || player.isDashing) return;
    playSound('swing'); playerEl.classList.add('attack-anim'); setTimeout(() => playerEl.classList.remove('attack-anim'), 200);
    let target = isMobileEnv ? getClosestBossTo(player.x, player.y) : getClosestBossTo(mousePos.x, mousePos.y);
    let tx = target ? target.x : player.x; let ty = target ? target.y : player.y - 10; const baseAngle = Math.atan2(ty - player.y, tx - player.x);
    playerSwordEl.style.transform = `rotate(${baseAngle}rad)`; setTimeout(() => { playerSwordEl.style.transform = 'rotate(0deg)'; }, 200);

    if (player.waveChance && Math.random() < 0.3) { spawnProjectile(player.x, player.y, baseAngle - 0.3, 12, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle + 0.3, 12, player.damage, false, 70); } 
    else { spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70); }
    player.attackQueue = player.attackCount - 1; player.burstTimer = 8; player.attackCooldown = player.baseAttackCooldown;
}

function activateParry() {
    if(isPaused || player.isStunned || player.isPulled || player.parryCooldown > 0 || player.isParrying || player.isDashing) return;
    playSound('parry'); player.isParrying = true; player.parryTimer = 60; playerEl.classList.add('parrying'); playerEl.classList.remove('parry-cd');
    parryStatusEl.innerText = "패링 중!! (이동 불가)"; parryStatusEl.style.color = "#00ffff";
}

function doSkill() {
    if (player.hasSkill && player.skillCooldown <= 0 && !isPaused && !player.isStunned && !player.isPulled && !player.isDashing) {
        playSound('swing'); player.skillCooldown = player.maxSkillCooldown; playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
        createScreenFlash(); spawnParticles(player.x, player.y, '#f1c40f', 30); for (let i = 0; i < 8; i++) spawnProjectile(player.x, player.y, (Math.PI / 4) * i, 15, player.damage * player.skillDamageMult, false, 120, true);
    }
}

function doDash() {
    if (isPaused || player.isStunned || player.isPulled || player.dashCooldown > 0 || player.isDashing) return;
    playSound('swing'); player.isDashing = true; player.dashTimer = 12; player.dashCooldown = 90;
    let dx = 0, dy = 0; if (joystickDelta.x !== 0 || joystickDelta.y !== 0) { dx = joystickDelta.x; dy = joystickDelta.y; } else { if (keys.w) dy -= 1; if (keys.s) dy += 1; if (keys.a) dx -= 1; if (keys.d) dx += 1; if (dx === 0 && dy === 0) dx = 1; }
    let len = Math.hypot(dx, dy); player.dashDir = { x: dx/len, y: dy/len }; playerEl.style.opacity = '0.4'; setTimeout(() => playerEl.style.opacity = '1', 200);
}

// ==========================================
// 완벽한 반달 검기 생성 (모양 및 아이콘 적용)
// ==========================================
function spawnProjectile(x, y, angle, speed, damage, isBoss, size, isHeavy = false, isGrab = false, owner = null, isLaser = false, isUnparryable = false, customClass = '') {
    const el = document.createElement('div');
    el.className = `slash ${isBoss ? 'boss-slash' : ''} ${isHeavy ? 'heavy-slash' : ''} ${isLaser ? 'laser-slash' : ''} ${isUnparryable ? 'unparryable-attack' : ''} ${customClass}`;
    
    let isElemental = (!isBoss && player.weaponType !== 'normal');

    if (isElemental) {
        el.classList.add('slash-elemental');
        el.style.width = size + 'px'; el.style.height = size + 'px';
        el.style.fontSize = (size * 0.8) + 'px';
        if (player.weaponType === 'fire') { el.style.color = '#e74c3c'; el.innerText = '🔥'; }
        else if (player.weaponType === 'ice') { el.style.color = '#00ffff'; el.innerText = '❄️'; size *= 1.5; }
        else if (player.weaponType === 'lightning') { el.style.color = '#f1c40f'; el.innerText = '⚡'; speed *= 1.5; }
        else if (player.weaponType === 'dark') { el.style.color = '#8e44ad'; el.innerText = '🌑'; size *= 1.8; damage *= 1.2; }
    } 
    else {
        // 기본 검기, 보스 공격, 보라색 공격 모두 완벽한 "뾰족한 반달"
        el.style.width = size + 'px'; 
        el.style.height = (size * 0.8) + 'px'; 
        
        let color = 'white';
        if (customClass.includes('slash-purple')) color = '#8e44ad';
        else if (isBoss) color = '#e74c3c';
        
        el.style.backgroundColor = color;
        el.style.filter = `drop-shadow(0 0 8px ${color})`;
        
        if (customClass.includes('slash-chain')) {
            el.style.width = '50px'; el.style.height = '6px';
        } else if (isLaser) {
            el.style.width = size + 'px'; el.style.height = (size/3) + 'px';
        }
    }

    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`; 
    
    // 패링 불가 표시 ❌ 추가 (회전 각도 보정)
    if (isUnparryable && isBoss) {
        const cross = document.createElement('div'); cross.innerText = '❌'; cross.style.position = 'absolute';
        cross.style.top = '50%'; cross.style.left = '50%'; cross.style.transform = `translate(-50%, -50%) rotate(${-angle}rad)`; 
        cross.style.fontSize = (size * 0.4) + 'px'; cross.style.textShadow = '0 0 5px black';
        el.appendChild(cross);
    }
    
    container.appendChild(el);
    projectiles.push({ x, y, angle, speed, damage, isBoss, radius: (!isBoss && (player.weaponType === 'ice' || player.weaponType === 'dark') ? size/2 * 1.5 : size/2), el, isGrab, owner, isUnparryable, timer: 0 });
}

function bossLogic() {
    bosses.forEach(boss => {
        if (boss.isFrozen) { boss.freezeTimer--; if (boss.freezeTimer <= 0) { boss.isFrozen = false; boss.el.classList.remove('frozen-boss'); } boss.el.style.left = boss.x + 'px'; boss.el.style.top = boss.y + 'px'; boss.uiEl.style.left = boss.x + 'px'; boss.uiEl.style.top = (boss.y - boss.radius - 15) + 'px'; return; }
        if (boss.dashHitDelay > 0) boss.dashHitDelay--;

        if (boss.state === 'idle') {
            boss.x += boss.vx; if (boss.x < boss.radius + 50 || boss.x > GAME_WIDTH - boss.radius - 50) boss.vx *= -1; boss.stateTimer++;
            if (boss.stateTimer > 90) {
                const rand = Math.random(); boss.stateTimer = 0;
                if (bossLevel < 2) { if (rand < 0.2) boss.state = 'pattern1'; else if (rand < 0.4) boss.state = 'pattern2'; else if (rand < 0.6) boss.state = 'pattern3'; else if (rand < 0.8) boss.state = 'pattern6'; else boss.state = 'pattern5'; } 
                else if (bossLevel < 4) { if (rand < 0.15) boss.state = 'pattern1'; else if (rand < 0.3) boss.state = 'pattern5'; else if (rand < 0.45) boss.state = 'pattern6'; else if (rand < 0.6) boss.state = 'pattern8'; else if (rand < 0.75) boss.state = 'pattern9'; else boss.state = 'pattern3'; } 
                else { if (rand < 0.1) boss.state = 'pattern1'; else if (rand < 0.2) boss.state = 'pattern2'; else if (rand < 0.35) boss.state = 'pattern5'; else if (rand < 0.5) boss.state = 'pattern6'; else if (rand < 0.65) boss.state = 'pattern8'; else if (rand < 0.8) boss.state = 'pattern9'; else boss.state = 'pattern7'; }
            }
        } else {
            boss.stateTimer++; const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
            if (boss.stateTimer === 1 && boss.state !== 'pattern7' && boss.state !== 'pattern8') boss.el.classList.add('eye-glow');

            if (boss.state === 'pattern1') {
                if(boss.stateTimer === 10) { playSound('swing'); boss.el.classList.remove('eye-glow'); boss.el.classList.add('boss-attack-anim'); spawnProjectile(boss.x, boss.y, angleToPlayer, 18, 15, true, 100, false, false, boss); }
                if(boss.stateTimer > 40) resetBossState(boss);
            }
            else if (boss.state === 'pattern2') {
                if(boss.stateTimer === 1) boss.el.classList.add('boss-telegraph');
                if(boss.stateTimer === 100) { playSound('swing'); boss.el.classList.remove('eye-glow', 'boss-telegraph'); boss.el.classList.add('boss-attack-anim'); spawnProjectile(boss.x, boss.y, angleToPlayer, 10, 20, true, 180, true, false, boss); }
                if(boss.stateTimer > 130) resetBossState(boss);
            }
            else if (boss.state === 'pattern3') {
                if(boss.stateTimer === 20 || boss.stateTimer === 40 || boss.stateTimer === 60) {
                    if(boss.stateTimer === 20) boss.el.classList.remove('eye-glow'); playSound('swing'); boss.el.classList.add('boss-attack-anim'); spawnProjectile(boss.x, boss.y, angleToPlayer, 10, 10, true, 100, false, false, boss); setTimeout(() => boss.el.classList.remove('boss-attack-anim'), 100);
                }
                if(boss.stateTimer > 100) resetBossState(boss);
            }
            else if (boss.state === 'pattern4') {
                if(boss.stateTimer === 30) { playSound('swing'); boss.el.classList.remove('eye-glow'); boss.el.classList.add('boss-attack-anim'); spawnProjectile(boss.x, boss.y, angleToPlayer, 12, 20, true, 100, false, false, boss); }
                if(boss.stateTimer > 70) resetBossState(boss);
            }
            else if (boss.state === 'pattern5') { // 돌진 패턴
                if (boss.stateTimer === 1) {
                    boss.el.style.backgroundColor = '#f1c40f'; boss.el.classList.add('boss-telegraph', 'boss-shake');
                    let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'dash-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 10px red'; boss.el.appendChild(warning);
                }
                if (boss.stateTimer === 60) {
                    boss.el.classList.remove('eye-glow', 'boss-telegraph', 'boss-shake'); let warn = boss.el.querySelector('.dash-warning'); if(warn) warn.remove();
                    boss.el.classList.add('boss-dashing'); boss.el.style.backgroundColor = '#e67e22'; boss.el.style.transform = 'translate(-50%, -50%) scale(1.1)'; boss.el.style.transition = 'none'; boss.vx = Math.cos(angleToPlayer) * boss.dashSpeed; boss.vy = Math.sin(angleToPlayer) * boss.dashSpeed;
                }
                if (boss.stateTimer > 60 && boss.stateTimer < 90) {
                    boss.x += boss.vx; boss.y += boss.vy;
                    if (getDistance(boss.x, boss.y, player.x, player.y) < player.radius + boss.radius) {
                        if (player.isDashing) { } 
                        else if (player.isParrying || player.autoParryTimer > 0) { 
                            createScreenFlash(); spawnParticles(player.x, player.y, '#0ff', 40); player.autoParryTimer = 6; playSound('parryed'); player.isParrying = false; playerEl.classList.remove('parrying', 'parry-cd'); playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                            if (player.parryHeal) { player.hp = Math.min(player.maxHp, player.hp + 20); spawnDamageText(player.x, player.y, 20, 'heal'); }
                            player.parryCooldown = 0; parryStatusEl.innerText = "돌진 저지 성공! (보스 기절)"; parryStatusEl.style.color = "#2ecc71";
                            boss.hp -= 100; gainExp(50); boss.stateTimer = 90; bossHitEffect(boss, boss.x, boss.y, 100, true); checkBossDeath(boss);
                        } else { takeDamage(30); boss.stateTimer = 90; }
                    }
                }
                if (boss.stateTimer >= 90) { boss.el.classList.remove('boss-dashing'); resetBossState(boss); }
            }
            else if (boss.state === 'pattern6') { // 보라색 스턴 공격 (이제 패링이 완전히 가능합니다)
                if (boss.stateTimer === 1) {
                    boss.el.style.backgroundColor = '#8e44ad'; boss.el.classList.add('boss-telegraph', 'boss-shake');
                    let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'grab-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 15px #8e44ad'; boss.el.appendChild(warning);
                }
                if (boss.stateTimer === 60) {
                    playSound('swing'); boss.el.style.backgroundColor = '#c0392b'; boss.el.classList.remove('boss-telegraph', 'boss-shake'); let warn = boss.el.querySelector('.grab-warning'); if(warn) warn.remove(); boss.el.classList.add('boss-attack-anim'); 
                    // isUnparryable = false, isGrab(기절) = true
                    spawnProjectile(boss.x, boss.y, angleToPlayer, 20, 0, true, 120, false, true, boss, false, false, 'slash-purple');
                }
                if (boss.stateTimer > 100) resetBossState(boss);
            }
            else if (boss.state === 'pattern9') { // 체인 끌어오기
                if (boss.stateTimer === 1) {
                    boss.el.style.backgroundColor = '#7f8c8d'; boss.el.classList.add('boss-telegraph');
                    let warning = document.createElement('div'); warning.innerText = '⛓️'; warning.className = 'chain-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '30px'; warning.style.textShadow = '0 0 15px #7f8c8d'; boss.el.appendChild(warning);
                }
                if (boss.stateTimer === 50) {
                    playSound('swing'); boss.el.style.backgroundColor = '#bdc3c7'; boss.el.classList.remove('boss-telegraph'); let warn = boss.el.querySelector('.chain-warning'); if(warn) warn.remove(); boss.el.classList.add('boss-attack-anim');
                    spawnProjectile(boss.x, boss.y, angleToPlayer, 25, 5, true, 40, false, false, boss, false, false, 'slash-chain');
                }
                if (boss.stateTimer > 90) resetBossState(boss);
            }
            else if (boss.state === 'pattern8') { // 초록색 연사 레이저
                if (boss.stateTimer === 1) {
                    boss.el.style.backgroundColor = '#2ecc71'; boss.el.classList.add('boss-telegraph');
                    let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'grab-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 15px #2ecc71'; boss.el.appendChild(warning);
                }
                if (boss.stateTimer >= 60 && boss.stateTimer <= 80) {
                    if (boss.stateTimer === 60) { boss.el.classList.remove('boss-telegraph'); let warn = boss.el.querySelector('.grab-warning'); if(warn) warn.remove(); boss.el.classList.add('boss-attack-anim'); }
                    if (boss.stateTimer % 2 === 0) {
                        playSound('swing'); spawnProjectile(boss.x, boss.y, angleToPlayer, 35, 5, true, 40, false, false, boss, false, false, 'slash-green');
                    }
                }
                if (boss.stateTimer > 100) resetBossState(boss);
            }
            else if (boss.state === 'pattern7') { // 폭격 레이저
                if (boss.stateTimer === 1) { boss.el.style.backgroundColor = '#000'; boss.el.style.boxShadow = '0 0 20px #f00'; }
                boss.x += Math.cos(angleToPlayer) * 1.5; boss.y += Math.sin(angleToPlayer) * 1.5; const timings = [30, 70, 100, 150, 180, 230, 260];
                if (timings.includes(boss.stateTimer)) { let orbitAngle = (boss.stateTimer * 0.1) + Math.random(); let bx = player.x + Math.cos(orbitAngle) * 250; let by = player.y + Math.sin(orbitAngle) * 250; createBlaster(bx, by, Math.atan2(player.y - by, player.x - bx), boss); }
                if (boss.stateTimer > 300) { resetBossState(boss); }
            }
        }
        boss.x = Math.max(boss.radius, Math.min(GAME_WIDTH - boss.radius, boss.x)); boss.y = Math.max(boss.radius, Math.min(GAME_HEIGHT - boss.radius, boss.y)); boss.el.style.left = boss.x + 'px'; boss.el.style.top = boss.y + 'px'; boss.uiEl.style.left = boss.x + 'px'; boss.uiEl.style.top = (boss.y - boss.radius - 15) + 'px';
    });
}

function resetBossState(boss) {
    boss.state = 'idle'; boss.stateTimer = 0; boss.vy = 0; boss.vx = 2;
    boss.el.classList.remove('boss-attack-anim', 'boss-telegraph', 'boss-dashing', 'eye-glow', 'boss-shake'); boss.el.style.backgroundColor = ''; boss.el.style.boxShadow = 'none'; boss.el.style.transform = 'translate(-50%, -50%) scale(1)'; boss.el.style.transition = 'none';
    let warn = boss.el.querySelector('.dash-warning'); if(warn) warn.remove(); let warn2 = boss.el.querySelector('.grab-warning'); if(warn2) warn2.remove(); let warn3 = boss.el.querySelector('.chain-warning'); if(warn3) warn3.remove();
}

function update() {
    if (isPaused) { requestAnimationFrame(update); return; }

    if (isAttacking) doAttack();
    if (player.autoParryTimer > 0) player.autoParryTimer--;
    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.dashCooldown <= 0) { dashStatusEl.innerText = "[Shift] 대시 준비 완료"; dashStatusEl.style.color = "#2ecc71"; } else { dashStatusEl.innerText = `대시 쿨타임: ${(player.dashCooldown/60).toFixed(1)}초`; dashStatusEl.style.color = "#7f8c8d"; }

    // CC기 우선순위: 스턴 > 끌려감 > 대시 > 걷기
    if (player.isStunned) {
        player.stunTimer--;
        parryStatusEl.innerText = `기절됨! (${Math.ceil(player.stunTimer/60)}초)`; parryStatusEl.style.color = "red";
        
        let stunInd = document.getElementById('stun-indicator');
        if (!stunInd) {
            stunInd = document.createElement('div'); stunInd.id = 'stun-indicator'; stunInd.className = 'stun-indicator'; stunInd.innerText = '기절!';
            playerEl.appendChild(stunInd);
            playerEl.classList.add('player-stunned');
        }

        if (player.stunTimer <= 0) { 
            player.isStunned = false; 
            if (stunInd) stunInd.remove(); 
            playerEl.classList.remove('player-stunned'); 
        }
    } else if (player.isPulled) {
        player.pullTimer--;
        if (player.pullTarget && player.pullTarget.hp > 0) {
            let dx = player.pullTarget.x - player.x; let dy = player.pullTarget.y - player.y; let dist = Math.hypot(dx, dy);
            if (dist > 30) { player.x += (dx / dist) * 10; player.y += (dy / dist) * 10; }
        }
        parryStatusEl.innerText = "사슬에 끌려가는 중!!"; parryStatusEl.style.color = "orange";
        if (player.pullTimer <= 0) player.isPulled = false;
    } else if (player.isDashing) {
        player.x += player.dashDir.x * 15; player.y += player.dashDir.y * 15; player.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, player.x)); player.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, player.y)); player.dashTimer--; if (player.dashTimer % 2 === 0) createDashShadow();
        if (player.dashDamage) { bosses.forEach(b => { if (getDistance(player.x, player.y, b.x, b.y) < player.radius + b.radius + 30) { if (b.dashHitDelay <= 0) { b.hp -= player.damage; gainExp(player.damage); bossHitEffect(b, b.x, b.y, player.damage, true); checkBossDeath(b); b.dashHitDelay = 30; } } }); }
        if (player.dashTimer <= 0) player.isDashing = false;
    } else if (!player.isParrying) {
        if (joystickDelta.x !== 0 || joystickDelta.y !== 0) {
            let nextX = player.x + joystickDelta.x * player.speed; let nextY = player.y + joystickDelta.y * player.speed; player.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, nextX)); player.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, nextY));
        } else {
            if (keys.w && player.y > player.radius) player.y -= player.speed; if (keys.s && player.y < GAME_HEIGHT - player.radius) player.y += player.speed;
            if (keys.a && player.x > player.radius) player.x -= player.speed; if (keys.d && player.x < GAME_WIDTH - player.radius) player.x += player.speed;
        }
    }

    playerEl.style.left = player.x + 'px'; playerEl.style.top = player.y + 'px';

    if (player.attackQueue > 0 && !player.isStunned && !player.isPulled) {
        player.burstTimer--;
        if (player.burstTimer <= 0) {
            playSound('swing');
            let target = isMobileEnv ? getClosestBossTo(player.x, player.y) : getClosestBossTo(mousePos.x, mousePos.y); let tx = target ? target.x : player.x; let ty = target ? target.y : player.y - 10; let baseAngle = Math.atan2(ty - player.y, tx - player.x);
            playerSwordEl.style.transform = `rotate(${baseAngle}rad)`; setTimeout(() => { playerSwordEl.style.transform = 'rotate(0deg)'; }, 200);
            if (player.waveChance && Math.random() < 0.3) { spawnProjectile(player.x, player.y, baseAngle - 0.3, 12, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle + 0.3, 12, player.damage, false, 70); } 
            else { spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70); }
            player.attackQueue--; player.burstTimer = 8;
        }
    }

    if(player.attackCooldown > 0) player.attackCooldown--;

    if (player.isParrying) {
        player.parryTimer--;
        if (player.parryTimer <= 0) { player.isParrying = false; playerEl.classList.remove('parrying'); playerEl.classList.add('parry-cd'); player.parryCooldown = 300; }
    } else if (!player.isStunned && !player.isPulled) {
        if (player.parryCooldown > 0) {
            player.parryCooldown--; let secondsLeft = Math.ceil(player.parryCooldown / 60);
            parryStatusEl.innerText = `패링 쿨타임: ${secondsLeft}초`; parryStatusEl.style.color = "#e74c3c"; floatingCdEl.innerText = `${secondsLeft}초`;
            if (player.parryCooldown <= 0) { parryStatusEl.innerText = "패링 준비 완료"; parryStatusEl.style.color = "#3498db"; floatingCdEl.innerText = ""; playerEl.classList.remove('parry-cd'); }
        }
    }

    if (player.hasSkill) {
        if (player.skillCooldown > 0) { player.skillCooldown--; skillStatusEl.innerText = `회전베기: ${Math.ceil(player.skillCooldown / 60)}초`; skillStatusEl.style.color = "#e74c3c"; } 
        else { skillStatusEl.innerText = "회전베기: 준비 완료!"; skillStatusEl.style.color = "#f1c40f"; }
    }

    bossLogic();

    for (let i = blasters.length - 1; i >= 0; i--) {
        let bl = blasters[i]; bl.timer--;
        if (bl.timer === 0) {
            playSound('swing'); bl.telegraph.remove(); spawnProjectile(bl.x, bl.y, bl.angle, 25, 15, true, 100, true, false, bl.owner, true, true);
            bl.el.style.opacity = '0'; bl.el.style.transform = `translate(-50%, -50%) rotate(${bl.angle}rad) translateX(-20px)`;
        } else if (bl.timer === -15) { bl.el.remove(); blasters.splice(i, 1); }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i]; p.x += Math.cos(p.angle) * p.speed; p.y += Math.sin(p.angle) * p.speed; p.el.style.left = p.x + 'px'; p.el.style.top = p.y + 'px'; p.el.style.transform = `translate(-50%, -50%) rotate(${p.angle}rad)`; p.timer++;

        if (!p.isBoss && player.weaponType === 'fire' && p.timer % 2 === 0) { spawnFireTrail(p.x, p.y); }
        if (p.x < -100 || p.x > GAME_WIDTH + 100 || p.y < -100 || p.y > GAME_HEIGHT + 100) { p.el.remove(); projectiles.splice(i, 1); continue; }

        if (p.isBoss) {
            if (getDistance(p.x, p.y, player.x, player.y) < player.radius + p.radius) {
                if (player.isDashing) { } 
                else if ((player.isParrying || player.autoParryTimer > 0) && !p.isUnparryable) {
                    let isLaser = p.el.classList.contains('slash-green'); let isAutoParry = (player.autoParryTimer > 0 && !player.isParrying);

                    if (!isAutoParry) { createScreenFlash(); if (player.parryHeal) { player.hp = Math.min(player.maxHp, player.hp + 20); spawnDamageText(player.x, player.y, 20, 'heal'); } }

                    spawnParticles(player.x, player.y, '#0ff', 20); player.autoParryTimer = 6; playSound('parryed'); player.isParrying = false; 
                    playerEl.classList.remove('parrying', 'parry-cd'); playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                    
                    player.parryCooldown = 0; floatingCdEl.innerText = ""; parryStatusEl.style.color = "#2ecc71";
                    
                    // 보라색 검기 패링 성공 시 특수 텍스트
                    if (p.el.classList.contains('slash-purple')) {
                        parryStatusEl.innerText = "스턴 공격 패링 성공!";
                        if(p.owner) { p.owner.hp -= 20; bossHitEffect(p.owner, p.owner.x, p.owner.y, 20, true); checkBossDeath(p.owner); } p.el.remove(); projectiles.splice(i, 1); 
                    }
                    else if (p.el.classList.contains('slash-chain')) {
                        parryStatusEl.innerText = "사슬 튕겨내기 성공!";
                        if(p.owner) { p.owner.hp -= 20; bossHitEffect(p.owner, p.owner.x, p.owner.y, 20, true); checkBossDeath(p.owner); } p.el.remove(); projectiles.splice(i, 1); 
                    } else {
                        parryStatusEl.innerText = "패링 반사 성공!";
                        p.isBoss = false; p.el.classList.remove('boss-slash', 'heavy-slash', 'laser-slash', 'unparryable-attack', 'slash-green');
                        let target = isMobileEnv ? getClosestBossTo(p.x, p.y) : getClosestBossTo(mousePos.x, mousePos.y); 
                        p.angle = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.angle + Math.PI; p.speed *= 1.5; p.damage *= 2;
                    }
                } else {
                    let isChain = p.el.classList.contains('slash-chain');
                    
                    // 패링에 실패하거나, 패링 타이밍을 놓쳤을 경우
                    if (p.isGrab) { // isGrab은 보라색 스턴 공격을 의미
                        player.isStunned = true; player.stunTimer = 120; // 2초 기절
                        takeDamage(20); 
                        
                        let stunFx = document.createElement('div'); stunFx.className = 'stun-flash'; container.appendChild(stunFx); setTimeout(() => stunFx.remove(), 300);
                        p.el.remove(); projectiles.splice(i, 1);
                    } else if (isChain) {
                        player.isPulled = true; player.pullTimer = 40; player.pullTarget = p.owner; 
                        takeDamage(5); p.el.remove(); projectiles.splice(i, 1);
                    } else {
                        takeDamage(p.damage); p.el.remove(); projectiles.splice(i, 1); 
                    }
                }
            }
        } else {
            for(let j = bosses.length - 1; j >= 0; j--) {
                let b = bosses[j];
                if (getDistance(p.x, p.y, b.x, b.y) < b.radius + p.radius) {
                    b.hp -= p.damage; gainExp(p.damage);
                    if (player.lifesteal > 0 && player.hp < player.maxHp) player.hp = Math.min(player.maxHp, player.hp + player.lifesteal);
                    updateUI(); bossHitEffect(b, p.x, p.y, p.damage, false);
                    if (player.weaponType === 'ice') { b.freezeStack++; spawnParticles(p.x, p.y, '#00ffff', 5); if (b.freezeStack >= 4) { b.isFrozen = true; b.freezeTimer = 180; b.freezeStack = 0; b.el.classList.add('frozen-boss'); spawnDamageText(b.x, b.y, 'FREEZE!', 'crit'); } } else if (player.weaponType === 'fire') { spawnParticles(p.x, p.y, '#e67e22', 15); b.hp -= 5; spawnDamageText(b.x, b.y + 20, 5, 'fire'); }
                    p.el.remove(); projectiles.splice(i, 1); checkBossDeath(b); break;
                }
            }
        }
    }

    if (player.hp <= 0) {
        playSound('dead'); document.getElementById('final-score').innerText = `현재 도달: Boss Wave ${bossLevel}\n플레이어 Lv. ${player.level}`;
        document.getElementById('game-over-modal').classList.remove('hidden'); isPaused = true; return;
    }
    requestAnimationFrame(update);
}

window.restartGame = function() {
    player.hp = player.maxHp; player.x = GAME_WIDTH / 2; player.y = GAME_HEIGHT - 100;
    player.isParrying = false; player.parryTimer = 0; player.parryCooldown = 0; player.autoParryTimer = 0; 
    player.attackCooldown = 0; player.burstTimer = 0; player.attackQueue = 0; player.skillCooldown = 0; player.isDashing = false; player.dashTimer = 0; player.dashCooldown = 0; 
    player.isStunned = false; player.stunTimer = 0; player.isPulled = false; player.pullTimer = 0; player.pullTarget = null;
    
    projectiles.forEach(p => p.el.remove()); projectiles = []; blasters.forEach(b => b.el.remove()); blasters = [];
    document.querySelectorAll('.unparryable-hit, .impact-effect, .damage-text, .particle, .fire-trail, .dash-shadow, .screen-flash').forEach(el => el.remove());
    document.getElementById('game-over-modal').classList.add('hidden');

    playerEl.classList.remove('player-grabbed', 'parrying', 'parry-deflect', 'parry-cd', 'hit-flash', 'player-stunned'); 
    container.classList.remove('screen-shake', 'boss-hit-shake');
    let stunInd = document.getElementById('stun-indicator'); if(stunInd) stunInd.remove();

    spawnBosses(); updateUI(); renderAugments(); isPaused = false; requestAnimationFrame(update);
}

function updateUI() {
    document.getElementById('player-hp').style.width = (Math.max(0, player.hp) / player.maxHp * 100) + '%'; document.getElementById('player-exp').style.width = (player.exp / player.maxExp * 100) + '%'; document.getElementById('player-level').innerText = player.level;
    let totalHp = 0; let totalMaxHp = 0; bosses.forEach(b => { totalHp += b.hp; totalMaxHp += b.maxHp; b.hpFill.style.width = (Math.max(0, b.hp) / b.maxHp * 100) + '%'; });
    const bossHpTop = document.getElementById('boss-hp'); if(bossHpTop && totalMaxHp > 0) bossHpTop.style.width = (Math.max(0, totalHp) / totalMaxHp * 100) + '%';
}

function renderAugments() {
    const histDiv = document.getElementById('augment-history');
    histDiv.innerHTML = '';
    player.augments.forEach(aug => {
        const iconEl = document.createElement('div'); iconEl.className = 'history-icon'; iconEl.innerText = aug.icon; 
        
        const tooltip = document.createElement('div'); tooltip.className = 'custom-tooltip';
        tooltip.innerHTML = `<strong>${aug.name}</strong><br>${aug.desc}<br><span style="color:#f1c40f">보유: ${aug.count}개</span>`;
        iconEl.appendChild(tooltip);
        
        if (aug.count > 1) {
            const badge = document.createElement('div'); badge.className = 'stack-badge'; badge.innerText = `x${aug.count}`;
            iconEl.appendChild(badge);
        }
        histDiv.appendChild(iconEl);
    });
}

function showLevelUpModal() {
    isPaused = true; const modal = document.getElementById('level-up-modal'); modal.classList.remove('hidden');

    const baseAugmentPool = [
        { id: 'damage', name: '⚔️ 예리한 칼날', desc: '평타 데미지 +5', unique: false, icon: '⚔️' },
        { id: 'cooldown', name: '⚡ 가벼운 몸놀림', desc: '평타 공격 쿨타임 감소', unique: false, icon: '🏃' },
        { id: 'multishot', name: '🏹 다중 발사', desc: '평타 발사 개수 1개 추가', unique: false, icon: '🏹' },
        { id: 'maxhp', name: '💖 강인한 체력', desc: '최대 체력 +30 및 100% 회복', unique: false, icon: '💖' },
        { id: 'weapon_fire', name: '🔥 화염검 (무기)', desc: '화염 잔상 및 타격시 추가 피해', unique: true, icon: '🔥' },
        { id: 'weapon_ice', name: '❄️ 얼음검 (무기)', desc: '서리 이펙트 및 4타 적중시 빙결', unique: true, icon: '❄️' },
        { id: 'weapon_lightning', name: '⚡ 뇌전검 (무기)', desc: '투사체 속도 대폭 증가', unique: true, icon: '⚡' },
        { id: 'weapon_dark', name: '🌑 암흑검 (무기)', desc: '투사체 거대화 및 피흡 2 부여', unique: true, icon: '🌑' },
        { id: 'skill_dash', name: '💨 돌진 베기 (스킬)', desc: '대시 중 적과 충돌 시 데미지', unique: true, icon: '💨' },
        { id: 'skill_parry_heal', name: '💚 치유의 패링', desc: '패링 성공 시 체력 20 회복', unique: true, icon: '💚' },
        { id: 'skill_wave', name: '🌊 파도 베기', desc: '평타 시 30% 확률로 3갈래 발사', unique: true, icon: '🌊' }
    ];

    let availablePool = baseAugmentPool.filter(aug => {
        if (aug.unique && player.augments.some(a => a.id === aug.id)) return false; 
        if (aug.id.startsWith('weapon_') && player.weaponType !== 'normal') return false; 
        return true;
    });

    if (!player.hasSkill) { availablePool.push({ id: 'skill', name: '🌀 회전베기 스킬', desc: '[R]키로 주변 적 전체 공격 획득', unique: true, icon: '🌀' }); }
    else { availablePool.push({ id: 'skill_cooldown', name: '⏳ 깨달음', desc: '회전베기 스킬 쿨타임 감소', unique: false, icon: '⏳' }); }

    availablePool.sort(() => 0.5 - Math.random());
    const containerEl = document.getElementById('augment-container'); containerEl.innerHTML = '';
    availablePool.slice(0, 3).forEach(aug => {
        const btn = document.createElement('button'); btn.className = 'aug-btn';
        btn.innerHTML = `<strong>${aug.name}</strong><br><span style="font-size:13px; color:#aaa;">${aug.desc}</span>`;
        btn.onclick = () => window.selectAugment(aug.id, aug.name, aug.icon, aug.desc); containerEl.appendChild(btn);
    });
}

function gainExp(amount) {
    player.exp += (amount * 1.5);
    if (player.exp >= player.maxExp) { player.level++; player.exp -= player.maxExp; player.maxExp = Math.floor(player.maxExp * 1.15); updateUI(); showLevelUpModal(); }
    updateUI();
}

window.selectAugment = function(type, name, icon, desc) {
    let existing = player.augments.find(a => a.id === type);
    if (existing) { existing.count++; } else { player.augments.push({ id: type, name: name, icon: icon, desc: desc, count: 1 }); }
    renderAugments();

    if (type === 'damage') player.damage += 5;
    else if (type === 'cooldown') player.baseAttackCooldown = Math.max(10, player.baseAttackCooldown - 5);
    else if (type === 'multishot') player.attackCount += 1;
    else if (type === 'maxhp') { player.maxHp += 30; player.hp = player.maxHp; }
    else if (type === 'weapon_fire') { player.weaponType = 'fire'; playerSwordEl.style.background = 'linear-gradient(to right, #e74c3c, #f1c40f)'; }
    else if (type === 'weapon_ice') { player.weaponType = 'ice'; playerSwordEl.style.background = 'linear-gradient(to right, #00ffff, #fff)'; }
    else if (type === 'weapon_lightning') { player.weaponType = 'lightning'; playerSwordEl.style.background = 'linear-gradient(to right, #f1c40f, #00ffff)'; }
    else if (type === 'weapon_dark') { player.weaponType = 'dark'; playerSwordEl.style.background = 'linear-gradient(to right, #8e44ad, #2c3e50)'; player.lifesteal = 2; }
    else if (type === 'skill_dash') player.dashDamage = true;
    else if (type === 'skill_parry_heal') player.parryHeal = true;
    else if (type === 'skill_wave') player.waveChance = true;
    else if (type === 'skill') { player.hasSkill = true; skillStatusEl.classList.remove('hidden'); if(document.getElementById('btn-skill')) document.getElementById('btn-skill').classList.remove('hidden'); document.getElementById('mob-skill').classList.remove('hidden'); }
    else if (type === 'skill_cooldown') player.maxSkillCooldown = Math.max(180, player.maxSkillCooldown - 100);

    document.getElementById('level-up-modal').classList.add('hidden'); updateUI(); isPaused = false;
}
