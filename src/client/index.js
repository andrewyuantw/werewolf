
import { connect, dropOutElection, enterUsername, getSeerChoice, getKillChoice, hostStartGame, mayorVote, moveToMayorVote, play, playerReady, readyToStart, runForMayorOrNot, seerLook, startGame, vote, wolfChatMessage, witchSkip, heal, poison, wolfMayorReveal, moveToDay, moveToVote, wolfReveal, getHunterChoice } from "./networking"
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
const yesMayorButton = document.getElementById('yes-mayor');
const noMayorButton = document.getElementById('no-mayor');
const startMayorVoteButton = document.getElementById('start-mayor-vote-button');
const dropoutButton = document.getElementById('drop-out-button');
const mayorVoteButton = document.getElementById('mayor-vote-button');
const voteButton = document.getElementById('vote-button');
const wolfMayorRevealButton = document.getElementById('wolf-mayor-reveal-button');
const moveToDayButton = document.getElementById('move-to-day-button');
const moveToVoteButton = document.getElementById('move-to-vote-button');
const wolfRevealButton = document.getElementById('wolf-reveal-button');






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
            playButton.classList.toggle("hide");
        }
    };

    // When the host clicks the START game button
    startGameButton.onclick = () => {
        hostStartGame();
        startGameButton.classList.toggle("hide");
    };

    // When players press READY after seeing their assigned role
    readyButton.onclick = () => {

        // We hide the button once it is clicked
        var readyButton = document.getElementById("ready");
        if (!readyButton.classList.contains("hide"))
            readyButton.classList.toggle("hide");

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
        if (numInput >= 1 && numInput <= 9)
            getSeerChoice(numInput);
    }

    // When the wolf has clicked confirm after inputting a player number 
    wolfButton.onclick = () => {

        // We get the number from the input box, and check if it is valid
       
        var numInput = document.getElementById('wolf-input').value;
        if (numInput >= 0 && numInput <= 9)
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
        document.getElementById("witch-menu").classList.toggle("hide");
    }

    // When the witch has clicked poison after inputting a player number 
    poisonButton.onclick = () => {

        // We get the number from the input box, and check if it is valid
        var numInput = document.getElementById('witch-input').value;
        if (numInput >= 1 && numInput <= 9)
            poison(numInput);
        document.getElementById("witch-menu").classList.toggle("hide");
    }

    // When the witch has clicked skip
    skipButton.onclick = () => {
        witchSkip();
        document.getElementById("witch-menu").classList.toggle("hide");
        
    }

    hunterNoButton.onclick = () => {

        document.getElementById("hunter-menu").classList.toggle("hide");
        hunterSkip();
    }

    hunterShootButton.onclick = () => {
        document.getElementById("hunter-menu").classList.toggle("hide");
        var numInput = document.getElementById('shoot-input').value;
        if (numInput >= 1 && numInput <= 9)
            getHunterChoice(numInput);
    }

    yesMayorButton.onclick = () =>{
        runForMayorOrNot(true);
        yesMayorButton.classList.toggle("hide");
        noMayorButton.classList.toggle("hide");
    }

    noMayorButton.onclick = () =>{
        runForMayorOrNot(false);
        yesMayorButton.classList.toggle("hide");
        noMayorButton.classList.toggle("hide");
    }

    startMayorVoteButton.onclick = () =>{
        startMayorVoteButton.classList.toggle("hide");
        moveToMayorVote();
    }

    dropoutButton.onclick = () =>{
        dropoutButton.classList.toggle("hide");
        dropOutElection();
    }

    mayorVoteButton.onclick = () =>{
        mayorVoteButton.classList.toggle("hide");
        var numInput = document.getElementById('mayor-input').value;
        if (numInput >= 0 && numInput <= 9)
            mayorVote(numInput);
    }

    voteButton.onclick = () =>{
        voteButton.classList.toggle("hide");
        var numInput = document.getElementById('vote-input').value;
        if (numInput >= 0 && numInput <= 9)
            vote(numInput);
    }

    wolfMayorRevealButton.onclick = () => {
        wolfMayorRevealButton.classList.toggle("hide");
        wolfMayorReveal();
    }

    moveToDayButton.onclick = () =>{
        moveToDayButton.classList.toggle("hide");
        moveToDay();
    }

    moveToVoteButton.onclick = () =>{
        moveToVoteButton.classList.toggle("hide");
        moveToVote();
    }

    wolfRevealButton.onclick = () =>{
        wolfRevealButton.classList.toggle("hide");
        wolfReveal();
    }
}) 

