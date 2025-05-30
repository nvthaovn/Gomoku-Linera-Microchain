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

use self::state::{GomokuState, GameMode, Step};

#[derive(SimpleObject, Clone)] //param avaliable for query function
pub struct QueryRoot {
    pub host: Option<ChainId>,
    pub guest: Option<ChainId>,
	pub mode: Option<GameMode>,
	pub last_move: Option<Step>,
	pub log: String,
    pub status: String,
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
        let query_data = QueryRoot {
            host: *self.state.host.get(),
            guest: *self.state.guest.get(),
            status: format!("{:?}", *self.state.status.get()),
            steps: self.state.steps.get().clone(),
			mode: self.state.mode.get().clone(),
			last_move: self.state.last_move.get().clone(),
			log: self.state.log.get().clone().unwrap_or_default(),
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
impl MutationRoot {	 //param avaliable for mutation function
	async fn new_game(&self, game_mode:u8) -> bool {
        self.runtime.schedule_operation(&gomoku::Operation::NewGame { game_mode });
        true
    }

    async fn join_game(&self, host: ChainId) -> bool {
        //let host = host.parse().expect("Invalid ChainId format");
        self.runtime.schedule_operation(&gomoku::Operation::JoinGame { host });
        true
    }

    async fn move_step(&self, x: u8, y: u8, player: String) -> bool {
        self.runtime.schedule_operation(&gomoku::Operation::Move { x, y, player });
        true
    }
	
	async fn end_game(&self) -> bool {
        self.runtime.schedule_operation(&gomoku::Operation::EndGame);
        true
    }
}