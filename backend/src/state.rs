// state.rs
use linera_sdk::views::{linera_views, RegisterView, RootView, ViewStorageContext};
use linera_sdk::linera_base_types::ChainId;
use serde::{Serialize, Deserialize};
use async_graphql::SimpleObject;
use async_graphql::Enum;

#[derive(RootView)]
#[view(context = "ViewStorageContext")]
pub struct GomokuState {
    pub host: RegisterView<Option<ChainId>>,
    pub guest: RegisterView<Option<ChainId>>,
	pub mode: RegisterView<Option<GameMode>>,
    pub status: RegisterView<Option<GameStatus>>,
    pub steps: RegisterView<Vec<Step>>,
	pub last_move: RegisterView<Option<Step>>,
	pub log: RegisterView<Option<String>>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Default)]
pub enum GameStatus {
    #[default]
    NotStarted,
	Joinning,
    Playing,
    Finished,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Eq, Enum, Default)]
pub enum GameMode {
    #[default]
    PvP,
	Guest,
    AI,
}

#[derive(Clone, Debug, Serialize, Deserialize, SimpleObject)]
pub struct Step {
    pub x: u8,
    pub y: u8,
    pub player: String,
}