const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let background;
let ground;
let obstacles;
let score = 0;
let scoreText;

function preload() {
    // Carica le immagini e gli sprite
    this.load.image('background', 'assets/background.png'); // Immagine dello sfondo
    this.load.image('ground', 'assets/ground.png'); // Immagine della strada
    this.load.image('obstacle', 'assets/obstacle.png'); // Immagine dell'ostacolo
    this.load.spritesheet('provolone', 'assets/provolone.png', { frameWidth: 32, frameHeight: 32 }); // Sprite del provolone
}

function create() {
    // Aggiunge lo sfondo
    background = this.add.tileSprite(400, 300, 800, 600, 'background');

    // Aggiunge la strada
    ground = this.add.tileSprite(400, 580, 800, 40, 'ground');
    this.physics.add.existing(ground, true);

    // Crea il personaggio (provolone)
    player = this.physics.add.sprite(100, 520, 'provolone'); // Posiziona il provolone a sinistra
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Crea l'animazione per il provolone
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('provolone', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    player.anims.play('run', true);

    // Aggiunge i controlli
    cursors = this.input.keyboard.createCursorKeys();

    // Crea il gruppo per gli ostacoli
    obstacles = this.physics.add.group();

    // Timer per aggiungere nuovi ostacoli in movimento
    this.time.addEvent({
        delay: 1500, // Ritardo tra la creazione di ostacoli
        callback: addObstacle,
        callbackScope: this,
        loop: true
    });

    // Collide il player con il terreno e gli ostacoli
    this.physics.add.collider(player, ground);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    // Mostra il punteggio
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
}

function update() {
    // Fa scorrere lo sfondo e la strada
    background.tilePositionX += 2; // Fa scorrere lo sfondo
    ground.tilePositionX += 4; // Fa scorrere la strada

    // Controlla il salto del protagonista
    if (cursors.space.isDown && player.body.touching.down) {
        player.setVelocityY(-350); // Imposta il salto
    }

    // Incrementa il punteggio
    score += 0.01;
    scoreText.setText('Score: ' + Math.floor(score));
}

function addObstacle() {
    // Crea un ostacolo in basso sulla strada
    const obstacle = obstacles.create(800, 550, 'obstacle');
    obstacle.setVelocityX(-200); // Fa muovere l'ostacolo verso sinistra
    obstacle.body.allowGravity = false; // Non applica la gravità
    obstacle.setImmovable(true); // Rende l'ostacolo fermo rispetto al protagonista
}

function hitObstacle(player, obstacle) {
    // Gestisce la collisione con l'ostacolo
    this.physics.pause(); // Ferma il gioco
    player.setTint(0xff0000); // Cambia colore al protagonista
    player.anims.stop(); // Ferma l'animazione
    scoreText.setText('Game Over! Score: ' + Math.floor(score)); // Mostra il punteggio finale
}
