// contract.rs
#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    linera_base_types::{ChainId, WithContractAbi},
    views::{RootView, View},
    Contract, ContractRuntime,
};

use log::debug;


use gomoku::Operation;
use gomoku::CrossMessage;
use self::state::{GomokuState, GameStatus, GameMode, Step};

// declare state structure
pub struct GomokuContract {
    state: GomokuState,
    runtime: ContractRuntime<Self>,
}

// create contract
linera_sdk::contract!(GomokuContract);

// declare ABI
impl WithContractAbi for GomokuContract {
    type Abi = gomoku::GomokuAbi;
}

// Public function
impl Contract for GomokuContract {
    type Message = CrossMessage;
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
		//Run something after publish-and-create new app
        self.init_game().await;
    }

	// Handle Frontend function call
    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation { 
            Operation::NewGame { game_mode } => self.backend_new_game(game_mode).await,
            Operation::JoinGame { host } => self.backend_join_game(host).await,
            Operation::Move { x, y } => self.backend_move_step(x, y).await,
        }
    }

	//Handle message from other microchain
    async fn execute_message(&mut self, message: Self::Message) {
		debug!("route: execute_message");
		let sender_chain = self.runtime.message_id()
			.expect("No message ID")
			.chain_id;
		debug!("handle message from {:?} to {:?}",sender_chain,self.runtime.chain_id());
		match message {
			CrossMessage::JoinRequest => {
				debug!("✉️ JoinRequest from {:?}", sender_chain);
				self.handle_join_request(sender_chain).await;
			}

			CrossMessage::JoinResult { result } => {
				debug!("✉️ JoinResult from {:?}, result = {}", sender_chain, result);
				self.handle_join_result(sender_chain, result).await;
			}

			CrossMessage::EnemyGameMove { x, y } => {
				debug!("✉️ EnemyGameMove from {:?} - position ({}, {})", sender_chain, x, y);
				self.handle_enemy_game_move(sender_chain, x, y).await;
			}
		}
	}

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

//Main Contract Logic
impl GomokuContract {
	
	// init new empty game
	async fn init_game(&mut self){
		self.state.host.set(None);
		self.state.guest.set(None);
		self.state.mode.set(None);
        self.state.status.set(None);
        self.state.steps.set(vec![]);
		self.state.last_move.set(None);
	}
		
	//function for frontend call to create a new game
    async fn backend_new_game(&mut self,game_mode_int: u8) {
		let timestamp = self.runtime.system_time();
		debug!("[{}] called: backend_new_game",timestamp);
		let game_mode = match game_mode_int {
			1 => GameMode::PvP,
			2 => GameMode::Guest,
			3 => GameMode::AI,
			_ => GameMode::PvP,
		};
        let my_chain_id = self.runtime.chain_id();
		// init new game
		self.init_game().await;
		self.state.host.set(Some(my_chain_id));
		self.state.guest.set(None);
		self.state.mode.set(Some(game_mode));
		if game_mode == GameMode::AI {
			self.state.status.set(Some(GameStatus::Playing)); 
		}
		else{
			self.state.status.set(Some(GameStatus::NotStarted));
		}
        self.state.steps.set(vec![]);
		self.state.last_move.set(None);
    }
	
	//function for frontend call to join a game
	async fn backend_join_game(&mut self, host: ChainId) {
		debug!("called: backend_join_game");
		let my_chain_id = self.runtime.chain_id();
		self.state.host.set(Some(host));
		self.state.guest.set(Some(my_chain_id));
		self.state.mode.set(Some(GameMode::Guest)); //join as guest
        self.state.status.set(Some(GameStatus::Joinning));
        self.state.steps.set(vec![]);
		self.state.last_move.set(None);
		// Send a crosschain message to the room owner to request join the game
		self.runtime
            .prepare_message(CrossMessage::JoinRequest)
            .with_authentication()
            .send_to(host);
    }
	
	async fn backend_move_step(&mut self, x: u8, y: u8) {
		debug!("called: backend_move_step");
		let last_move = self.state.last_move.get().clone();
		let mode = *self.state.mode.get();
		let mut result = false;
		let mut enemy_chain = None;
		match mode {
			Some(GameMode::PvP) => {
				if last_move.is_none() || last_move.as_ref().unwrap().player == "o" {
					result = self.move_step(x, y, "x".to_string()).await;
					if result {
						enemy_chain = self.state.guest.get().clone();
					}
				} else {
					debug!("Not your turn: last was {:?}",last_move.as_ref().unwrap().player);
				}
			}
			Some(GameMode::Guest) => {
				if let Some(last) = last_move {
					if last.player == "x" {
						result = self.move_step(x, y, "o".to_string()).await;
						if result {
							enemy_chain = self.state.host.get().clone();
						}
					} else {
						debug!("Not your turn: last was {:?}", last.player);
					}
				}
			}
			_ => {
				panic!("Not a participant.");
			}
		}
		// send Message to enemy microchain
		if result {
			debug!("called: backend_move_step success move");
			if let Some(chain) = enemy_chain {
				self.runtime
					.prepare_message(CrossMessage::EnemyGameMove { x, y })
					.with_authentication()
					.send_to(chain);
			}
		}
    }
	
