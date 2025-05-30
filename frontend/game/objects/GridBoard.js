export class GridBoard extends Phaser.GameObjects.Container {
	constructor(scene, x, y, rows, cols, cell_width, cell_height, color) {
		super(scene, x, y);

		scene.add.existing(this); // quan trọng: thêm vào scene
		this.scene = scene;
		
		const WIDTH = cell_width*cols;
		const HEIGHT = cell_height*rows;
		
		let board = scene.add.graphics();
		board.lineStyle(1, color, 1); // dày 1px, COLOR, OPACITY 1

		// Vẽ các dòng ngang
		for (let i = 0; i <= rows; i++) {
			let y = i * cell_height;
			let xStart = 0;
			let xEnd = WIDTH;
			board.beginPath();
			board.moveTo(xStart, y);
			board.lineTo(xEnd, y);
			board.strokePath();
		}

		// Vẽ các dòng dọc
		for (let i = 0; i <= cols; i++) {
			let x = i * cell_width;
			let yStart = 0;
			let yEnd = HEIGHT;
			board.beginPath();
			board.moveTo(x, yStart);
			board.lineTo(x, yEnd);
			board.strokePath();
		}
		
		//Apply
		this.add([board]);
	}
}