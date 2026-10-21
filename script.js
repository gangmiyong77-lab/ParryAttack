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
    lifesteal: 0, skillDamageMult: 2, weaponType: 'normal', dashDamage: false, parryHeal: false, waveChance: false, aug
