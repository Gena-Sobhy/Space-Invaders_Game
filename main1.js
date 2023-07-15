window.addEventListener("load" , function() {
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = this.innerWidth - 50;
    canvas.height = this.innerHeight - 50;
    let gameScale; 
    if(canvas.width < canvas.height*1.5) gameScale = ((canvas.height) /Math.pow(6, 4.6) );
    else  gameScale = ((canvas.width) /Math.pow(6, 5) );
    
    // player
    class Player {
        constructor() {
            this.image = document.getElementById("spaceship");
            this.width = this.image.width * gameScale;
            this.height = this.image.height * gameScale;
            this.position = {
                x: canvas.width /2 - this.width /2,
                y: canvas.height - this.height - 20
            };
            this.velocity = {x: 0, y: 0};
            this.opacity = 1;
        }
        restart() {
            this.position = {
                x: canvas.width /2 - this.width /2,
                y: canvas.height - this.height - 20
            };
            this.velocity = {x: 0, y: 0};
            this.opacity = 1;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
            ctx.restore();
        }
        update() {
            this.draw();
            this.position.x += this.velocity.x;
            
            //"left" or "a" keys && "d" or "right" keys
            if(keys.a.pressed && player.position.x >= 0) player.velocity.x = -5;  
            else if(keys.d.pressed && player.position.x + player.width <= canvas.width) player.velocity.x = +5
            else player.velocity.x = 0; 
        }
    }
    
    // Projectiles
    class Projectile {
        constructor({position, velocity}) {
            this.position = position;
            this.velocity = velocity;
            this.radius = 3
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
            ctx.fillStyle = 'Red';
            ctx.fill();
            ctx.closePath();
        }
        update() {
            this.draw();
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }

    // particles (explosions)
    class Particle {
        constructor({position, velocity, radius, color, fades}) {
            this.position = position;
            this.velocity = velocity;
            this.radius = radius;
            this.color = color;
            this.opacity = 1;
            this.fades = fades;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
        update() {
            this.draw();
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;

            // fade particles
            if(this.fades) this.opacity -= 0.01;
            else this.opacity = 1;
            
        }
    }

    //invader projectiles
    class InvaderProjectile {
        constructor({position, velocity}) {
            this.position = position;
            this.velocity = velocity;
            this.width = 3;
            this.height = 10;
        }
        draw() {
            ctx.fillStyle = "white";
            ctx.fillRect(this.position.x, this.position.y, this.width,  this.height);
        }
        update() {
            this.draw();
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }

    
    // Invaders
    class Invader {
        constructor({ position }) {
            const scale = 1;
            this.image = document.getElementById("invader");
            this.width = this.image.width * 5 * gameScale;
            this.height = this.image.height * 5 * gameScale;
            this.position = {
                x: position.x,
                y: position.y
            };
            this.velocity = {x: 0, y: 0};
        }
        draw() {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        update({velocity}) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
        shoot(InvaderProjectiles) {
            InvaderProjectiles.push(
                new InvaderProjectile({
                    position: {
                x: this.position.x + this.width/2,
                y: this.position.y + this.height
                    },
                velocity: {
                x: 0,
                y: 5
                    }
                }
            ))
        }
    }

    // Invaders Grid
    class Grid {
        constructor() {
            this.position = {
                x: 0,
                y: 0
            }
            this.velocity = {
                x: 3,
                y: 0
            }
            this.invaders = [];
            if(canvas.width < canvas.height*1.5) {
                const rows = Math.floor(Math.random() *9 +5)
                const cols = Math.floor(Math.random() *5 +3)

                this.width = cols * 32 * 5 * gameScale;
                for (let i = 0; i < cols; i++) {
                    for (let j = 0; j < rows; j++) {
                        this.invaders.push(new Invader({
                            position: {
                                x: i * 32 * 5 * gameScale,
                                y: j * 32 * 5 * gameScale
                            }
                        }))
                    }
                }
            }
            else {
                const rows = Math.floor(Math.random() *7 +5)
                const cols = Math.floor(Math.random() *9 +4)

                this.width = cols * 32 * 5 * gameScale;
                for (let i = 0; i < cols; i++) {
                    for (let j = 0; j < rows; j++) {
                        this.invaders.push(new Invader({
                            position: {
                                x: i * 32 * 5 * gameScale,
                                y: j * 32 * 5 * gameScale
                            }
                        }))
                    }
                }
            }
        }
        update() {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.velocity.y = 0;

            if(this.position.x + this.width >= canvas.width) { 
                this.velocity.x *= -1;
                this.velocity.y = 32 * gameScale;
            } else if (this.position.x <= 0) {
                this.velocity.x *= -1;
                this.velocity.y = 32 * 5 * gameScale;
            }

        }
    }

    //variables
    const player = new Player();
    const projectiles = [];
    const grids = [];
    let frames = 0;
    let randomInterval = Math.floor(Math.random() * 800 +500);
    const invaderProjectiles = [];
    const particles = [];
    let game = {
        over: false,
        active: true,
    }
    let score = 0;

    // actions
    const keys = {
        a: {pressed: false},
        d: {pressed: false},
        space: {pressed: false},
        enter: {pressed: false},
    }
    window.addEventListener("keydown", ({key}) => {
        switch (key) {
            case "a": case "ArrowLeft":
                keys.a.pressed = true;
                break;
            case "d": case "ArrowRight":
                keys.d.pressed = true;
                break;
            case "Enter":
                keys.enter.pressed = true;
                break;
            case " ":
                    keys.space.pressed = true;
                    projectiles.push(new Projectile({
                        position: {
                            x: player.position.x + player.width/2,
                            y: player.position.y 
                        },
                        velocity: {
                            x: 0,
                            y: -10
                        }
                    }))
                }
            })
    window.addEventListener("keyup", ({key}) => {
        if(game.over) return;
        switch (key) {
            case "a": case "ArrowLeft":
                keys.a.pressed = false;
                break;
                case "d": case "ArrowRight":
                    keys.d.pressed = false;
                    break;
                case "Enter":
                    keys.enter.pressed = false;
                    break;
                case " ":
                        keys.space.pressed = false;
                    }
            })

            // functions
        // create moving background stars
        function backgroundStars() {
            for (let i = 0; i < 100; i++) {
                particles.push(new Particle({
                    position: {
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height
                    },
                    velocity: {
                        x: 0,
                        y: 0.3
                    },
                    radius: Math.random() * 2,
                    color: 'white',
                    fades: false
                    })
                )
            }
        }
        backgroundStars();

    // creating particles for explosions
    function createParticles({object, color, fades}) {
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle({
                position: {
                    x: object.position.x + object.width/2,
                    y: object.position.y + object.height/2
                },
                velocity: {
                    x: (Math.random() -0.5) *2,
                    y: (Math.random() -0.5) *2
                },
                radius: Math.random() *3,
                color: color || "#BAA0DE",
                fades: true,
            }));
        }
    }

    function displayStatusText(context) {
        context.font = "40px Helvetica";
        context.fillStyle = "#c1121f";
        context.textAlign = 'left';
        context.fillText("Score: " + score , 20, 50);
        context.fillStyle = "white";
        context.textAlign = 'left';
        context.fillText("Score: " + score, 22, 52);
        

        if(game.over) {
            context.textAlign = "center";
            context.fillStyle = "black";
            context.fillText("GAME OVER, press Enter to restart!", canvas.width/2, 200);
            context.fillStyle = "white";
            context.fillText("GAME OVER, press Enter to restart!", canvas.width/2 +2, 202);
        }
    }

    function endGame() {
        console.log('you lose')

        // Makes player disappear
        setTimeout(() => {
            player.opacity = 0
            game.over = true
        }, 0)
    
        // stops game altogether
        createParticles({
            object: player,
            color: 'white',
            fades: true
        }) 

        let timeOut = setTimeout(() => {
            game.active = false;
        }, 2000)
        timeOut;
    }
    
        // animation loop
    function animate() {
        if(!game.active) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.update();

        //removing particles 
        particles.forEach((particle, i) => {
            //Background particles:
            if (particle.position.y - particle.radius >= canvas.height) {
                particle.position.x = Math.random() * canvas.width
                particle.position.y = -particle.radius
            }
            //Explosion particles:
            if (particle.opacity <= 0) {
                setTimeout(() => {
                    particles.splice(i, 1)
                }, 0)
            } else {
                particle.update()
            }
        })

        invaderProjectiles.forEach(invaderProjectile => {
            if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height) invaderProjectiles.shift();
            else invaderProjectile.update();

            // collision detection (projectile hits player)
        if(invaderProjectile.position.y + invaderProjectile.height >= player.position.y + player.width/2
        && invaderProjectile.position.x + invaderProjectile.width >= player.position.x
        && invaderProjectile.position.x <= player.position.x + player.width) {
                invaderProjectiles.shift()
                console.log("you lose");
                //player explosion effect
                createParticles({
                    object: player,
                    color: "white",
                    fades: true,
                    });
                    return endGame();
                } 
        })

        projectiles.forEach((projectile) => {
            if(projectile.position.y <= 0) {
                projectiles.shift();
            } else {
                projectile.update();
            }
            
        })

        // grid
        grids.forEach(grid => {
            grid.update();
            // sapwn projectiles
            if(frames % 100 === 0 && grid.invaders.length > 0) {
                grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
            }
            grid.invaders.forEach((invader, i) => {
                invader.update({velocity: grid.velocity});

                // projectiles hit enemies
                projectiles.forEach((projectile, j) => {
                    if(projectile.position.y - projectile.radius <= invader.position.y + invader.height 
                        && projectile.position.x + projectile.radius >= invader.position.x 
                        && projectile.position.x - projectile.radius <= invader.position.x + invader.width
                        && projectile.position.y + projectile.radius >= invader.position.y) {
                            
                            setTimeout(() => {
                            const invaderFound = grid.invaders.find(invader2 => { 
                                return invader2 === invader
                            })
                            const projectileFound = projectiles.find(projectile2 => projectile2 === projectile)
                            
                            // remove invader & projectile
                            if(invaderFound && projectileFound) {
                                score += 10;
                                createParticles({
                                    object: invader,
                                    fades: true,
                                });
                                grid.invaders.splice(i, 1);
                                projectiles.splice(j, 1);  
                            }
                        })
                    }
                })
            });
        })

        displayStatusText(ctx);

        // spawning enimies
        if(frames % randomInterval   === 0) {
            grids.push(new Grid());
            randomInterval = Math.floor(Math.random() * 800 +800);
            frames = 0;
        }
        frames++;
            requestAnimationFrame(animate);
    }
    animate();

    

    //end
});