// Handles server message indicating a new person has joined the lobby
export function changeDisplay(username, num){

    // Changes the "lobby" div display
    document.getElementById(num.toString()).innerHTML = `<td>${num}.</td><td>${username}</td>`;
}

// Handles the server message sent to the host indicating there are enough players
export function showStartGameButton(){

    // We show the startGameButton
    var startGameButton = document.getElementById("start-game-button");
    if (startGameButton.classList.contains("hide"))
        startGameButton.classList.toggle("hide");

}

// Handles the server message sent indicating the host has started the game
export function startGameForAll(role){

    // Hide welcome menu
    var welcomeMenu = document.getElementById("play-menu");
    welcomeMenu.classList.toggle("hide");

    // Extra check for startButton because host's start button is visible while others aren't
    // However the startButton needs to disappear for everyone
    var startButton = document.getElementById("start-game-button");
    if (!startButton.classList.contains("hide"))
        startButton.classList.toggle("hide");

    // Shows the characterReveal menu by removing the "hide" attribute
    var characterReveal = document.getElementById("character-reveal");
    characterReveal.classList.toggle("hide");

    // Shows the player's role
    document.getElementById("role").innerHTML = `Your role is ${role}`;
}

// Handles the server message sent to the seer indicating it is now night
export function seerNight(){

    // Shows the seer menu by removing the "hide" attribute
    document.getElementById("seer-menu").classList.toggle("hide");
}

// Handles the server message sent to the seer indicating whether their input is good or bad
export function gotSeerResult(bad){

    // Displays message depending on whether the person is good or bad
    var seer_display = document.getElementById("seer-result");
    seer_display.innerHTML = (bad) ? "This person is bad!" : "This person is good!";
    document.getElementById("seer-button").classList.toggle("hide");
}

export function wolfNight(){

    // shows the wolf menu
    document.getElementById("wolf-menu").classList.toggle("hide");
}

export function wolfChat(message){

    // shows the wolf menu

    document.getElementById("chat").innerHTML = message;
}

export function wolfNightEnd(){

    // 
    document.getElementById("wolf-menu").classList.toggle("hide");
}

export function gotKillResult(result, heal, poison){

    var potion_display = document.getElementById("potion");
    var potion_num = `You have ${heal} heal potion and ${poison} poison.`;
    potion_display.innerHTML = potion_num;

    var witch_display = document.getElementById("player-killed");
    witch_display.innerHTML = result;
    document.getElementById("witch-menu").classList.toggle("hide");
}

export function witchNightEnd(){

    document.getElementById("witch-menu").classList.toggle("hide");
}

export function gameover(winner){
    var display = document.getElementById("game-result");
    display.innerHTML = `${winner} wins.`;
    document.getElementById("game-over").classList.toggle("hide");
}

export function shoot(poisoned){
    if(poisoned){
        document.getElementById("poison-check").innerHTML = `Witch used poison on you. :(`;
        document.getElementById("hunter-no-button").classList.toggle("hide");
        document.getElementById("shoot-input").classList.toggle("hide");
        document.getElementById("shoot-button").classList.toggle("hide");
    } else {
        document.getElementById("poison-check").innerHTML = `Witch didn't use poison on you. :)`;
    }
    document.getElementById("hunter-menu").classList.toggle("hide");
}

export function shootResult(result){
    var display = document.getElementById("shoot-result");
    display.innerHTML = result;
    document.getElementById("hunter-shoot").classList.toggle("hide");
}

export function electionStart(){

    /* COMMENT THIS OUT THIS IS HERE ONLY FOR DEBUGGING
       Hides welcome menu, useful when looking to skip ahead to voting
    
    var welcomeMenu = document.getElementById("play-menu");
    welcomeMenu.classList.toggle("hide");
    */

    document.getElementById('election-choice-menu').classList.toggle("hide");
}

