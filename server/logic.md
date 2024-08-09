sequenceDiagram
    User ->> FE: Open Telegram MiniApp
    FE->>FE: Capture Telegram initData string
    FE->>BE: Sends Init Data
    BE->>BE: Verifies Data
    BE->>DB: Check/Create User
    DB-->>BE: Returns User Data
    BE->>BE: Generates JWT Token
    BE-->>FE: Returns Token and User Data
    FE->>FE: Sets Token to Axios Header
    FE->>User: Display User name in screen

sequenceDiagram
    User->>FE: Create Game Button
    FE->> BE: Call createGame tRPC
    FE->>BE: Emit C2S_CREATE_GAME Event
    BE->>DB: Create Game Entry
    BE->>Other Users: Emit S2C_GAME_CREATED WebSocket to everyone
    DB-->>BE: Return Game Details
    BE-->>FE: Return Game Created Response
    FE-->>User: Display Game Created

sequenceDiagram
    User-->FE:.
    FE-->>User: Display Current Open Games
    User-->>FE: Press AnyGame(Or FE choose randomly)
    FE->>BE: Call joinGame tRPC
    FE->>BE: Emit C2S_JOIN_GAME Event
    BE->>DB: Add User to Game
    DB-->>BE: Return Updated Game Details
    BE->>Users in Game: S2C_PLAYER_JOINED
    BE-->>FE: Return Player Joined Response
    FE-->>User: Display Player Joined

sequenceDiagram
    Game Creator->>FE: press Start button
    FE->>BE: Emit C2S_START_GAME Event
    BE->>DB: Update Game Status to IN_PROGRESS
    DB-->>BE: Return Updated Game Status
    BE-->>FE: Emit S2C_GAME_STARTED
    BE->>Other users in Game: Emit S2C_GAME_STARTED
    FE-->>Game Creator: Display Game Started

sequenceDiagram
    User-->>FE: .
    FE->>BE: Call submitMove tRPC
    FE->>BE: C2S_SUBMIT_MOVE
    BE->>DB: Record Move in Game Logs
    DB-->>BE: Return Move Recorded Confirmation
    BE->>BE: Update Game State in Real-Time
    BE->>BE: Check Submitted Move and Max Player
    BE->>BE: Determine Winner
    BE-->>FE: Return Move Submission Response
    BE->>FE: Emit notifyMoveSubmission WebSocket
    FE-->>User: S2C_MOVE_SUBMITTED
    BE-->>Users in same Game: S2C_MOVE_SUBMITTED
