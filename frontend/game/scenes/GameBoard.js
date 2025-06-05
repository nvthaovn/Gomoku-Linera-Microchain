import { SceneBase } from './SceneBase.js';
import { GridBoard } from '../objects/GridBoard.js';
import { CaroBoard } from '../objects/CaroBoard.js';

export class GameBoard extends SceneBase
{
    constructor ()
    {
        super('GameBoard');
    }
	
	init(data) {
		this.player = data.player;
        this.gameMode = data.mode;
	}

	// 
    create ()
    {
		//debug
		//this.showGrid();
		//this.showRuler();
		this.showFPS();
		this.showLog();
		//
		this.cameras.main.setBackgroundColor(window.game.params.BGColor);
		
		//
		let MARGIN = 30;   
		const ROWS = window.game.params.rows; //20
		const COLS = window.game.params.cols; //46
		
		let WIDTH = this.scale.width - MARGIN*2;
		let HEIGHT = this.scale.height - MARGIN*2;
		const CELL_WIDTH = Math.floor(WIDTH/COLS); 
		const CELL_HEIGHT = Math.floor(HEIGHT/ROWS); 
		//Recalculate the size to eliminate the error parts when dividing.
		WIDTH = CELL_WIDTH*COLS;
		HEIGHT = CELL_HEIGHT*ROWS;
		MARGIN = Math.floor((this.scale.width - WIDTH)/2);
		
		let grid_board = new GridBoard(this,MARGIN,MARGIN,ROWS,COLS,CELL_WIDTH,CELL_HEIGHT,0xbabab5);
		let cell_board = new CaroBoard(this,MARGIN,MARGIN,ROWS,COLS,CELL_WIDTH,CELL_HEIGHT,0xbabab5);
		
    }

		
	// Phrase 3
	update()
	{
		//this.log(Math.floor(Date.now() / 1000));
	}

}