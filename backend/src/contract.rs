// contract.rs
#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    linera_base_types::{ChainId, WithContractAbi},
    views::{RootView, View},
    Contract, ContractRuntime,
};

use gomoku::Operation;
use self::state::{GomokuState, GameStatus, GameMode, Step};

pub struct GomokuContract {
    state: GomokuState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(GomokuContract);

impl WithContractAbi for GomokuContract {
    type Abi = gomoku::GomokuAbi;
}

impl Contract for GomokuContract {
    type Message = Operation;
    type Parameters = ();
    type InstantiationArgument = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = GomokuState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        GomokuContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        self.new_game(1).await;
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            Operation::NewGame { game_mode } => self.new_game(game_mode).await,
            Operation::JoinGame { host } => self.join_game(host).await,
            Operation::Move { x, y, player } => self.move_step(x, y, player).await,
			Operation::EndGame => self.end_game().await,
			
			Operation::MicrochainJoinGame => {
				let sender_chain = self.runtime.chain_id();
				self.state.log.set(Some(sender_chain.to_string()));
				self.reply_join_success(sender_chain).await;
			},
			Operation::MicrochainReplyJoin { result } => {
				let sender_chain = self.runtime.chain_id();
				self.handle_join_result(sender_chain, result).await;
			},
			Operation::MicrochainGameMove { x, y } => {
				let sender_chain = self.runtime.chain_id();
				self.handle_game_move(sender_chain, x, y).await;
			},
        }
    }

	//Handle microchain Message
    async fn execute_message(&mut self, message: Self::Message) {
		//handle JoinGame reqquest 
		if let Operation::MicrochainJoinGame = message {
			let sender_chain = self.runtime.chain_id();
			self.state.log.set(Some("user joined: ".to_string() + &sender_chain.to_string()));
			self.reply_join_success(sender_chain).await;
		}
		//Handle joinGame Reply
		if let Operation::MicrochainReplyJoin { result } = message {
			let sender_chain = self.runtime.chain_id();
			self.state.log.set(Some("join has result: ".to_string()+&result.to_string()));
			self.handle_join_result(sender_chain,result).await;
		}
		
		//Handle move Step
		if let Operation::MicrochainGameMove { x,y } = message {
			let sender_chain = self.runtime.chain_id();
			self.state.log.set(Some("Enemy move: ".to_string()+&x.to_string()+"-"+&y.to_string()));
			self.handle_game_move(sender_chain, x, y).await;
		}
	}

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl GomokuContract {
	//create pvp game - done
    async fn new_game(&mut self,game_mode_int: u8) {
		let game_mode = match game_mode_int {
			1 => GameMode::PvP,
			2 => GameMode::Guest,
			3 => GameMode::AI,
			_ => GameMode::PvP,
		};
        let my_chain_id = self.runtime.chain_id();
		self.state.host.set(Some(my_chain_id));
		self.state.guest.set(None);
		self.state.mode.set(Some(game_mode));
        self.state.status.set(Some(GameStatus::NotStarted));
        self.state.steps.set(vec![]);
		self.state.last_move.set(None);
    }
	
	//request to join game - done
	async fn join_game(&mut self, host: ChainId) {
		let my_chain_id = self.runtime.chain_id();
		self.state.host.set(Some(host));
		self.state.guest.set(Some(my_chain_id));
		self.state.mode.set(Some(GameMode::Guest)); //join as guest
        self.state.status.set(Some(GameStatus::Joinning));
        self.state.steps.set(vec![]);
		self.state.last_move.set(None);
		//croschain
		self.runtime
            .prepare_message(Operation::MicrochainJoinGame)
            .with_authentication()
            .send_to(host);
		//self.runtime.send_message(host, Operation::MicrochainJoinGame);
    }
	
	//answer join reqquest #todo
	async fn reply_join_success(&mut self, guest_id: ChainId) {
		if self.state.guest.get().is_none() && *self.state.mode.get() == Some(GameMode::PvP) {//open game
			self.state.guest.set(Some(guest_id));
			self.runtime.send_message(guest_id, Operation::MicrochainReplyJoin { result:1 });
		}
		else{
			self.runtime.send_message(guest_id, Operation::MicrochainReplyJoin { result:0 });
		}
    }
	
	//handle join result #todo
	async fn handle_join_result(&mut self, chain_id: ChainId, result: u8) {
		if result == 1 && Some(chain_id) == *self.state.host.get() {
			let my_chain_id = self.runtime.chain_id(); //???
			self.state.host.set(Some(my_chain_id));
			self.state.status.set(Some(GameStatus::NotStarted));
			self.state.steps.set(vec![]);
		}
		else{
			self.state.status.set(None);
			self.state.steps.set(vec![]);
		}
    }
	
	//handle game move #todo
	async fn handle_game_move(&mut self, sender_chain: ChainId, x: u8, y: u8) {
		if Some(sender_chain) == *self.state.guest.get() { //guest move, i am host
			self.move_step(x, y, "o".to_string()).await;
			return ;
		}
		if Some(sender_chain) == *self.state.host.get() { // host move, i am guest
			self.move_step(x, y, "x".to_string()).await;
			return ;
		}
		panic!("Not a participant.");
    }
	
    async fn move_step(&mut self, x: u8, y: u8, player: String) {
        let sender = self.runtime.chain_id();
		let last_move = self.state.last_move.get().clone();
		if last_move.as_ref().map(|s| &s.player) != Some(&player) {//correct Turn
			//fist move by host will start game
			if self.state.steps.get().is_empty()&&Some(sender) == *self.state.host.get(){ 
				self.state.status.set(Some(GameStatus::Playing));
			}
			if *self.state.status.get() != Some(GameStatus::Playing) { 
				panic!("Game not start");
			}
			//move
			if !self.is_cell_occupied(x,y) {
				let mut steps = self.state.steps.get().clone();
				let last_move = Step {
					x:x,
					y:y,
					player:player.clone(),
				};
				self.state.last_move.set(Some(last_move.clone()));
				steps.push(last_move);
				self.state.steps.set(steps);
				return;
			}
		}
		panic!("Not a participant.");
    }
	
	//end the game
    async fn end_game(&mut self) {
		self.state.status.set(Some(GameStatus::Finished));
	}
	
	fn is_cell_occupied(&self, x: u8, y: u8) -> bool {
        self.state.steps
            .get()
            .iter()
            .any(|step| step.x == x && step.y == y)
    }
}