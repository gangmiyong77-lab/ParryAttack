// ★ 추가: 가스터 블래스터와 레이저 디자인을 동적으로 삽입 (style.css 수정 필요 없음)
const extraStyle = document.createElement('style');
extraStyle.innerHTML = `
    .gaster-blaster {
        position: absolute; width: 45px; height: 35px;
        background: #111; border: 2px solid #fff; border-radius: 10px 20px 20px 10px;
        z-index: 15; transition: opacity 0.3s, transform 0.1s;
    }
    .blaster-telegraph {
        position: absolute; top: 50%; left: 45px;
        width: 1500px; height: 2px; background: rgba(0, 255, 255, 0.4);
        transform: translateY(-50%); pointer-events: none;
    }
    .laser-slash {
        background: #0ff !important; border: none !important;
        box-shadow: 0 0 15px #0ff, 0 0 30px #fff !important;
        border-radius: 10px !important; height: 25px !important; width: 150px !important;
    }
`;
document.head.appendChild(extraStyle);

const container = document.getElementById('game-container');
const playerEl = document.getElementById('player');
const floatingCdEl = document.getElementById('floating-cd'); 
const parryStatusEl = document.getElementById('parry-status');
const skillStatusEl = document.getElementById('skill-status');

const originalBossEl = document.getElementById('boss');
const originalBossUiEl = document.getElementById('boss-ui');
if(originalBossEl) originalBossEl.style.display = 'none';
if(originalBossUiEl) originalBossUiEl.style.display = 'none';

let isPaused = false;

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
        sound.volume = 0.1;
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound play prevented pending user interaction."));
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
let bosses = [];
let projectiles = [];
let blasters = []; // ★ 가스터 블래스터 배열 관리

const initPlayer = () => ({
    x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, speed: 2.5, radius: 25,
    hp: 100, maxHp: 100, exp: 0, maxExp: 400, level: 1, damage: 10, 
    attackCount: 1, baseAttackCooldown: 30, attackCooldown: 0,
    attackQueue: 0, burstTimer: 0, 
    isParrying: false, parryTimer: 0, parryCooldown: 0,
    hasSkill: false, skillCooldown: 0, maxSkillCooldown: 600,
    isGrabbed: false, grabTimer: 0
});
let player = initPlayer();

function spawnBosses() {
    bosses.forEach(b => { b.el.remove(); b.uiEl.remove(); });
    bosses = [];
    
    for(let i = 0; i < bossLevel; i++) {
        const el = originalBossEl.cloneNode(true);
        el.style.display = 'block'; 
        el.style.position = 'absolute'; 
        el.style.transform = 'translate(-50%, -50%)';
        el.style.zIndex = '10';

        const uiEl = document.createElement('div');
        uiEl.style.position = 'absolute'; uiEl.style.width = '100px';
        uiEl.style.transform = 'translate(-50%, -15px)'; uiEl.style.textAlign = 'center'; uiEl.style.zIndex = '11';

        const nameEl = document.createElement('div');
        nameEl.innerText = `Lv.${bossLevel} Boss`;
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

        let maxHp = 50 + (bossLevel * 100); 
        let spacing = GAME_WIDTH / (bossLevel + 1);
        
        bosses.push({
            x: spacing * (i + 1),
            y: 100 + (Math.random() * 80),
            radius: 50,
            hp: maxHp, maxHp: maxHp,
            state: 'idle', stateTimer: Math.floor(Math.random() * 40),
            vx: 2 * (i % 2 === 0 ? 1 : -1), vy: 0, dashSpeed: 20 + bossLevel,
            el: el, uiEl: uiEl, hpFill: hpFill
        });
    }
    
    const topBossName = document.getElementById('boss-name');
    if(topBossName) topBossName.innerText = `WAVE ${bossLevel} (적 ${bossLevel}마리)`;
}

// ★ 블래스터 소환 함수 ★
function createBlaster(x, y, angle, owner) {
    playSound('parry'); 
    const el = document.createElement('div');
    el.className = 'gaster-blaster';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    
    // 블래스터 눈(하늘색 빛)
    const eye = document.createElement('div');
    eye.style.position = 'absolute'; eye.style.right = '10px'; eye.style.top = '12px';
    eye.style.width = '10px'; eye.style.height = '10px'; eye.style.backgroundColor = '#0ff'; 
    eye.style.borderRadius = '50%'; eye.style.boxShadow = '0 0 10px #0ff';
    el.appendChild(eye);

    // 블래스터 조준선
    const telegraph = document.createElement('div');
    telegraph.className = 'blaster-telegraph';
    el.appendChild(telegraph);
    
    container.appendChild(el);
    blasters.push({ x, y, angle, timer: 35, el, telegraph, owner }); // 35프레임 후 발사
}

