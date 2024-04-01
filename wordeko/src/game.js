import * as PIXI from 'pixi.js';
import Matter from 'matter-js';

export default class Game {
    constructor() {

        if (window.gameInstance && window.gameInstance.app) {
            return window.gameInstance;
        }

        this.app = new PIXI.Application({
            antialias: true,
            width: 480,
            height: 800,
            backgroundColor: 0x1e1e37
        });
        if (!document.body.contains(this.app.view)) {
            document.body.appendChild(this.app.view);
        }


        const background = PIXI.Sprite.from('assets/wordekobg.jpg');
        background.width = this.app.screen.width;
        background.height = this.app.screen.height;
        this.app.stage.addChild(background);

        this.engine = Matter.Engine.create();
        this.runner = Matter.Runner.create();
        this.engine.gravity.y = 1;

        this.word = '';
        this.score = 0;
        this.letters = [];

        const wallOptions = { isStatic: true };
        const ground = Matter.Bodies.rectangle(240, 790, 480, 20, wallOptions);
        const ceiling = Matter.Bodies.rectangle(240, 10, 480, 20, wallOptions);
        const leftWall = Matter.Bodies.rectangle(10, 400, 20, 800, wallOptions);
        const rightWall = Matter.Bodies.rectangle(470, 400, 20, 800, wallOptions);

        Matter.World.add(this.engine.world, [ground, ceiling, leftWall, rightWall]);

        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        this.scoreText = new PIXI.Text('Score: 0', {
            fontFamily: 'Comic Sans MS',
            fontSize: 24,
            fill: ['#ffffff', '#ff69b4'],
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        this.app.stage.addChild(this.scoreText);
        this.setupMusic();
        this.setupUI();
        this.initGame();
    }


    setupMusic() {
       
        if (!window.gameMusic) {
            window.gameMusic = new Audio('assets/bgmus.mp3');
            window.gameMusic.loop = true;
        }
        if (window.gameMusic.paused) {
            window.gameMusic.play();
        }
        this.music = window.gameMusic;
    }

    initGame() {
        this.createBallsWithLetter(30);

        Matter.Events.on(this.engine, 'afterUpdate', () => {
            this.letters.forEach(({ ball, ballGraphics, letterText }) => {
                ballGraphics.x = ball.position.x;
                ballGraphics.y = ball.position.y;
                letterText.x = ball.position.x;
                letterText.y = ball.position.y;
            });
        });

        Matter.Runner.run(this.runner, this.engine);

    }

    generateConfetti() {
        const confettiAmount = 100;
        const colors = ['#f44336', '#9c27b0', '#3f51b5', '#2196f3', '#4caf50', '#ffeb3b', '#ff5722'];
    
        for (let i = 0; i < confettiAmount; i++) {
            const confetti = new PIXI.Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
    
            confetti.beginFill(color);
            confetti.drawCircle(0, 0, 5);
            confetti.endFill();
    
            confetti.x = Math.random() * this.app.screen.width;
            confetti.y = -10;
            confetti.velocityY = Math.random() * 3 + 1;
    
            this.app.stage.addChild(confetti);
    
            this.app.ticker.add(() => {
                confetti.y += confetti.velocityY;
    
                if (confetti.y > this.app.screen.height) {
                    confetti.y = -10;
                    confetti.x = Math.random() * this.app.screen.width;
                }
            });
        }
    }

    createBallsWithLetter(ballCount) {
        for (let i = 0; i < ballCount; i++) {
            const ballRadius = 20 + Math.random() * 30;
            const randomX = 50 + Math.random() * (this.app.screen.width - 100);
            const randomY = 50 + Math.random() * (this.app.screen.height / 4);

            const ball = Matter.Bodies.circle(randomX, randomY, ballRadius, { restitution: 0.5 });
            Matter.World.add(this.engine.world, ball);

            const ballGraphics = new PIXI.Graphics();
            const color = Math.random() * 0xFFFFFF;
            ballGraphics.beginFill(color, 0.5 + Math.random() * 0.5);
            ballGraphics.drawCircle(0, 0, ballRadius);
            ballGraphics.endFill();
            ballGraphics.x = randomX;
            ballGraphics.y = randomY;
            this.container.addChild(ballGraphics);

            const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            const letterText = new PIXI.Text(randomLetter, {
                fill: 0xffffff,
                fontSize: ballRadius,
                fontWeight: 'bold',
            });
            letterText.anchor.set(0.5);
            letterText.x = randomX;
            letterText.y = randomY;

            letterText.interactive = true;
            letterText.buttonMode = true;
            letterText.on('pointerdown', () => this.handleLetterClick(randomLetter, letterText, ball));

            letterText.flag = 0;

            this.container.addChild(letterText);

            this.letters.push({ letter: randomLetter, letterText, ball, ballGraphics });
        }
    }

    handleLetterClick(letter, letterText, ball) {
        if (letterText.flag == 0) {
            letterText.style.fill = '#0ff';
            this.word += letter;
            this.updateWordBar();
            letterText.flag = 1;
        } else {
            letterText.style.fill = '#FFFFFF';
            this.word = this.word.split(letter).join('')
            this.updateWordBar();
            letterText.flag = 0;
        }
    }

    updateWordBar() {
        this.wordBar.value = this.word;
    }

    setupUI() {
        const wordContainer = document.createElement('div');
        wordContainer.style.position = 'absolute';
        wordContainer.style.bottom = '50px'; // word bar ve diğer kontroller için yer bırak
        wordContainer.style.left = '50%';
        wordContainer.style.transform = 'translateX(-50%)';
        wordContainer.style.color = '#FFF';
        wordContainer.style.fontSize = '20px';
        wordContainer.style.padding = '10px';
        wordContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(wordContainer);
    
        this.wordBar = document.createElement('input');
        this.wordBar.type = 'text';
        this.wordBar.style.width = '300px';
        this.wordBar.style.padding = '5px';
        this.wordBar.placeholder = 'Click Letters...';
        wordContainer.appendChild(this.wordBar);
    
        this.submitButton = document.createElement('button');
        this.submitButton.textContent = 'Submit';
        this.submitButton.style.marginLeft = '10px';
        this.submitButton.style.padding = '5px 10px';
        this.submitButton.style.backgroundColor = '#4CAF50'; 
        this.submitButton.style.color = 'white'; 
        this.submitButton.style.border = 'none'; 
        this.submitButton.style.cursor = 'pointer'; 
        this.submitButton.style.borderRadius = '5px'; 
        this.submitButton.onmouseover = () => this.submitButton.style.backgroundColor = '#45a049'; 
        this.submitButton.onmouseleave = () => this.submitButton.style.backgroundColor = '#4CAF50'; 
        this.submitButton.onclick = () => this.checkWordValidity();
        wordContainer.appendChild(this.submitButton);
    
      
        const musicControlsContainer = document.createElement('div');
        musicControlsContainer.style.position = 'absolute';
        musicControlsContainer.style.bottom = '10px';
        musicControlsContainer.style.left = '50%';
        musicControlsContainer.style.transform = 'translateX(-50%)';
        document.body.appendChild(musicControlsContainer);
    
        const musicButton = document.createElement('button');
        musicButton.textContent = 'Toggle Music';
        musicButton.style.marginRight = '10px'; // Sol tarafta boşluk bırak
        musicButton.style.padding = '5px 10px';
        musicButton.onclick = () => this.toggleMusic();
        musicControlsContainer.appendChild(musicButton);
    
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = 0;
        volumeSlider.max = 1;
        volumeSlider.step = 0.01;
        volumeSlider.value = 1;
        volumeSlider.style.marginLeft = '10px';
        volumeSlider.style.verticalAlign = 'middle';
        volumeSlider.oninput = () => this.setMusicVolume(volumeSlider.value);
        musicControlsContainer.appendChild(volumeSlider);
    }

    toggleMusic() {
        if (this.music.paused) {
            this.music.play();
        } else {
            this.music.pause();
        }
    }

    setMusicVolume(volume) {
        this.music.volume = volume;
    }

    async checkWordValidity() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const wordDictionary = await response.json();

            const isValid = !!wordDictionary[this.word.toLowerCase()];
            this.showValidationMessage(isValid);
            if (isValid) {
                this.letters.forEach(({ letterText, ballGraphics, ball }) => {
                    this.container.removeChild(letterText);
                    this.container.removeChild(ballGraphics);
                    Matter.World.remove(this.engine.world, ball);
                });
                this.updateScore(20);
                this.letters = [];
                this.createBallsWithLetter(30);
                this.word = '';
                this.updateWordBar();
            }

        } catch (error) {
            console.error('Error during word validation:', error);
            alert('Word validation failed. Please try again later.');
        }
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.text = `Score: ${this.score}`;

        if (this.score >= 100) {
            this.endGame();
        }
    }

    showValidationMessage(isValid) {
        const message = isValid ? 'Correct word! 🎉' : 'Incorrect word, try again! 😕';
        alert(message);
        if (!isValid) {
            this.score = 0;
        }
    }

    endGame() {
        const playAgainBtn = document.getElementById('play-again-btn');
        playAgainBtn.style.display = 'block';

        Matter.Runner.stop(this.runner);
        this.music.pause();
    }

    resetGame() {
        this.app.destroy(true, { children: true, texture: true, baseTexture: true });
        document.body.removeChild(this.app.view);

        window.gameInstance = new Game();
        window.gameInstance.initGame();
    }
}

function restartGame() {
    if (!window.gameInstance) {
        window.gameInstance = new Game();
    } else {
        window.gameInstance.resetGame();
    }
}
window.restartGame = restartGame;

export { restartGame };