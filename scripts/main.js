const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Imposta la gravità a zero
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
let gameOver = false;
let restartText;
let obstacleCount = 0;
let music;
let jumpSound;
let gameOverSound;

function preload() {
    this.load.image('background', 'assets/background.png'); // Carica il tuo sfondo
    this.load.image('ground', 'assets/ground.png'); // Carica l'immagine del terreno
    this.load.image('obstacle', 'assets/obstacle.png'); // Carica l'immagine degli ostacoli
    this.load.spritesheet('provolone', 'assets/provolone.png', { frameWidth: 32, frameHeight: 32 }); // Carica il provolone
    this.load.audio('backgroundMusic', 'assets/background-music.mp3'); // Carica la musica di sottofondo
    this.load.audio('jumpSound', 'assets/jump-sound.mp3'); // Carica il suono del salto
    this.load.audio('gameOverSound', 'assets/game-over-sound.mp3'); // Carica il suono di game over
}

function create() {
    // Aggiungi musica di sottofondo
    music = this.sound.add('backgroundMusic');
    music.loop = true;
    music.play();

    // Sfondo
    background = this.add.tileSprite(400, 300, 800, 600, 'background');

    // Crea il terreno
    ground = this.physics.add.staticGroup();
    ground.create(400, 580, 'ground').setScale(1).refreshBody(); // Strada

    // Crea il personaggio
    player = this.physics.add.sprite(100, 450, 'provolone');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('provolone', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    player.anims.play('run', true);

    cursors = this.input.keyboard.createCursorKeys();

    obstacles = this.physics.add.group();
    this.time.addEvent({
        delay: 1500,
        callback: addObstacle,
        callbackScope: this,
        loop: true
    });

    this.physics.add.collider(player, ground);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // Testo per iniziare il gioco
    this.add.text(400, 300, 'Clicca per iniziare', { fontSize: '32px', fill: '#000' }).setOrigin(0.5).setInteractive().on('pointerdown', startGame, this);
}

function update() {
    if (gameOver) {
        return; // Non eseguire il gioco se è finito
    }

    background.tilePositionX += 2; // Scorrimento dello sfondo

    if (cursors.space.isDown && player.body.touching.down) {
        player.setVelocityY(-350); // Salto
        this.sound.play('jumpSound'); // Suono del salto
    }

    // Aggiorna il punteggio
    score += 0.01; // Incremento del punteggio
    scoreText.setText('Score: ' + Math.floor(score));
}

function startGame() {
    // Inizializza il gioco
    gameOver = false;
    score = 0;
    scoreText.setText('Score: 0');
    player.setVelocity(0);
    player.setPosition(100, 450);
    obstacles.clear(true, true); // Rimuovi gli ostacoli esistenti
    music.play(); // Riprendi la musica
}

function addObstacle() {
    const obstacle = obstacles.create(800, Phaser.Math.Between(500, 550), 'obstacle'); // Posiziona l'ostacolo sulla strada
    obstacle.setVelocityX(-200); // Ostacolo che si muove a sinistra
    obstacle.setCollideWorldBounds(false); // Non deve rimanere all'interno del mondo
    obstacle.setImmovable(true); // L'ostacolo è immobile
}

function hitObstacle(player, obstacle) {
    this.physics.pause();
    player.setTint(0xff0000); // Colore rosso quando colpisce un ostacolo
    player.anims.stop();
    music.stop(); // Ferma la musica di sottofondo
    this.sound.play('gameOverSound'); // Suono di game over

    scoreText.setText('Game Over! Score: ' + Math.floor(score));

    // Mostra il pulsante "RIPROVA!"
    restartText = this.add.text(400, 300, 'RIPROVA!', { fontSize: '32px', fill: '#000' }).setOrigin(0.5).setInteractive();
    restartText.on('pointerdown', restartGame, this);
}

function restartGame() {
    // Riavvia il gioco
    restartText.setVisible(false);
    startGame(); // Chiama la funzione di avvio per riavviare
}