function getClosestBoss() {
    if(bosses.length === 0) return null;
    let closest = bosses[0];
    let minDist = getDistance(player.x, player.y, closest.x, closest.y);
    for(let i=1; i<bosses.length; i++) {
        let dist = getDistance(player.x, player.y, bosses[i].x, bosses[i].y);
        if(dist < minDist) { closest = bosses[i]; minDist = dist; }
    }
    return closest;
}

function takeDamage(amount) {
    player.hp -= amount; updateUI(); playSound('hit');
    playerEl.classList.add('hit-flash'); container.classList.add('screen-shake');
    setTimeout(() => { playerEl.classList.remove('hit-flash'); container.classList.remove('screen-shake'); }, 300);
}

function bossHitEffect(targetBoss, x, y) {
    playSound('hit');
    targetBoss.el.classList.add('boss-hit-flash');
    setTimeout(() => targetBoss.el.classList.remove('boss-hit-flash'), 200);
    container.classList.add('boss-hit-shake');
    setTimeout(() => container.classList.remove('boss-hit-shake'), 150);

    let impact = document.createElement('div');
    impact.className = 'impact-effect'; impact.style.left = x + 'px'; impact.style.top = y + 'px';
    impact.style.setProperty('--rot', `${Math.random() * 360}deg`);
    container.appendChild(impact); setTimeout(() => impact.remove(), 200); 
}

function checkBossDeath(b) {
    if (b.hp <= 0) {
        playSound('dead'); 
        b.el.remove(); b.uiEl.remove();
        bosses = bosses.filter(boss => boss !== b); 
        
        if (bosses.length === 0) { 
            bossLevel++; 
            player.hp = Math.min(player.maxHp, player.hp + 50);
            setTimeout(() => alert(`웨이브 클리어! 다음 단계(Lv.${bossLevel})로 진입합니다!\n(적 ${bossLevel}마리 등장, 체력 소폭 회복)`), 100);
            spawnBosses(); updateUI();
        }
    }
}

function doAttack() {
    if(isPaused || player.isGrabbed || player.attackCooldown > 0) return;
    playSound('swing');
    playerEl.classList.add('attack-anim');
    setTimeout(() => playerEl.classList.remove('attack-anim'), 200);
    
    let target = getClosestBoss();
    let tx = target ? target.x : player.x; let ty = target ? target.y : player.y - 10;
    
    const baseAngle = Math.atan2(ty - player.y, tx - player.x);
    spawnProjectile(player.x, player.y, baseAngle, 12, player.damage, false, 70);
    
    player.attackQueue = player.attackCount - 1;
    player.burstTimer = 8; player.attackCooldown = player.baseAttackCooldown; 
}

function activateParry() {
    if(isPaused || player.isGrabbed || player.parryCooldown > 0 || player.isParrying) return;
    playSound('parry'); player.isParrying = true; player.parryTimer = 60; 
    playerEl.classList.add('parrying'); playerEl.classList.remove('parry-cd');
    parryStatusEl.innerText = "패링 중!! (이동 불가)"; parryStatusEl.style.color = "#00ffff";
}

function doSkill() {
    if (player.hasSkill && player.skillCooldown <= 0 && !isPaused && !player.isGrabbed) {
        playSound('swing'); player.skillCooldown = player.maxSkillCooldown;
        playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
        for (let i = 0; i < 8; i++) {
            spawnProjectile(player.x, player.y, (Math.PI / 4) * i, 15, player.damage * 2, false, 120, true);
        }
    }
}

// ★ isLaser 매개변수 추가: 레이저일 경우 크고 화려한 속성 부여
function spawnProjectile(x, y, angle, speed, damage, isBoss, size, isHeavy = false, isGrab = false, owner = null, isLaser = false) {
    const el = document.createElement('div');
    el.className = `slash ${isBoss ? 'boss-slash' : ''} ${isHeavy ? 'heavy-slash' : ''} ${isGrab ? 'grab-slash' : ''} ${isLaser ? 'laser-slash' : ''}`;
    if(isHeavy && !isBoss && !isLaser) el.style.borderRightColor = "#00ffff"; 
    
    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    container.appendChild(el);
    projectiles.push({ x, y, angle, speed, damage, isBoss, radius: size/2, el, isGrab, owner });
}

