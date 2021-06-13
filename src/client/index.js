
import { connect, dropOutElection, enterUsername, getSeerChoice, getKillChoice, hostStartGame, mayorVote, moveToMayorVote, play, playerReady, readyToStart, runForMayorOrNot, seerLook, startGame, vote, wolfChatMessage, witchSkip, heal, poison, wolfMayorReveal, moveToDay, moveToVote, wolfReveal, getHunterChoice, hunterSkip, confirmDeath, moveToMayorTie, moveToTie } from "./networking"
import './style.css';

// Gets the desired element from our index.html file 
const playButton = document.getElementById('play-button');
const startGameButton = document.getElementById('start-game-button');
const readyButton = document.getElementById('ready');
const seerButton = document.getElementById('seer-button');
const wolfButton = document.getElementById('wolf-button');
const chatButton = document.getElementById('chat-button');
const healButton = document.getElementById('heal-button');
const poisonButton = document.getElementById('poison-button');
const skipButton = document.getElementById('skip-button');
const hunterNoButton = document.getElementById('hunter-no-button');
const hunterShootButton = document.getElementById('shoot-button');
const mayorDestroyButton = document.getElementById('destroy-button');
const mayorSuccessorButton = document.getElementById('successor-button');
const yesMayorButton = document.getElementById('yes-mayor');
const noMayorButton = document.getElementById('no-mayor');
const startMayorVoteButton = document.getElementById('start-mayor-vote-button');
const dropoutButton = document.getElementById('drop-out-button');
const mayorVoteButton = document.getElementById('mayor-vote-button');
const voteButton = document.getElementById('vote-button');
const moveToDayButton = document.getElementById('move-to-day-button');
const moveToVoteButton = document.getElementById('move-to-vote-button');
const wolfRevealButton = document.getElementById('wolf-reveal-button');
const moveToMayorTieButton = document.getElementById('move-to-mayor-tie-button');
const moveToTieButton = document.getElementById('move-to-tie-button');
const historyButton = document.getElementById('history');
const confirmDeathButton = document.getElementById('confirm-death-button');
const seeYourRoleButton = document.getElementById('see-your-role');


// Stores the player number (not IDs) of players alive (from player perspective)
var alivePlayers = [];


// Stores the player number (not IDs) of eligible nominees that you can still vote for
var activeNominees = []

var voteCheck = [];

var currentMode = 0;

var getInitialCandidates = true;


