const container = document.getElementById('game-container');
const playerEl = document.getElementById('player');
const floatingCdEl = document.getElementById('floating-cd'); 
const parryStatusEl = document.getElementById('parry-status');
const skillStatusEl = document.getElementById('skill-status');

const dashStatusEl = document.createElement('div');
dashStatusEl.style.marginTop = '5px'; dashStatusEl.style.fontWeight = 'bold'; dashStatusEl.style.fontSize = '14px';
parryStatusEl.parentNode.insertBefore(dashStatusEl, parryStatusEl.nextSibling);

const originalBossEl = document.getElementById('boss');
const originalBossUiEl = document.getElementById('boss-ui');
if(originalBossEl) originalBossEl.style.display = 'none';
if(originalBossUiEl) originalBossUiEl.style.display = 'none';

let isPaused = false;
let hitStopFrames = 0;

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

    if (sound) {
        sound.volume = 0.1; sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound error"));
    }
}

let GAME_WIDTH = container.clientWidth;
let GAME_HEIGHT = container.clientHeight;
window.addEventListener('resize', () => { GAME_WIDTH = container.clientWidth; GAME_HEIGHT = container.clientHeight; });

const keys = { w: false, a: false, s: false, d: false };

window.addEventListener('keydown', e => { 
    if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; 
    if (e.code === 'Space') { e.preventDefault(); activateParry(); }
    if (e.key.toLowerCase() === 'r') { doSkill(); }
    if (e.key === 'Shift') { e.preventDefault(); doDash(); }
});
window.addEventListener('keyup', e => { if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });
window.addEventListener('contextmenu', e => e.preventDefault());

let isAttacking = false;
container.addEventListener('mousedown', e => {
    if(e.target.closest('#mobile-controls') || e.target.closest('.modal')) return; 
    if (e.button === 0) isAttacking = true; 
    else if (e.button === 2) activateParry();
});
window.addEventListener('mouseup', e => { if (e.button === 0) isAttacking = false; });

// ★ 초기 스탯에 무기와 스킬 상태 추가
const initPlayer = () => ({
    x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, speed: 2.5, radius: 25,
    hp: 100, maxHp: 100, exp: 0, maxExp: 200, level: 1, damage: 10, 
    attackCount: 1, baseAttackCooldown: 30, attackCooldown: 0,
    attackQueue: 0, burstTimer: 0, 
    isParrying: false, parryTimer: 0, parryCooldown: 0, autoParryTimer: 0,
    isDashing: false, dashTimer: 0, dashCooldown: 0, dashDir: {x: 1, y: 0},
    hasSkill: false, skillCooldown: 0, maxSkillCooldown: 600,
    isGrabbed: false, grabTimer: 0, lifesteal: 0, skillDamageMult: 2,
    
    // 신규 속성
    weaponType: 'normal', dashDamage: false, parryHeal: false, waveChance: false
});
let player = initPlayer();
let bossLevel = 1; let bosses = []; let projectiles = []; let blasters = []; 

function spawnDamageText(x, y, damage, type = 'normal') {
    const el = document.createElement('div');
    el.className = 'damage-text ' + (type === 'crit' ? 'crit-text' : type === 'player' ? 'player-dmg-text' : '');
    el.innerText = isNaN(damage) ? damage : Math.floor(damage);
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

        const hpBg = document.createElement('div');
        hpBg.style.width = '100%'; hpBg.style.height = '8px';
        hpBg.style.backgroundColor = 'rgba(0,0,0,0.5)'; hpBg.style.border = '1px solid #000';

        const hpFill = document.createElement('div');
        hpFill.style.width = '100%'; hpFill.style.height = '100%';
        hpFill.style.backgroundColor = '#e74c3c'; hpFill.style.transition = 'width 0.1s';

        hpBg.appendChild(hpFill); uiEl.appendChild(nameEl); uiEl.appendChild(hpBg);
        container.appendChild(el); container.appendChild(uiEl);

        let maxHp = 50 + (bossLevel * 100); let spacing = GAME_WIDTH / (bossLevel + 1);
        bosses.push({
            x: spacing * (i + 1), y: 100 + (Math.random() * 80), radius: 50,
            hp: maxHp, maxHp: maxHp, state: 'idle', stateTimer: Math.floor(Math.random() * 40),
            vx: 2 * (i % 2 === 0 ? 1 : -1), vy: 0, dashSpeed: 20 + bossLevel,
            dashHitDelay: 0, // 대시 타격 쿨타임
            el: el, uiEl: uiEl, hpFill: hpFill
        });
    }
    const topBossName = document.getElementById('boss-name');
    if(topBossName) topBossName.innerText = `WAVE ${bossLevel} (적 ${bossLevel}마리)`;
}

