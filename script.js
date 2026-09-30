const container = document.getElementById('game-container');
const playerEl = document.getElementById('player');
const bossEl = document.getElementById('boss');
const bossUiEl = document.getElementById('boss-ui'); 
const bossNameEl = document.getElementById('boss-name');
const parryStatusEl = document.getElementById('parry-status');
const skillStatusEl = document.getElementById('skill-status');
const floatingCdEl = document.getElementById('floating-cd'); 
let isPaused = false;

// ==========================================
// ★ 수정: 명확한 상대 경로(./) 사용 ★
// ==========================================
// './' 는 'index.html이 있는 현재 폴더'를 의미합니다.
const audioDead = new Audio('./Dead.mp3');
const audioAttack1 = new Audio('./Attack1.mp3');
const audioAttack2 = new Audio('./Attack2.mp3');
const audioParry = new Audio('./Parry.mp3');
const audioParryed = new Audio('./Parryed.mp3');
const audioSwing = new Audio('./Swing.mp3');

function playSound(type) {
    let sound;
    if (type === 'hit') {
        // Attack1, Attack2 중 랜덤 재생
        sound = Math.random() < 0.5 ? audioAttack1 : audioAttack2;
    } else if (type === 'dead') {
        sound = audioDead;
    } else if (type === 'parry') {
        sound = audioParry;
    } else if (type === 'parryed') {
        sound = audioParryed;
    } else if (type === 'swing') {
        sound = audioSwing;
    }

    if (sound) {
        sound.currentTime = 0; // 연속 재생을 위해 재생 위치 초기화
        // 브라우저 정책상 첫 클릭 전에는 에러가 날 수 있으므로 예외 처리
        sound.play().catch(e => console.log("Sound play prevented pending user interaction."));
    }
}
// ==========================================

let GAME_WIDTH = container.clientWidth;
let GAME_HEIGHT = container.clientHeight;
window.addEventListener('resize', () => { GAME_WIDTH = container.clientWidth; GAME_HEIGHT = container.clientHeight; });

const keys = { w: false, a: false, s: false, d: false };

window.addEventListener('keydown', e => { 
    if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; 
    if (e.code === 'Space') { e.preventDefault(); doSkill(); }
});
window.addEventListener('keyup', e => { if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });
window.addEventListener('contextmenu', e => e.preventDefault());

container.addEventListener('mousedown', e => {
    if(e.target.closest('#mobile-controls') || e.target.closest('.modal')) return; 
    if (e.button === 0) doAttack();
    else if (e.button === 2) activateParry();
});

function bindTouch(id, key) {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
}
bindTouch('btn-up', 'w'); bindTouch('btn-down', 's');
bindTouch('btn-left', 'a'); bindTouch('btn-right', 'd');
document.getElementById('btn-attack').addEventListener('touchstart', (e) => { e.preventDefault(); doAttack(); });
document.getElementById('btn-parry').addEventListener('touchstart', (e) => { e.preventDefault(); activateParry(); });
document.getElementById('btn-skill').addEventListener('touchstart', (e) => { e.preventDefault(); doSkill(); });

let bossLevel = 1;
const initPlayer = () => ({
    x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, speed: 2.5, radius: 25,
    hp: 100, maxHp: 100, exp: 0, maxExp: 400, level: 1, damage: 10, 
    attackCount: 1, baseAttackCooldown: 30, attackCooldown: 0,
    attackQueue: 0, burstTimer: 0, 
    isParrying: false, parryTimer: 0, parryCooldown: 0,
    hasSkill: false, skillCooldown: 0, maxSkillCooldown: 600,
    isGrabbed: false, grabTimer: 0
});
const initBoss = () => ({
    x: GAME_WIDTH / 2, y: 150, radius: 50, hp: 1000, maxHp: 1000,
    state: 'idle', stateTimer: 0, vx: 2, vy: 0, dashSpeed: 20
});

let player = initPlayer();
let boss = initBoss();
let projectiles = [];

function takeDamage(amount) {
    player.hp -= amount;
    updateUI();
    playSound('hit'); // 플레이어 피격 사운드
    playerEl.classList.add('hit-flash');
    container.classList.add('screen-shake');
    setTimeout(() => {
        playerEl.classList.remove('hit-flash');
        container.classList.remove('screen-shake');
    }, 300);
}

