// service.rs
#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Schema, SimpleObject};
use linera_sdk::{
    linera_base_types::{WithServiceAbi, ChainId},
    views::View,
    Service, ServiceRuntime
};

use self::state::{GomokuState, GameMode, Step, GameStatus};

#[derive(SimpleObject, Clone)] //param avaliable for query function
pub struct QueryRoot {
    pub host: Option<ChainId>,
    pub guest: Option<ChainId>,
	pub mode: Option<GameMode>,
	pub last_move: Option<Step>,
    pub status: Option<GameStatus>,
    pub steps: Vec<Step>,
}

pub struct GomokuService {
    state: GomokuState,
	runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(GomokuService);

impl WithServiceAbi for GomokuService {
    type Abi = gomoku::GomokuAbi;
}

impl Service for GomokuService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = GomokuState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        GomokuService {
            state,
			runtime: Arc::new(runtime),
        }
    }
	
    async fn handle_query(&self, query: Self::Query) -> Self::QueryResponse {
        let query_data = QueryRoot { //Data return for query graph 
            host: self.state.host.get().clone(),
            guest: self.state.guest.get().clone(),
            status: self.state.status.get().clone(),
            steps: self.state.steps.get().clone(),
			mode: self.state.mode.get().clone(),
			last_move: self.state.last_move.get().clone(),
        };

        Schema::build(
            query_data,
            MutationRoot {
                runtime: self.runtime.clone(),
            },
            EmptySubscription,
        )
        .finish()
        .execute(query)
        .await
    }
}

struct MutationRoot {
    runtime: Arc<ServiceRuntime<GomokuService>>,
}

#[Object]
impl MutationRoot {	 //param avaliable for mutation function (frontend call to backend)
	async fn new_game(&self, game_mode:u8) -> bool {
        self.runtime.schedule_operation(&gomoku::Operation::NewGame { game_mode });
        true
    }
	
	/*
	Flow :
	Frontend JS
	   ↓
	Mutation (join_game)
	   ↓
	MutationRoot.join_game() - services.rs
	   ↓
	schedule_operation(Operation::JoinGame)
	   ↓ 
	contract.rs: execute_operation() - contract.rs
	   ↓
	match Operation::JoinGame => self.join_game(host).await
	*/

    async fn join_game(&self, host: ChainId) -> bool {
        self.runtime.schedule_operation(&gomoku::Operation::JoinGame { host:host });
        true
    }

    async fn move_step(&self, x: u8, y: u8) -> bool {
        self.runtime.schedule_operation(&gomoku::Operation::Move { x, y });
        true
    }
}