	//answer join reqquest from other microchain
	async fn handle_join_request(&mut self, guest_chain: ChainId) {
		debug!("called: handle_join_request from {:?}", guest_chain);
		
		let mut join_result = 0;

		if self.state.guest.get().is_none() && *self.state.mode.get() == Some(GameMode::PvP) {
			self.state.guest.set(Some(guest_chain));
			self.state.status.set(Some(GameStatus::Playing)); // Start the game
			join_result = 1;
		}

		// Send join result back to guest_chain
		self.runtime
			.prepare_message(CrossMessage::JoinResult { result: join_result })
			.with_authentication()
			.send_to(guest_chain);
	}
	
	//handle join result from host's microchain
	async fn handle_join_result(&mut self, host_chain: ChainId, result: u8) {
		debug!("called: handle_join_result");
		if *self.state.mode.get() == Some(GameMode::Guest)
			&& self.state.host.get().as_ref() == Some(&host_chain)
			&& *self.state.status.get() == Some(GameStatus::Joinning){
				if result == 1{
					self.state.status.set(Some(GameStatus::Playing)); // Start the game
				}
				else{
					debug!("called: handle_join_result - join Failed");
				}
		}
    }
	
	// Handle game move from enemy chain
	async fn handle_enemy_game_move(&mut self, enemy_chain: ChainId, x: u8, y: u8) {
		debug!("called: handle_enemy_game_move from {:?}", enemy_chain);

		let mode = *self.state.mode.get();
		let last_move = self.state.last_move.get();

		match mode {
			Some(GameMode::PvP) => {
				if let Some(last) = last_move {
					if last.player == "x" {
						self.move_step(x, y, "o".to_string()).await;
					} else {
						debug!("Not your turn: last was {:?}", last.player);
					}
				}
			}
			Some(GameMode::Guest) => {
				if last_move.is_none() || last_move.as_ref().unwrap().player == "o" {
					self.move_step(x, y, "x".to_string()).await;
				} else {
					debug!("Not your turn: last was {:?}", last_move.as_ref().unwrap().player);
				}
			}
			_ => {
				panic!("Not a participant.");
			}
		}
	}

	
    async fn move_step(&mut self, x: u8, y: u8, player: String) -> bool {
		debug!("called: move_step");

		let status = self.state.status.get().clone();
		if status != Some(GameStatus::Playing) {
			debug!("Game is not ready: {:?}", status);
			return false;
		}

		if self.is_cell_occupied(x, y) {
			debug!("Cell ({}, {}) is already occupied", x, y);
			return false;
		}

		let mut steps = self.state.steps.get().clone();
		let step = Step {
			x,
			y,
			player: player.clone(),
		};
		self.state.last_move.set(Some(step.clone()));
		steps.push(step);
		self.state.steps.set(steps);
		debug!("move step saved !");

		if self.check_win(x, y, &player).await {
			self.state.status.set(Some(GameStatus::Finished));
		}

		true
	}
	
	async fn check_win(&self, x: u8, y: u8, player: &str) -> bool {
        let steps = self.state.steps.get();
        let directions = [
            (1, 0),   //  →
            (0, 1),   //  ↓
            (1, 1),   //  ↘
            (1, -1),  //  ↗
        ];

        for (dx, dy) in directions {
            let mut count = 1;

            // left top
            let mut i = 1;
            while let Some(_step) = steps.iter().find(|s| 
                s.x as i16 == x as i16 - dx * i &&
                s.y as i16 == y as i16 - dy * i &&
                s.player == player
            ) {
                count += 1;
                i += 1;
            }

            // right bottom
            let mut i = 1;
            while let Some(_step) = steps.iter().find(|s| 
                s.x as i16 == x as i16 + dx * i &&
                s.y as i16 == y as i16 + dy * i &&
                s.player == player
            ) {
                count += 1;
                i += 1;
            }

            if count >= 5 {
                return true;
            }
        }
        false
    }
	
	fn is_cell_occupied(&self, x: u8, y: u8) -> bool {
        self.state.steps
            .get()
            .iter()
            .any(|step| step.x == x && step.y == y)
    }
}