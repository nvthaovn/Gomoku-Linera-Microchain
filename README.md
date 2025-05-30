# Gomoku-Linera-Microchain 🎮⚡

**Gomoku (Five in a Row)** – an online multiplayer board game powered by **Linea Blockchain**, utilizing **Microchain cross-message communication**.  
Players can create or join games in real-time, with moves synchronized across the blockchain using smart contracts base on Microchain.

---

## 🚀 Features

- ✅ Online Gomoku gameplay powered by Linera Blockchain Testnet  
- ✅ Cross-chain messaging via Microchain
- ✅ Supports both human players in PvP online mode and AI Mode to play with AI  
- ✅ Lightweight frontend running directly in the browser
- ✅ Easy to read, easy to understand, quick to deploy
- ✅ Gui game engine by Phaser 3
---

## 🛠️ How to Run

### 🔧 Backend (Smart Contract – Linera SDK)

1. **Build the WebAssembly contract:**
   ```bash
   cargo build --release --target wasm32-unknown-unknown
   ```

2. **Publish and create the Microchain:**
   ```bash
   linera publish-and-create target/wasm32-unknown-unknown/release/gomoku_{contract,service}.wasm
   ```

---

### 🌐 Frontend (Client Interface)

1. **Start the local server:**
   - On Windows:
     ```bash
     ./frontend/runLocalServer.bat
     ```
   - Or with Python (cross-platform):
     ```bash
     cd frontend
     python -m http.server
     ```

2. **Open the game in your browser:**
   ```
   http://localhost:8000/
   ```

---

## ⚙️ Frontend Configuration (Application ID)

Edit the following file to set your application ID:

```
./frontend/main.js
```

Look for the line that sets `APP_ID = ...` and replace it with your actual deployed application ID from the Linera network.

---

## 🖼️ Screenshot

![Game Screenshot](screenshot_1.png)
![Game Screenshot](screenshot_2.png)

---

## 📌 Requirements

- Rust & Cargo  
- Linera CLI  
- Python 3
- OS: Windows or Linux

---

## 📣 Contributing

Pull requests and issues are welcome!  
This project is open-source and aims to explore Microchain Technology on Linera Blockchain, serverless gameplay using blockchain and microchain messaging on the Linea ecosystem.

---
