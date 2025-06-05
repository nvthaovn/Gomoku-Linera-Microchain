// lib.rs
use async_graphql::{Request, Response};
use linera_sdk::{
    linera_base_types::{ContractAbi, ServiceAbi},
};
use serde::{Deserialize, Serialize};
use linera_sdk::linera_base_types::ChainId;

pub struct GomokuAbi;

impl ContractAbi for GomokuAbi {
    type Operation = Operation;
    type Response = ();
}

impl ServiceAbi for GomokuAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Operation {
    NewGame{ game_mode: u8 },
    JoinGame { host: ChainId },
    Move { x: u8, y: u8},
}

#[derive(Debug, Deserialize, Serialize)]
pub enum CrossMessage {
	JoinRequest,
    JoinResult { result: u8 },
    EnemyGameMove { x: u8, y: u8 },
}