function createBlaster(x, y, angle, owner) {
    playSound('parry'); 
    const el = document.createElement('div'); el.className = 'gaster-blaster';
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    
    const eye = document.createElement('div');
    eye.style.position = 'absolute'; eye.style.right = '5px'; eye.style.top = '3px';
    eye.style.width = '8px'; eye.style.height = '8px'; eye.style.backgroundColor = '#f00';
    eye.style.borderRadius = '50%'; eye.style.boxShadow = '0 0 10px #f00'; el.appendChild(eye);

    const telegraph = document.createElement('div'); telegraph.className = 'blaster-telegraph'; el.appendChild(telegraph);
    container.appendChild(el); blasters.push({ x, y, angle, timer: 35, el, telegraph, owner }); 
}

function getClosestBoss() {
    if(bosses.length === 0) return null;
    let closest = bosses[0]; let minDist = getDistance(player.x, player.y, closest.x, closest.y);
    for(let i=1; i<bosses.length; i++) {
        let dist = getDistance(player.x, player.y, bosses[i].x, bosses[i].y);
        if(dist < minDist) { closest = bosses[i]; minDist = dist; }
    }
    return closest;
}

function takeDamage(amount) {
    player.hp -= amount; updateUI(); playSound('hit');
    playerEl.classList.add('hit-flash'); container.classList.add('screen-shake');
    hitStopFrames = 3; spawnDamageText(player.x, player.y, amount, 'player'); spawnParticles(player.x, player.y, '#e74c3c', 10);
    setTimeout(() => { playerEl.classList.remove('hit-flash'); container.classList.remove('screen-shake'); }, 300);
}

