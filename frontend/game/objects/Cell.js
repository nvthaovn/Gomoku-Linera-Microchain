export class Cell extends Phaser.GameObjects.Container {
	constructor(scene, x, y, width, height, row, col, clickCallback, color=0x00ccff) {
		super(scene, x, y);
		this.value = "";
		this.hover = false;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.scene = scene;

		scene.add.existing(this); // quan trọng: thêm vào scene
		
		this.mark = null;
		this.square = scene.add.graphics();
	

		// Cho phép tương tác với vùng hình vuông
		this.square.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

		// 🖱️ Xử lý sự kiện CLICK
		this.square.on('pointerdown', () => {
			console.log('Clicked on cell');
			clickCallback(row,col,this.scene.player);
		});

		// 🖱️ Xử lý sự kiện HOVER (mouseover)
		this.square.on('pointerover', () => {
			this.hover = true;
			this.reStyle();
		});

		// 🐭 Trở lại màu cũ khi rời chuột
		this.square.on('pointerout', () => {
			this.hover = false;
			this.reStyle();
		});
		//Apply
		this.add([this.square]);
	}
	
	//Cập nhật trạng thái của ô
	reStyle(){
		if(this.value){
			if(!this.mark){
				if(this.value=="x"){
					this.clearBackground();
					this.mark = this.scene.add.image(0, 0, 'markX')
						.setDisplaySize(this.width, this.height)  // co dãn vừa khít
						.setOrigin(0, 0);
					this.add(this.mark);
				}
				else{
					this.clearBackground();
					this.mark = this.scene.add.image(0, 0, 'markO')
						.setDisplaySize(this.width, this.height)  // co dãn vừa khít
						.setOrigin(0, 0);
					this.add(this.mark);
				}
			}
		}
		else if(this.hover){
			this.setBackground(0xffcc00); // đổi màu khi hover
		}
		else{//Ô trống
			this.clearBackground();
		}
	}
	
	clearBackground(){
		this.square.clear();
	}
	setBackground(color,opacity = 1){
		this.clearBackground();
		this.square.fillStyle(color,opacity); // đổi màu khi đánh X
		this.square.fillRect(0, 0, this.width, this.height); 
	}
	
	getCenter(){
		console.log(this.x,this.y,this.width,this.height);
		return {
			x:this.x+this.width/2,
			y:this.y+this.height/2
		}
	}
	
	//đánh cờ cairo
	mark(value){
		this.value = value;
		this.reStyle();
	}
}