window.addEventListener('load', function(){
    // canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1500;
    canvas.height = 1000;

    class InputHandler{
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                if((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && (this.game.keys.indexOf(e.key) == -1)){
                    this.game.keys.push(e.key);
                    if(e.key === 'ArrowRight'){
                        this.game.player.runRight();
                    }
                } else if(e.key === 'z' || e.key === 'Z' || e.key === 'я' || e.key === 'Я'){
                    this.game.needDrop = true;
                    this.game.player.shootWrench();
                } else if(e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С'){
                    this.game.needScream = true;
                    this.game.player.shootYell();
                }
            });
            window.addEventListener('keyup', e => {
                if(this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Projectiles{
        constructor(game){
            this.game = game;
            this.speedY = 10
        }
    }

    class Wrench extends Projectiles{
        constructor(game, x, y){
            super(game);
            this.x = x;
            this.y = y;
            this.width = 80;
            this.height = 130;
            this.angle = 0;
            this.va = 0.2;
            this.type = 'wrench';
            this.markedForDeletion = false;;
            this.isReturn = false;
            this.canAttack = true;
            this.wrenchImg = document.getElementById('wrench');
        }
        update(){
            this.angle += this.va;
            this.y -= this.speedY;
        }
        draw(context){
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.wrenchImg, this.width * -0.5, this.height * -0.5, this.width, this.height);
            context.restore();
        }
        returning(){
            this.angle += this.va;
            if(this.game.player.x + 20 > this.x) {
                this.x += 5;
            } else if(this.game.player.x + 20 < this.x) {
                this.x -=5;
            }
            this.y += this.speedY;
            if((this.game.checkCollision(this.game.player, this)) || this.y >= this.game.height){
                this.markedForDeletion = true;
                this.game.wrench.canAttack = true;
            }
        }
    }

    class Yell extends Projectiles{
        constructor(game, x, y){
            super(game);
            this.x = x;
            this.y = y;
            this.width = 150;
            this.height = 100;
            this.type = 'yell';
            this.yellImg = document.getElementById('yell');
            this.markedForDeletion = false;
        }
        update(){
            this.y -= this.speedY;
        }
        draw(context){
            context.drawImage(this.yellImg, this.x, this.y);
        }
    }

    class Player{
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 170;
            this.x = 690;
            this.y = 825;
            this.mainImg = document.getElementById('player_static');
            this.runRightImg = document.getElementById('run_right');
            this.runLeftImg = document.getElementById('run_left');
            this.runFrame = 0;
            this.maxRunFrame = 16;
            this.runCount = 0;
            this.dropImg = document.getElementById('drop');
            this.dropFrame = 0;
            this.maxDropFrame = 6;
            this.dropCount = 0;
            this.screamImg = document.getElementById('scream');
            this.screamFrame = 0;
            this.maxScreamFrame = 10;
            this.screamCount = 0;
            this.lives = 5;
        }
        update(deltaTime){
            if(this.game.keys[0] === 'ArrowLeft'){
                if(this.x <= 0) this.x -= 0;
                else this.x -= 5;
            } else if(this.game.keys[0] === 'ArrowRight'){
                if(this.x + this.width >= this.game.width) this.x += 0;
                else this.x += 5;
            }

            // sprite animation RUN
            if(this.runFrame < this.maxRunFrame){
                this.runCount++;
                if(this.runCount === 5){
                    this.runFrame++;
                    this.runCount = 0;
                }
            } else {
                this.runFrame = 0;
            }

            // sprite animation DROP
            if(this.game.needDrop){
                if(this.dropFrame < this.maxDropFrame){
                    this.dropCount++;
                    if(this.dropCount == 2){
                        this.dropFrame++;
                        this.dropCount = 0;
                    }
                } else {
                    this.game.needDrop = false;
                    this.dropFrame = 0;
                }
            }

            // sprite animation SCREAM
            if(this.game.needScream){
                if(this.screamFrame < this.maxScreamFrame){
                    this.screamCount++;
                    if(this.screamCount == 2){
                        this.screamFrame++;
                        this.screamCount = 0;
                    }
                } else {
                    this.game.needScream = false;
                    this.screamFrame = 0;
                }
            }
            
        }
        draw(context){
            context.drawImage(this.mainImg, this.x, this.y, this.width, this.height);
        }
        runRight(context){
            context.drawImage(
                this.runRightImg,
                this.runFrame * this.width,
                0,
                this.width, 
                this.height,
                this.x, 
                this.y, 
                this.width,
                this.height
                );
        }
        runLeft(context){
            context.drawImage(
                this.runLeftImg, 
                this.runFrame * this.width,
                0, 
                this.width,
                this.height,
                this.x, 
                this.y,
                this.width,
                this.height
                );
        }
        dropAnimation(context){
            context.drawImage(
                this.dropImg,
                this.dropFrame * this.width,
                0,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        shootWrench(){
            if(this.game.wrench.canAttack == true){
                this.game.projectiles.push(new Wrench(this.game, this.x + 20, this.y));
                this.game.wrench.canAttack = false;
            }
        }
        screamAnimation(context){
            context.drawImage(
                this.screamImg,
                this.screamFrame * this.width,
                0,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        shootYell(){
            this.game.projectiles.push(new Yell(this.game, this.x - 15, this.y - this.game.yell.height));
        }
    }

    class Enemy{
        constructor(game){
            this.game = game;
            this.speedY = Math.random() * 1.5 + 0.5;
            this.markedForDeletion = false;
        }
        update(deltaTime){
            this.y += this.speedY;
        }
    }

    class Bug extends Enemy{
        constructor(game){
            super(game);
            this.width = 300;
            this.height = 120;
            this.x = Math.random() * (this.game.width * 0.9 - this.width);
            this.y = -(this.height);
            this.type = 'bug';
        }
    }

    class Bug1 extends Bug{
        constructor(game){
            super(game);
            this.width = 237;
            this.height = 80;
            this.img = document.getElementById('bug1');
        }
        draw(context){
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img,
                this.x,
                this.y
            )
        }
    }

    class Bug2 extends Bug{
        constructor(game){
            super(game);
            this.width = 150;
            this.height = 79;
            this.img = document.getElementById('bug2');
        }
        draw(context){
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img,
                this.x,
                this.y
            )
        }
    }

    class Bug3 extends Bug{
        constructor(game){
            super(game);
            this.width = 279;
            this.height = 84;
            this.img = document.getElementById('bug3');
        }
        draw(context){
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img,
                this.x,
                this.y
            )
        }
    }

    class Bug4 extends Bug{
        constructor(game){
            super(game);
            this.width = 268;
            this.height = 45;
            this.img = document.getElementById('bug4');
        }
        draw(context){
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img,
                this.x,
                this.y
            )
        }
    }

    class Bug5 extends Bug{
        constructor(game){
            super(game);
            this.width = 291;
            this.height = 71;
            this.img = document.getElementById('bug5');
        }
        draw(context){
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img,
                this.x,
                this.y
            )
        }
    }

    class ClientSupport extends Enemy{
        constructor(game){
            super(game);
            this.width = 300;
            this.height = 170;
            this.x = Math.random() * (this.game.width * 0.9 - this.width);
            this.y = -(this.height);
            this.type = 'support';
        }
    }

    class Sup1 extends ClientSupport{
        constructor(game){
            super(game);
            this.width = 221;
            this.height = 78;
            this.img = document.getElementById('sup1');
        }
        draw(context){
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img,
                this.x,
                this.y
            );
        }
    }

    class Sup2 extends ClientSupport{
        constructor(game){
            super(game);
            this.width = 346;
            this.height = 83;
            this.img = document.getElementById('sup2');
        }
        draw(context){
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img,
                this.x,
                this.y
            );
        }
    }

    class Sup3 extends ClientSupport{
        constructor(game){
            super(game);
            this.width = 310;
            this.height = 66;
            this.img = document.getElementById('sup3');
        }
        draw(context){
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img,
                this.x,
                this.y
            );
        }
    }

    class Sup4 extends ClientSupport{
        constructor(game){
            super(game);
            this.width = 466;
            this.height = 75;
            this.img = document.getElementById('sup4');
        }
        draw(context){
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img,
                this.x,
                this.y
            );
        }
    }

    class Sup5 extends ClientSupport{
        constructor(game){
            super(game);
            this.width = 414;
            this.height = 88;
            this.img = document.getElementById('sup5');
        }
        draw(context){
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img,
                this.x,
                this.y
            );
        }
    }

    class UI{
        constructor(game){
            this.game = game;
            this.fontSize = 50;
            this.fontFamily = 'Bangers';
            this.color = 'White';
        }
        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;

            if(this.game.gameOver){
                context.textAlign = 'center';
                let message1 = "You're fired, looser!";
                context.font = '100px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);
            }

            context.restore();
        }
    }

    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.ui = new UI(this);
            this.input = new InputHandler(this);
            this.keys = [];
            this.projectiles = [];
            this.wrench = new Wrench(this);
            this.yell = new Yell(this);
            this.player = new Player(this);
            // BUGS VARIABLES
            this.bug = new Bug(this); /*THE MAIN BUG CLASS */
            this.bug1 = new Bug1(this);
            this.bug2 = new Bug2(this);
            this.bug3 = new Bug3(this);
            this.bug4 = new Bug4(this);
            this.bug5 = new Bug5(this);
            // --------------------
            // SUPPORT VARIABLES
            this.sup = new ClientSupport(this);/*THE MAIN SUPPORT CLASS */
            this.sup1 = new Sup1(this);
            this.sup2 = new Sup2(this);
            this.sup3 = new Sup3(this);
            this.sup4 = new Sup4(this);
            this.sup5 = new Sup5(this);
            // --------------------
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 2000;
            this.needDrop = false;
            this.needScream = false;
            this.gameOver = false;
        }
        update(deltaTime){
            if(this.player.lives < 0){
                this.gameOver = true;
                this.enemies = [];
            }
            this.enemies.forEach(enemy => enemy.update(deltaTime));
            this.projectiles.forEach(projectile => {
                if(projectile.isReturn){
                    projectile.returning();
                } else {
                    projectile.update();
                }
            });
            this.player.update(deltaTime);

            // appearance of the enemy
            if(this.enemyTimer >= 2000){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }

            // the collision of the player and enemy
            this.enemies.forEach(enemy =>{
                if(this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion = true;
                    this.player.lives--;
                    console.log(this.player.lives);
                }
            });

            // dissapearance of the enemies after collision with the player
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

            // dissapearance of the Yell-weapon
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);

            // the collision of the enemies and the bottom of the map
            this.enemies.forEach(enemy =>{
                if(enemy.y + enemy.height >= this.height){
                    enemy.markedForDeletion = true;
                    this.player.lives--;
                    console.log(this.player.lives);
                }
            });

            // the collision of the enemies and projectiles
            this.enemies.forEach(enemy =>{
                this.projectiles.forEach(projectile => {
                    if(this.checkCollision(projectile, enemy)){
                        if((projectile.type == 'yell') && (enemy.type == 'support')){
                            enemy.markedForDeletion = true;
                            projectile.markedForDeletion = true;
                        } else if((projectile.type == 'wrench') && (enemy.type == 'bug')){
                            enemy.markedForDeletion = true;
                            projectile.isReturn = true;
                        }
                    }
                });
            });

            // the collision of the projectiles and the top of the map
            this.projectiles.forEach(projectile => {
                if((projectile.y <= 0) && (projectile.type === 'yell')){
                    projectile.markedForDeletion = true;
                } else if ((projectile.y <= 0) && (projectile.type === 'wrench')){
                    projectile.isReturn = true;
                }
            });
        }
        draw(context){
            if(this.gameOver){
                this.ui.draw(context);
            }
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            
            // DYNAMIC or STATIC player
            if(this.keys[0] === 'ArrowRight'){
                this.player.runRight(context);
            } else if (this.keys[0] === 'ArrowLeft'){
                this.player.runLeft(context);
            } else if(this.needDrop){
                this.player.dropAnimation(context);
            } else if(this.needScream){
                this.player.screamAnimation(context);
            }else {
                this.player.draw(context);
            }
        }
        addEnemy(){
            if(this.gameOver){
                this.enemies = [];
            }
            const randomize = Math.floor(Math.random() * 10);
            switch(randomize){
                case 0:
                    if(this.bug1.markedForDeletion) {
                        this.bug1.markedForDeletion = false;
                        this.bug1.y = -(this.bug.height);
                    }
                    this.enemies.push(this.bug1);
                    break;
                case 1:
                    if(this.bug2.markedForDeletion) {
                        this.bug2.markedForDeletion = false;
                        this.bug2.y = -(this.bug.height);
                    }
                    this.enemies.push(this.bug2);
                    break;
                case 2:
                    if(this.bug3.markedForDeletion) {
                        this.bug3.markedForDeletion = false;
                        this.bug3.y = -(this.bug.height);
                    }
                    this.enemies.push(this.bug3);
                    break;
                case 3:
                    if(this.bug4.markedForDeletion) {
                        this.bug4.markedForDeletion = false;
                        this.bug4.y = -(this.bug.height);
                    }
                    this.enemies.push(this.bug4);
                    break;
                case 4:
                    if(this.bug5.markedForDeletion) {
                        this.bug5.markedForDeletion = false;
                        this.bug5.y = -(this.bug.height);
                    }
                    this.enemies.push(this.bug5);
                    break;
                case 5:
                    if(this.sup1.markedForDeletion) {
                        this.sup1.markedForDeletion = false;
                        this.sup1.y = -(this.sup.height);
                    }
                    this.enemies.push(this.sup1);
                    break;
                case 6:
                    if(this.sup2.markedForDeletion) {
                        this.sup2.markedForDeletion = false;
                        this.sup2.y = -(this.sup.height);
                    }
                    this.enemies.push(this.sup2);
                    break;
                case 7:
                    if(this.sup3.markedForDeletion) {
                        this.sup3.markedForDeletion = false;
                        this.sup3.y = -(this.sup.height);
                    }
                    this.enemies.push(this.sup3);
                    break;
                case 8:
                    if(this.sup4.markedForDeletion) {
                        this.sup4.markedForDeletion = false;
                        this.sup4.y = -(this.sup.height);
                    }
                    this.enemies.push(this.sup4);
                    break;
                case 9:
                    if(this.sup5.markedForDeletion) {
                        this.sup5.markedForDeletion = false;
                        this.sup5.y = -(this.sup.height);
                    }
                    this.enemies.push(this.sup5);
            }
        }
        checkCollision(rect1, rect2){
            return(
                rect1.x + rect1.width > rect2.x &&
                rect1.x < rect2.x + rect2.width &&
                rect1.y < rect2.y + rect2.height
            );
        }
    }
    
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    // animation loop
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate(0);
});