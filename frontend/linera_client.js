import * as linera from '@linera/client';

export class LineraClient{
	constructor(faucet_url) {
		this.faucet_url = faucet_url;
		this.connected = false;
		this.chain_id = null;
		this._backend = null;
		this._wallet = null;
		this._client = null;
		this._callback_handle = {};
	}
	
	async connect(app_id){
		await linera.default();
		const faucet = await new linera.Faucet(
			this.faucet_url,
		);
		this._wallet = await faucet.createWallet();
		this._client = await new linera.Client(this._wallet);
		this.chain_id = await faucet.claimChain(this._client);
		this._backend = await this._client.frontend().application(app_id);
		this.connected = true;
		this._triggerEvent("connected");
		
		
		this._client.onNotification(async (note) => {
			this.log('🔔 Notification:', note);
			this.log("🔔  Reason keys:", Object.keys(note.reason));
			this.log("🔔  Payload:", note.reason);
			this._triggerEvent("Notification");
			if (note.reason.NewBlock) {
				this._triggerEvent("NewBlock"); //state change (by frontend mutation call or crosschain message)
			}
			if (note.reason.NewIncomingBundle) {
				this._triggerEvent("NewIncomingBundle"); //recive a crosschain call from other microchain
			}
		});
		
	}
	
	onConnected(callback){
		if(this.connected) return callback();
		this.on("connected",callback);
	}
	
	// Events : 
	on(event_name, callback) {
		const list_events = [ //  supported event
			"connected",
			"Notification", //any notifycation
			"NewBlock", //state change 
			"NewIncomingBundle", //recive a crosschain call from other microchain
			"query", //call a query
		];

		if (typeof callback !== "function") {
			this.log("Callback is not a function");
			return;
		}

		// event input is an array
		if (Array.isArray(event_name)) {
			for (const evt of event_name) {
				if (!list_events.includes(evt)) {
					this.log("register on an event not found:", evt);
					continue;
				}
				if (!(evt in this._callback_handle)) this._callback_handle[evt] = [];
				this._callback_handle[evt].push(callback);
			}
			return;
		}

		// event input is a string
		if (!list_events.includes(event_name)) {
			this.log("register on an event not found:", event_name);
			return;
		}

		if (!(event_name in this._callback_handle)) this._callback_handle[event_name] = [];
		this._callback_handle[event_name].push(callback);
	}
	
	//Make a graph query to Linera network
	async query(app_id,query_string){
		console.log("startAQuery:",query_string);
		if(this.connected){
			const backend = this._backend;
			const response = await backend.query(JSON.stringify({ query: `${query_string}` }));
			return JSON.parse(response);
		}
		throw new Error("Linera Client is not connected to the network");
	}
	
	// trigger event callback
	_triggerEvent(event_name) {
		this.log("Web3 event:", event_name);
		if (event_name in this._callback_handle) {
			const callbacks = this._callback_handle[event_name];

			if (Array.isArray(callbacks)) {
				for (const cb of callbacks) {
					if (typeof cb === "function") {
						try {
							cb(event_name); // do callback
						} catch (err) {
							this.error("Error when calling callback:", err);
						}
					} else {
						this.warn("Invalid callback:", cb);
					}
				}
			} else {
				this.warn("Expected an array of callbacks, got:", callbacks);
			}
		}
	}
	
	//#todo
	log(...args){
		console.log(...args);
	}
	warn(...args){
		this.log("warn",...args);
	}
	error(...args){
		this.log("error",...args);
	}
}