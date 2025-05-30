//import { Scene } from 'phaser';

export class Preloader extends Phaser.Scene
{
    constructor ()
    {
        super('Preloader');
    }
	//init() → preload() → create() → update()
	
    init () 
    {
        // Loading bg, loading progres bar or something here
		this.cameras.main.setBackgroundColor(window.game.params.BGColor);
		this.add.text(700, 325, 'Connecting to Linera ...', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('game/assets');
		this.load.image('background', 'background.png');
        this.load.image('markX', 'x_30.png');
		this.load.image('markO', 'o_30.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Wait for successful connection to Linera network before entering the game
		//this.scene.start('StartMenu');//#Todo
		this.checkLineraReady();
        
    }
	
	checkLineraReady() {
		if (window.game.networkReady) {
			this.scene.start('StartMenu');
			return;
		}
		setTimeout(this.checkLineraReady.bind(this), 1000);
	}
}