function bossHitEffect(x, y) {
    playSound('hit'); // 보스 피격 사운드
    bossEl.classList.add('boss-hit-flash');
    setTimeout(() => bossEl.classList.remove('boss-hit-flash'), 200);

    container.classList.add('boss-hit-shake');
    setTimeout(() => container.classList.remove('boss-hit-shake'), 150);

    let impact = document.createElement('div');
    impact.className = 'impact-effect';
    impact.style.left = x + 'px';
    impact.style.top = y + 'px';
    
    let randomAngle = Math.random() * 360;
    impact.style.setProperty('--rot', `${randomAngle}deg`);
    
    container.appendChild(impact);
    setTimeout(() => impact.remove(), 200); 
}

function doAttack() {
    if(isPaused || player.isGrabbed || player.attackCooldown > 0) return;
    
    playSound('swing'); // 플레이어 공격 사운드
    playerEl.classList.add('attack-anim');
    setTimeout(() => playerEl.classList.remove('attack-anim'), 200);
    
    const baseAngle = Math.atan2(boss.y - player.y, boss.x - player.x);
    spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70);
    
    player.attackQueue = player.attackCount - 1;
    player.burstTimer = 8; 
    player.attackCooldown = player.baseAttackCooldown; 
}

function activateParry() {
    if(isPaused || player.isGrabbed || player.parryCooldown > 0 || player.isParrying) return;
    playSound('parry'); // 패링 시전 사운드
    player.isParrying = true;
    player.parryTimer = 60; 
    playerEl.classList.add('parrying');
    playerEl.classList.remove('parry-cd');
    parryStatusEl.innerText = "패링 중!! (이동 불가)";
    parryStatusEl.style.color = "#00ffff";
}

function doSkill() {
    if (player.hasSkill && player.skillCooldown <= 0 && !isPaused && !player.isGrabbed) {
        playSound('swing'); // 스킬 시전 사운드
        player.skillCooldown = player.maxSkillCooldown;
        playerEl.classList.add('parry-deflect');
        setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
        for (let i = 0; i < 8; i++) {
            let angle = (Math.PI / 4) * i;
            spawnProjectile(player.x, player.y, angle, 15, player.damage * 2, false, 120, true);
        }
    }
}

function spawnProjectile(x, y, angle, speed, damage, isBoss, size, isHeavy = false, isGrab = false) {
    const el = document.createElement('div');
    el.className = `slash ${isBoss ? 'boss-slash' : ''} ${isHeavy ? 'heavy-slash' : ''} ${isGrab ? 'grab-slash' : ''}`;
    if(isHeavy && !isBoss) el.style.borderRightColor = "#00ffff"; 
    
    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    container.appendChild(el);
    projectiles.push({ x, y, angle, speed, damage, isBoss, radius: size/2, el, isGrab });
}

