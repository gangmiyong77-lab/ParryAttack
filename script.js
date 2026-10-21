const container = document.getElementById('game-container');
const playerEl = document.getElementById('player');
const floatingCdEl = document.getElementById('floating-cd');
const parryStatusEl = document.getElementById('parry-status');
const skillStatusEl = document.getElementById('skill-status');

// 플레이어 검 요소 동적 생성 (무기 외형 변경을 위함)
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
    .clash-player { background: #3498db; left: 0; animation: clashLeft 2.5s infinite; justify-content: flex-end; }
    .intro-sword { position: absolute; right: -30px; width: 40px; height: 8px; background: #bdc3c7; border-radius: 4px; }
    .clash-boss { background: #8e44ad; right: 0; border: 4px solid #f1c40f; animation: clashRight 2.5s infinite; justify-content: flex-start; }
    .intro-boss-weapon { position: absolute; left: -40px; width: 50px; height: 12px; background: #2c3e50; border-radius: 4px; }
    .intro-crown { position: absolute; top: -15px; left: 5px; width: 40px; height: 20px; background: linear-gradient(#f1c40f, #e67e22); clip-path: polygon(0 0, 20% 100%, 50% 0, 80% 100%, 100% 0, 100% 100%, 0 100%); }
    .clash-spark { position: absolute; left: 135px; width: 30px; height: 30px; font-size: 40px; line-height: 30px; text-align: center; opacity: 0; animation: sparkAnim 2.5s infinite; z-index: 10; }
    
    @keyframes clashLeft { 0% { left: 0; } 15% { left: 100px; } 25% { left: 80px; } 35% { left: 100px; } 45% { left: 80px; } 55% { left: 100px; } 70% { left: 0; } 100% { left: 0; } }
    @keyframes clashRight { 0% { right: 0; } 15% { right: 100px; } 25% { right: 80px; } 35% { right: 100px; } 45% { right: 80px; } 55% { right: 100px; } 70% { right: 0; } 100% { right: 0; } }
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

    /* 신규 패턴 및 무기 투사체 스타일 */
    .slash-purple { background: #8e44ad !important; box-shadow: 0 0 20px #8e44ad !important; }
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
            <div class="clash-char clash-player"><div class="intro-sword"></div></div>
            <div class="clash-spark">💥</div>
            <div class="clash-char clash-boss"><div class="intro-crown"></div><div class="intro-boss-weapon"></div></div>
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
            - 속도가 매우 빠르고 피하기 어렵습니다. <b>무조건 패링</b>으로 막아내세요.<br><br>

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
    joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
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
    el.innerText = isNaN(damage) ? damage : (type === 'heal' ? `+${damage} HP` : Math.floor(damage));
    el.style.left = x + 'px'; el.style.top = (y - 30) + 'px';
    const randX = (Math.random() - 0.5) * 40; el.style.transform = `translateX(calc(-50% + ${randX}px))`;
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

        // 보스 진화 외형 적용 (레벨에 따른 갑옷/무기)
        el.innerHTML = ''; // 초기화
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
        nameEl.innerText = bossLevel >= 5 ? `Lv.${bossLevel} Demon Knight` : bossLevel >= 3 ? `Lv.${bossLevel} Armored Boss` : `Lv.${bossLevel} Boss`;
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

function createBlaster(x, y, angle, owner) {
    playSound('parry');
    const el = document.createElement('div'); el.className = 'gaster-blaster';
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    
    // 블래스터 상단에 패링 불가 표시 ❌
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
    let impact = document.createElement('div'); impact.className = 'impact-effect'; impact.style.left = x + 'px'; impact.style.top = y + 'px'; impact.style.setProperty('--rot', `${Math.random() * 360}deg`);
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

    // 무기 회전 애니메이션 처리 (마우스 조준 방향으로 칼을 뻗도록)
    playerSwordEl.style.transform = `rotate(${baseAngle}rad)`;
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
    el.className = `slash ${isBoss ? 'boss-slash' : ''} ${isHeavy ? 'heavy-slash' : ''} ${isLaser ? 'laser-slash' : ''} ${isUnparryable ? 'unparryable-attack' : ''} ${customClass}`;
    if(isHeavy && !isBoss && !isLaser) el.style.borderRightColor = "#00ffff";
    
    // 신규 무기 속성 추가
    if (!isBoss) {
        if (player.weaponType === 'fire') { el.classList.add('slash-fire'); }
        else if (player.weaponType === 'ice') { el.classList.add('slash-ice'); size *= 1.5; }
        else if (player.weaponType === 'lightning') { el.classList.add('slash-lightning'); speed *= 1.5; }
        else if (player.weaponType === 'dark') { el.classList.add('slash-dark'); size *= 1.8; damage *= 1.2; }
    }
    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`; container.appendChild(el);
    projectiles.push({ x, y, angle, speed, damage, isBoss, radius: (!isBoss && (player.weaponType === 'ice' || player.weaponType === 'dark') ? size/2 * 1.5 : size/2), el, owner, isUnparryable, timer: 0 });
}

function bossLogic() {
    bosses.forEach(boss => {
        if (boss.isFrozen) {
            boss.freezeTimer--; if (boss.freezeTimer <= 0) { boss.isFrozen = false; boss.el.classList.remove('frozen-boss'); }
            boss.el.style.left = boss.x + 'px'; boss.el.style.top = boss.y + 'px'; boss.uiEl.style.left = boss.x + 'px'; boss.uiEl.style.top = (boss.y - boss.radius - 15) + 'px';
            return;
        }

        if (boss.dashHitDelay > 0) boss.dashHitDelay--;

        if (boss.state === 'idle') {
            boss.x += boss.vx; if (boss.x < boss.radius + 50 || boss.x > GAME_WIDTH - boss.radius - 50) boss.vx *= -1;
            boss.stateTimer++;
            if (boss.stateTimer > 90) {
                const rand = Math.random(); boss.stateTimer = 0;
                if (bossLevel < 2) { 
                    if (rand < 0.2) boss.state = 'pattern1'; else if (rand < 0.4) boss.state = 'pattern2'; else if (rand < 0.6) boss.state = 'pattern3'; else if (rand < 0.8) boss.state = 'pattern4'; else boss.state = 'pattern5'; 
                } else if (bossLevel < 4) { 
                    if (rand < 0.15) boss.state = 'pattern1'; else if (rand < 0.3) boss.state = 'pattern2'; else if (rand < 0.45) boss.state = 'pattern5'; else if (rand < 0.6) boss.state = 'pattern6'; else if (rand < 0.8) boss.state = 'pattern8'; else boss.state = 'pattern3'; 
                } else { 
                    if (rand < 0.1) boss.state = 'pattern1'; else if (rand < 0.2) boss.state = 'pattern2'; else if (rand < 0.3) boss.state = 'pattern3'; else if (rand < 0.4) boss.state = 'pattern5'; else if (rand < 0.6) boss.state = 'pattern6'; else if (rand < 0.8) boss.state = 'pattern8'; else boss.state = 'pattern7'; 
                }
            }
        } else {
            boss.stateTimer++; const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
            if (boss.stateTimer === 1 && boss.state !== 'pattern7' && boss.state !== 'pattern6' && boss.state !== 'pattern8') boss.el.classList.add('eye-glow');

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
                        if (player.isDashing) { } // 회피
                        else if (player.isParrying || player.autoParryTimer > 0) { // 패링 성공
                            createScreenFlash(); spawnParticles(player.x, player.y, '#0ff', 40); player.autoParryTimer = 6; playSound('parryed'); player.isParrying = false; playerEl.classList.remove('parrying', 'parry-cd'); playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                            if (player.parryHeal) { player.hp = Math.min(player.maxHp, player.hp + 20); spawnDamageText(player.x, player.y, 20, 'heal'); }
                            player.parryCooldown = 0; parryStatusEl.innerText = "돌진 저지 성공! (보스 기절)"; parryStatusEl.style.color = "#2ecc71";
                            boss.hp -= 100; gainExp(50); boss.stateTimer = 90; bossHitEffect(boss, boss.x, boss.y, 100, true); checkBossDeath(boss);
                        } else { takeDamage(30); boss.stateTimer = 90; }
                    }
                }
                if (boss.stateTimer >= 90) { boss.el.classList.remove('boss-dashing'); resetBossState(boss); }
            }
            else if (boss.state === 'pattern6') { // 보라색 거합 베기 (패링 가능하게 변경됨)
                if (boss.stateTimer === 1) {
                    boss.el.style.backgroundColor = '#8e44ad'; boss.el.classList.add('boss-telegraph', 'boss-shake');
                    let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'grab-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 15px #8e44ad'; boss.el.appendChild(warning);
                }
                if (boss.stateTimer === 50) {
                    playSound('swing'); boss.el.style.backgroundColor = '#9b59b6'; boss.el.classList.remove('boss-telegraph', 'boss-shake'); let warn = boss.el.querySelector('.grab-warning'); if(warn) warn.remove(); boss.el.classList.add('boss-attack-anim'); 
                    spawnProjectile(boss.x, boss.y, angleToPlayer, 25, 30, true, 180, true, false, boss, false, false, 'slash-purple');
                }
                if (boss.stateTimer > 90) resetBossState(boss);
            }
            else if (boss.state === 'pattern8') { // 초록색 연사 레이저 빔
                if (boss.stateTimer === 1) {
                    boss.el.style.backgroundColor = '#2ecc71'; boss.el.classList.add('boss-telegraph');
                    let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'grab-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 15px #2ecc71'; boss.el.appendChild(warning);
                }
                if (boss.stateTimer >= 60 && boss.stateTimer <= 80) {
                    if (boss.stateTimer === 60) { boss.el.classList.remove('boss-telegraph'); let warn = boss.el.querySelector('.grab-warning'); if(warn) warn.remove(); boss.el.classList.add('boss-attack-anim'); }
                    // 2프레임마다 초고속 빔 발사 (자동 연쇄 패링 가능)
                    if (boss.stateTimer % 2 === 0) {
                        playSound('swing'); 
                        spawnProjectile(boss.x, boss.y, angleToPlayer, 35, 5, true, 40, false, false, boss, false, false, 'slash-green');
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
    let warn = boss.el.querySelector('.dash-warning'); if(warn) warn.remove(); let warn2 = boss.el.querySelector('.grab-warning'); if(warn2) warn2.remove();
}

function update() {
    if (isPaused) { requestAnimationFrame(update); return; }

    if (isAttacking) doAttack();
    if (player.autoParryTimer > 0) player.autoParryTimer--;

    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.dashCooldown <= 0) { dashStatusEl.innerText = "[Shift] 대시 준비 완료"; dashStatusEl.style.color = "#2ecc71"; }
    else { dashStatusEl.innerText = `대시 쿨타임: ${(player.dashCooldown/60).toFixed(1)}초`; dashStatusEl.style.color = "#7f8c8d"; }

    if (player.isDashing) {
        player.x += player.dashDir.x * 15; player.y += player.dashDir.y * 15;
        player.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, player.x)); player.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, player.y));
        player.dashTimer--; if (player.dashTimer % 2 === 0) createDashShadow();

        if (player.dashDamage) {
            bosses.forEach(b => {
                if (getDistance(player.x, player.y, b.x, b.y) < player.radius + b.radius + 30) {
                    if (b.dashHitDelay <= 0) { b.hp -= player.damage; gainExp(player.damage); bossHitEffect(b, b.x, b.y, player.damage, true); checkBossDeath(b); b.dashHitDelay = 30; }
                }
            });
        }
        if (player.dashTimer <= 0) player.isDashing = false;
    } else if (!player.isParrying) {
        if (joystickDelta.x !== 0 || joystickDelta.y !== 0) {
            let nextX = player.x + joystickDelta.x * player.speed; let nextY = player.y + joystickDelta.y * player.speed;
            player.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, nextX)); player.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, nextY));
        } else {
            if (keys.w && player.y > player.radius) player.y -= player.speed; if (keys.s && player.y < GAME_HEIGHT - player.radius) player.y += player.speed;
            if (keys.a && player.x > player.radius) player.x -= player.speed; if (keys.d && player.x < GAME_WIDTH - player.radius) player.x += player.speed;
        }
    }

    playerEl.style.left = player.x + 'px'; playerEl.style.top = player.y + 'px';

    if (player.attackQueue > 0) {
        player.burstTimer--;
        if (player.burstTimer <= 0) {
            playSound('swing');
            let target = isMobileEnv ? getClosestBossTo(player.x, player.y) : getClosestBossTo(mousePos.x, mousePos.y);
            let tx = target ? target.x : player.x; let ty = target ? target.y : player.y - 10;
            let baseAngle = Math.atan2(ty - player.y, tx - player.x);

            playerSwordEl.style.transform = `rotate(${baseAngle}rad)`;
            setTimeout(() => { playerSwordEl.style.transform = 'rotate(0deg)'; }, 200);

            if (player.waveChance && Math.random() < 0.3) {
                spawnProjectile(player.x, player.y, baseAngle - 0.3, 12, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle + 0.3, 12, player.damage, false, 70);
            } else { spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70); }
            player.attackQueue--; player.burstTimer = 8;
        }
    }

    if(player.attackCooldown > 0) player.attackCooldown--;

    if (player.isParrying) {
        player.parryTimer--;
        if (player.parryTimer <= 0) { player.isParrying = false; playerEl.classList.remove('parrying'); playerEl.classList.add('parry-cd'); player.parryCooldown = 300; }
    } else {
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
            playSound('swing'); bl.telegraph.remove(); 
            // 블래스터 폭발 (isUnparryable = true)
            spawnProjectile(bl.x, bl.y, bl.angle, 25, 15, true, 100, true, false, bl.owner, true, true);
            bl.el.style.opacity = '0'; bl.el.style.transform = `translate(-50%, -50%) rotate(${bl.angle}rad) translateX(-20px)`;
        } else if (bl.timer === -15) { bl.el.remove(); blasters.splice(i, 1); }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += Math.cos(p.angle) * p.speed; p.y += Math.sin(p.angle) * p.speed;
        p.el.style.left = p.x + 'px'; p.el.style.top = p.y + 'px'; p.el.style.transform = `translate(-50%, -50%) rotate(${p.angle}rad)`; p.timer++;

        if (!p.isBoss && player.weaponType === 'fire' && p.timer % 2 === 0) { spawnFireTrail(p.x, p.y); }
        if (p.x < -100 || p.x > GAME_WIDTH + 100 || p.y < -100 || p.y > GAME_HEIGHT + 100) { p.el.remove(); projectiles.splice(i, 1); continue; }

        if (p.isBoss) {
            if (getDistance(p.x, p.y, player.x, player.y) < player.radius + p.radius) {
                if (player.isDashing) { } 
                else if ((player.isParrying || player.autoParryTimer > 0) && !p.isUnparryable) {
                    createScreenFlash(); spawnParticles(player.x, player.y, '#0ff', 20); player.autoParryTimer = 6; playSound('parryed'); player.isParrying = false; playerEl.classList.remove('parrying', 'parry-cd'); playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                    if (player.parryHeal) { player.hp = Math.min(player.maxHp, player.hp + 20); spawnDamageText(player.x, player.y, 20, 'heal'); }
                    
                    player.parryCooldown = 0; floatingCdEl.innerText = ""; parryStatusEl.innerText = "패링 반사 성공!"; parryStatusEl.style.color = "#2ecc71";
                    
                    p.isBoss = false; p.el.classList.remove('boss-slash', 'heavy-slash', 'laser-slash', 'unparryable-attack', 'slash-purple', 'slash-green');
                    let target = isMobileEnv ? getClosestBossTo(p.x, p.y) : getClosestBossTo(mousePos.x, mousePos.y); 
                    p.angle = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.angle + Math.PI;
                    p.speed *= 1.5; p.damage *= 2;
                } else {
                    takeDamage(p.damage); p.el.remove(); projectiles.splice(i, 1);
                }
            }
        } else {
            for(let j = bosses.length - 1; j >= 0; j--) {
                let b = bosses[j];
                if (getDistance(p.x, p.y, b.x, b.y) < b.radius + p.radius) {
                    b.hp -= p.damage; gainExp(p.damage);
                    if (player.lifesteal > 0 && player.hp < player.maxHp) player.hp = Math.min(player.maxHp, player.hp + player.lifesteal);
                    updateUI(); bossHitEffect(b, p.x, p.y, p.damage, false);
                    if (player.weaponType === 'ice') {
                        b.freezeStack++; spawnParticles(p.x, p.y, '#00ffff', 5);
                        if (b.freezeStack >= 4) { b.isFrozen = true; b.freezeTimer = 180; b.freezeStack = 0; b.el.classList.add('frozen-boss'); spawnDamageText(b.x, b.y, 'FREEZE!', 'crit'); }
                    } else if (player.weaponType === 'fire') { spawnParticles(p.x, p.y, '#e67e22', 15); b.hp -= 5; spawnDamageText(b.x, b.y + 20, 5, 'fire'); }
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
    
    player.augments = []; player.weaponType = 'normal'; player.hasSkill = false; player.damage = 10; player.attackCount = 1; player.lifesteal = 0;
    document.getElementById('augment-history').innerHTML = ''; playerSwordEl.style.background = '#bdc3c7';

    projectiles.forEach(p => p.el.remove()); projectiles = []; blasters.forEach(b => b.el.remove()); blasters = [];
    document.querySelectorAll('.unparryable-hit, .impact-effect, .damage-text, .particle, .fire-trail, .dash-shadow, .screen-flash').forEach(el => el.remove());
    document.getElementById('game-over-modal').classList.add('hidden');

    const btnSkillEl = document.getElementById('btn-skill');
    if (btnSkillEl) btnSkillEl.classList.add('hidden');
    if (skillStatusEl) skillStatusEl.classList.add('hidden');
    document.getElementById('mob-skill').classList.add('hidden');

    playerEl.classList.remove('player-grabbed', 'parrying', 'parry-deflect', 'parry-cd', 'hit-flash'); container.classList.remove('screen-shake', 'boss-hit-shake');
    spawnBosses(); updateUI(); isPaused = false; requestAnimationFrame(update);
}

function updateUI() {
    document.getElementById('player-hp').style.width = (Math.max(0, player.hp) / player.maxHp * 100) + '%'; document.getElementById('player-exp').style.width = (player.exp / player.maxExp * 100) + '%'; document.getElementById('player-level').innerText = player.level;
    let totalHp = 0; let totalMaxHp = 0;
    bosses.forEach(b => { totalHp += b.hp; totalMaxHp += b.maxHp; b.hpFill.style.width = (Math.max(0, b.hp) / b.maxHp * 100) + '%'; });
    const bossHpTop = document.getElementById('boss-hp'); if(bossHpTop && totalMaxHp > 0) bossHpTop.style.width = (Math.max(0, totalHp) / totalMaxHp * 100) + '%';
}

function showLevelUpModal() {
    isPaused = true; const modal = document.getElementById('level-up-modal'); modal.classList.remove('hidden');

    // 신규 무기(뇌전검, 암흑검)가 포함된 증강 풀
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
        if (aug.id.startsWith('weapon_') && player.weaponType !== 'normal') return false; // 무기는 한 가지만 장착 가능
        return true;
    });

    if (!player.hasSkill) { availablePool.push({ id: 'skill', name: '🌀 회전베기 스킬', desc: '[R]키로 주변 적 전체 공격 획득', unique: true, icon: '🌀' }); }
    else { availablePool.push({ id: 'skill_cooldown', name: '⏳ 깨달음', desc: '회전베기 스킬 쿨타임 감소', unique: false, icon: '⏳' }); }

    availablePool.sort(() => 0.5 - Math.random());
    const containerEl = document.getElementById('augment-container'); containerEl.innerHTML = '';
    availablePool.slice(0, 3).forEach(aug => {
        const btn = document.createElement('button'); btn.className = 'aug-btn';
        btn.innerHTML = `<strong>${aug.name}</strong><br><span style="font-size:13px; color:#aaa;">${aug.desc}</span>`;
        btn.onclick = () => window.selectAugment(aug.id, aug.name, aug.icon); containerEl.appendChild(btn);
    });
}

function gainExp(amount) {
    player.exp += (amount * 1.5);
    if (player.exp >= player.maxExp) { player.level++; player.exp -= player.maxExp; player.maxExp = Math.floor(player.maxExp * 1.15); updateUI(); showLevelUpModal(); }
    updateUI();
}

window.selectAugment = function(type, name, icon) {
    player.augments.push({ id: type, name: name });
    const histDiv = document.getElementById('augment-history');
    const iconEl = document.createElement('div'); iconEl.className = 'history-icon'; iconEl.innerText = icon; iconEl.title = name;
    histDiv.appendChild(iconEl);

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
