import { SceneBase } from './SceneBase.js';

export class StartMenu extends SceneBase
{
    constructor ()
    {
        super('StartMenu');
    }

    create ()
    {
		//debug ui
		//this.showRuler();
		this.showFPS();
		this.showLog();
		
		const bg = this.add.image(0, 0, 'background')
			.setOrigin(0, 0) 
			.setDisplaySize(this.scale.width, this.scale.height);

        const textLog = this.add.text(700, 260, 'Gomoku - Five in a row Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
		
		this.processing = false;
		this.processInterval = null;
		
		// "Play Again" button
		const newGameButton = this.add.rectangle(400, 370, 200, 60, 0x4caf50).setInteractive();
		const newGameText = this.add.text(400, 370, 'New PvP Game', {
			fontSize: '24px',
			color: '#ffffff',
			fontFamily: 'Arial'
		}).setOrigin(0.5);
		// Hover effect
		newGameButton.on('pointerover', () => {
			newGameButton.setFillStyle(0x66bb6a);
		});
		newGameButton.on('pointerout', () => {
			newGameButton.setFillStyle(0x4caf50);
		});
		// Handle click
		newGameButton.on('pointerdown', () => {
			this.showNewGamePopup();
		});
		
		
		// "Join a game" button
		const joinGameButton = this.add.rectangle(700, 370, 200, 60, 0x4caf50).setInteractive();
		const joinGameText = this.add.text(700, 370, 'Join a Game', {
			fontSize: '24px',
			color: '#ffffff',
			fontFamily: 'Arial'
		}).setOrigin(0.5);

		// Hover effect
		joinGameButton.on('pointerover', () => {
			joinGameButton.setFillStyle(0x66bb6a);
		});
		joinGameButton.on('pointerout', () => {
			joinGameButton.setFillStyle(0x4caf50);
		});
		// Handle click
		joinGameButton.on('pointerdown', () => {
			this.showJoinPopup();
		});
		
		
		// "Play vs AI" button
		const aiGameButton = this.add.rectangle(1000, 370, 200, 60, 0x4caf50).setInteractive();
		const aiGameText = this.add.text(1000, 370, 'Play vs AI', {
			fontSize: '24px',
			color: '#ffffff',
			fontFamily: 'Arial'
		}).setOrigin(0.5);
		// Hover effect
		aiGameButton.on('pointerover', () => {
			aiGameButton.setFillStyle(0x66bb6a);
		});
		aiGameButton.on('pointerout', () => {
			aiGameButton.setFillStyle(0x4caf50);
		});
		// Handle click
		aiGameButton.on('pointerdown', () => {
			this.createAIGame();
		});
		
    }
	
	
	showJoinPopup() {
		// Dim background
		const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6).setOrigin(0);
		overlay.setDepth(10);
		overlay.setInteractive(); // để chặn click xuyên qua

		// Popup container
		const popup = this.add.container(700, 300).setDepth(11);

		const bg = this.add.rectangle(0, 0, 520, 240, 0xffffff).setStrokeStyle(2, 0x4caf50).setOrigin(0.5);

		// Instruction text
		const instruction = this.add.text(0, -70, "Enter your friend's ChainID to join the game", {
			fontSize: '16px',
			color: '#000',
			fontFamily: 'Arial',
			align: 'center',
			wordWrap: { width: 380 }
		}).setOrigin(0.5);

		// Input
		const inputText = this.add.dom(0, -30).createFromHTML('<input type="text" id="chainInput" placeholder="e.g. abc123" style="font-size:18px;padding:6px;width:400px;">');

		// Join button
		const joinBtn = this.add.rectangle(-50, 40, 100, 40, 0x4caf50).setInteractive();
		const joinLabel = this.add.text(-50, 40, 'Join', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

		// Close button
		const closeBtn = this.add.rectangle(70, 40, 100, 40, 0xf44336).setInteractive();
		const closeLabel = this.add.text(70, 40, 'Close', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

		// Loading / result message
		const loadingText = this.add.text(0, 90, '', { fontSize: '16px', color: '#333' }).setOrigin(0.5);

		popup.add([bg, instruction, inputText, joinBtn, joinLabel, closeBtn, closeLabel, loadingText]);

		// Join handler
		joinBtn.on('pointerdown', async () => {
			if(this.processing) return;
			const inputEl = document.getElementById('chainInput');
			const networkID = inputEl?.value?.trim();
			if (!networkID) {
				loadingText.setText('Please enter a chainID! ');
				return;
			}
			if(networkID==window.linera.chain_id){
				loadingText.setText("You can't play with yourself ");
				return;
			}

			loadingText.setText('Joining...');
			const success = await this.joinGame(networkID); 
			console.log(success);
			if (success) {
				loadingText.setText('Joined successfully!');
				this.time.delayedCall(500, () => {
					overlay.destroy();
					popup.destroy();
					this.scene.start('GameBoard',{ player: 'o', mode: 2 }); // Enter the game
				});
			} else {
				loadingText.setText('Game is full!');
			}
		});

		// Close handler
		closeBtn.on('pointerdown', () => {
			overlay.destroy();
			popup.destroy();
			this.processing = false;
			clearInterval(this.processInterval);
			this.processInterval = null;
		});
	}
	
	async joinGame(chainID){
		this.processing = true;
		await window.linera.joinGame(chainID);
		return new Promise((resolve, reject) => {
			this.processInterval = setInterval(async () => {
				try {
					const gameInfo = await window.linera.checkGameInfo();
					if (gameInfo.data.status == "PLAYING" || gameInfo.data.status == "JOINNING") {
						clearInterval(this.processInterval);
						resolve(true); // ✅
					}
					else if(gameInfo.data.status == "None"){
						clearInterval(this.processInterval);
						resolve(false);
					}
				} catch (error) {
					clearInterval(this.processInterval);
					reject(error); // ❌
				}
			}, 3000);
		});
	}
	
	showNewGamePopup() {
		//create new Game
		this.createNewGame();
		// Dim background
		const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6).setOrigin(0);
		overlay.setDepth(10);
		overlay.setInteractive();

		// Popup container
		const popup = this.add.container(700, 300).setDepth(11);

		const bg = this.add.rectangle(0, 0, 520, 240, 0xffffff).setStrokeStyle(2, 0x4caf50).setOrigin(0.5);

		// Instruction text
		const instruction = this.add.text(0, -70, "Send your chainID to the person you want to invite to play with, you can also always copy your chainID in the top right corner of the website", {
			fontSize: '16px',
			color: '#000',
			fontFamily: 'Arial',
			align: 'center',
			wordWrap: { width: 380 }
		}).setOrigin(0.5);

		// Input
		const inputText = this.add.dom(0, 0).createFromHTML('<textarea id="myChainID" disabled readonly title="this is your chainID, click to copy" style="font-size:18px;padding:6px;width:400px; resize: none;">'+window.linera.chain_id+'</textarea>');
		
		// Join button
		const enterBtn = this.add.rectangle(-50, 60, 100, 40, 0x4caf50).setInteractive();
		const enterLabel = this.add.text(-50, 60, 'Play', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

		// Close button
		const closeBtn = this.add.rectangle(70, 60, 100, 40, 0xf44336).setInteractive();
		const closeLabel = this.add.text(70, 60, 'Close', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

		// Loading / result message
		const loadingText = this.add.text(0, 100, '', { fontSize: '16px', color: '#333' }).setOrigin(0.5);

		popup.add([bg, instruction, inputText, enterBtn, enterLabel, closeBtn, closeLabel, loadingText]);
		
		// Join handler
		enterBtn.on('pointerdown', async () => {
			if(this.processing) return;
			loadingText.setText('Entering the game, please wait...');
			//Check newgame created
			const success = await this.checkGameOpened(); 
			console.log(success);
			if (success) {
				this.scene.start('GameBoard',{ player: 'x', mode: 1 }); // Enter the game
			} else {
				loadingText.setText('Game creation failed, please try again!');
			}
		});

		// Close handler
		closeBtn.on('pointerdown', () => {
			overlay.destroy();
			popup.destroy();
			this.processing = false;
			clearInterval(this.processInterval);
			this.processInterval = null;
		});
	}
	
	async createNewGame(){
		window.linera.newGame(1);
		return true;
	}
	
	async checkGameOpened(){ //#Todo
		this.processing = true;
		return new Promise((resolve, reject) => {
			this.processInterval = setInterval(async () => {
				try {
					const gameInfo = await window.linera.checkGameInfo();

					if (gameInfo.data.status == "NOT_STARTED" || gameInfo.data.status == "PLAYING") {
						clearInterval(this.processInterval);
						resolve(true); // ✅
					}
				} catch (error) {
					clearInterval(this.processInterval);
					reject(error); // ❌
				}
			}, 3000);
		});
	}
	
	async createAIGame(){
		window.linera.newGame(3);
		this.scene.start('GameBoard',{ player: 'x', mode: 3 }); // Enter the game
	}
}