function bossLogic() {
    if (boss.state === 'idle') {
        boss.x += boss.vx;
        if (boss.x < boss.radius + 50 || boss.x > GAME_WIDTH - boss.radius - 50) boss.vx *= -1; 
        
        boss.stateTimer++;
        if (boss.stateTimer > 90) { 
            const rand = Math.random();
            boss.stateTimer = 0;
            if (bossLevel === 1) {
                if (rand < 0.2) boss.state = 'pattern1'; else if (rand < 0.4) boss.state = 'pattern2'; else if (rand < 0.6) boss.state = 'pattern3'; else if (rand < 0.8) boss.state = 'pattern4'; else boss.state = 'pattern5';
            } else {
                if (rand < 0.15) boss.state = 'pattern1'; else if (rand < 0.3) boss.state = 'pattern2'; else if (rand < 0.45) boss.state = 'pattern3'; else if (rand < 0.6) boss.state = 'pattern4'; else if (rand < 0.75) boss.state = 'pattern5'; else boss.state = 'pattern6'; 
            }
        }
    } else {
        boss.stateTimer++;
        const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
        
        if (boss.stateTimer === 1) bossEl.classList.add('eye-glow');

        if (boss.state === 'pattern1') {
            if(boss.stateTimer === 10) { 
                playSound('swing'); bossEl.classList.remove('eye-glow'); bossEl.classList.add('boss-attack-anim'); 
                spawnProjectile(boss.x, boss.y, angleToPlayer, 18, 15, true, 100); 
            }
            if(boss.stateTimer > 40) resetBossState();
        } 
        else if (boss.state === 'pattern2') {
            if(boss.stateTimer === 1) bossEl.classList.add('boss-telegraph');
            if(boss.stateTimer === 100) { 
                playSound('swing'); bossEl.classList.remove('eye-glow', 'boss-telegraph'); bossEl.classList.add('boss-attack-anim'); 
                spawnProjectile(boss.x, boss.y, angleToPlayer, 10, 40, true, 180, true); 
            }
            if(boss.stateTimer > 130) resetBossState();
        }
        else if (boss.state === 'pattern3') {
            if(boss.stateTimer === 20 || boss.stateTimer === 40 || boss.stateTimer === 60) {
                if(boss.stateTimer === 20) bossEl.classList.remove('eye-glow');
                playSound('swing'); bossEl.classList.add('boss-attack-anim'); 
                spawnProjectile(boss.x, boss.y, angleToPlayer, 10, 10, true, 100);
                setTimeout(() => bossEl.classList.remove('boss-attack-anim'), 100);
            }
            if(boss.stateTimer > 100) resetBossState();
        }
        else if (boss.state === 'pattern4') {
            if(boss.stateTimer === 30) { 
                playSound('swing'); bossEl.classList.remove('eye-glow'); bossEl.classList.add('boss-attack-anim'); 
                spawnProjectile(boss.x, boss.y, angleToPlayer, 12, 20, true, 100); 
            }
            if(boss.stateTimer > 70) resetBossState();
        }
        else if (boss.state === 'pattern5') {
            if (boss.stateTimer === 1) bossEl.classList.add('boss-telegraph');
            if (boss.stateTimer === 60) {
                bossEl.classList.remove('eye-glow', 'boss-telegraph'); bossEl.classList.add('boss-dashing');
                boss.vx = Math.cos(angleToPlayer) * boss.dashSpeed; boss.vy = Math.sin(angleToPlayer) * boss.dashSpeed;
            }
            if (boss.stateTimer > 60 && boss.stateTimer < 90) {
                boss.x += boss.vx; boss.y += boss.vy;
                if (getDistance(boss.x, boss.y, player.x, player.y) < player.radius + boss.radius) {
                    if (player.isParrying) {
                        playSound('parryed'); // 돌진 패링 성공!
                        player.isParrying = false; playerEl.classList.remove('parrying');
                        playerEl.classList.add('parry-deflect', 'parry-cd'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                        player.parryCooldown = 0;
                        parryStatusEl.innerText = "돌진 저지 성공! (보스 기절)"; parryStatusEl.style.color = "#2ecc71";
                        boss.hp -= 100; gainExp(50); boss.stateTimer = 90;
                        bossHitEffect(boss.x, boss.y); 
                    } else {
                        takeDamage(30); boss.stateTimer = 90;
                    }
                }
            }
            if (boss.stateTimer >= 90) { bossEl.classList.remove('boss-dashing'); resetBossState(); }
        }
        else if (boss.state === 'pattern6') {
            if (boss.stateTimer === 1) {
                bossEl.style.backgroundColor = '#8e44ad'; bossEl.classList.add('boss-telegraph');
            }
            if (boss.stateTimer === 60) {
                playSound('swing');
                bossEl.style.backgroundColor = '#c0392b';
                bossEl.classList.remove('eye-glow', 'boss-telegraph'); bossEl.classList.add('boss-attack-anim');
                spawnProjectile(boss.x, boss.y, angleToPlayer, 15, 0, true, 80, false, true);
            }
            if (boss.stateTimer > 100) resetBossState();
        }
    }
    boss.x = Math.max(boss.radius, Math.min(GAME_WIDTH - boss.radius, boss.x));
    boss.y = Math.max(boss.radius, Math.min(GAME_HEIGHT - boss.radius, boss.y));
}

function resetBossState() { 
    boss.state = 'idle'; boss.stateTimer = 0; boss.vy = 0; boss.vx = 2; 
    bossEl.classList.remove('boss-attack-anim', 'boss-telegraph', 'boss-dashing', 'eye-glow'); 
    bossEl.style.backgroundColor = '#c0392b';
}

function getDistance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

function update() {
    if (isPaused) { requestAnimationFrame(update); return; }

    // ★ 수정: 잡히지 않았고, 패링 상태가 아닐 때만 이동 가능 (패링 시 이동 불가) ★
    if (!player.isGrabbed && !player.isParrying) {
        if (keys.w && player.y > player.radius) player.y -= player.speed;
        if (keys.s && player.y < GAME_HEIGHT - player.radius) player.y += player.speed;
        if (keys.a && player.x > player.radius) player.x -= player.speed;
        if (keys.d && player.x < GAME_WIDTH - player.radius) player.x += player.speed;
    }
    
    playerEl.style.left = player.x + 'px';
    playerEl.style.top = player.y + 'px';

    if (player.attackQueue > 0) {
        player.burstTimer--;
        if (player.burstTimer <= 0) {
            playSound('swing');
            const baseAngle = Math.atan2(boss.y - player.y, boss.x - player.x);
            spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70);
            player.attackQueue--;
            player.burstTimer = 8;
        }
    }

    if(player.attackCooldown > 0) player.attackCooldown--;

    if (player.isGrabbed) {
        player.grabTimer--;
        if (player.grabTimer === 30) {
            takeDamage(80); 
            let explosion = document.createElement('div');
            explosion.className = 'unparryable-hit';
            explosion.style.left = player.x + 'px'; explosion.style.top = player.y + 'px';
            container.appendChild(explosion);
            setTimeout(() => explosion.remove(), 500);
        }
        if (player.grabTimer <= 0) {
            player.isGrabbed = false; playerEl.classList.remove('player-grabbed');
        }
    }

    if (player.isParrying) {
        player.parryTimer--;
        if (player.parryTimer <= 0) {
            player.isParrying = false; 
            playerEl.classList.remove('parrying');
            playerEl.classList.add('parry-cd'); 
            player.parryCooldown = 300; 
        }
    } else if (player.parryCooldown > 0) {
        player.parryCooldown--;
        let secondsLeft = Math.ceil(player.parryCooldown / 60);
        if (!player.isGrabbed) { 
            parryStatusEl.innerText = `패링 쿨타임: ${secondsLeft}초`; 
            parryStatusEl.style.color = "#e74c3c";
            floatingCdEl.innerText = `${secondsLeft}초`; 
        }
        if (player.parryCooldown <= 0 && !player.isGrabbed) { 
            parryStatusEl.innerText = "패링 준비 완료"; 
            parryStatusEl.style.color = "#3498db"; 
            playerEl.classList.remove('parry-cd'); 
            floatingCdEl.innerText = ""; 
        }
    }

    if (player.hasSkill) {
        if (player.skillCooldown > 0) {
            player.skillCooldown--;
            let sec = Math.ceil(player.skillCooldown / 60);
            skillStatusEl.innerText = `회전베기: ${sec}초`; skillStatusEl.style.color = "#e74c3c";
        } else {
            skillStatusEl.innerText = "회전베기: 준비 완료!"; skillStatusEl.style.color = "#f1c40f";
        }
    }

    bossLogic();
    bossEl.style.left = boss.x + 'px'; bossEl.style.top = boss.y + 'px';
    
    bossUiEl.style.left = boss.x + 'px';
    bossUiEl.style.top = (boss.y - boss.radius - 15) + 'px';

    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += Math.cos(p.angle) * p.speed; p.y += Math.sin(p.angle) * p.speed;
        p.el.style.left = p.x + 'px'; p.el.style.top = p.y + 'px';
        p.el.style.transform = `translate(-50%, -50%) rotate(${p.angle}rad)`;

        if (p.x < -100 || p.x > GAME_WIDTH + 100 || p.y < -100 || p.y > GAME_HEIGHT + 100) {
            p.el.remove(); projectiles.splice(i, 1); continue;
        }

        if (p.isBoss) {
            if (getDistance(p.x, p.y, player.x, player.y) < player.radius + p.radius) {
                if (player.isParrying) {
                    playSound('parryed'); // ★ 패링 성공 사운드 ★
                    player.isParrying = false; playerEl.classList.remove('parrying');
                    playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                    player.parryCooldown = 0;
                    floatingCdEl.innerText = "";
                    
                    parryStatusEl.innerText = p.isGrab ? "잡기 무효화 성공!" : "패링 반사 성공!"; 
                    parryStatusEl.style.color = "#2ecc71";

                    if (p.isGrab) {
                        boss.hp -= 20; p.el.remove(); projectiles.splice(i, 1);
                        bossHitEffect(boss.x, boss.y); 
                    } else {
                        p.isBoss = false; p.el.classList.remove('boss-slash', 'heavy-slash');
                        p.angle = Math.atan2(boss.y - p.y, boss.x - p.x); p.speed *= 1.5; p.damage *= 2; 
                    }
                } else {
                    if (p.isGrab && !player.isGrabbed) {
                        player.isGrabbed = true; player.grabTimer = 90; 
                        playerEl.classList.add('player-grabbed');
                        parryStatusEl.innerText = "잡혔습니다!! (회피 불가)"; parryStatusEl.style.color = "red";
                        floatingCdEl.innerText = "기절";
                        p.el.remove(); projectiles.splice(i, 1);
                    } else {
                        takeDamage(p.damage); p.el.remove(); projectiles.splice(i, 1);
                    }
                }
            }
        } else { 
            if (getDistance(p.x, p.y, boss.x, boss.y) < boss.radius + p.radius) {
                boss.hp -= p.damage; gainExp(p.damage); updateUI(); 
                bossHitEffect(p.x, p.y); 
                p.el.remove(); projectiles.splice(i, 1);
                
                if (boss.hp <= 0) {
                    playSound('dead'); // ★ 보스 사망 사운드 ★
                    bossLevel++; boss.maxHp = 1000 + (bossLevel * 500); boss.hp = boss.maxHp; boss.dashSpeed += 1; 
                    bossNameEl.innerText = `BOSS (Lv. ${bossLevel})`;
                    player.hp = Math.min(player.maxHp, player.hp + 50);
                    
                    setTimeout(() => alert(`보스 처치! 다음 단계(Lv.${bossLevel})로 진입합니다!\n(증강 유지, 체력 소폭 회복)`), 100);
                    resetBossState(); updateUI();
                }
            }
        }
    }

    if (player.hp <= 0) {
        playSound('dead'); // ★ 플레이어 사망 사운드 ★
        document.getElementById('final-score').innerText = `최종 도달: Boss Lv. ${bossLevel}\n플레이어 Lv. ${player.level}`;
        document.getElementById('game-over-modal').classList.remove('hidden');
        isPaused = true; 
        return; 
    }

    requestAnimationFrame(update);
}

