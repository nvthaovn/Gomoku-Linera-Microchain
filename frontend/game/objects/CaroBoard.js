import { Cell } from '../objects/Cell.js';
import { CaroAI } from '../CaroAI.js';

export class CaroBoard extends Phaser.GameObjects.Container {
	constructor(scene, x, y, rows, cols, cell_width, cell_height, color) {
		super(scene, x, y);
		scene.add.existing(this); // important: add to scene
		this.scene = scene;
		
		this.cells = [];
		this.aiCairo = new CaroAI(this.cells, this.cellClick.bind(this), rows, cols);
		this.openTurn = "x"; // x - user's turn, o - AI's turn - x fist
		this.last_pos = null; // save last move position to highlight
		this.gamePlaying = true;
		
		//update user
		this.player = this.scene.player;
		this.gameMode = this.scene.gameMode;
		
		const WIDTH = cell_width * cols;
		const HEIGHT = cell_height * rows;

		// Draw grid cells
		for (let i = 0; i < rows; i++) {
			this.cells[i] = [];
			for (let k = 0; k < cols; k++) {
				let posX = k * cell_width;
				let posY = i * cell_height;
				let cell = new Cell(scene, posX, posY, cell_width, cell_height, i, k, this.cellClick.bind(this));
				this.cells[i][k] = cell;
				this.add(cell);
			}
		}
	}
	
	// Handle user clicking on a cell
	cellClick(x, y, value) {
		console.log("click:", x, y, value, this.openTurn, this.cells[x][y].value);
		if (!this.gamePlaying) return;

		if (value == this.openTurn && this.cells[x][y].value == "") { // valid move: correct turn & empty cell
			// Clear previous move highlight
			if (this.last_pos) {
				this.cells[this.last_pos.x][this.last_pos.y].clearBackground();
			}
			this.last_pos = { x: x, y: y };
			// Update cell value
			this.cells[x][y].value = value;
			this.cells[x][y].reStyle();
			window.linera.moveStep(x,y,this.player);
			
			// Switch turn
			this.openTurn = value == "x" ? "o" : "x";
			console.log("xxxxTurn", this.openTurn);
			
			// Win check
			let checkResult = this.checkWinnerAndDrawLine();
			if (checkResult) return this.endGame(checkResult);
			
			// If user just played and game is not over, let AI make a move
			if (value == "x"&& this.gameMode == 3) { //play vs AI
				this.aiCairo.nextMove(); // request AI to play
			}
			else if(value == this.player && this.gameMode != 3){
				this.waitForGameTurn();
			}
			//competitor
			if (value != this.player) {
				// highlight AI's last move to help user identify
				this.cells[this.last_pos.x][this.last_pos.y].setBackground(0x188f1a, 0.5);
			}
		}
		this.cells[x][y].reStyle();
	}
	
	// Check if there is a winner, if so, end the game
	checkWinnerAndDrawLine() {
		console.log("checkWinnerAndDrawLine");
		const rows = this.cells.length;
		const cols = this.cells[0].length;
		const directions = [
			[1, 0],   // horizontal →
			[0, 1],   // vertical ↓
			[1, 1],   // diagonal ↘
			[1, -1]   // diagonal ↗
		];
		
		for (let x = 0; x < rows; x++) {
			for (let y = 0; y < cols; y++) {
				const player = this.cells[x][y].value;
				if (player === "") continue;
				for (const [dx, dy] of directions) {
					let path = [{ x, y }];
					for (let i = 1; i < 5; i++) {
						const nx = x + dx * i;
						const ny = y + dy * i;
						if (
							nx < 0 || ny < 0 ||
							nx >= rows || ny >= cols ||
							this.cells[nx][ny].value !== player
						) break;
						path.push({ x: nx, y: ny });
					}
					if (path.length >= 5) {
						// Use getCenter to draw line from start to end cell
						const p1 = this.cells[path[0].x][path[0].y].getCenter();
						const p2 = this.cells[path[path.length - 1].x][path[path.length - 1].y].getCenter();

						this.drawLine(path, p1.x, p1.y, p2.x, p2.y);

						return {
							winner: player,
							path
						};
					}
				}
			}
		}

		return null; // no winner yet
	}
	
	// Draw line over winning cells
	drawLine(path, x1, y1, x2, y2) {
		console.log("drawLine", x1, y1, x2, y2);
		// Draw the line
		const graphics = this.scene.add.graphics(); // or store a dedicated instance
		graphics.lineStyle(3, 0xba19fa, 1);
		graphics.beginPath();
		graphics.moveTo(x1, y1);
		graphics.lineTo(x2, y2);
		graphics.strokePath();
		this.add(graphics);
		// Highlight background of winning cells
		for (const pos of path) {
			this.cells[pos.x][pos.y].setBackground(0xffffff);
		}
	}
	
	// Show game end message
	endGame(result) {
		console.log("endGame", result);
		if (result.winner == this.player) {
			alert("You win!");
		} else {
			alert("You lose!");
		}
		this.gamePlaying = false;
		this.endPopup();
	}
	
	// Display end-game popup
	// #Todo
	endPopup() {
		// "Play Again" button
		const btn = this.scene.add.rectangle(650, 500, 200, 60, 0x4caf50).setInteractive();
		const text = this.scene.add.text(650, 500, 'Play Again', {
			fontSize: '24px',
			color: '#ffffff',
			fontFamily: 'Arial'
		}).setOrigin(0.5);
		this.add([btn, text]);

		// Hover effect
		btn.on('pointerover', () => {
			btn.setFillStyle(0x66bb6a);
		});
		btn.on('pointerout', () => {
			btn.setFillStyle(0x4caf50);
		});

		// Handle click
		btn.on('pointerdown', () => {
			this.scene.scene.start('GameBoard');  // replace with your target scene
		});
	}
	
	//wait competitor
	async waitForGameTurn(){
		const checkInterval = setInterval(async () => {
			try {
				const gameInfo = await window.linera.checkGameInfo();
				if (gameInfo.data.status != "None"&&gameInfo.data.lastMove.player!=this.player) {
					clearInterval(checkInterval); 
					this.cellClick(gameInfo.data.lastMove.x, gameInfo.data.lastMove.y, gameInfo.data.lastMove.player);
				}
			} catch (error) {
				console.error('Error checking game info:', error);
			}
		}, 3000); 
	}
	
	//wait competitor - #todo
	async waitForGameStart(){
		const checkInterval = setInterval(async () => {
			try {
				const gameInfo = await window.linera.checkGameInfo();
				if (gameInfo.data.status != "None" && gameInfo.data.mode == "AI") {
					clearInterval(checkInterval); 
				}
			} catch (error) {
				console.error('Error checking game info:', error);
			}
		}, 5000); 
	}
	
}
