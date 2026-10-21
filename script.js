const container = document.getElementById('game-container');
const playerEl = document.getElementById('player');
const floatingCdEl = document.getElementById('floating-cd');
const parryStatusEl = document.getElementById('parry-status');
const skillStatusEl = document.getElementById('skill-status');

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

    /* 오프닝 화면 */
    #opening-screen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(20, 25, 30, 0.95); z-index: 300; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
    .title-text { font-size: 48px; font-weight: bold; text-shadow: 0 0 20px #3498db; margin-bottom: 10px; text-align: center; line-height: 1.2; }
    .subtitle-text { font-size: 18px; color: #aaa; margin-bottom: 40px; }
    
    /* 오프닝 애니메이션 */
    .clash-container { position: relative; width: 300px; height: 120px; margin-bottom: 30px; }
    .clash-char { width: 40px; height: 40px; border-radius: 50%; position: absolute; top: 40px; border: 3px solid white; box-shadow: 0 0 15px rgba(255,255,255,0.5); }
    .clash-player { background: #3498db; left: 0; animation: clashLeft 2.5s infinite; }
    .clash-boss { background: #e74c3c; right: 0; border-radius: 10px; animation: clashRight 2.5s infinite; }
    .clash-spark { position: absolute; left: 140px; top: 30px; width: 20px; height: 20px; font-size: 40px; line-height: 20px; text-align: center; opacity: 0; animation: sparkAnim 2.5s infinite; }
    @keyframes clashLeft { 0% { left: 0; } 15% { left: 110px; } 25% { left: 90px; } 35% { left: 110px; } 45% { left: 90px; } 55% { left: 110px; } 70% { left: 0; } 100% { left: 0; } }
    @keyframes clashRight { 0% { right: 0; } 15% { right: 110px; } 25% { right: 90px; } 35% { right: 110px; } 45% { right: 90px; } 55% { right: 110px; } 70% { right: 0; } 100% { right: 0; } }
    @keyframes sparkAnim { 0%, 14% { opacity: 0; transform: scale(0.5); } 15% { opacity: 1; transform: scale(1.5); } 20% { opacity: 0; } 34% { opacity: 0; } 35% { opacity: 1; transform: scale(1.5); } 40% { opacity: 0; } 54% { opacity: 0; } 55% { opacity: 1; transform: scale(2); color: yellow; text-shadow: 0 0 20px red; } 65% { opacity: 0; } 100% { opacity: 0; } }

    /* 메인 버튼들 */
    .menu-btn { padding: 15px 40px; font-size: 24px; font-weight: bold; background: transparent; color: white; border: 2px solid #3498db; border-radius: 10px; cursor: pointer; transition: 0.2s; margin-top: 10px; width: 250px; }
    .menu-btn:hover { background: #3498db; box-shadow: 0 0 20px #3498db; transform: scale(1.05); }
    .menu-btn-tutorial { border-color: #f1c40f; color: #f1c40f; font-size: 18px; padding: 10px 30px; margin-top: 20px; }
    .menu-btn-tutorial:hover { background: #f1c40f; color: black; box-shadow: 0 0 20px #f1c40f; }

    /* 튜토리얼 모달 */
    #tutorial-modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 85%; max-width: 600px; background: rgba(10, 15, 20, 0.98); border: 2px solid #f1c40f; border-radius: 15px; padding: 20px; color: white; z-index: 400; display: none; box-shadow: 0 0 30px #f1c40f; overflow-y: auto; max-height: 80%; }
    .tut-header { font-size: 24px; color: #f1c40f; border-bottom: 1px solid #444; padding-bottom: 10px; margin-bottom: 15px; text-align: center; font-weight: bold; }
    .tut-section { margin-bottom: 15px; line-height: 1.5; font-size: 15px; }
    .tut-title { font-weight: bold; color: #3498db; margin-bottom: 5px; font-size: 17px; }
    .tut-highlight { color: #e74c3c; font-weight: bold; }
    .tut-close { display: block; margin: 20px auto 0; padding: 10px 30px; background: #3498db; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; }

    /* 증강 내역 UI */
    #augment-history { position: absolute; top: 10px; right: 10px; display: flex; gap: 8px; z-index: 50; flex-wrap: wrap-reverse; justify-content: flex-end; max-width: 200px; }
    .history-icon { width: 35px; height: 35px; background: rgba(0,0,0,0.6); border: 1px solid #aaa; border-radius: 5px; display: flex; justify-content: center; align-items: center; font-size: 18px; box-shadow: 0 0 5px black; }
`;
document.head.appendChild(style);

// 오프닝 스크린 HTML 주입
container.insertAdjacentHTML('beforeend', `
    <div id="opening-screen">
        <div class="title-text">PARRY STRIKE<br><span style="font-size:24px; color:#e74c3c;">Boss Rush</span></div>
        <div class="subtitle-text">끊임없이 몰려오는 보스를 베어 넘기세요</div>
        
        <div class="clash-container">
            <div class="clash-char clash-player"></div>
            <div class="clash-spark">💥</div>
            <div class="clash-char clash-boss"></div>
        </div>

        <button class="menu-btn" onclick="startGame()">▶ 게임 시작</button>
        <button class="menu-btn menu-btn-tutorial" onclick="showTutorial()">📖 게임 방법 (필독)</button>
    </div>

    <div id="tutorial-modal">
        <div class="tut-header">📖 생존 가이드 & 패링 시스템</div>
        <div class="tut-section">
            <div class="tut-title">⚔️ 기본 공격 & 조준</div>
            PC: <strong>마우스 커서</strong>와 가장 가까운 적을 공격 (좌클릭)<br>
            모바일: 플레이어와 가장 가까운 적을 <strong>자동 조준</strong> (우측 하단 ⚔️버튼)
        </div>
        <div class="tut-section">
            <div class="tut-title">🛡️ 패링 (우클릭 / Space / 모바일 🛡️)</div>
            적의 공격이 닿기 0.5초 전 패링을 사용하면 공격을 튕겨냅니다.<br>
            패링 성공 시 <strong>쿨타임이 즉시 0초로 초기화</strong>되어 연속 패링이 가능합니다!
        </div>
        <div class="tut-section">
            <div class="tut-title">⚠️ 보스의 특수 패턴 주의!</div>
            <span style="color:#f1c40f; font-weight:bold;">[노란색 ❗] 돌진 공격:</span><br>
            보스가 노란색으로 빛나며 돌진할 때 <strong>타이밍 맞춰 패링</strong>하면 보스가 스턴에 걸리며 <span class="tut-highlight">100의 반동 데미지</span>를 입힙니다.<br><br>
            <span style="color:#8e44ad; font-weight:bold;">[보라색 ❗] 잡기 공격:</span><br>
            패링이 <span class="tut-highlight">불가능한</span> 즉사기급 공격입니다. 반드시 대시(Shift / 모바일 💨)를 사용해 무적 시간으로 회피하세요!
        </div>
        <div class="tut-section">
            <div class="tut-title">⬆️ 레벨업 및 증강(스킬)</div>
            적을 타격하여 경험치를 모으고 레벨업하세요.<br>
            얼음검, 화염검 같은 특수 무기나 스킬은 <span style="color:#2ecc71;">중복되지 않으며</span>, 획득한 내역은 우측 상단에 아이콘으로 표시됩니다.
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

let isPaused = true; // 시작 시 정지 상태
let hitStopFrames = 0;
let isMobileEnv = false; // 모바일(터치) 환경 감지

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
    isMobileEnv = false; // 마우스 클릭 시 PC 환경으로 간주
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

// 모바일 버튼
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
    augments: [] // 획득한 증강 기록
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

// 특정 좌표 기준 가장 가까운 보스 찾기 (마우스 타겟팅용)
function getClosestBossTo(targetX, targetY) {
    if(bosses.length === 0) return null;
    let closest = bosses[0]; let minDist = getDistance(targetX, targetY, closest.x, closest.y);
    for(let i=1; i<bosses.length; i++) {
        let dist = getDistance(targetX, targetY, bosses[i].x, bosses[i].y);
        if(dist < minDist) { closest = bosses[i]; minDist = dist; }
    }
    return closest;
}

// 기존 함수 대체 (호환성 유지)
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
        let p = document.createElement('div'); p.className = 'particle';
        p.style.backgroundColor = color;
        p.style.width = (Math.random() * 6 + 4) + 'px'; p.style.height = p.style.width;
        p.style.left = x + 'px'; p.style.top = y + 'px';
        let angle = Math.random() * Math.PI * 2; let dist = Math.random() * 60 + 20;
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        container.appendChild(p); setTimeout(() => p.remove(), 400);
    }
}

function spawnFireTrail(x, y) {
    let t = document.createElement('div'); t.className = 'fire-trail';
    t.style.left = x + 'px'; t.style.top = y + 'px';
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
        el.style.display = 'block'; el.style.position = 'absolute';
        el.style.transform = 'translate(-50%, -50%)'; el.style.zIndex = '10';

        const uiEl = document.createElement('div');
        uiEl.style.position = 'absolute'; uiEl.style.width = '100px';
        uiEl.style.transform = 'translate(-50%, -15px)'; uiEl.style.textAlign = 'center'; uiEl.style.zIndex = '11';

        const nameEl = document.createElement('div'); nameEl.innerText = `Lv.${bossLevel} Boss`;
        nameEl.style.color = '#fff'; nameEl.style.fontSize = '12px'; nameEl.style.fontWeight = 'bold';
        nameEl.style.marginBottom = '2px'; nameEl.style.textShadow = '1px 1px 2px #000';

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
    const eye = document.createElement('div'); eye.style.position = 'absolute'; eye.style.right = '5px'; eye.style.top = '3px'; eye.style.width = '8px'; eye.style.height = '8px'; eye.style.backgroundColor = '#f00'; eye.style.borderRadius = '50%'; eye.style.boxShadow = '0 0 10px #f00'; el.appendChild(eye);
    const telegraph = document.createElement('div'); telegraph.className = 'blaster-telegraph'; el.appendChild(telegraph);
    container.appendChild(el); blasters.push({ x, y, angle, timer: 35, el, telegraph, owner });
}

function takeDamage(amount) {
    player.hp -= amount; updateUI(); playSound('hit');
    playerEl.classList.add('hit-flash'); container.classList.add('screen-shake');
    hitStopFrames = 3; spawnDamageText(player.x, player.y, amount, 'player'); spawnParticles(player.x, player.y, '#e74c3c', 10);
    setTimeout(() => { playerEl.classList.remove('hit-flash'); container.classList.remove('screen-shake'); }, 300);
}

function bossHitEffect(targetBoss, x, y, damage, isCrit = false) {
    playSound('hit'); targetBoss.el.classList.add('boss-hit-flash'); setTimeout(() => targetBoss.el.classList.remove('boss-hit-flash'), 200);
    container.classList.add('boss-hit-shake'); setTimeout(() => container.classList.remove('boss-hit-shake'), 150);
    hitStopFrames = 2; spawnDamageText(targetBoss.x, targetBoss.y, damage, isCrit ? 'crit' : 'normal'); spawnParticles(x, y, isCrit ? '#f1c40f' : '#e74c3c', 12);
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

// 수정된 마우스/모바일 타겟팅 공격
function doAttack() {
    if(isPaused || player.isGrabbed || player.attackCooldown > 0 || player.isDashing) return;
    playSound('swing'); playerEl.classList.add('attack-anim');
    setTimeout(() => playerEl.classList.remove('attack-anim'), 200);

    // 환경에 따른 타겟 설정
    let target = isMobileEnv ? getClosestBossTo(player.x, player.y) : getClosestBossTo(mousePos.x, mousePos.y);
    let tx = target ? target.x : player.x; 
    let ty = target ? target.y : player.y - 10;
    const baseAngle = Math.atan2(ty - player.y, tx - player.x);

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
    if(isPaused || player.isGrabbed || player.parryCooldown > 0 || player.isParrying || player.isDashing) return;
    playSound('parry'); player.isParrying = true; player.parryTimer = 60;
    playerEl.classList.add('parrying'); playerEl.classList.remove('parry-cd');
    parryStatusEl.innerText = "패링 중!! (이동 불가)"; parryStatusEl.style.color = "#00ffff";
}

function doSkill() {
    if (player.hasSkill && player.skillCooldown <= 0 && !isPaused && !player.isGrabbed && !player.isDashing) {
        playSound('swing'); player.skillCooldown = player.maxSkillCooldown;
        playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
        createScreenFlash(); spawnParticles(player.x, player.y, '#f1c40f', 30);
        for (let i = 0; i < 8; i++) spawnProjectile(player.x, player.y, (Math.PI / 4) * i, 15, player.damage * player.skillDamageMult, false, 120, true);
    }
}

function doDash() {
    if (isPaused || player.isGrabbed || player.dashCooldown > 0 || player.isDashing) return;
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

function spawnProjectile(x, y, angle, speed, damage, isBoss, size, isHeavy = false, isGrab = false, owner = null, isLaser = false, isUnparryable = false) {
    const el = document.createElement('div');
    el.className = `slash ${isBoss ? 'boss-slash' : ''} ${isHeavy ? 'heavy-slash' : ''} ${isGrab ? 'grab-slash' : ''} ${isLaser ? 'laser-slash' : ''} ${isUnparryable ? 'unparryable-attack' : ''}`;
    if(isHeavy && !isBoss && !isLaser) el.style.borderRightColor = "#00ffff";
    if (!isBoss) {
        if (player.weaponType === 'fire') { el.classList.add('slash-fire'); }
        else if (player.weaponType === 'ice') { el.classList.add('slash-ice'); size *= 1.5; }
    }
    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`; container.appendChild(el);
    projectiles.push({ x, y, angle, speed, damage, isBoss, radius: (!isBoss && player.weaponType === 'ice' ? size/2 * 1.5 : size/2), el, isGrab, owner, isUnparryable, timer: 0 });
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
                if (bossLevel < 2) { if (rand < 0.2) boss.state = 'pattern1'; else if (rand < 0.4) boss.state = 'pattern2'; else if (rand < 0.6) boss.state = 'pattern3'; else if (rand < 0.8) boss.state = 'pattern4'; else boss.state = 'pattern5'; } 
                else if (bossLevel < 4) { if (rand < 0.15) boss.state = 'pattern1'; else if (rand < 0.3) boss.state = 'pattern2'; else if (rand < 0.45) boss.state = 'pattern3'; else if (rand < 0.6) boss.state = 'pattern4'; else if (rand < 0.75) boss.state = 'pattern5'; else boss.state = 'pattern6'; } 
                else { if (rand < 0.1) boss.state = 'pattern1'; else if (rand < 0.2) boss.state = 'pattern2'; else if (rand < 0.3) boss.state = 'pattern3'; else if (rand < 0.4) boss.state = 'pattern4'; else if (rand < 0.5) boss.state = 'pattern5'; else if (rand < 0.65) boss.state = 'pattern6'; else boss.state = 'pattern7'; }
            }
        } else {
            boss.stateTimer++; const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
            if (boss.stateTimer === 1 && boss.state !== 'pattern7' && boss.state !== 'pattern6') boss.el.classList.add('eye-glow');

            if (boss.state === 'pattern1') {
                if(boss.stateTimer === 10) { playSound('swing'); boss.el.classList.remove('eye-glow'); boss.el.classList.add('boss-attack-anim'); spawnProjectile(boss.x, boss.y, angleToPlayer, 18, 15, true, 100, false, false, boss); }
                if(boss.stateTimer > 40) resetBossState(boss);
            }
            else if (boss.state === 'pattern2') {
                if(boss.stateTimer === 1) boss.el.classList.add('boss-telegraph');
                if(boss.stateTimer === 100) { playSound('swing'); boss.el.classList.remove('eye-glow', 'boss-telegraph'); boss.el.classList.add('boss-attack-anim'); spawnProjectile(boss.x, boss.y, angleToPlayer, 10, 20, true, 180, true, false, boss, false, true); }
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
                        else if (player.isParrying || player.autoParryTimer > 0) { // 패링 성공 (반동 데미지 100)
                            hitStopFrames = 8; createScreenFlash(); spawnParticles(player.x, player.y, '#0ff', 40); player.autoParryTimer = 6; playSound('parryed'); player.isParrying = false; playerEl.classList.remove('parrying', 'parry-cd'); playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                            if (player.parryHeal) { player.hp = Math.min(player.maxHp, player.hp + 20); spawnDamageText(player.x, player.y, 20, 'heal'); }
                            player.parryCooldown = 0; parryStatusEl.innerText = "돌진 저지 성공! (보스 기절)"; parryStatusEl.style.color = "#2ecc71";
                            boss.hp -= 100; gainExp(50); boss.stateTimer = 90; bossHitEffect(boss, boss.x, boss.y, 100, true); checkBossDeath(boss);
                        } else { takeDamage(30); boss.stateTimer = 90; }
                    }
                }
                if (boss.stateTimer >= 90) { boss.el.classList.remove('boss-dashing'); resetBossState(boss); }
            }
            else if (boss.state === 'pattern6') { // 잡기 패턴
                if (boss.stateTimer === 1) {
                    boss.el.style.backgroundColor = '#8e44ad'; boss.el.classList.add('boss-telegraph', 'boss-grab-glow');
                    let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'grab-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 15px #8e44ad'; boss.el.appendChild(warning);
                }
                if (boss.stateTimer === 60) {
                    playSound('swing'); boss.el.style.backgroundColor = '#c0392b'; boss.el.classList.remove('eye-glow', 'boss-telegraph', 'boss-grab-glow'); let warn = boss.el.querySelector('.grab-warning'); if(warn) warn.remove(); boss.el.classList.add('boss-attack-anim'); spawnProjectile(boss.x, boss.y, angleToPlayer, 15, 0, true, 80, false, true, boss);
                }
                if (boss.stateTimer > 100) resetBossState(boss);
            }
            else if (boss.state === 'pattern7') {
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
    boss.el.classList.remove('boss-attack-anim', 'boss-telegraph', 'boss-dashing', 'eye-glow', 'boss-shake', 'boss-grab-glow'); boss.el.style.backgroundColor = ''; boss.el.style.boxShadow = 'none'; boss.el.style.transform = 'translate(-50%, -50%) scale(1)'; boss.el.style.transition = 'none';
    let warn = boss.el.querySelector('.dash-warning'); if(warn) warn.remove(); let warn2 = boss.el.querySelector('.grab-warning'); if(warn2) warn2.remove();
}

function update() {
    if (isPaused) { requestAnimationFrame(update); return; }
    if (hitStopFrames > 0) { hitStopFrames--; requestAnimationFrame(update); return; }

    if (isAttacking) doAttack();
    if (player.autoParryTimer > 0) player.autoParryTimer--;

    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.dashCooldown <= 0 && !player.isGrabbed) { dashStatusEl.innerText = "[Shift] 대시 준비 완료"; dashStatusEl.style.color = "#2ecc71"; }
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
    } else if (!player.isGrabbed && !player.isParrying) {
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

            if (player.waveChance && Math.random() < 0.3) {
                spawnProjectile(player.x, player.y, baseAngle - 0.3, 12, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle + 0.3, 12, player.damage, false, 70);
            } else { spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70); }
            player.attackQueue--; player.burstTimer = 8;
        }
    }

    if(player.attackCooldown > 0) player.attackCooldown--;

    if (player.isGrabbed) {
        player.grabTimer--;
        if (player.grabTimer === 30) {
            takeDamage(25); let explosion = document.createElement('div'); explosion.className = 'unparryable-hit'; explosion.style.left = player.x + 'px'; explosion.style.top = player.y + 'px'; container.appendChild(explosion); setTimeout(() => explosion.remove(), 500);
        }
        if (player.grabTimer <= 0) { player.isGrabbed = false; playerEl.classList.remove('player-grabbed'); }
    }

    if (player.isParrying) {
        player.parryTimer--;
        if (player.parryTimer <= 0) { player.isParrying = false; playerEl.classList.remove('parrying'); playerEl.classList.add('parry-cd'); player.parryCooldown = 300; }
    } else {
        if (player.parryCooldown > 0) {
            player.parryCooldown--; let secondsLeft = Math.ceil(player.parryCooldown / 60);
            if (!player.isGrabbed) { parryStatusEl.innerText = `패링 쿨타임: ${secondsLeft}초`; parryStatusEl.style.color = "#e74c3c"; floatingCdEl.innerText = `${secondsLeft}초`; }
            if (player.parryCooldown <= 0) { if (!player.isGrabbed) { parryStatusEl.innerText = "패링 준비 완료"; parryStatusEl.style.color = "#3498db"; floatingCdEl.innerText = ""; } playerEl.classList.remove('parry-cd'); }
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
            playSound('swing'); bl.telegraph.remove(); spawnProjectile(bl.x, bl.y, bl.angle, 25, 10, true, 100, true, false, bl.owner, true, true);
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
                    hitStopFrames = 6; createScreenFlash(); spawnParticles(player.x, player.y, '#0ff', 20); player.autoParryTimer = 6; playSound('parryed'); player.isParrying = false; playerEl.classList.remove('parrying', 'parry-cd'); playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                    if (player.parryHeal) { player.hp = Math.min(player.maxHp, player.hp + 20); spawnDamageText(player.x, player.y, 20, 'heal'); }
                    
                    player.parryCooldown = 0; floatingCdEl.innerText = ""; parryStatusEl.innerText = p.isGrab ? "잡기 무효화 성공!" : "패링 반사 성공!"; parryStatusEl.style.color = "#2ecc71";
                    if (p.isGrab) { if(p.owner) { p.owner.hp -= 20; bossHitEffect(p.owner, p.owner.x, p.owner.y, 20, true); checkBossDeath(p.owner); } p.el.remove(); projectiles.splice(i, 1); } 
                    else {
                        p.isBoss = false; p.el.classList.remove('boss-slash', 'heavy-slash', 'laser-slash', 'unparryable-attack');
                        let target = isMobileEnv ? getClosestBossTo(p.x, p.y) : getClosestBossTo(mousePos.x, mousePos.y); 
                        p.angle = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.angle + Math.PI;
                        p.speed *= 1.5; p.damage *= 2;
                    }
                } else {
                    if (p.isGrab && !player.isGrabbed) {
                        player.isGrabbed = true; player.grabTimer = 90; playerEl.classList.add('player-grabbed'); parryStatusEl.innerText = "잡혔습니다!! (회피 불가)"; parryStatusEl.style.color = "red"; floatingCdEl.innerText = "기절"; p.el.remove(); projectiles.splice(i, 1);
                    } else { takeDamage(p.damage); p.el.remove(); projectiles.splice(i, 1); }
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
    player.isGrabbed = false; player.grabTimer = 0; player.isParrying = false; player.parryTimer = 0; player.parryCooldown = 0; player.autoParryTimer = 0; 
    player.attackCooldown = 0; player.burstTimer = 0; player.attackQueue = 0; player.skillCooldown = 0; player.isDashing = false; player.dashTimer = 0; player.dashCooldown = 0; 
    hitStopFrames = 0;
    // 획득 내역 초기화 여부 (사망 시 모든 걸 잃는다면 유지)
    player.augments = []; player.weaponType = 'normal'; player.hasSkill = false; player.damage = 10; player.attackCount = 1; document.getElementById('augment-history').innerHTML = ''; document.getElementById('player-sword').style.background = '#bdc3c7';

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

    // 증강 풀 (unique: true 인 것은 한 번만 획득 가능)
    const baseAugmentPool = [
        { id: 'damage', name: '⚔️ 예리한 칼날', desc: '평타 데미지 +5', unique: false, icon: '⚔️' },
        { id: 'cooldown', name: '⚡ 가벼운 몸놀림', desc: '평타 공격 쿨타임 감소', unique: false, icon: '⚡' },
        { id: 'multishot', name: '🏹 다중 발사', desc: '평타 발사 개수 1개 추가', unique: false, icon: '🏹' },
        { id: 'maxhp', name: '💖 강인한 체력', desc: '최대 체력 +30 및 100% 회복', unique: false, icon: '💖' },
        { id: 'weapon_fire', name: '🔥 화염검 (무기)', desc: '화염 잔상 및 매 타격시 추가 피해', unique: true, icon: '🔥' },
        { id: 'weapon_ice', name: '❄️ 얼음검 (무기)', desc: '서리 이펙트 및 4타 적중시 빙결', unique: true, icon: '❄️' },
        { id: 'skill_dash', name: '💨 돌진 베기 (스킬)', desc: '대시 중 적과 충돌 시 데미지', unique: true, icon: '💨' },
        { id: 'skill_parry_heal', name: '💚 치유의 패링', desc: '패링 성공 시 체력 20 회복', unique: true, icon: '💚' },
        { id: 'skill_wave', name: '🌊 파도 베기', desc: '평타 시 30% 확률로 3갈래 발사', unique: true, icon: '🌊' }
    ];

    // 중복 제거 필터링 로직
    let availablePool = baseAugmentPool.filter(aug => {
        if (aug.unique && player.augments.some(a => a.id === aug.id)) return false; // 이미 얻은 고유능력은 안 띄움
        if ((aug.id === 'weapon_fire' && player.weaponType === 'ice') || (aug.id === 'weapon_ice' && player.weaponType === 'fire')) return false; // 무기 속성 중복 방지
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
    // 획득 내역 저장 및 UI 업데이트
    player.augments.push({ id: type, name: name });
    const histDiv = document.getElementById('augment-history');
    const iconEl = document.createElement('div'); iconEl.className = 'history-icon'; iconEl.innerText = icon; iconEl.title = name;
    histDiv.appendChild(iconEl);

    if (type === 'damage') player.damage += 5;
    else if (type === 'cooldown') player.baseAttackCooldown = Math.max(10, player.baseAttackCooldown - 5);
    else if (type === 'multishot') player.attackCount += 1;
    else if (type === 'maxhp') { player.maxHp += 30; player.hp = player.maxHp; }
    else if (type === 'weapon_fire') { player.weaponType = 'fire'; document.getElementById('player-sword').style.background = 'linear-gradient(to right, #e74c3c, #f1c40f)'; }
    else if (type === 'weapon_ice') { player.weaponType = 'ice'; document.getElementById('player-sword').style.background = 'linear-gradient(to right, #00ffff, #fff)'; }
    else if (type === 'skill_dash') player.dashDamage = true;
    else if (type === 'skill_parry_heal') player.parryHeal = true;
    else if (type === 'skill_wave') player.waveChance = true;
    else if (type === 'skill') { player.hasSkill = true; skillStatusEl.classList.remove('hidden'); if(document.getElementById('btn-skill')) document.getElementById('btn-skill').classList.remove('hidden'); document.getElementById('mob-skill').classList.remove('hidden'); }
    else if (type === 'skill_cooldown') player.maxSkillCooldown = Math.max(180, player.maxSkillCooldown - 100);

    document.getElementById('level-up-modal').classList.add('hidden'); updateUI(); isPaused = false;
}
