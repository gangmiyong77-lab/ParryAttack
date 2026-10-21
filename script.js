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
    /* 모바일 컨트롤러 */
    @media (min-width: 769px) { #mobile-controls { display: none !important; } }
    #mobile-controls { position: absolute; bottom: 30px; left: 0; width: 100%; display: flex; justify-content: space-between; padding: 0 30px; box-sizing: border-box; z-index: 100; pointer-events: none; touch-action: none; }
    #joystick-area { width: 130px; height: 130px; border-radius: 50%; background: rgba(0,0,0,0.4); position: relative; pointer-events: auto; }
    #joystick-knob { width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.8); position: absolute; top: 40px; left: 40px; }
    #action-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; pointer-events: auto; }
    .mob-btn { width: 60px; height: 60px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.5); color: white; font-size: 24px; display: flex; justify-content: center; align-items: center; user-select: none; }
    .mob-btn:active { background: rgba(255,255,255,0.5); }
    .mob-btn.hidden { display: none !important; }

    /* 플레이어 및 보스 인게임 외형 */
    #player { background: #3498db; border: 2px solid #fff; border-radius: 50%; display: flex; justify-content: center; align-items: center; z-index: 20; }
    #player-sword { position: absolute; width: 45px; height: 10px; background: #bdc3c7; left: 25px; border-radius: 5px; transform-origin: left center; transition: all 0.3s; z-index: -1; }
    .attack-anim #player-sword { animation: playerSwing 0.2s ease-out; }
    @keyframes playerSwing { 0% { transform: rotate(0deg); } 50% { transform: rotate(140deg); } 100% { transform: rotate(0deg); } }

    .boss-helmet { position: absolute; top: -10px; left: 5px; width: 40px; height: 20px; background: #7f8c8d; border-radius: 15px 15px 0 0; border: 2px solid #2c3e50; }
    .boss-crown { position: absolute; top: -15px; left: 5px; width: 40px; height: 20px; background: linear-gradient(#f1c40f, #e67e22); clip-path: polygon(0 0, 20% 100%, 50% 0, 80% 100%, 100% 0, 100% 100%, 0 100%); }
    .boss-weapon-ui { position: absolute; top: 20px; left: -30px; width: 60px; height: 15px; background: #2c3e50; border-radius: 5px; transform-origin: right center; animation: bossWeaponIdle 2s infinite alternate; }
    @keyframes bossWeaponIdle { 0% { transform: rotate(-10deg); } 100% { transform: rotate(10deg); } }

    /* 오프닝 화면 */
    #opening-screen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(20, 25, 30, 0.95); z-index: 300; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
    .title-text { font-size: 48px; font-weight: bold; text-shadow: 0 0 20px #3498db; margin-bottom: 10px; text-align: center; line-height: 1.2; }
    .subtitle-text { font-size: 18px; color: #aaa; margin-bottom: 40px; }
    
    /* 오프닝 애니메이션 (인게임 캐릭터와 흡사하게) */
    .clash-container { position: relative; width: 300px; height: 120px; margin-bottom: 30px; display: flex; align-items: center; }
    .clash-char { width: 50px; height: 50px; border-radius: 50%; position: absolute; border: 2px solid white; box-shadow: 0 0 15px rgba(255,255,255,0.5); display: flex; align-items: center; }
    
    /* 캐릭터 눈 */
    .eyes { position: absolute; top: 12px; width: 100%; display: flex; justify-content: center; gap: 8px; z-index: 5; }
    .eye { width: 6px; height: 6px; background: white; border-radius: 50%; box-shadow: 0 0 5px white; }
    .clash-boss .eye { background: #f1c40f; box-shadow: 0 0 8px red; }

    .clash-player { background: #3498db; left: 0; animation: clashLeft 2.5s infinite; justify-content: flex-end; }
    .intro-sword { position: absolute; right: -30px; width: 40px; height: 8px; background: #bdc3c7; border-radius: 4px; transform-origin: left center; animation: swingPlayer 2.5s infinite; }
    
    .clash-boss { background: #8e44ad; right: 0; border: 4px solid #f1c40f; animation: clashRight 2.5s infinite; justify-content: flex-start; }
    .intro-boss-weapon { position: absolute; left: -40px; width: 50px; height: 12px; background: #2c3e50; border-radius: 4px; transform-origin: right center; animation: swingBoss 2.5s infinite; }
    .intro-crown { position: absolute; top: -15px; left: 5px; width: 40px; height: 20px; background: linear-gradient(#f1c40f, #e67e22); clip-path: polygon(0 0, 20% 100%, 50% 0, 80% 100%, 100% 0, 100% 100%, 0 100%); z-index: 6; }
    
    .clash-spark { position: absolute; left: 135px; width: 30px; height: 30px; font-size: 40px; line-height: 30px; text-align: center; opacity: 0; animation: sparkAnim 2.5s infinite; z-index: 10; }
    
    @keyframes clashLeft { 0% { left: 0; } 15% { left: 100px; } 25% { left: 80px; } 35% { left: 100px; } 45% { left: 80px; } 55% { left: 100px; } 70% { left: 0; } 100% { left: 0; } }
    @keyframes clashRight { 0% { right: 0; } 15% { right: 100px; } 25% { right: 80px; } 35% { right: 100px; } 45% { right: 80px; } 55% { right: 100px; } 70% { right: 0; } 100% { right: 0; } }
    @keyframes swingPlayer { 0%, 10%, 25%, 45%, 70%, 100% { transform: rotate(-40deg); } 15%, 35%, 55% { transform: rotate(45deg); } }
    @keyframes swingBoss { 0%, 10%, 25%, 45%, 70%, 100% { transform: rotate(40deg); } 15%, 35%, 55% { transform: rotate(-45deg); } }
    @keyframes sparkAnim { 0%, 14% { opacity: 0; transform: scale(0.5); } 15% { opacity: 1; transform: scale(1.5); } 20% { opacity: 0; } 34% { opacity: 0; } 35% { opacity: 1; transform: scale(1.5); } 40% { opacity: 0; } 54% { opacity: 0; } 55% { opacity: 1; transform: scale(2); color: yellow; text-shadow: 0 0 20px red; } 65% { opacity: 0; } 100% { opacity: 0; } }

    /* 메인 버튼들 */
    .menu-btn { padding: 15px 40px; font-size: 24px; font-weight: bold; background: transparent; color: white; border: 2px solid #3498db; border-radius: 10px; cursor: pointer; transition: 0.2s; margin-top: 10px; width: 260px; }
    .menu-btn:hover { background: #3498db; box-shadow: 0 0 20px #3498db; transform: scale(1.05); }
    .menu-btn-tutorial { border-color: #f1c40f; color: #f1c40f; font-size: 18px; padding: 10px 30px; margin-top: 20px; }
    .menu-btn-tutorial:hover { background: #f1c40f; color: black; box-shadow: 0 0 20px #f1c40f; }

    /* 튜토리얼 모달 */
    #tutorial-modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 85%; max-width: 500px; background: rgba(10, 15, 20, 0.98); border: 2px solid #f1c40f; border-radius: 15px; padding: 25px; color: white; z-index: 400; display: none; box-shadow: 0 0 30px #f1c40f; overflow-y: auto; max-height: 80%; }
    .tut-header { font-size: 22px; color: #f1c40f; border-bottom: 1px solid #444; padding-bottom: 10px; margin-bottom: 15px; text-align: center; font-weight: bold; }
    .tut-section { margin-bottom: 15px; line-height: 1.6; font-size: 15px; }
    .tut-title { font-weight: bold; color: #3498db; margin-bottom: 8px; font-size: 18px; }
    .tut-close { display: block; margin: 20px auto 0; padding: 10px 30px; background: #3498db; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; }

    /* 증강 내역 UI */
    #augment-history { position: absolute; top: 10px; right: 10px; display: flex; gap: 8px; z-index: 50; flex-wrap: wrap-reverse; justify-content: flex-end; max-width: 200px; }
    .history-icon { width: 35px; height: 35px; background: rgba(0,0,0,0.6); border: 1px solid #aaa; border-radius: 5px; display: flex; justify-content: center; align-items: center; font-size: 18px; box-shadow: 0 0 5px black; }

    /* 무기 및 신규 패턴 투사체 스타일 */
    .slash-green { background: #2ecc71 !important; box-shadow: 0 0 15px #2ecc71 !important; border-radius: 10px !important; }
    .slash-lightning { background: #f1c40f !important; box-shadow: 0 0 15px #00ffff !important; border: 2px solid #fff; }
    .slash-dark { background: #2c3e50 !important; box-shadow: 0 0 20px #8e44ad !important; border: 1px solid #000; }
    .unparryable-attack { background: #e74c3c !important; box-shadow: 0 0 25px #e74c3c !important; border: 2px solid white; }
`;
document.head.appendChild(style);

// 오프닝 스크린 및 튜토리얼 HTML 주입
container.insertAdjacentHTML('beforeend', `
    <div id="opening-screen">
        <div class="title-text">PARRY STRIKE<br><span style="font-size:24px; color:#e74c3c;">Boss Rush</span></div>
        <div class="subtitle-text">적의 패턴을 파악하고 전부 튕겨내세요!</div>
        
        <div class="clash-container">
            <div class="clash-char clash-player">
                <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
                <div class="intro-sword"></div>
            </div>
            <div class="clash-spark">💥</div>
            <div class="clash-char clash-boss">
                <div class="intro-crown"></div>
                <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
                <div class="intro-boss-weapon"></div>
            </div>
        </div>

        <button class="menu-btn" onclick="startGame()">▶ 게임 시작</button>
        <button class="menu-btn menu-btn-tutorial" onclick="showTutorial()">📖 게임 시스템 요약 (필독)</button>
    </div>

    <div id="tutorial-modal">
        <div class="tut-header">📖 생존 가이드 & 패턴 요약</div>
        <div class="tut-section">
            1️⃣ <b>우측 상단 UI:</b> 획득한 증강(스킬) 내역이 표시됩니다.<br>
            2️⃣ <b>자동 패링:</b> 패링 성공 시 쿨타임이 즉시 초기화되며, 잠깐 동안 적의 연속 공격을 자동으로 튕겨내는 판정이 생깁니다.
        </div>
        <div class="tut-section">
            <div class="tut-title">⚠️ 적의 특수 공격 패턴</div>
            <span style="color:#f1c40f; font-weight:bold;">🟨 [노란색 ❗] 돌진 공격</span><br>
            - 패링 시 보스 스턴 + 100의 강력한 반동 데미지!<br><br>
            
            <span style="color:#8e44ad; font-weight:bold;">🟪 [보라색 ❗] 거합 베기</span><br>
            - 속도가 매우 빠르고 피하기 어렵습니다. <b>무조건 패링</b>으로 튕겨내세요!<br><br>

            <span style="color:#2ecc71; font-weight:bold;">🟩 [초록색 ❗] 연사 레이저 빔</span><br>
            - 기관총처럼 발사됩니다. 첫 공격만 패링하면 자동 패링 판정으로 <b>'따다당'</b> 전부 막아냅니다!<br><br>

            <span style="color:#e74c3c; font-weight:bold;">🟥 [빨간색 ❌] 폭격 레이저</span><br>
            - <b>패링 절대 불가!</b> 방어할 수 없습니다. 대시(Shift / 💨)의 무적 시간으로 회피하세요!
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

// 오디오 설정
const audioDead = new Audio('./Dead.mp3');
const audioAttack1 = new Audio('./Attack1.mp3');
const audioAttack2 = new Audio('./Attack2.mp3');
const audioParry = new Audio('./Parry.mp3');
const audioParryed = new Audio('./Parryed.mp3');
const audioSwing = new Audio('./Swing.mp3');

function playSound(type) {
    let sound;
    if (type === 'hit') sound = Math.random() < 0.5 ? audioAttack1 : audioAttack2;
    else if (type === 'dead') sound = audioDead;
    else if (type === 'parry') sound = audioParry;
    else if (type === 'parryed') sound = audioParryed;
    else if (type === 'swing') sound = audioSwing;
    if (sound) { sound.volume = 0.1; sound.currentTime = 0; sound.play().catch(e => {}); }
}

let GAME_WIDTH = container.clientWidth;
let GAME_HEIGHT = container.clientHeight;
window.addEventListener('resize', () => { GAME_WIDTH = container.clientWidth; GAME_HEIGHT = container.clientHeight; });

// ================= 입력 처리 (마우스 타겟팅 & 모바일) =================
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
container.addEventListener('mousemove', e => {
    const rect = container.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left; mousePos.y = e.clientY - rect.top;
});
container.addEventListener('mousedown', e => {
    if(e.target.closest('#mobile-controls') || e.target.closest('.modal') || e.target.closest('#opening-screen')) return;
    isMobileEnv = false;
    if (e.button === 0) isAttacking = true;
    else if (e.button === 2) activateParry();
});
window.addEventListener('mouseup', e => { if (e.button === 0) isAttacking = false; });
window.addEventListener('touchstart', () => { isMobileEnv = true; }, {passive: true});

// 모바일 조이스틱
let joyActive = false; let joyCenter = { x: 0, y: 0 }; let joystickDelta = { x: 0, y: 0 };
const joyArea = document.getElementById('joystick-area');
const joyKnob = document.getElementById('joystick-knob');

joyArea.addEventListener('touchstart', (e) => {
    joyActive = true; let rect = joyArea.getBoundingClientRect();
    joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateJoystick(e.touches[0]);
});
joyArea.addEventListener('touchmove', (e) => { if (joyActive) { e.preventDefault(); updateJoystick(e.touches[0]); } }, {passive: false});
joyArea.addEventListener('touchend', () => { joyActive = false; joyKnob.style.transform = `translate(0px, 0px)`; joystickDelta = { x: 0, y: 0 }; });

function updateJoystick(touch) {
    let dx = touch.clientX - joyCenter.x; let dy = touch.clientY - joyCenter.y;
    let dist = Math.hypot(dx, dy); let maxDist = 40;
    if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; }
    joyKnob.style.transform = `translate(${dx}px,${dy}px)`;
    joystickDelta = { x: dx / maxDist, y: dy / maxDist };
}

const mobAttack = document.getElementById('mob-attack');
mobAttack.addEventListener('touchstart', (e) => { e.preventDefault(); isAttacking = true; }, {passive: false});
mobAttack.addEventListener('touchend', (e) => { e.preventDefault(); isAttacking = false; }, {passive: false});
document.getElementById('mob-parry').addEventListener('touchstart', (e) => { e.preventDefault(); activateParry(); }, {passive: false});
document.getElementById('mob-dash').addEventListener('touchstart', (e) => { e.preventDefault(); doDash(); }, {passive: false});
document.getElementById('mob-skill').addEventListener('touchstart', (e) => { e.preventDefault(); doSkill(); }, {passive: false});

// ================= 게임 객체 초기화 =================
const initPlayer = () => ({
    x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, speed: 2.5, radius: 25,
    hp: 100, maxHp: 100, exp: 0, maxExp: 200, level: 1, damage: 10,
    attackCount: 1, baseAttackCooldown: 30, attackCooldown: 0,
    attackQueue: 0, burstTimer: 0,
    isParrying: false, parryTimer: 0, parryCooldown: 0, autoParryTimer: 0,
    isDashing: false, dashTimer: 0, dashCooldown: 0, dashDir: {x: 1, y: 0},
    hasSkill: false, skillCooldown: 0, maxSkillCooldown: 600,
    isGrabbed: false, grabTimer: 0, lifesteal: 0, skillDamageMult: 2,
    weaponType: 'normal', dashDamage: false, parryHeal: false, waveChance: false,
    augments: []
});
let player = initPlayer();
let bossLevel = 1; let bosses = []; let projectiles = []; let blasters = [];

// ================= 오프닝 & 메뉴 로직 =================
window.startGame = function() {
    document.getElementById('opening-screen').style.display = 'none';
    isPaused = false;
    spawnBosses();
    updateUI();
    requestAnimationFrame(update);
}
window.showTutorial = function() { document.getElementById('tutorial-modal').style.display = 'block'; }
window.closeTutorial = function() { document.getElementById('tutorial-modal').style.display = 'none'; }

// 유틸 함수들
function getDistance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

function getClosestBossTo(targetX, targetY) {
    if(bosses.length === 0) return null;
    let closest = bosses[0]; let minDist = getDistance(targetX, targetY, closest.x, closest.y);
    for(let i=1; i<bosses.length; i++) {
        let dist = getDistance(targetX, targetY, bosses[i].x, bosses[i].y);
        if(dist < minDist) { closest = bosses[i]; minDist = dist; }
    }
    return closest;
}
function getClosestBoss() { return getClosestBossTo(player.x, player.y); }

function spawnDamageText(x, y, damage, type = 'normal') {
    const el = document.createElement('div');
    el.className = 'damage-text ' + (type === 'crit' ? 'crit-text' : type === 'fire' ? 'fire-text' : type === 'heal' ? 'heal-text' : type === 'player' ? 'player-dmg-text' : '');
    el.innerText = isNaN(damage) ? damage : (type === 'heal' ? `+\${damage} HP` : Math.floor(damage));
    el.style.left = x + 'px'; el.style.top = (y - 30) + 'px';
    const randX = (Math.random() - 0.5) * 40; el.style.transform = `translateX(calc(-50% + \${randX}px))`;
    container.appendChild(el); setTimeout(() => el.remove(), 600);
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        let p = document.createElement('div'); p.className = 'particle'; p.style.backgroundColor = color;
        p.style.width = (Math.random() * 6 + 4) + 'px'; p.style.height = p.style.width;
        p.style.left = x + 'px'; p.style.top = y + 'px';
        let angle = Math.random() * Math.PI * 2; let dist = Math.random() * 60 + 20;
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px'); p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        container.appendChild(p); setTimeout(() => p.remove(), 400);
    }
}

function spawnFireTrail(x, y) {
    let t = document.createElement('div'); t.className = 'fire-trail'; t.style.left = x + 'px'; t.style.top = y + 'px';
    container.appendChild(t); setTimeout(() => t.remove(), 300);
}

function createScreenFlash() {
    let flash = document.createElement('div'); flash.className = 'screen-flash';
    container.appendChild(flash); setTimeout(() => flash.remove(), 300);
}

function createDashShadow() {
    let shadow = document.createElement('div'); shadow.className = 'dash-shadow';
    shadow.style.left = player.x + 'px'; shadow.style.top = player.y + 'px';
    container.appendChild(shadow); setTimeout(() => shadow.remove(), 300);
}

function spawnBosses() {
    bosses.forEach(b => { b.el.remove(); b.uiEl.remove(); }); bosses = [];
    for(let i = 0; i < bossLevel; i++) {
        const el = originalBossEl.cloneNode(true);
        el.style.display = 'block'; el.style.position = 'absolute'; el.style.transform = 'translate(-50%, -50%)'; el.style.zIndex = '10';

        el.innerHTML = '';
        if (bossLevel >= 5) {
            el.style.border = '4px solid #f1c40f'; el.style.backgroundColor = '#8e44ad';
            el.innerHTML = '<div class="boss-crown"></div><div class="boss-weapon-ui"></div>';
        } else if (bossLevel >= 3) {
            el.style.border = '4px solid #95a5a6'; el.style.backgroundColor = '#c0392b';
            el.innerHTML = '<div class="boss-helmet"></div>';
        } else {
            el.style.backgroundColor = '#e74c3c';
        }

        const uiEl = document.createElement('div');
        uiEl.style.position = 'absolute'; uiEl.style.width = '100px'; uiEl.style.transform = 'translate(-50%, -15px)'; uiEl.style.textAlign = 'center'; uiEl.style.zIndex = '11';

        const nameEl = document.createElement('div'); 
        nameEl.innerText = bossLevel >= 5 ? `Lv.\${bossLevel} Demon Knight` : bossLevel >= 3 ? `Lv.\${bossLevel} Armored Boss` : `Lv.\${bossLevel} Boss`;
        nameEl.style.color = bossLevel >= 5 ? '#f1c40f' : '#fff'; nameEl.style.fontSize = '12px'; nameEl.style.fontWeight = 'bold'; nameEl.style.marginBottom = '2px'; nameEl.style.textShadow = '1px 1px 2px #000';

        const hpBg = document.createElement('div'); hpBg.style.width = '100%'; hpBg.style.height = '8px'; hpBg.style.backgroundColor = 'rgba(0,0,0,0.5)'; hpBg.style.border = '1px solid #000';
        const hpFill = document.createElement('div'); hpFill.style.width = '100%'; hpFill.style.height = '100%'; hpFill.style.backgroundColor = '#e74c3c'; hpFill.style.transition = 'width 0.1s';
        hpBg.appendChild(hpFill); uiEl.appendChild(nameEl); uiEl.appendChild(hpBg);
        container.appendChild(el); container.appendChild(uiEl);

        let maxHp = 50 + (bossLevel * 100); let spacing = GAME_WIDTH / (bossLevel + 1);
        bosses.push({
            x: spacing * (i + 1), y: 100 + (Math.random() * 80), radius: 50, hp: maxHp, maxHp: maxHp, state: 'idle', stateTimer: Math.floor(Math.random() * 40),
            vx: 2 * (i % 2 === 0 ? 1 : -1), vy: 0, dashSpeed: 20 + bossLevel, dashHitDelay: 0, freezeStack: 0, isFrozen: false, freezeTimer: 0, el: el, uiEl: uiEl, hpFill: hpFill
        });
    }
    const topBossName = document.getElementById('boss-name');
    if(topBossName) topBossName.innerText = `WAVE ${bossLevel} (적 ${bossLevel}마리)`;
}

// ❌ 빨간색 표식이 뜨는 패링 불가 공격 (블래스터)
function createBlaster(x, y, angle, owner) {
    playSound('parry');
    const el = document.createElement('div'); el.className = 'gaster-blaster';
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.transform = `translate(-50%, -50%) rotate(\${angle}rad)`;
    
    const eye = document.createElement('div'); 
    eye.innerText = '❌'; eye.style.position = 'absolute'; eye.style.right = '-10px'; eye.style.top = '-15px'; 
    eye.style.fontSize = '20px'; eye.style.textShadow = '0 0 10px #f00'; el.appendChild(eye);

    const telegraph = document.createElement('div'); telegraph.className = 'blaster-telegraph'; el.appendChild(telegraph);
    container.appendChild(el); blasters.push({ x, y, angle, timer: 35, el, telegraph, owner });
}

function takeDamage(amount) {
    player.hp -= amount; updateUI(); playSound('hit');
    playerEl.classList.add('hit-flash'); container.classList.add('screen-shake');
    spawnDamageText(player.x, player.y, amount, 'player'); spawnParticles(player.x, player.y, '#e74c3c', 10);
    setTimeout(() => { playerEl.classList.remove('hit-flash'); container.classList.remove('screen-shake'); }, 300);
}

function bossHitEffect(targetBoss, x, y, damage, isCrit = false) {
    playSound('hit'); targetBoss.el.classList.add('boss-hit-flash'); setTimeout(() => targetBoss.el.classList.remove('boss-hit-flash'), 200);
    spawnDamageText(targetBoss.x, targetBoss.y, damage, isCrit ? 'crit' : 'normal'); spawnParticles(x, y, isCrit ? '#f1c40f' : '#e74c3c', 12);
    let impact = document.createElement('div'); impact.className = 'impact-effect'; impact.style.left = x + 'px'; impact.style.top = y + 'px'; impact.style.setProperty('--rot', `\${Math.random() * 360}deg`);
    container.appendChild(impact); setTimeout(() => impact.remove(), 200);
}

function checkBossDeath(b) {
    if (b.hp <= 0) {
        playSound('dead'); b.el.remove(); b.uiEl.remove();
        bosses = bosses.filter(boss => boss !== b);
        if (bosses.length === 0) {
            bossLevel++; player.hp = Math.min(player.maxHp, player.hp + 50);
            setTimeout(() => alert(`웨이브 클리어! 다음 단계(Lv.${bossLevel})로 진입합니다!\n(적 ${bossLevel}마리 등장, 체력 소폭 회복)`), 100);
            spawnBosses(); updateUI();
        }
    }
}

function doAttack() {
    if(isPaused || player.attackCooldown > 0 || player.isDashing) return;
    playSound('swing'); playerEl.classList.add('attack-anim');
    setTimeout(() => playerEl.classList.remove('attack-anim'), 200);

    let target = isMobileEnv ? getClosestBossTo(player.x, player.y) : getClosestBossTo(mousePos.x, mousePos.y);
    let tx = target ? target.x : player.x; 
    let ty = target ? target.y : player.y - 10;
    const baseAngle = Math.atan2(ty - player.y, tx - player.x);

    playerSwordEl.style.transform = `rotate(\${baseAngle}rad)`;
    setTimeout(() => { playerSwordEl.style.transform = 'rotate(0deg)'; }, 200);

    if (player.waveChance && Math.random() < 0.3) {
        spawnProjectile(player.x, player.y, baseAngle - 0.3, 12, player.damage, false, 70);
        spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70);
        spawnProjectile(player.x, player.y, baseAngle + 0.3, 12, player.damage, false, 70);
    } else {
        spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70);
    }
    player.attackQueue = player.attackCount - 1; player.burstTimer = 8; player.attackCooldown = player.baseAttackCooldown;
}

function activateParry() {
    if(isPaused || player.parryCooldown > 0 || player.isParrying || player.isDashing) return;
    playSound('parry'); player.isParrying = true; player.parryTimer = 60;
    playerEl.classList.add('parrying'); playerEl.classList.remove('parry-cd');
    parryStatusEl.innerText = "패링 중!! (이동 불가)"; parryStatusEl.style.color = "#00ffff";
}

function doSkill() {
    if (player.hasSkill && player.skillCooldown <= 0 && !isPaused && !player.isDashing) {
        playSound('swing'); player.skillCooldown = player.maxSkillCooldown;
        playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
        createScreenFlash(); spawnParticles(player.x, player.y, '#f1c40f', 30);
        for (let i = 0; i < 8; i++) spawnProjectile(player.x, player.y, (Math.PI / 4) * i, 15, player.damage * player.skillDamageMult, false, 120, true);
    }
}

function doDash() {
    if (isPaused || player.dashCooldown > 0 || player.isDashing) return;
    playSound('swing'); player.isDashing = true; player.dashTimer = 12; player.dashCooldown = 90;
    let dx = 0, dy = 0;
    if (joystickDelta.x !== 0 || joystickDelta.y !== 0) { dx = joystickDelta.x; dy = joystickDelta.y; } 
    else {
        if (keys.w) dy -= 1; if (keys.s) dy += 1; if (keys.a) dx -= 1; if (keys.d) dx += 1;
        if (dx === 0 && dy === 0) dx = 1;
    }
    let len = Math.hypot(dx, dy); player.dashDir = { x: dx/len, y: dy/len };
    playerEl.style.opacity = '0.4'; setTimeout(() => playerEl.style.opacity = '1', 200);
}

function spawnProjectile(x, y, angle, speed, damage, isBoss, size, isHeavy = false, isGrab = false, owner = null, isLaser = false, isUnparryable = false, customClass = '') {
    const el = document.createElement('div');
    el.className = `slash ${isBoss ? 'boss-slash' : ''} ${isHeavy ? 'heavy-slash' : ''} ${isGrab ? 'grab-slash' : ''} ${isLaser ? 'laser-slash' : ''} ${isUnparryable ? 'unparryable-attack' : ''} ${customClass}`;
    if(isHeavy && !isBoss && !isLaser) el.style.borderRightColor = "#00ffff";
    
    if (!isBoss) {
        if (player.weaponType === 'fire') { el.classList.add('slash-fire'); }
        else if (player.weaponType === 'ice') { el.classList.add('slash-ice'); size *= 1.5; }
        else if (player.weaponType === 'lightning') { el.classList.add('slash-lightning'); speed *= 1.5; }
        else if (player.weaponType === 'dark') { el.classList.add('slash-dark'); size *= 1.8; damage *= 1.2; }
    }
    el.style.transform = `translate(-50%, -50
