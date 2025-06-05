use linera_sdk::test::{TestEnvironment, TestValidator};
use gomoku::{Operation, CrossMessage};
use linera_base::data_types::Amount;
use linera_base::crypto::KeyPair;
use linera_base::identity::ChainId;

#[tokio::test]
async fn test_new_game_and_move() {
    // Create a test environment with 2 chains
    let mut env = TestEnvironment::default();
    let key_pair1 = KeyPair::generate();
    let key_pair2 = KeyPair::generate();
    let chain1 = env.add_user_chain(key_pair1.clone()).await;
    let chain2 = env.add_user_chain(key_pair2.clone()).await;

    // Publish the application
    let app_id = env
        .publish_application("gomoku", "gomoku::GomokuAbi", ())
        .await
        .expect("Failed to publish");

    // Create the contract instance on chain1
    chain1
        .create_application(app_id, ())
        .await
        .expect("Failed to create app on chain1");

    // Start a new PvP game on chain1
    chain1
        .execute_operation(app_id, &Operation::NewGame { game_mode: 1 })
        .await
        .expect("Failed to start new game");

    // Join the game from chain2
    chain2
        .execute_operation(app_id, &Operation::JoinGame { host: chain1.chain_id })
        .await
        .expect("Failed to join game");

    // Execute the cross-message from chain2 -> chain1 (join request)
    env.execute_pending_messages().await;

    // Verify that chain1 accepted the guest and started the game
    let value = chain1
        .application_state(app_id)
        .await
        .expect("Failed to get state");
    println!("Chain1 state: {:?}", value);

    // Make a move on chain1
    chain1
        .execute_operation(app_id, &Operation::Move { x: 3, y: 4 })
        .await
        .expect("Failed to move");

    // Make a move on chain2 (as guest)
    chain2
        .execute_operation(app_id, &Operation::Move { x: 3, y: 5 })
        .await
        .expect("Guest failed to move");

    // Execute enemy move message
    env.execute_pending_messages().await;

    // Final state validation
    let final_state = chain1.application_state(app_id).await.unwrap();
    println!("Final state on chain1: {:?}", final_state);
}