// Handle HTML button onclick functions
Promise.all([
    
]).then(() => {

    // When the play button is clicked after you've entered your display name 
    playButton.onclick = () => {

        // We get the string input from the text box
        var usernameInput = document.getElementById('username-input').value;

        // If the input isn't empty, we send a message to the server
        if (usernameInput.length != 0){
            enterUsername(usernameInput);
            playButton.classList.toggle("show");
        }
    };

    // When the host clicks the START game button
    startGameButton.onclick = () => {
        hostStartGame();
        startGameButton.classList.toggle("show");
    };

    // When players press READY after seeing their assigned role
    readyButton.onclick = () => {

        // We hide the button once it is clicked
        var readyButton = document.getElementById("ready");
        if (readyButton.classList.contains("show"))
            readyButton.classList.toggle("show");

        // We send a message to the server
        playerReady();
    }

    // When the seer has clicked confirm after inputting a player number 
    seerButton.onclick = () => {

        // We get the number from the input box, and check if it is valid
        // TO DO: Check if the player number is for someone alive
        // needs to handle case where wolves kill someone before the seer makes decision
        // in this case, the person cannot be shown to be dead yet
        var numInput = document.getElementById('seer-input').value;
        alivePlayers.forEach(a =>{
            console.log(a);
        })
        if (alivePlayers.includes(numInput))
            getSeerChoice(numInput);
    }

    // When the wolf has clicked confirm after inputting a player number 
    wolfButton.onclick = () => {

        // We get the number from the input box, and check if it is valid
       
        var numInput = document.getElementById('wolf-input').value;
        if (alivePlayers.includes(numInput) || numInput == 0)
            getKillChoice(numInput);
    }

    // When the wolf has clicked confirm after inputting a player number 
    chatButton.onclick = () => {

        // We get the message from the input box
        var textInput = document.getElementById('chat-input').value;
        wolfChatMessage(textInput);
    }

    // When the witch has clicked heal
    healButton.onclick = () => {
        heal();
        document.getElementById("witch-menu").classList.toggle("show");
    }

    // When the witch has clicked poison after inputting a player number 
    poisonButton.onclick = () => {

        // We get the number from the input box, and check if it is valid
        var numInput = document.getElementById('witch-input').value;
        if (alivePlayers.includes(numInput)){
            poison(numInput);
            document.getElementById("witch-menu").classList.toggle("show");
        }
    }

    // When the witch has clicked skip
    skipButton.onclick = () => {
        witchSkip();
        document.getElementById("witch-menu").classList.toggle("show");
        
    }

    hunterNoButton.onclick = () => {
        hunterSkip();
        document.getElementById("hunter-menu").classList.toggle("show");
        
    }

    hunterShootButton.onclick = () => {
        
        var numInput = document.getElementById('shoot-input').value;
        if (alivePlayers.includes(numInput))
            getHunterChoice(numInput);
        document.getElementById("hunter-menu").classList.toggle("show");
    }

    confirmDeathButton.onclick = () => {

        confirmDeathButton.classList.toggle("show");
        confirmDeath();
    }

    mayorDestroyButton.onclick = () => {
        getMayorChoice(0);
        document.getElementById("mayor-successor-menu").classList.toggle("show");
        
    }

    mayorSuccessorButton.onclick = () => {
        var numInput = document.getElementById('successor-input').value;
        if (alivePlayers.includes(numInput))
            getMayorChoice(numInput);
        document.getElementById("mayor-successor-menu").classList.toggle("show");
        
    }

    yesMayorButton.onclick = () =>{
        runForMayorOrNot(true);
        yesMayorButton.classList.toggle("show");
        noMayorButton.classList.toggle("show");
    }

    noMayorButton.onclick = () =>{
        runForMayorOrNot(false);
        yesMayorButton.classList.toggle("show");
        noMayorButton.classList.toggle("show");
    }

    startMayorVoteButton.onclick = () =>{
        startMayorVoteButton.classList.toggle("show");
        moveToMayorVote();
    }

    dropoutButton.onclick = () =>{
        dropoutButton.classList.toggle("show");
        dropOutElection();
    }

    mayorVoteButton.onclick = () =>{
        var numInput = document.getElementById('mayor-input').value;
        if (activeNominees.includes(parseInt(numInput)) || numInput == "0"){
            mayorVote(numInput);
            mayorVoteButton.classList.toggle("show");
        }
    }

    voteButton.onclick = () =>{
        var numInput = document.getElementById('vote-input').value;
        if (voteCheck.includes(numInput) || numInput == "0"){
            vote(numInput);
            voteButton.classList.toggle("show");
        }
    }

    moveToDayButton.onclick = () =>{
        moveToDayButton.classList.toggle("show");
        moveToDay();
    }

    moveToVoteButton.onclick = () =>{
        moveToVoteButton.classList.toggle("show");
        moveToVote();
    }

    wolfRevealButton.onclick = () =>{
        wolfRevealButton.classList.toggle("show");
        if (currentMode == 2)
            wolfReveal();
        else if (currentMode == 1)
            wolfMayorReveal();
    }

    moveToMayorTieButton.onclick = () =>{
        moveToMayorTieButton.classList.toggle("show");
        moveToMayorTie();
    }

    moveToTieButton.onclick = () =>{
        moveToTieButton.classList.toggle("show");
        moveToTie();
    }

    historyButton.onclick = () =>{
        document.getElementById("history-display").classList.toggle("show");
    }

    seeYourRoleButton.onclick = () =>{
        document.getElementById("your-role").classList.toggle("show");
    }
}) 

// Handles server message indicating a new person has joined the lobby
export function changeDisplay(username, num){

    // Changes the "lobby" div display
    document.getElementById(num.toString()).innerHTML = `<td>${num}.</td><td>${username}</td>`;

    // Pushes playerNum to alivePlayers
    if (!alivePlayers.includes(num.toString()))
        alivePlayers.push(num.toString());
}

// Handles the server message sent to the host indicating there are enough players
export function showStartGameButton(){

    // We show the startGameButton
    var startGameButton = document.getElementById("start-game-button");
    if (!startGameButton.classList.contains("show"))
        startGameButton.classList.toggle("show");

}