function bossHitEffect(targetBoss, x, y, damage, isCrit = false) {
    playSound('hit'); targetBoss.el.classList.add('boss-hit-flash');
    setTimeout(() => targetBoss.el.classList.remove('boss-hit-flash'), 200);
    container.classList.add('boss-hit-shake'); setTimeout(() => container.classList.remove('boss-hit-shake'), 150);
    
    hitStopFrames = 2; spawnDamageText(targetBoss.x, targetBoss.y, damage, isCrit ? 'crit' : 'normal');
    spawnParticles(x, y, isCrit ? '#f1c40f' : '#e74c3c', 12);

    let impact = document.createElement('div'); impact.className = 'impact-effect'; impact.style.left = x + 'px'; impact.style.top = y + 'px';
    impact.style.setProperty('--rot', `${Math.random() * 360}deg`);
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

// ★ 공격 시 파도 베기 30% 확률 적용
function doAttack() {
    if(isPaused || player.isGrabbed || player.attackCooldown > 0 || player.isDashing) return;
    playSound('swing'); playerEl.classList.add('attack-anim');
    setTimeout(() => playerEl.classList.remove('attack-anim'), 200);
    
    let target = getClosestBoss(); let tx = target ? target.x : player.x; let ty = target ? target.y : player.y - 10;
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
    if (keys.w) dy -= 1; if (keys.s) dy += 1; if (keys.a) dx -= 1; if (keys.d) dx += 1;
    if (dx === 0 && dy === 0) dx = 1; 
    let len = Math.hypot(dx, dy); player.dashDir = { x: dx/len, y: dy/len };
    playerEl.style.opacity = '0.4'; setTimeout(() => playerEl.style.opacity = '1', 200);
}

// ★ 투사체 발사 시 무기 속성에 따른 시각효과 및 데미지 버프 추가
function spawnProjectile(x, y, angle, speed, damage, isBoss, size, isHeavy = false, isGrab = false, owner = null, isLaser = false, isUnparryable = false) {
    const el = document.createElement('div');
    el.className = `slash ${isBoss ? 'boss-slash' : ''} ${isHeavy ? 'heavy-slash' : ''} ${isGrab ? 'grab-slash' : ''} ${isLaser ? 'laser-slash' : ''} ${isUnparryable ? 'unparryable-attack' : ''}`;
    if(isHeavy && !isBoss && !isLaser) el.style.borderRightColor = "#00ffff"; 
    
    if (!isBoss) {
        if (player.weaponType === 'fire') { el.classList.add('slash-fire'); damage *= 1.5; }
        else if (player.weaponType === 'ice') { el.classList.add('slash-ice'); size *= 1.5; }
    }

    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    container.appendChild(el);
    projectiles.push({ x, y, angle, speed, damage, isBoss, radius: (!isBoss && player.weaponType === 'ice' ? size/2 * 1.5 : size/2), el, isGrab, owner, isUnparryable });
}

function bossLogic() {
    bosses.forEach(boss => {
        if (boss.dashHitDelay > 0) boss.dashHitDelay--; // 대시 공격 무적시간 감소

        if (boss.state === 'idle') {
            boss.x += boss.vx;
            if (boss.x < boss.radius + 50 || boss.x > GAME_WIDTH - boss.radius - 50) boss.vx *= -1; 
            
            boss.stateTimer++;
            if (boss.stateTimer > 90) { 
                const rand = Math.random(); boss.stateTimer = 0;
                if (bossLevel < 2) {
                    if (rand < 0.2) boss.state = 'pattern1'; else if (rand < 0.4) boss.state = 'pattern2'; else if (rand < 0.6) boss.state = 'pattern3'; else if (rand < 0.8) boss.state = 'pattern4'; else boss.state = 'pattern5';
                } else if (bossLevel < 4) {
                    if (rand < 0.15) boss.state = 'pattern1'; else if (rand < 0.3) boss.state = 'pattern2'; else if (rand < 0.45) boss.state = 'pattern3'; else if (rand < 0.6) boss.state = 'pattern4'; else if (rand < 0.75) boss.state = 'pattern5'; else boss.state = 'pattern6'; 
                } else {
                    if (rand < 0.1) boss.state = 'pattern1'; else if (rand < 0.2) boss.state = 'pattern2'; else if (rand < 0.3) boss.state = 'pattern3'; else if (rand < 0.4) boss.state = 'pattern4'; else if (rand < 0.5) boss.state = 'pattern5'; else if (rand < 0.65) boss.state = 'pattern6'; else boss.state = 'pattern7'; 
                }
            }
        } else {
            boss.stateTimer++;
            const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
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
                    if(boss.stateTimer === 20) boss.el.classList.remove('eye-glow');
                    playSound('swing'); boss.el.classList.add('boss-attack-anim'); spawnProjectile(boss.x, boss.y, angleToPlayer, 10, 10, true, 100, false, false, boss);
                    setTimeout(() => boss.el.classList.remove('boss-attack-anim'), 100);
                }
                if(boss.stateTimer > 100) resetBossState(boss);
            }
            else if (boss.state === 'pattern4') {
                if(boss.stateTimer === 30) { playSound('swing'); boss.el.classList.remove('eye-glow'); boss.el.classList.add('boss-attack-anim'); spawnProjectile(boss.x, boss.y, angleToPlayer, 12, 20, true, 100, false, false, boss); }
                if(boss.stateTimer > 70) resetBossState(boss);
            }
            else if (boss.state === 'pattern5') {
                if (boss.stateTimer === 1) { 
                    boss.el.style.backgroundColor = '#f1c40f'; boss.el.classList.add('boss-telegraph', 'boss-shake');
                    let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'dash-warning';
                    warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; 
                    warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 10px red'; boss.el.appendChild(warning);
                }
                if (boss.stateTimer === 60) {
                    boss.el.classList.remove('eye-glow', 'boss-telegraph', 'boss-shake'); 
                    let warn = boss.el.querySelector('.dash-warning'); if(warn) warn.remove();
                    boss.el.classList.add('boss-dashing'); boss.el.style.backgroundColor = '#e67e22'; boss.el.style.transform = 'translate(-50%, -50%) scale(1.1)';
                    boss.el.style.transition = 'none'; boss.vx = Math.cos(angleToPlayer) * boss.dashSpeed; boss.vy = Math.sin(angleToPlayer) * boss.dashSpeed;
                }
                if (boss.stateTimer > 60 && boss.stateTimer < 90) {
                    boss.x += boss.vx; boss.y += boss.vy;
                    if (getDistance(boss.x, boss.y, player.x, player.y) < player.radius + boss.radius) {
                        if (player.isDashing) {
                            // 회피
                        } else if (player.isParrying || player.autoParryTimer > 0) {
                            hitStopFrames = 8; createScreenFlash(); spawnParticles(player.x, player.y, '#0ff', 40);
                            player.autoParryTimer = 6; playSound('parryed'); player.isParrying = false; 
                            playerEl.classList.remove('parrying', 'parry-cd'); playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                            
                            // ★ 치유의 패링 스킬 적용
                            if (player.parryHeal) { player.hp = Math.min(player.maxHp, player.hp + 20); spawnDamageText(player.x, player.y, '+20 HP', 'crit'); }

                            player.parryCooldown = 15; parryStatusEl.innerText = "돌진 저지 성공! (보스 기절)"; parryStatusEl.style.color = "#2ecc71";
                            boss.hp -= 100; gainExp(50); boss.stateTimer = 90;
                            bossHitEffect(boss, boss.x, boss.y, 100, true); checkBossDeath(boss);
                        } else { takeDamage(30); boss.stateTimer = 90; }
                    }
                }
                if (boss.stateTimer >= 90) { boss.el.classList.remove('boss-dashing'); resetBossState(boss); }
            }
            // ★ 패턴 6: 그랩 공격 텔레그래프 강화 (보라빛 효과)
            else if (boss.state === 'pattern6') {
                if (boss.stateTimer === 1) { 
                    boss.el.style.backgroundColor = '#8e44ad'; boss.el.classList.add('boss-telegraph', 'boss-grab-glow'); 
                    
                    let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'grab-warning';
                    warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; 
                    warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 15px #8e44ad';
                    boss.el.appendChild(warning);
                }
                if (boss.stateTimer === 60) {
                    playSound('swing'); boss.el.style.backgroundColor = '#c0392b';
                    boss.el.classList.remove('eye-glow', 'boss-telegraph', 'boss-grab-glow'); 
                    let warn = boss.el.querySelector('.grab-warning'); if(warn) warn.remove();
                    boss.el.classList.add('boss-attack-anim');
                    spawnProjectile(boss.x, boss.y, angleToPlayer, 15, 0, true, 80, false, true, boss);
                }
                if (boss.stateTimer > 100) resetBossState(boss);
            }
            else if (boss.state === 'pattern7') {
                if (boss.stateTimer === 1) { boss.el.style.backgroundColor = '#000'; boss.el.style.boxShadow = '0 0 20px #f00'; }
                boss.x += Math.cos(angleToPlayer) * 1.5; boss.y += Math.sin(angleToPlayer) * 1.5;
                const timings = [30, 70, 100, 150, 180, 230, 260];
                if (timings.includes(boss.stateTimer)) {
                    let orbitAngle = (boss.stateTimer * 0.1) + Math.random(); 
                    let bx = player.x + Math.cos(orbitAngle) * 250; let by = player.y + Math.sin(orbitAngle) * 250;
                    createBlaster(bx, by, Math.atan2(player.y - by, player.x - bx), boss);
                }
                if (boss.stateTimer > 300) { resetBossState(boss); }
            }
        }
        boss.x = Math.max(boss.radius, Math.min(GAME_WIDTH - boss.radius, boss.x));
        boss.y = Math.max(boss.radius, Math.min(GAME_HEIGHT - boss.radius, boss.y));
        boss.el.style.left = boss.x + 'px'; boss.el.style.top = boss.y + 'px';
        boss.uiEl.style.left = boss.x + 'px'; boss.uiEl.style.top = (boss.y - boss.radius - 15) + 'px';
    });
}

function resetBossState(boss) { 
    boss.state = 'idle'; boss.stateTimer = 0; boss.vy = 0; boss.vx = 2; 
    boss.el.classList.remove('boss-attack-anim', 'boss-telegraph', 'boss-dashing', 'eye-glow', 'boss-shake', 'boss-grab-glow'); 
    boss.el.style.backgroundColor = ''; boss.el.style.boxShadow = 'none'; 
    boss.el.style.transform = 'translate(-50%, -50%) scale(1)'; boss.el.style.transition = 'none'; 
    let warn = boss.el.querySelector('.dash-warning'); if(warn) warn.remove();
    let warn2 = boss.el.querySelector('.grab-warning'); if(warn2) warn2.remove();
}

function getDistance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

function update() {
    if (isPaused) { requestAnimationFrame(update); return; }

    if (hitStopFrames > 0) { hitStopFrames--; requestAnimationFrame(update); return; }

    if (isAttacking) doAttack();
    if (player.autoParryTimer > 0) player.autoParryTimer--;

    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.dashCooldown <= 0 && !player.isGrabbed) { dashStatusEl.innerText = "[Shift] 대시 준비 완료"; dashStatusEl.style.color = "#2ecc71";
