
import { connect, play, startGame } from "./networking"
import './style.css';

const playMenu = document.getElementById('play-menu');
const playButton = document.getElementById('play-button');
const usernameInput = document.getElementById('username-input');
const startGameButton = document.getElementById('start-game-button');


Promise.all([
    
]).then(() => {
    playButton.onclick = () => {
        var usernameInput = document.getElementById('username-input').value;
        play(usernameInput);
        console.log(usernameInput);
    };
    startGameButton.onclick = () => {
        startGame();
        console.log("Game has been started");
    };
    
})

export function changeDisplay(username){
    console.log("I'm clicked " + username);
    document.getElementById("lobby").innerHTML = username;
}

export function showStartGameButton(){
    console.log("You can start the game dude");
    var startGameButton = document.getElementById("start-game-button");
    if (startGameButton.classList.contains("hide"))
        startGameButton.classList.toggle("hide");
}

export function startGameForAll(role){
    console.log("we have started the game for all");
    var welcomeMenu = document.getElementById("play-menu");
    welcomeMenu.classList.toggle("hide");
    var startButton = document.getElementById("start-game-button");
    if (! startButton.classList.contains("hide"))
        startButton.classList.toggle("hide");
    var characterReveal = document.getElementById("character-reveal");
    characterReveal.classList.toggle("hide");
    document.getElementById("role").innerHTML = `Your role is ${role}`;
    console.log(role);
}