// Handles the server message sent indicating the host has started the game
export function startGameForAll(role){

    // Hide welcome menu
    var welcomeMenu = document.getElementById("play-menu");
    welcomeMenu.classList.toggle("show");

    // Extra check for startButton because host's start button is visible while others aren't
    // However the startButton needs to disappear for everyone
    var startButton = document.getElementById("start-game-button");
    if (startButton.classList.contains("show"))
        startButton.classList.toggle("show");

    // Shows the characterReveal menu by removing the "hide" attribute
    var characterReveal = document.getElementById("character-reveal");
    characterReveal.classList.toggle("show");

    document.getElementById("ready").classList.toggle("show");
    // Shows the player's role
    document.getElementById("role").innerHTML = `Your role is ${role}`;
    document.getElementById("your-role").innerHTML = `Your role is ${role}`;

    document.getElementById("history").classList.toggle("show");
    document.getElementById("see-your-role").classList.toggle("show");

}

// Handles the server message sent to the seer indicating it is now night
export function seerNight(){
    document.getElementById("character-reveal").classList.toggle("show");
    // Shows the seer menu by removing the "hide" attribute
    document.getElementById("seer-menu").classList.toggle("show");
    document.getElementById("seer-button").classList.toggle("show");
}

// Handles the server message sent to the seer indicating whether their input is good or bad
export function gotSeerResult(bad){

    // Displays message depending on whether the person is good or bad
    var seer_display = document.getElementById("seer-result");
    seer_display.innerHTML = (bad) ? "This person is bad!" : "This person is good!";
    document.getElementById("seer-button").classList.toggle("show");
}

export function goToNight(){
    document.getElementById("character-reveal").classList.toggle("show");
    document.getElementById("night-menu").classList.toggle("show");
}

export function wolfNight(){
    // shows the wolf menu
    document.getElementById("wolf-menu").classList.toggle("show");
    document.getElementById("chat-button").classList.toggle("show");
    document.getElementById("wolf-button").classList.toggle("show");
}

export function wolfChat(message){

    // shows the wolf menu

    document.getElementById("chat").innerHTML = message;
}

export function wolfNightEnd(){

    // 
    document.getElementById("wolf-menu").classList.toggle("show");
    document.getElementById("chat-button").classList.toggle("show");
    document.getElementById("wolf-button").classList.toggle("show");
}

export function gotKillResult(result, heal, poison){

    var potion_display = document.getElementById("potion");
    var potion_num = `You have ${heal} heal potion and ${poison} poison potion.`;
    potion_display.innerHTML = potion_num;

    var witch_display = document.getElementById("player-killed");
    witch_display.innerHTML = result;
    document.getElementById("witch-menu").classList.toggle("show");
    document.getElementById("heal-button").classList.toggle("show");
    document.getElementById("poison-button").classList.toggle("show");
    document.getElementById("skip-button").classList.toggle("show");
}

export function witchNightEnd(){

    document.getElementById("witch-menu").classList.toggle("show");
    document.getElementById("heal-button").classList.toggle("show");
    document.getElementById("poison-button").classList.toggle("show");
    document.getElementById("skip-button").classList.toggle("show");
}

export function deadLastNight(result){
    var display = document.getElementById("death");
    display.innerHTML = result;
    document.getElementById("dead-reveal").classList.toggle("show");
}

export function confirm_death_button(){
    document.getElementById("confirm-death-button").classList.toggle("show");
}
export function deathEnd(){
    document.getElementById("dead-reveal").classList.toggle("show");
}

export function gameover(winner){
    var display = document.getElementById("game-result");
    display.innerHTML = `${winner} wins.`;
    document.getElementById("game-over").classList.toggle("show");
}

export function shoot(poisoned){
    document.getElementById("hunter-menu").classList.toggle("show");
    if(poisoned){
        document.getElementById("poison-check").innerHTML = `Witch used poison on you. :(`;
        document.getElementById("hunter-no-button").classList.toggle("show");
        document.getElementById("shoot-input").classList.toggle("show");
        document.getElementById("shoot-button").classList.toggle("show");
    } else {
        document.getElementById("poison-check").innerHTML = `Witch didn't use poison on you. :)`;
    }
    
}

export function shootResult(result){
    var display = document.getElementById("shoot-result");
    display.innerHTML = result;
    document.getElementById("hunter-shoot").classList.toggle("show");
}

