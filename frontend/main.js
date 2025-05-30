import StartGame from './game/game.js';
import { LineraClient } from './linera_client.js';

const APP_ID = '6cd9468e42a1f5bd0c8fb41e9e072500034d5f2c1b59b865b93872412de95c17';
const FAUCET_URL = 'https://faucet.testnet-babbage.linera.net';

let connected = false;
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
		let query_create = `mutation { newGame(gameMode:${mode}) }`;
		let tmp = await window.linera.query(APP_ID, query_create);
	};

	window.linera.joinGame = async (chainID) => {
		let query_create = `mutation { joinGame(host:${chainID}) }`;
		let tmp = await window.linera.query(APP_ID, query_create);
	};

	window.linera.moveStep = async (x, y, player) => {
		let query_create = `mutation { moveStep(x:${x}, y:${y}, player:${player}) }`;
		let tmp = await window.linera.query(APP_ID, query_create);
	};

	window.linera.endGame = async () => {
		let query_create = `mutation { end_game }`;
		let tmp = await window.linera.query(APP_ID, query_create);
	};

	window.linera.checkGameInfo = async () => {
		let query_create = `query { host, guest, mode, status, lastMove {x,y,player}, log }`;
		let tmp = await window.linera.query(APP_ID, query_create);
		return tmp;
	};
	
	window.linera.wait = async () => {
		let query_create = `query { host, guest, mode, status, log }`;
		let tmp = await window.linera.query(APP_ID, query_create);
		return tmp;
	};

	window.linera.checkLog = async () => {
		let query_create = `query { log }`;
		let tmp = await window.linera.query(APP_ID, query_create);
		console.log("GameLog:", tmp);
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