function bossLogic() {
    bosses.forEach(boss => {
        if (boss.state === 'idle') {
            boss.x += boss.vx;
            if (boss.x < boss.radius + 50 || boss.x > GAME_WIDTH - boss.radius - 50) boss.vx *= -1; 
            
            boss.stateTimer++;
            if (boss.stateTimer > 90) { 
                const rand = Math.random(); boss.stateTimer = 0;
                
                // ★ 보스 레벨별 패턴 등장 확률 업데이트 (4레벨부터 패턴7 가스터 블래스터 등장) ★
                if (bossLevel < 2) {
                    if (rand < 0.2) boss.state = 'pattern1'; else if (rand < 0.4) boss.state = 'pattern2'; else if (rand < 0.6) boss.state = 'pattern3'; else if (rand < 0.8) boss.state = 'pattern4'; else boss.state = 'pattern5';
                } else if (bossLevel < 4) {
                    if (rand < 0.15) boss.state = 'pattern1'; else if (rand < 0.3) boss.state = 'pattern2'; else if (rand < 0.45) boss.state = 'pattern3'; else if (rand < 0.6) boss.state = 'pattern4'; else if (rand < 0.75) boss.state = 'pattern5'; else boss.state = 'pattern6'; 
                } else {
                    // 레벨 4 이상: 무려 35% 확률로 가스터 블래스터 패턴 사용!
                    if (rand < 0.1) boss.state = 'pattern1'; 
                    else if (rand < 0.2) boss.state = 'pattern2'; 
                    else if (rand < 0.3) boss.state = 'pattern3'; 
                    else if (rand < 0.4) boss.state = 'pattern4'; 
                    else if (rand < 0.5) boss.state = 'pattern5'; 
                    else if (rand < 0.65) boss.state = 'pattern6'; 
                    else boss.state = 'pattern7'; // 가스터 블래스터 
                }
            }
        } else {
            boss.stateTimer++;
            const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
            if (boss.stateTimer === 1 && boss.state !== 'pattern7') boss.el.classList.add('eye-glow');

            if (boss.state === 'pattern1') {
                if(boss.stateTimer === 10) { 
                    playSound('swing'); boss.el.classList.remove('eye-glow'); boss.el.classList.add('boss-attack-anim'); 
                    spawnProjectile(boss.x, boss.y, angleToPlayer, 18, 15, true, 100, false, false, boss); 
                }
                if(boss.stateTimer > 40) resetBossState(boss);
            } 
            else if (boss.state === 'pattern2') {
                if(boss.stateTimer === 1) boss.el.classList.add('boss-telegraph');
                if(boss.stateTimer === 100) { 
                    playSound('swing'); boss.el.classList.remove('eye-glow', 'boss-telegraph'); boss.el.classList.add('boss-attack-anim'); 
                    spawnProjectile(boss.x, boss.y, angleToPlayer, 10, 20, true, 180, true, false, boss); 
                }
                if(boss.stateTimer > 130) resetBossState(boss);
            }
            else if (boss.state === 'pattern3') {
                if(boss.stateTimer === 20 || boss.stateTimer === 40 || boss.stateTimer === 60) {
                    if(boss.stateTimer === 20) boss.el.classList.remove('eye-glow');
                    playSound('swing'); boss.el.classList.add('boss-attack-anim'); 
                    spawnProjectile(boss.x, boss.y, angleToPlayer, 10, 10, true, 100, false, false, boss);
                    setTimeout(() => boss.el.classList.remove('boss-attack-anim'), 100);
                }
                if(boss.stateTimer > 100) resetBossState(boss);
            }
            else if (boss.state === 'pattern4') {
                if(boss.stateTimer === 30) { 
                    playSound('swing'); boss.el.classList.remove('eye-glow'); boss.el.classList.add('boss-attack-anim'); 
                    spawnProjectile(boss.x, boss.y, angleToPlayer, 12, 20, true, 100, false, false, boss); 
                }
                if(boss.stateTimer > 70) resetBossState(boss);
            }
            else if (boss.state === 'pattern5') {
                if (boss.stateTimer === 1) { 
                    boss.el.style.backgroundColor = '#f1c40f'; 
                    boss.el.style.transform = 'translate(-50%, -50%) scale(0.8)';
                    boss.el.style.transition = 'transform 0.5s, background-color 0.5s';
                    boss.el.classList.add('boss-telegraph');
                }
                if (boss.stateTimer === 60) {
                    boss.el.classList.remove('eye-glow', 'boss-telegraph'); boss.el.classList.add('boss-dashing');
                    boss.el.style.backgroundColor = '#e67e22'; boss.el.style.transform = 'translate(-50%, -50%) scale(1.1)';
                    boss.el.style.transition = 'none'; 
                    boss.vx = Math.cos(angleToPlayer) * boss.dashSpeed; boss.vy = Math.sin(angleToPlayer) * boss.dashSpeed;
                }
                if (boss.stateTimer > 60 && boss.stateTimer < 90) {
                    boss.x += boss.vx; boss.y += boss.vy;
                    if (getDistance(boss.x, boss.y, player.x, player.y) < player.radius + boss.radius) {
                        if (player.isParrying) {
                            playSound('parryed');
                            player.isParrying = false; playerEl.classList.remove('parrying');
                            playerEl.classList.add('parry-deflect', 'parry-cd'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                            player.parryCooldown = 0; parryStatusEl.innerText = "돌진 저지 성공! (보스 기절)"; parryStatusEl.style.color = "#2ecc71";
                            boss.hp -= 100; gainExp(50); boss.stateTimer = 90;
                            bossHitEffect(boss, boss.x, boss.y); checkBossDeath(boss);
                        } else { takeDamage(30); boss.stateTimer = 90; }
                    }
                }
                if (boss.stateTimer >= 90) { boss.el.classList.remove('boss-dashing'); resetBossState(boss); }
            }
            else if (boss.state === 'pattern6') {
                if (boss.stateTimer === 1) { boss.el.style.backgroundColor = '#8e44ad'; boss.el.classList.add('boss-telegraph'); }
                if (boss.stateTimer === 60) {
                    playSound('swing'); boss.el.style.backgroundColor = '#c0392b';
                    boss.el.classList.remove('eye-glow', 'boss-telegraph'); boss.el.classList.add('boss-attack-anim');
                    spawnProjectile(boss.x, boss.y, angleToPlayer, 15, 0, true, 80, false, true, boss);
                }
                if (boss.stateTimer > 100) resetBossState(boss);
            }
            // ★ 신규 패턴: 가스터 블래스터 (엇박, 궤도 회전) ★
            else if (boss.state === 'pattern7') {
                if (boss.stateTimer === 1) { 
                    boss.el.style.backgroundColor = '#000'; // 흑화
                    boss.el.style.boxShadow = '0 0 20px #0ff';
                }
                
                // 보스가 플레이어를 향해 천천히 압박 이동 (평타 섞기 위함)
                boss.x += Math.cos(angleToPlayer) * 1.5;
                boss.y += Math.sin(angleToPlayer) * 1.5;

                // 엇박자 타이밍으로 블래스터 소환 배열
                const timings = [30, 70, 100, 150, 180, 230, 260];
                if (timings.includes(boss.stateTimer)) {
                    // 타이머에 따라 각도를 계속 증가시켜 빙빙 도는 연출
                    let orbitAngle = (boss.stateTimer * 0.1) + Math.random(); 
                    let bx = player.x + Math.cos(orbitAngle) * 250;
                    let by = player.y + Math.sin(orbitAngle) * 250;
                    let angleToBlaster = Math.atan2(player.y - by, player.x - bx);

                    createBlaster(bx, by, angleToBlaster, boss);
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
    boss.el.classList.remove('boss-attack-anim', 'boss-telegraph', 'boss-dashing', 'eye-glow'); 
    boss.el.style.backgroundColor = '#c0392b';
    boss.el.style.boxShadow = 'none'; // 블래스터 빛 효과 제거
    boss.el.style.transform = 'translate(-50%, -50%) scale(1)';
    boss.el.style.transition = 'none'; 
}

function getDistance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

function update() {
    if (isPaused) { requestAnimationFrame(update); return; }

    if (isAttacking) doAttack();

    if (!player.isGrabbed && !player.isParrying) {
        if (keys.w && player.y > player.radius) player.y -= player.speed;
        if (keys.s && player.y < GAME_HEIGHT - player.radius) player.y += player.speed;
        if (keys.a && player.x > player.radius) player.x -= player.speed;
        if (keys.d && player.x < GAME_WIDTH - player.radius) player.x += player.speed;
    }
    
    playerEl.style.left = player.x + 'px'; playerEl.style.top = player.y + 'px';

    if (player.attackQueue > 0) {
        player.burstTimer--;
        if (player.burstTimer <= 0) {
            playSound('swing');
            let target = getClosestBoss();
            let tx = target ? target.x : player.x; let ty = target ? target.y : player.y - 10;
            spawnProjectile(player.x, player.y, Math.atan2(ty - player.y, tx - player.x), 12, player.damage, false, 70);
            player.attackQueue--; player.burstTimer = 8;
        }
    }

    if(player.attackCooldown > 0) player.attackCooldown--;

    if (player.isGrabbed) {
        player.grabTimer--;
        if (player.grabTimer === 30) {
            takeDamage(25); 
            let explosion = document.createElement('div'); explosion.className = 'unparryable-hit';
            explosion.style.left = player.x + 'px'; explosion.style.top = player.y + 'px';
            container.appendChild(explosion); setTimeout(() => explosion.remove(), 500);
        }
        if (player.grabTimer <= 0) { player.isGrabbed = false; playerEl.classList.remove('player-grabbed'); }
    }

    if (player.isParrying) {
        player.parryTimer--;
        if (player.parryTimer <= 0) {
            player.isParrying = false; playerEl.classList.remove('parrying');
            playerEl.classList.add('parry-cd'); player.parryCooldown = 300; 
        }
    } else if (player.parryCooldown > 0) {
        player.parryCooldown--;
        let secondsLeft = Math.ceil(player.parryCooldown / 60);
        if (!player.isGrabbed) { 
            parryStatusEl.innerText = `패링 쿨타임: ${secondsLeft}초`; parryStatusEl.style.color = "#e74c3c"; floatingCdEl.innerText = `${secondsLeft}초`; 
        }
        if (player.parryCooldown <= 0 && !player.isGrabbed) { 
            parryStatusEl.innerText = "패링 준비 완료"; parryStatusEl.style.color = "#3498db"; 
            playerEl.classList.remove('parry-cd'); floatingCdEl.innerText = ""; 
        }
    }

    if (player.hasSkill) {
        if (player.skillCooldown > 0) {
            player.skillCooldown--; skillStatusEl.innerText = `회전베기: ${Math.ceil(player.skillCooldown / 60)}초`; skillStatusEl.style.color = "#e74c3c";
        } else { skillStatusEl.innerText = "회전베기: 준비 완료!"; skillStatusEl.style.color = "#f1c40f"; }
    }

    bossLogic();

    // ★ 블래스터 업데이트 타이머 처리 ★
    for (let i = blasters.length - 1; i >= 0; i--) {
        let bl = blasters[i];
        bl.timer--;
        
        if (bl.timer === 0) {
            playSound('swing'); // 발사음
            bl.telegraph.remove(); // 조준선 제거
            // 엄청나게 빠른 레이저 (isLaser = true 적용)
            spawnProjectile(bl.x, bl.y, bl.angle, 25, 30, true, 100, true, false, bl.owner, true);
            bl.el.style.opacity = '0'; // 발사 직후 투명화
            bl.el.style.transform = `translate(-50%, -50%) rotate(${bl.angle}rad) translateX(-20px)`; // 반동 연출
        } else if (bl.timer === -15) {
            bl.el.remove(); // 완전히 지우기
            blasters.splice(i, 1);
        }
    }

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
                    playSound('parryed'); player.isParrying = false; playerEl.classList.remove('parrying');
                    playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                    player.parryCooldown = 0; floatingCdEl.innerText = "";
                    parryStatusEl.innerText = p.isGrab ? "잡기 무효화 성공!" : "패링 반사 성공!"; 
                    parryStatusEl.style.color = "#2ecc71";

                    if (p.isGrab) {
                        if(p.owner) { p.owner.hp -= 20; bossHitEffect(p.owner, p.owner.x, p.owner.y); checkBossDeath(p.owner); }
                        p.el.remove(); projectiles.splice(i, 1);
                    } else {
                        p.isBoss = false; p.el.classList.remove('boss-slash', 'heavy-slash', 'laser-slash');
                        let target = getClosestBoss();
                        p.angle = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.angle + Math.PI;
                        p.speed *= 1.5; p.damage *= 2; 
                    }
                } else {
                    if (p.isGrab && !player.isGrabbed) {
                        player.isGrabbed = true; player.grabTimer = 90; playerEl.classList.add('player-grabbed');
                        parryStatusEl.innerText = "잡혔습니다!! (회피 불가)"; parryStatusEl.style.color = "red";
                        floatingCdEl.innerText = "기절"; p.el.remove(); projectiles.splice(i, 1);
                    } else { takeDamage(p.damage); p.el.remove(); projectiles.splice(i, 1); }
                }
            }
        } else { 
            for(let j = bosses.length - 1; j >= 0; j--) {
                let b = bosses[j];
                if (getDistance(p.x, p.y, b.x, b.y) < b.radius + p.radius) {
                    b.hp -= p.damage; gainExp(p.damage); updateUI(); 
                    bossHitEffect(b, p.x, p.y); 
                    p.el.remove(); projectiles.splice(i, 1);
                    checkBossDeath(b);
                    break; 
                }
            }
        }
    }

    if (player.hp <= 0) {
        playSound('dead'); 
        document.getElementById('final-score').innerText = `최종 도달: Boss Wave ${bossLevel}\n플레이어 Lv. ${player.level}`;
        document.getElementById('game-over-modal').classList.remove('hidden');
        isPaused = true; return; 
    }

    requestAnimationFrame(update);
}

window.restartGame = function() {
    player = initPlayer(); bossLevel = 1; 
    projectiles.forEach(p => p.el.remove()); projectiles = [];
    blasters.forEach(b => b.el.remove()); blasters = []; // 다시 시작 시 블래스터 지우기
    
    document.querySelectorAll('.unparryable-hit').forEach(el => el.remove());
    document.querySelectorAll('.impact-effect').forEach(el => el.remove());

    document.getElementById('game-over-modal').classList.add('hidden');
    document.getElementById('aug-skill').style.display = 'block'; 
    skillStatusEl.classList.add('hidden'); document.getElementById('btn-skill').classList.add('hidden'); 
    
    playerEl.classList.remove('player-grabbed', 'parrying', 'parry-deflect', 'parry-cd', 'hit-flash');
    container.classList.remove('screen-shake', 'boss-hit-shake');
    
    spawnBosses(); updateUI();
    isPaused = false; requestAnimationFrame(update); 
}

function updateUI() {
    document.getElementById('player-hp').style.width = (Math.max(0, player.hp) / player.maxHp * 100) + '%';
    document.getElementById('player-exp').style.width = (player.exp / player.maxExp * 100) + '%';
    document.getElementById('player-level').innerText = player.level;
    
    let totalHp = 0; let totalMaxHp = 0;
    bosses.forEach(b => {
        totalHp += b.hp; totalMaxHp += b.maxHp;
        b.hpFill.style.width = (Math.max(0, b.hp) / b.maxHp * 100) + '%';
    });
    
    const bossHpTop = document.getElementById('boss-hp');
    if(bossHpTop && totalMaxHp > 0) bossHpTop.style.width = (Math.max(0, totalHp) / totalMaxHp * 100) + '%';
}

function gainExp(amount) {
    player.exp += (amount * 0.5); 
    if (player.exp >= player.maxExp) {
        player.level++; player.exp -= player.maxExp; player.maxExp = Math.floor(player.maxExp * 1.5);
        updateUI(); isPaused = true; document.getElementById('level-up-modal').classList.remove('hidden');
    }
    updateUI();
}

window.selectAugment = function(type) {
    if (type === 'damage') player.damage += 5;
    else if (type === 'cooldown') player.baseAttackCooldown = Math.max(10, player.baseAttackCooldown - 5);
    else if (type === 'multishot') player.attackCount += 1;
    else if (type === 'skill') {
        player.hasSkill = true; skillStatusEl.classList.remove('hidden');
        document.getElementById('aug-skill').style.display = 'none'; document.getElementById('btn-skill').classList.remove('hidden'); 
    }
    document.getElementById('level-up-modal').classList.add('hidden'); updateUI(); isPaused = false; 
}

spawnBosses();
updateUI();
requestAnimationFrame(update);