export function mayorMenu(){
    document.getElementById("mayor-successor-menu").classList.toggle("show");
}

export function mayorResult(result){
    var display = document.getElementById("mayor-successor-result");
    display.innerHTML = result;
    document.getElementById("mayor-successor").classList.toggle("show");
}
export function electionStart(){

    /* COMMENT THIS OUT THIS IS HERE ONLY FOR DEBUGGING
       Hides welcome menu, useful when looking to skip ahead to voting
    
    var welcomeMenu = document.getElementById("play-menu");
    welcomeMenu.classList.toggle("hide");
    */

    if (document.getElementById("night-menu").classList.contains("show"))
        document.getElementById("night-menu").classList.toggle("show");
    if (document.getElementById("seer-menu").classList.contains("show"))
        document.getElementById("seer-menu").classList.toggle("show");
    if (document.getElementById("character-reveal").classList.contains("show"))
        document.getElementById("character-reveal").classList.toggle("show");
    document.getElementById('election-choice-menu').classList.toggle("show");
    document.getElementById('yes-mayor').classList.toggle("show");
    document.getElementById('no-mayor').classList.toggle("show");
}

export function electionSpeechStart(speakingOrder){
    if (document.getElementById("election-choice-menu").classList.contains("show"))
        document.getElementById("election-choice-menu").classList.toggle("show");
    if (document.getElementById("mayor-reveal").classList.contains("show"))
        document.getElementById("mayor-reveal").classList.toggle("show");
    document.getElementById("election-speech-menu").classList.toggle("show");
    document.getElementById("speaking-order").innerHTML = speakingOrder;
}

export function show_mayor_button(){
    document.getElementById("start-mayor-vote-button").classList.toggle("show");
}

export function show_mayor_menu(){
    document.getElementById('history-display').innerHTML += "Final candidates: <br>" + document.getElementById('candidates').innerHTML + "<br>";
    document.getElementById('election-speech-menu').classList.toggle("show");
    document.getElementById("mayor-voting").classList.toggle("show");
    if (document.getElementById("wolf-reveal-button").classList.contains("show"))
        document.getElementById("wolf-reveal-button").classList.toggle("show");
    if (!document.getElementById("mayor-vote-button").classList.contains("show"))
        document.getElementById("mayor-vote-button").classList.toggle("show");
    currentMode = 0;
}

export function show_mayor_menu_candidate(){
    document.getElementById('history-display').innerHTML += "<br> Final candidates: <br>" + document.getElementById('candidates').innerHTML + "<br>";
    if (document.getElementById("election-speech-menu").classList.contains("show"))
        document.getElementById('election-speech-menu').classList.toggle("show");
    if (!document.getElementById("mayor-voting-candidate").classList.contains("show"))
        document.getElementById("mayor-voting-candidate").classList.toggle("show");
    if (document.getElementById("wolf-reveal-button").classList.contains("show"))
        document.getElementById("wolf-reveal-button").classList.toggle("show");
    if (document.getElementById("day-screen").classList.contains("show"))
        document.getElementById("day-screen").classList.toggle("show");
    if (document.getElementById("drop-out-button").classList.contains("show"))
        document.getElementById("drop-out-button").classList.toggle("show");
    currentMode = 0;
}

export function show_drop_out_button(){
    document.getElementById('drop-out-button').classList.toggle("show");
}

export function update_candidates(candidateString, candidateListSent){
    document.getElementById('candidates').innerHTML = candidateString;
    if (getInitialCandidates){
        document.getElementById('history-display').innerHTML += "<br> Initial candidates:<br>" + candidateString + "<br>";
        getInitialCandidates = false;
    }
    activeNominees = [...candidateListSent];
}

