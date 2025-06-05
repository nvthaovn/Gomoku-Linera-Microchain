import StartGame from './game/game.js';
import { LineraClient } from './linera_client.js';

const APP_ID = '3bcb7e4a194c4023c328d8c1ad471ccd67b8616386d03cabf78ebfe72cb2196e';
const FAUCET_URL = 'https://faucet.testnet-babbage.linera.net';
//const FAUCET_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
	// Init Linera Client
	try {
		window.linera = new LineraClient(FAUCET_URL);
		window.linera.connect(APP_ID);
	} catch (error) {
	  // #todo
	}
	
	// Load game
    window.game = StartGame('gameBoard');
	
	// Ready to start game
	window.linera.onConnected(async ()=>{
		document.getElementById('chainID').innerText = window.linera.chain_id;
		window.game.networkReady = true;
	});
	
	//Linera Function
	window.linera.newGame = async (mode) => {
		window.linera.checkGameInfo();
		let query_create = `mutation { newGame(gameMode:${mode}) }`;
		let tmp = await window.linera.query(APP_ID, query_create);
	};

	window.linera.joinGame = async (chainID) => {
		let query_create = `mutation { joinGame(host:"${chainID}") }`;
		let tmp = await window.linera.query(APP_ID, query_create);
	};

	window.linera.moveStep = async (x, y) => {
		let query_create = `mutation { moveStep(x:${x}, y:${y}) }`;
		let tmp = await window.linera.query(APP_ID, query_create);
	};

	window.linera.checkGameInfo = async () => {
		let query_create = `query { host, guest, mode, status, lastMove {x,y,player}, steps {x,y,player} }`;
		let tmp = await window.linera.query(APP_ID, query_create);
		return tmp;
	};
	
	
	//onpage Function
	
	// copy chainID to clipboard
	document.getElementById('chainID').addEventListener('click', () => {
		const text = document.getElementById('chainID').innerText;
		navigator.clipboard.writeText(text)
			.then(() => {
				console.log('ChainID was copied to clipboard!');
			})
			.catch(err => {
				console.error('Failed to copy ChainID: ', err);
			});
	});
});
