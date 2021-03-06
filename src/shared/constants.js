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

        // SEER_END sent to seer
        SEER_END: 'seer_end',

        // WOLF_RESPONSE sent whenever a wolf presses send to chat
        WOLF_RESPONSE: 'wolf_response',

        // CHAT_MESSAGE sent whenever a wolf presses send to chat
        CHAT_MESSAGE: 'chat_message',
        
        // WOLF_KILL sent whenever the wolf leader has submitted the player number they want to kill
        WOLF_KILL: 'wolf_kill',

        // KILL_RESULT sent to server when one wolf makes the decision to kill 
        KILL_RESULT: 'kill_result',

        // WITCH_NIGHT is sent to 
        WITCH_NIGHT: 'witch_night',

        //
        HEAL: 'heal',

        //
        POISON: 'poison',
        
        //
        WITCH_SKIP: 'witch_skip',

        // HUNTER_RESPONSE whenever a hunter has submitted the player number they want to shoot
        HUNTER_RESPONSE: 'hunter_response',
        
        // HUNTER_SHOOT sent to hunter when hunter is dead
        HUNTER_SHOOT: 'hunter_shoot',

        // HUNTER_SKIP sent whenever a hunter skips
        HUNTER_SKIP: 'hunter_skip',
        
        // SHOOT_RESULT sent to everyone when hunter shoots someone
        SHOOT_RESULT: 'shoot_result',

        // REVEAL_CONFIRM_SHOT_BUTTON sent to host
        REVEAL_CONFIRM_SHOT_BUTTON: 'reveal_confirm_shot_button',

        // CONFIRM_SHOT sent whenever shot result is confirmed
        CONFIRM_SHOT: 'confirm_shot',

        // SHOT_END sent to everyone 
        SHOT_END: 'shot_end',
        
        // MAYOR_RESPONSE sent whenever a mayor has submitted the player number
        MAYOR_RESPONSE: 'mayor_response',
        
        // MAYOR_SUCCESSOR sent to mayor when mayor is dead
        MAYOR_SUCCESSOR: 'mayor_successor',

        // NEW_MAYOR sent to everyone
        NEW_MAYOR: 'new_mayor',

        // REVEAL_DEAD_LAST_NIGHT sent to everyone before day speech
        REVEAL_DEAD_LAST_NIGHT: 'reveal_dead_last_night',

        // REVEAL_CONFIRM_DEATH_BUTTON sent to host
        REVEAL_CONFIRM_DEATH_BUTTON: 'reveal_confirm_death_button',

        // CONFIRM_DEATH sent whenever a host confirms death
        CONFIRM_DEATH: 'confirm_deadth',

        // DEATH_END sent to everyone
        DEATH_END: 'death_end',
        
        // REVEAL_CONFIRM_NEW_MAYOR_BUTTON sent to host
        REVEAL_CONFIRM_NEW_MAYOR_BUTTON: 'reveal_confirm_new_mayor_button',
        
        // CONFIRM_NEW_MAYOR sent whenever a host confirms new mayor
        CONFIRM_NEW_MAYOR: 'confirm_new_mayor',

        // SUCCESSOR_END sent to everyone
        SUCCESSOR_END: 'successor_end',

        // MOVE_TO_NEXT_STAGE sent after checks
        MOVE_TO_NEXT_STAGE: 'move_to_next_stage', 

        // GAME_OVER sent to every player whenever the game is over
        GAME_OVER: 'game_over',

        // RUN_FOR_MAYOR sent whenever someone presses YES or NO to running for mayor
        RUN_FOR_MAYOR: 'run_for_mayor',

        // MOVE_TO_MAYOR_VOTE sent when host presses move to mayor vote
        MOVE_TO_MAYOR_VOTE: 'move_to_mayor_vote',
        
        // sent when candidates no longer want to stay in the election
        DROP_OUT_ELECTION: 'drop_out_election',

        // sent when players vote for a mayor
        MAYOR_VOTE: 'mayor_vote',

        // sent when players vote for someone to be voted out
        SUBMIT_VOTE: 'submit_vote',

        WOLF_MAYOR_REVEAL: 'wolf_mayor_reveal',

        MOVE_TO_DAY: 'move_to_day',

        MOVE_TO_VOTING: 'move_to_voting',

        WOLF_VOTE_REVEAL: 'wolf_vote_reveal',

        MAYOR_TIE: 'mayor_tie',

        AFTER_VOTE: 'after_vote',

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

        //
        WOLF_END: 'wolf_end',

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

        // sent to the newest player that joined, gives them their number so they can turn their name blue
        YOUR_NUMBER: 'your_number',

        

        // sent to everyone once server has tallied all the votes
        VOTE_REVEAL: 'vote_reveal',

        WOLF_MAYOR_BUTTON: 'wolf_mayor_button',

        // sent to host
        REVEAL_MOVE_TO_DAY_BUTTON: 'reveal_move_to_day_button',

        // sent to everyone
        MOVE_TO_DAY: 'move_to_day',

        // sent to host
        REVEAL_MOVE_TO_VOTE_BUTTON: 'reveal_move_to_vote_button',

        // sent to wolves
        WOLF_VOTE_REVEAL: 'wolf_vote_reveal',

        REVEAL_MAYOR_TIE_BUTTON: 'reveal_mayor_tie_button',

        MAYOR_TIE: 'mayor_tie',

        REVEAL_VOTE_TIE_BUTTON: 'reveal_vote_tie_button',

        VOTE_TIE: 'vote-tie',

        PLAYER_DISCONNECTED: 'player-disconnected',

        REVEAL_MOVE_TO_AFTER_VOTE_BUTTON: 'reveal-move-to-after-vote-button'
    },
});