export function mayor_reveal(mayor_num, dead_num, mayor_vote_history){

    // make sure both mayor-voting and mayor-voting-candidate is hidden
    if (document.getElementById("mayor-voting").classList.contains("show"))
        document.getElementById("mayor-voting").classList.toggle("show");
    if (document.getElementById("drop-out-button").classList.contains("show"))
        document.getElementById("drop-out-button").classList.toggle("show");
    if (document.getElementById("start-mayor-vote-button").classList.contains("show"))
        document.getElementById("start-mayor-vote-button").classList.toggle("show");
    
    if (document.getElementById("mayor-voting-candidate").classList.contains("show"))
        document.getElementById("mayor-voting-candidate").classList.toggle("show");
    if (document.getElementById("election-speech-menu").classList.contains("show"))
        document.getElementById("election-speech-menu").classList.toggle("show");
    if (document.getElementById("wolf-reveal-button").classList.contains("show"))
        document.getElementById("wolf-reveal-button").classList.toggle("show");
    currentMode = 0;
    // show mayor-reveal
    document.getElementById('mayor-reveal').classList.toggle("show");
    document.getElementById('mayor-name').innerHTML = mayor_num;
    document.getElementById('history-display').innerHTML += mayor_num+ "<br>";
    document.getElementById('mayor-vote-list').innerHTML = mayor_vote_history;
    document.getElementById('history-display').innerHTML += mayor_vote_history + "<br>";
    
    var words = mayor_num.split(".");

    if (dead_num != 0){
        document.getElementById(dead_num.toString()).classList.toggle("dead");
    } else if (parseInt(words)!= 0) {
        console.log(parseInt(words));
        document.getElementById(words[0].toString()).classList.toggle("mayor");
    }
    
}

export function your_number(num){

    for (var i = 1; i <= 9; i ++){
        if (document.getElementById(i.toString()).classList.contains("me"))
            document.getElementById(i.toString()).classList.toggle("me");
    }
    // Updates lobby table, makes self blue
    document.getElementById(num.toString()).classList.toggle("me");
}

export function vote_reveal(reveal, vote_history){
    if (document.getElementById('day-screen').classList.contains("show"))
        document.getElementById('day-screen').classList.toggle("show");
    if (document.getElementById('vote-menu').classList.contains("show"))
        document.getElementById('vote-menu').classList.toggle("show");
    if (document.getElementById('mayor-voting-candidate').classList.contains("show"))
        document.getElementById('mayor-voting-candidate').classList.toggle("show");
    document.getElementById('vote-reveal').classList.toggle("show");
    document.getElementById('reveal').innerHTML = reveal ;
    document.getElementById('history-display').innerHTML += reveal + "<br>";
    document.getElementById('vote-history').innerHTML = vote_history;
    document.getElementById('history-display').innerHTML += vote_history + "<br>";
    

    var words = reveal.split(".");

    // Updates lobby table, makes dead people red
    if (parseInt(words) != 0){
        document.getElementById(words[0].toString()).classList.toggle("dead");

        // Removes the dead player from index.js's aliveplayer array
        var index = alivePlayers.indexOf(words[0].toString());
        if (index !== -1){
            alivePlayers.splice(index, 1);
        }
    }
    
}

export function wolf_mayor_reveal_button(){
    document.getElementById('wolf-reveal-button').classList.toggle("show");
    currentMode = 1;
}

export function reveal_move_to_day_button(){
    document.getElementById('move-to-day-button').classList.toggle("show");
}

export function move_to_day(){
    document.getElementById('mayor-reveal').classList.toggle("show");
    document.getElementById('day-screen').classList.toggle("show");
}

export function reveal_move_to_vote_button(){
    document.getElementById('move-to-vote-button').classList.toggle("show");
}

export function wolf_reveal_button(){
    document.getElementById('wolf-reveal-button').classList.toggle("show");
    currentMode = 2;
}

export function move_to_vote(tieList){
    if (document.getElementById('vote-reveal').classList.contains("show"))
        document.getElementById('vote-reveal').classList.toggle("show");
    if (document.getElementById('wolf-reveal-button').classList.contains("show"))
        document.getElementById('wolf-reveal-button').classList.toggle("show");
    currentMode = 0;
    document.getElementById('day-screen').classList.toggle("show");
    document.getElementById('vote-menu').classList.toggle("show");
    if (!document.getElementById('vote-button').classList.contains("show"))
        document.getElementById('vote-button').classList.toggle("show");
    if (tieList == null){
        console.log("tie list null");
        voteCheck = [...alivePlayers];
    } else {
        console.log("tie list not null");
        voteCheck = [...tieList];
    }
}

export function reveal_mayor_tie_button(){
    
    document.getElementById('move-to-mayor-tie-button').classList.toggle("show");
}

export function reveal_vote_tie_button(){
    document.getElementById('move-to-tie-button').classList.toggle("show");
}

export function player_disconnected(disconnectedNum){
    document.getElementById(disconnectedNum.toString()).classList.toggle("dead");
}