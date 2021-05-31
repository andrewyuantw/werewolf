module.exports = Object.freeze({
    MSG_TYPES: {

        // Client to Server

        // JOIN_GAME sent whenever a player submits their display name and joins the lobby
        JOIN_GAME: 'join_game',

        // START_GAME sent whenever the host presses the START button
        START_GAME: 'start_game',

        // READY_TO_START sent whenever a player hits READY after seeing their role
        READY_TO_START: 'ready_to_start',

        // SEER_RESPONSE sent whenever a seer has submitted the player number they want to check
        SEER_RESPONSE: 'seer_response',

        // WOLF_RESPONSE sent whenever a wolf presses send to chat
        WOLF_RESPONSE: 'wolf_response',

        // CHAT_MESSAGE is sent to werewolves
        CHAT_MESSAGE: 'chat_message',

        // WOLF_KILL sent whenever the wolf leader has submitted the player number they want to kill
        WOLF_KILL: 'wolf_kill',

        //
        KILL_RESULT: 'kill_result',

        //
        WITCH_NIGHT: 'witch_night',

        //
        HEAL: 'heal',

        //
        POISON: 'poison',
        
        //
        WITCH_SKIP: 'witch_skip',

        // RUN_FOR_MAYOR sent whenever someone presses YES or NO to running for mayor
        RUN_FOR_MAYOR: 'run_for_mayor',

        // MOVE_TO_MAYOR_VOTE sent when host presses move to mayor vote
        MOVE_TO_MAYOR_VOTE: 'move_to_mayor_vote',
        
        // sent when candidates no longer want to stay in the election
        DROP_OUT_ELECTION: 'drop_out_election',

        // sent when players vote for a mayor
        MAYOR_VOTE: 'mayor_vote',

        // Server to Client

        // JOIN_LOBBY sent whenever someone else has joined the lobby
        // this is required because everyone's "lobby" div needs to be updated
        JOIN_LOBBY: 'join_lobby',

        // ENOUGH_PEOPLE is sent to the host when enough people are in the lobby
        ENOUGH_PEOPLE: 'enough_people',

        // START_GAME is sent to every player when the host starts the game
        // We can reuse the same message because one is server -> client and the other is client -> server
        START_GAME: 'start_game',

        // GO_TO_NIGHT is sent to players (villagers and hunter) who have nothing to do in the night
        GO_TO_NIGHT: 'go_to_night',

        // SEER_NIGHT is sent to the seer when night starts
        SEER_NIGHT: 'seer_night',

        // SEER_RESULT is sent to the seer with the results of their check
        SEER_RESULT: "seer_result",

        // SEER_NIGHT is sent to the seer when night starts
        WOLF_NIGHT: 'wolf_night',

        // ELECTION_START is sent at the end of the first night
        ELECTION_START: 'election_start',

        // ELECTION_SPEECH_START is sent after everyone has said whether they want to run or not
        ELECTION_SPEECH_START: 'election_speech_start',

        // SHOW_MAYOR_BUTTON is sent to the host when mayor speeches begin
        SHOW_MAYOR_BUTTON: 'show_mayor_button',

        // MOVE_TO_MAYOR_VOTE is sent to everyone to move to the mayor voting screen
        MOVE_TO_MAYOR_VOTE: 'move_to_mayor_vote',

        MOVE_TO_MAYOR_VOTE_CANDIDATE: 'move_to_mayor_vote_candidate',

        // sent to candidates only, shows the button that allows that to drop out
        SHOW_DROP_OUT_BUTTON: 'show_drop_out_button',

        // sent to everyone, updates active candidate list
        UPDATE_CANDIDATES: 'update_candidates',

        // sent to everyone, shows mayor election results
        MAYOR_REVEAL: 'mayor_reveal',

        YOUR_NUMBER: 'your_number'

    },
});