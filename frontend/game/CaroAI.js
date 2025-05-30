export class CaroAI {
	constructor(cells, markCallback, rows, cols) {
		this.cells = cells;
		this.mark = markCallback;
		this.rows = rows;
		this.cols = cols;
		this.aiChessO = "o";
		this.userChessX = "x";

		this.scoreTable = [0, 1, 10, 50, 500, 50000]; // điểm theo chuỗi liền
	}

	nextMove() {
		let bestScore = -Infinity;
		let bestMoves = [];

		for (let x = 0; x < this.rows; x++) {
			for (let y = 0; y < this.cols; y++) {
				if (this.cells[x][y].value !== "") continue;

				// Giả lập đánh
				const attackScore = this.evaluatePosition(x, y, this.aiChessO);
				const defenseScore = this.evaluatePosition(x, y, this.userChessX);

				let totalScore = attackScore * 1.1 + defenseScore * 1.0;

				if (this.cells[x][y].value === "") {
					//Thử đánh tấn công "o" vào ô
					this.cells[x][y].value = this.aiChessO;
					if (this.checkWin(x, y, this.aiChessO)) {
						this.cells[x][y].value = "";
						this.mark(x, y,this.aiChessO);
						return;
					}
					//Thử để đối phương - người dùng đánh "x" vào ô
					this.cells[x][y].value = this.userChessX;
					if (this.checkWin(x, y, this.userChessX)) {
						this.cells[x][y].value = "";
						this.mark(x, y,this.aiChessO); // chặn ngay
						return;
					}
					//Khôi phục lại trạng thái chưa đánh
					this.cells[x][y].value = "";
				}

				if (totalScore > bestScore) {
					bestScore = totalScore;
					bestMoves = [{ x, y }];
				} else if (totalScore === bestScore) {
					bestMoves.push({ x, y });
				}
			}
		}

		if (bestMoves.length > 0) {
			const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
			this.mark(move.x, move.y,this.aiChessO);
		}
	}

	// Đánh giá 1 ô theo hướng và pattern
	evaluatePosition(x, y, player) {
		const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
		let total = 0;

		for (const [dx, dy] of dirs) {
			let count = 1;
			let openEnds = 0;

			// Đếm về một phía
			let i = 1;
			while (true) {
				const nx = x + dx * i, ny = y + dy * i;
				if (nx < 0 || ny < 0 || nx >= this.rows || ny >= this.cols) break;
				const val = this.cells[nx][ny].value;
				if (val === player) count++;
				else if (val === "") {
					openEnds++;
					break;
				} else break;
				i++;
			}

			// Đếm phía đối diện
			i = 1;
			while (true) {
				const nx = x - dx * i, ny = y - dy * i;
				if (nx < 0 || ny < 0 || nx >= this.rows || ny >= this.cols) break;
				const val = this.cells[nx][ny].value;
				if (val === player) count++;
				else if (val === "") {
					openEnds++;
					break;
				} else break;
				i++;
			}

			if (count >= 5) return 100000; // gần thắng
			let score = this.scoreTable[Math.min(count, 5)];
			if (openEnds === 2) score *= 1.5; // open 2 đầu rất nguy hiểm
			else if (openEnds === 0) score *= 0.2; // bị chặn cả 2 đầu => yếu
			total += score;
		}

		return total;
	}

	checkWin(x, y, player) {
		const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
		for (const [dx, dy] of dirs) {
			let count = 1;
			for (let dir = -1; dir <= 1; dir += 2) {
				let i = 1;
				while (true) {
					const nx = x + dx * i * dir;
					const ny = y + dy * i * dir;
					if (nx < 0 || ny < 0 || nx >= this.rows || ny >= this.cols) break;
					if (this.cells[nx][ny].value === player) {
						count++;
						i++;
					} else break;
				}
			}
			if (count >= 5) return true;
		}
		return false;
	}
}
