let { cli } = require("./cli");

module.exports = async (data) => {
	switch(data.charCodeAt(2)){
		// Up
		case 65:
			if(cli.dataIndex > 0) cli.dataIndex -= 1;
			await cli.setNewCommand();
			process.stdout.write(cli.currentData);
			break;
		// Down
		case 66:
			if(cli.dataIndex > cli.history.length-1) cli.dataIndex -= 1;
			if(cli.dataIndex < cli.history.length-1) cli.dataIndex += 1;
			await cli.setNewCommand();
			process.stdout.write(cli.currentData);
			break;
		// Right
		case 67:
			if(cli.cursor < cli.currentData.length) cli.cursor += 1;
			cli.updateXCursorPosition();
			break;
		// Left
		case 68:
			if(cli.cursor > 0) cli.cursor -= 1;
			cli.updateXCursorPosition();
	}
}