export function electionSpeechStart(speakingOrder){
    document.getElementById('election-choice-menu').classList.toggle("hide");
    document.getElementById("election-speech-menu").classList.toggle("hide");
    document.getElementById("speaking-order").innerHTML = speakingOrder;
}

export function show_mayor_button(){
    document.getElementById("start-mayor-vote-button").classList.toggle("hide");
}

export function show_mayor_menu(){
    document.getElementById('election-speech-menu').classList.toggle("hide");
    document.getElementById("mayor-voting").classList.toggle("hide");
    if (!document.getElementById("wolf-mayor-reveal-button").classList.contains("hide"))
        document.getElementById("wolf-mayor-reveal-button").classList.toggle("hide");
}

export function show_mayor_menu_candidate(){
    document.getElementById('election-speech-menu').classList.toggle("hide");
    document.getElementById("mayor-voting-candidate").classList.toggle("hide");
    if (!document.getElementById("wolf-mayor-reveal-button").classList.contains("hide"))
        document.getElementById("wolf-mayor-reveal-button").classList.toggle("hide");
}

export function show_drop_out_button(){
    document.getElementById('drop-out-button').classList.toggle("hide");
}

export function update_candidates(candidateList){
    document.getElementById('candidates').innerHTML = candidateList;
}

export function mayor_reveal(mayor_num, dead_num){

    // make sure both mayor-voting and mayor-voting-candidate is hidden
    if (!document.getElementById("mayor-voting").classList.contains("hide"))
        document.getElementById("mayor-voting").classList.toggle("hide");
    if (!document.getElementById("mayor-voting-candidate").classList.contains("hide"))
        document.getElementById("mayor-voting-candidate").classList.toggle("hide");
    if (!document.getElementById("election-speech-menu").classList.contains("hide"))
        document.getElementById("election-speech-menu").classList.toggle("hide");
    if (!document.getElementById("wolf-mayor-reveal-button").classList.contains("hide"))
        document.getElementById("wolf-mayor-reveal-button").classList.toggle("hide");
    
    // show mayor-reveal
    document.getElementById('mayor-reveal').classList.toggle("hide");
    document.getElementById('mayor-name').innerHTML = mayor_num + " is now your mayor!";
    var words = mayor_num.split(".");

    if (dead_num != 0){
        document.getElementById(dead_num.toString()).classList.toggle("dead");
    } else if (parseInt(words)!= 0) {
        document.getElementById(words[0].toString()).classList.toggle("mayor");
    }
    
}

export function your_number(num){

    // Updates lobby table, makes self blue
    document.getElementById(num.toString()).classList.toggle("me");
}

export function start_vote(){
    document.getElementById('vote-menu').classList.toggle("hide");
}

export function vote_reveal(reveal){
    if (!document.getElementById('day-screen').classList.contains("hide"))
        document.getElementById('day-screen').classList.toggle("hide");
    document.getElementById('vote-reveal').classList.toggle("hide");
    document.getElementById('reveal').innerHTML = reveal + " is now DEAD...";
    var words = reveal.split(".");

    // Updates lobby table, makes dead people red
    if (parseInt(words) != 0)
        document.getElementById(words[0].toString()).classList.toggle("dead");
}

export function wolf_mayor_reveal_button(){
    document.getElementById('wolf-mayor-reveal-button').classList.toggle("hide");
}

export function reveal_move_to_day_button(){
    document.getElementById('move-to-day-button').classList.toggle("hide");
}

export function move_to_day(){
    document.getElementById('mayor-reveal').classList.toggle("hide");
    document.getElementById('day-screen').classList.toggle("hide");
}

export function reveal_move_to_vote_button(){
    document.getElementById('move-to-vote-button').classList.toggle("hide");
}

export function wolf_reveal_button(){
    document.getElementById('wolf-reveal-button').classList.toggle("hide");
}

export function move_to_vote(){
    document.getElementById('day-screen').classList.toggle("hide");
    document.getElementById('vote-menu').classList.toggle("hide");
}

