export class Cell extends Phaser.GameObjects.Container {
	constructor(scene, x, y, width, height, row, col, clickCallback, color = 0x00ccff) {
		super(scene, x, y);
		this.value = "";
		this.hover = false;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.scene = scene;

		scene.add.existing(this); // important: add to scene
		
		this.mark = null;
		this.square = scene.add.graphics();
	
		// Enable interaction with the square area
		this.square.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

		// 🖱️ Handle CLICK event
		this.square.on('pointerdown', () => {
			console.log('Clicked on cell');
			clickCallback(row, col, this.scene.player);
		});

		// 🖱️ Handle HOVER (mouseover) event
		this.square.on('pointerover', () => {
			this.hover = true;
			this.reStyle();
		});

		// 🐭 Revert color when mouse leaves
		this.square.on('pointerout', () => {
			this.hover = false;
			this.reStyle();
		});

		// Apply elements to container
		this.add([this.square]);
	}
	
	// Update the cell's visual state
	reStyle() {
		if (this.value) {
			if (!this.mark) {
				if (this.value == "x") {
					this.clearBackground();
					this.mark = this.scene.add.image(0, 0, 'markX')
						.setDisplaySize(this.width, this.height)  // stretch to fit
						.setOrigin(0, 0);
					this.add(this.mark);
				} else {
					this.clearBackground();
					this.mark = this.scene.add.image(0, 0, 'markO')
						.setDisplaySize(this.width, this.height)  // stretch to fit
						.setOrigin(0, 0);
					this.add(this.mark);
				}
			}
		} else if (this.hover) {
			this.setBackground(0xffcc00); // change color on hover
		} else {
			// Empty cell
			this.clearBackground();
		}
	}
	
	clearBackground() {
		this.square.clear();
	}

	setBackground(color, opacity = 1) {
		this.clearBackground();
		this.square.fillStyle(color, opacity); // change color when marking X
		this.square.fillRect(0, 0, this.width, this.height); 
	}

	getCenter() {
		console.log(this.x, this.y, this.width, this.height);
		return {
			x: this.x + this.width / 2,
			y: this.y + this.height / 2
		};
	}
	
	// Make a move in the Cairo game
	mark(value) {
		this.value = value;
		this.reStyle();
	}
}
