import { Boot } from './scenes/Boot.js';
import { Preloader } from './scenes/Preloader.js';
import { StartMenu } from './scenes/StartMenu.js';
import { GameBoard } from './scenes/GameBoard.js';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const phaserConfig = {
    type: Phaser.AUTO,
    width: 1400,
    height: 650,
    parent: 'game-container',
    backgroundColor: '#c8ed9d',
    scale: {
        mode: Phaser.Scale.FIT,
		//mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
		StartMenu,
        GameBoard
    ],
	dom: {
        createContainer: true
    }
};

// Global game params
const params = {
	rows: 20,
	cols: 46,
	BGColor: 0xc5d9e3
};

const StartGame = (parent) => {
	const newGame = new Phaser.Game({ ...phaserConfig, parent });
	newGame.params = params;
	newGame.networkReady = false;
    return newGame;
}

export default StartGame;