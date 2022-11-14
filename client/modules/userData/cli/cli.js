module.exports.cli = {
	currentData: '',
	cursor: 0,
	row: 1,
	startTextYPosition: 0,
	// Index of the current command in the history
	dataIndex: 0,
	history: [],

	// Get cursor position from terminal:
	// printing the sequence "ESC[6n" will report
	// the cursor position to the application: "ESC[n;mR"
	// where n is the row
	getCursorYPos: async function() {
		return new Promise((resolve, reject) => {
			const termcodes = { cursorGetPosition: '\u001b[6n' };
    		const readfx = function () {
				try {
        			const buf = process.stdin.read();
        			const str = JSON.stringify(buf); // "\u001b[9;1R"
        			const regex = /\[(.*)/g;
        			const y = regex.exec(str)[0].replace(/\[|R"/g, '').split(';');
        			const pos = y[0];
        			resolve(Number(pos));
				} catch(err) {  }
    		};
			process.stdin.once('readable', readfx);
    		process.stdout.write(termcodes.cursorGetPosition);
		});
	},

	printCharacter: async function(data){
		// Escape non-printable characters
		let stringData = String(data).replace(/[\x00\x08\x0B\x0C\x0E-\x1F]/g, "");
		// If it is first row and column, then the user has started writing a text,
		// so we need to set start row position of the text
		if(this.row == 1 && this.cursor == 0) this.startTextYPosition = await this.getCursorYPos();
		process.stdout.write(stringData);
		this.currentData += stringData, this.cursor += stringData.length;
		// When the cursor moves to the next line (up or down), increase the value of the row
		if(this.cursor > process.stdout.columns && this.cursor % process.stdout.columns == 1){ 
			let currentRowCount = Math.ceil(this.cursor / process.stdout.columns);
			// Increase the row value only if the cursor moves down
			if(this.row < currentRowCount) this.row += 1;
		}
	},

	addDataToTheHistory: function() {
		let currentRowCount = Math.ceil(this.cursor / process.stdout.columns);
		if(this.history.length <= 50 && this.currentData) this.history.push({
			text: this.currentData, 
			row: currentRowCount
		});
		// When the size of the command history is too large, delete
		// the last command and insert new command at the begining
		else if(this.history.length >= 50 && this.currentData) { 
			this.history.shift();
			this.history.push({text: this.currentData, row: currentRowCount});
		} this.dataIndex = this.history.length;
	},

	// Before writing out a new command/message, remove the old 
	// command/message from the terminal
	removeOldText: async function(){
		let cursorYPos = await this.getCursorYPos(), rowDeleted = 0, totalRows = process.stdout.rows,
		startYPos = this.startTextYPosition, endOfTextBlock;
		// If there are more current rows than the total rows in the terminal, then the end 
		// of the text block will be at the end of the terminal and not beyond its borders 
		if(startYPos) endOfTextBlock = startYPos < totalRows ? startYPos + (this.row-1) : totalRows;
		else endOfTextBlock = cursorYPos <= totalRows ? cursorYPos : totalRows;
		// Delete each line of text starting from the end of the text block
		while(rowDeleted <= this.row){
			process.stdout.cursorTo(0, endOfTextBlock - rowDeleted); process.stdout.clearLine();
			rowDeleted += 1;
		}
	},

	setNewCommand: async function(){
		await this.removeOldText();
		let dataIndex = this.dataIndex, history = this.history;
		// Update information about the current text and the current cursor position
		this.currentData = history[dataIndex].text, this.row = history[dataIndex].row;
		this.cursor = this.currentData.length, this.startTextYPosition = await this.getCursorYPos();
	},

	removeCharacter: async function(){
		let newText = this.currentData.slice(0, this.cursor-1) + this.currentData.slice(this.cursor);
		this.currentData = newText;
		if(this.cursor > 0) this.cursor -= 1;
		await this.removeOldText();
	}
};