window.restartGame = function() {
    player = initPlayer(); bossLevel = 1; boss = initBoss();
    bossNameEl.innerText = `BOSS (Lv. 1)`;
    floatingCdEl.innerText = "";
    
    projectiles.forEach(p => p.el.remove()); projectiles = [];
    document.querySelectorAll('.unparryable-hit').forEach(el => el.remove());
    document.querySelectorAll('.impact-effect').forEach(el => el.remove());

    document.getElementById('game-over-modal').classList.add('hidden');
    document.getElementById('aug-skill').style.display = 'block'; 
    skillStatusEl.classList.add('hidden'); document.getElementById('btn-skill').classList.add('hidden'); 
    
    playerEl.classList.remove('player-grabbed', 'parrying', 'parry-deflect', 'parry-cd', 'hit-flash');
    container.classList.remove('screen-shake', 'boss-hit-shake');
    
    resetBossState(); updateUI();
    isPaused = false; requestAnimationFrame(update); 
}

function updateUI() {
    document.getElementById('player-hp').style.width = (Math.max(0, player.hp) / player.maxHp * 100) + '%';
    document.getElementById('boss-hp').style.width = (Math.max(0, boss.hp) / boss.maxHp * 100) + '%';
    document.getElementById('player-exp').style.width = (player.exp / player.maxExp * 100) + '%';
    document.getElementById('player-level').innerText = player.level;
}

function gainExp(amount) {
    player.exp += (amount * 0.5); 
    if (player.exp >= player.maxExp) {
        player.level++; player.exp -= player.maxExp; player.maxExp = Math.floor(player.maxExp * 1.5);
        updateUI(); showLevelUpModal();
    }
    updateUI();
}

function showLevelUpModal() {
    isPaused = true; document.getElementById('level-up-modal').classList.remove('hidden');
}

window.selectAugment = function(type) {
    if (type === 'damage') player.damage += 5;
    else if (type === 'cooldown') player.baseAttackCooldown = Math.max(10, player.baseAttackCooldown - 5);
    else if (type === 'multishot') player.attackCount += 1;
    else if (type === 'skill') {
        player.hasSkill = true; skillStatusEl.classList.remove('hidden');
        document.getElementById('aug-skill').style.display = 'none'; document.getElementById('btn-skill').classList.remove('hidden'); 
    }
    document.getElementById('level-up-modal').classList.add('hidden');
    updateUI(); isPaused = false; 
}

updateUI();
requestAnimationFrame(update);
