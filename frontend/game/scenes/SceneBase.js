export class SceneBase extends Phaser.Scene
{
    constructor(config) {
        super(config);
    }

    init(data) {
        // Use init because constructor doesn't have this.sys yet
        this._debugText = null;
        this._debugLogData = null;
        this._debugLogLevel = 'info';
        this._debugTimeout = 5;
        this._debugTimeStart = null;
        this._fpsText = null;
        this._gridOverlay = null;
        this._rulerOverlay = null;
        this.events.on('update', this.baseUpdate, this);
    }

    showGrid(rows = 3, cols = 3, color = "#5973de") {
        if (rows < 2) rows = 3;
        if (cols < 2) cols = 3;
        this._gridOverlay = this.add.graphics();
        this._gridOverlay.setDepth(100);

        this._gridOverlay.lineStyle(2, this.toHexColor(color), 1);
        let cell_height = this.scale.height / rows;
        let cell_width = this.scale.width / cols;
        for (let i = 1; i < rows; i++) {
            this._gridOverlay.beginPath();
            let rowY = cell_height * i;
            this._gridOverlay.moveTo(0, rowY); // start point
            this._gridOverlay.lineTo(this.scale.width, rowY); // end point
            this._gridOverlay.strokePath();
        }
        for (let i = 1; i < cols; i++) {
            this._gridOverlay.beginPath();
            let colX = cell_width * i;
            this._gridOverlay.moveTo(colX, 0); // start point
            this._gridOverlay.lineTo(colX, this.scale.height); // end point
            this._gridOverlay.strokePath();
        }
    }

    hideGrid() {
        this._gridOverlay.destroy();  // Remove from scene and GPU
        this._gridOverlay = null;     // Clear reference for GC
    }

    showRuler(color = 0x999999) {
        const barWidth = this.scale.width;
        const barHeight = this.scale.height;
        this._rulerOverlay = this.add.graphics();
        this._rulerOverlay.setDepth(100);

        // Small ticks (every 10px)
        this._rulerOverlay.lineStyle(1, color, 1);
        let minDistance = 10; //px

        // Horizontal ruler
        for (let i = 0; i <= barWidth; i++) {
            if (i % minDistance == 0) {
                let height = 10;
                if (i % 100 == 0) height = 20;
                if (i % (minDistance * 100) == 0) height = 30;
                if (i % (minDistance * 50) == 0) {
                    // Draw number
                    const text = this.add.text(i, height, i.toString(), {
                        fontSize: '12px',
                        fontFamily: 'Arial',
                        color: this.toStringColor(color),
                    });
                    text.setOrigin(0.5);
                    text.setDepth(100);
                }
                // Top
                this._rulerOverlay.beginPath();
                this._rulerOverlay.moveTo(i, 0);
                this._rulerOverlay.lineTo(i, height);
                this._rulerOverlay.strokePath();
                // Bottom
                this._rulerOverlay.beginPath();
                this._rulerOverlay.moveTo(i, barHeight - height);
                this._rulerOverlay.lineTo(i, barHeight);
                this._rulerOverlay.strokePath();
            }
        }

        // Vertical ruler
        for (let i = 0; i <= barHeight; i++) {
            if (i % minDistance == 0) {
                let height = 10;
                if (i % 100 == 0) height = 20;
                if (i % (minDistance * 100) == 0) height = 30;
                if (i % (minDistance * 30) == 0) {
                    // Draw number
                    const text = this.add.text(height, i, i.toString(), {
                        fontSize: '12px',
                        fontFamily: 'Arial',
                        color: this.toStringColor(color),
                    });
                    text.setOrigin(0, 0.5);
                    text.setDepth(100);
                }
                // Left
                this._rulerOverlay.beginPath();
                this._rulerOverlay.moveTo(0, i);
                this._rulerOverlay.lineTo(height, i);
                this._rulerOverlay.strokePath();
                // Right
                this._rulerOverlay.beginPath();
                this._rulerOverlay.moveTo(barWidth - height, i);
                this._rulerOverlay.lineTo(barWidth, i);
                this._rulerOverlay.strokePath();
            }
        }
    }

    hideRuler() {
        this._rulerOverlay.destroy();  // Remove from scene and GPU
        this._rulerOverlay = null;     // Clear reference for GC
    }

    showFPS(position = "topLeft", color = "#49c410") {
        let objectX = 10;
        let objectY = 10;
        switch (position) {
            case "topLeft":
                objectX = 10;
                objectY = 10;
                break;
            case "topRight":
                objectX = this.scale.width - 70;
                objectY = 10;
                break;
            case "bottomLeft":
                objectX = 10;
                objectY = this.scale.height - 25;
                break;
            case "bottomRight":
                objectX = this.scale.width - 70;
                objectY = this.scale.height - 25;
                break;
            default:
                objectX = 10;
                objectY = 10;
        }
        this._fpsText = this.add.text(objectX, objectY, '', {
            font: '16px Courier',
            fill: this.toStringColor(color)
        });
        this._fpsText.setDepth(100);
    }

    hideFPS() {
        this._fpsText.destroy();
        this._fpsText = null;
    }

    log(message, level = "info") {
        const supported = ['info', 'debug', 'error', 'warn'];
        if (!supported.includes(level)) {
            level = 'info';
        }
        let fullLog = "[" + level + "] " + message;
        this._debugLogData = fullLog;
        this._debugLogLevel = level;
        console.log(fullLog);
    }

    showLog(color = "#ffffff") {
        let objectX = 5;
        let objectY = this.scale.height - 15;
        this._debugText = this.add.text(objectX, objectY, '', {
            font: '10px Courier',
            fill: this.toStringColor(color)
        });
        this._debugText.setDepth(100);
    }

    hideLog() {
        this._debugText.destroy();
        this._debugText = null;
        this._debugLogData = null;
        this._debugLogLevel = null;
        this._debugTimeStart = null;
    }

    debugObjectDepth() {
        // 1. Get list of objects with valid depth
        const objects = this.children.list
            .filter(obj => typeof obj.depth === 'number' && obj.visible !== false);

        // 2. Hide all
        objects.forEach(obj => {
            obj.setVisible(false);
        });

        // 3. Sort by depth ascending
        objects.sort((a, b) => a.depth - b.depth);

        // 4. Show group by group every 5 seconds
        let index = 0;
        const interval = 1000; // 1 second

        const timer = this.time.addEvent({
            delay: interval,
            callback: () => {
                if (index >= objects.length) {
                    timer.remove(); // Stop when done
                    return;
                }

                const currentDepth = objects[index].depth;

                // Show all objects with the same depth
                for (let i = index; i < objects.length; i++) {
                    if (objects[i].depth === currentDepth) {
                        objects[i].setVisible(true);
                    } else {
                        break;
                    }
                }

                // Move to the next depth group
                while (index < objects.length && objects[index].depth === currentDepth) {
                    index++;
                }
            },
            loop: true
        });
    }

    debugObjectRender() {
        const objects = this.children.list.slice(); // clone to avoid modifying original list

        // 1. Hide all
        objects.forEach(obj => {
            if (typeof obj.setVisible === 'function') {
                obj.setVisible(false);
            }
        });

        // 2. Show one by one every 5 seconds
        let index = 0;
        const interval = 1000;

        const timer = this.time.addEvent({
            delay: interval,
            callback: () => {
                if (index >= objects.length) {
                    timer.remove(); // Stop when done
                    return;
                }

                const obj = objects[index];
                if (typeof obj.setVisible === 'function') {
                    obj.setVisible(true);
                    console.log(`Show object:`, obj.constructor.name, 'depth:', obj.depth);
                }

                index++;
            },
            loop: true
        });
    }

    baseUpdate() {
        // Update FPS
        if (this._fpsText) {
            const fps = Math.floor(this.game.loop.actualFps);
            this._fpsText.setText(`FPS:${fps}`);
        }
        // Update Log
        if (this._debugText) {
            this._updateLog();
        }
    }

    _updateLog() {
        if (this._debugLogData) {
            this._debugText.setText(this._debugLogData);
            this._debugLogData = null;
            this._debugLogLevel = null;
            this._debugTimeStart = Math.floor(Date.now() / 1000);
        }
        // Hide log if timeout
        if (this._debugTimeStart) {
            let crTime = Math.floor(Date.now() / 1000);
            if ((crTime - this._debugTimeStart) > this._debugTimeout) {
                this._debugTimeStart = null;
                this._debugText.setText('');
            }
        }
    }

    toHexColor(input) {
        if (typeof input === 'number') {
            return input; // already hex number
        }

        if (typeof input === 'string') {
            const str = input.trim().toLowerCase().replace(/^#/, '');
            const parsed = parseInt(str, 16);
            if (!isNaN(parsed)) {
                return parsed;
            }
        }
    }

    toStringColor(input) {
        if (typeof input === 'string') {
            if (/^#[0-9a-fA-F]{6}$/.test(input.trim())) {
                return input.trim().toLowerCase(); // already valid
            }

            const str = input.trim().toLowerCase().replace(/^#/, '');
            if (/^[0-9a-f]{6}$/.test(str)) {
                return '#' + str;
            }
        }

        if (typeof input === 'number') {
            const hex = input.toString(16).padStart(6, '0');
            return '#' + hex.toLowerCase();
        }
    }
}
