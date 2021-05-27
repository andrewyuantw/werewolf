package PlayersAction;

import java.util.*;
import java.util.Map.Entry;

public class Board {

	private Map<Player, ArrayList<Integer>> votesList; //Player X has votes from {...}
	private Map<Player, Double> playerWithVotes; // Player x has n votes (type double).
	private ArrayList<Player> alivePlayers; // Players who are alive.
	private ArrayList<Player> skippedPlayers; // Players who skipped vote.
	private ArrayList<Player> lastNightDead; // List of players who died last night.
	private int wolfNum, villagerNum, godNum; // Number of werewolves, villagers, and gods. Used to determine win condition.
	
	public Board() {
		votesList = new HashMap<Player, ArrayList<Integer>>();
		playerWithVotes = new HashMap<Player, Double>();
		alivePlayers = new ArrayList<>();
		lastNightDead = new ArrayList<>();
		this.wolfNum = 0;
		this.villagerNum = 0;
		this.godNum = 0;
		
	}
	
	public int getWolfNum() {
		return this.wolfNum;
	}

	public int getVillagerNum() {
		return this.villagerNum;
	}

	public int getGodNum() {
		return this.godNum;
	}
	
	public void decreaseWolfNumber() {
		this.wolfNum--;
	}


	public void decreaseVillagerNumber() {
		this.villagerNum--;
	}

	public void decreaseGodNumber() {
		this.godNum--;
	}
	
	public void setNums(int wolfNumber, int villagerNumber, int godNumber) {
		this.wolfNum = wolfNumber;
		this.villagerNum = villagerNumber;
		this.godNum = godNumber;
	}
	
	// get an array of 9 unique numbers from 1-9
	public int[] shuffle() {
		// generate a List that contains the numbers 1 to 9
		ArrayList<Integer> digits = new ArrayList<Integer>(Arrays.asList(1,2,3,4,5,6,7,8,9));
		// shuffle the List
		Collections.shuffle(digits);
		
		int numbers[] = new int[9];
		for(int i=0;i<9;i++){
		    numbers[i] = digits.get(i);
		}
		
		return numbers;
	}
	
	// assign identities to players using shuffled random array
	public Player playerRandomizer(int digit) {
		switch(digit) {
			case 1:
			case 2:
			case 3:
				return new Villager();
			case 4:
				return new Seer();
			case 5:
				return new Witch();
			case 6:
				return new Hunter();
			case 7:
			case 8:
			case 9:
				return new Werewolf();
			
		}
		return null;
	}
	
	// add player to alive player list.
	public void addAlivePlayer(Player newPlayer) {
		alivePlayers.add(newPlayer);
		
		if(newPlayer instanceof Werewolf) {
			wolfNum++;
		}
		if(newPlayer instanceof Villager) {
			villagerNum++;
		}
		if(newPlayer instanceof God) {
			godNum++;
		}
	}
	
	// add player to alive player list.
	public void removeAlivePlayer(Player thePlayer) {
		alivePlayers.remove(thePlayer);
		
		if(thePlayer instanceof Werewolf) {
			wolfNum--;
		}
		if(thePlayer instanceof Villager) {
			villagerNum--;
		}
		if(thePlayer instanceof God) {
			godNum--;
		}
	}
	
	// used mainly for sheriff election, sometimes for tie votes pk
	public void addPlayerWithVotes(Player newPlayer) {
		ArrayList<Integer> votesFrom = new ArrayList<Integer>();
		playerWithVotes.put(newPlayer, 0.0);
		votesList.put(newPlayer, votesFrom);
	}
	
	// add all alive players, it is used for exile vote, not sheriff election.
	public void addAllAlivePlayers() {
		for(Player element : alivePlayers) {
			ArrayList<Integer> votesFrom = new ArrayList<Integer>();
			playerWithVotes.put(element, 0.0);
			votesList.put(element, votesFrom);
		}
	}
	
	public void updateElectionCandidates() {
		for(Player p : alivePlayers) {
			if(p.joinedElectionOrNot()) {
				addPlayerWithVotes(p);
			}
		}
	}
	
	
	
	// update votes after every player voted
	public void updateVotes() {		
		for(Entry<Player, Double> entry : playerWithVotes.entrySet()) {
			double votes = entry.getKey().getCurrVote();
			entry.setValue(votes);
			
		}
		
		for(Entry<Player, ArrayList<Integer>> entry : votesList.entrySet()) {
			int currPlayerNum = entry.getKey().getNumber();
			for(Player player : alivePlayers) {
				if(player.getVotedFor() == currPlayerNum) {
					entry.getValue().add(player.getNumber());
				}
			}
		}
		
		for(Player player : alivePlayers) {
			if(player.getVotedFor() == 0) {
				skippedPlayers.add(player);
			}
		}
	}
	
	// reset votes
	public void resetVotes() {
		for(Entry<Player, Double> entry : playerWithVotes.entrySet()) {
			entry.getKey().resetCurrVote();
			entry.getKey().resetVoted();
		}
		playerWithVotes.clear();
		votesList.clear();
	}
	
	public ArrayList<Player> compareVotes() {
		double max = 0;
		ArrayList<Player> resultPlayers = new ArrayList<Player>();
		
		//find the highest vote number
		for(Double vote : playerWithVotes.values()) { 
			if(vote > max) {
				max = vote;
			}
		}
		
		//add all players who has highest vote number to ArrayList
		for(Entry<Player, Double> entry : playerWithVotes.entrySet()) {
			if(entry.getValue() == max) {
				resultPlayers.add(entry.getKey());
			}
		}
		
		return resultPlayers;
	}
	
	public boolean tieCheck(ArrayList<Player> result) {
		if(result.size() > 1) {
			return true;
		} else {
			return false;
		}
	}
	
	public void tieVotesSetUp(ArrayList<Player> ties) {
		resetVotes();
		for(Player element : ties) {
			addPlayerWithVotes(element);
		}
		

	}
	
	public void revealVotes() {
		for(Entry<Player, ArrayList<Integer>> entry : votesList.entrySet()) {
			Player curr = entry.getKey();
			ArrayList<Integer> votesFrom = entry.getValue();
			
			System.out.print(curr + " has votes from: ");
			for(Integer number : votesFrom) {
				System.out.print(number + " ");
			}
			System.out.println();
		}
		
		System.out.print("Players skipped: ");
		for(Player player : skippedPlayers) {
			System.out.print(player.getNumber() + " ");
		}
		System.out.println();
	}
	
	
	
	
	// display the result of sheriff election
	public void electionResult(ArrayList<Player> result) {
		revealVotes();
		if(result.size() != 1) {
			System.out.println("No one becomes sheriff.");
		} else {
			System.out.println(result.get(0) + " becomes sheriff.");
			electedSheriff(result.get(0));
		}
	}
	
	// display the result of exile
	public void exileResult(ArrayList<Player> result) {
		revealVotes();
		if(result.size() != 1) {
			System.out.println("No one is exiled.");
		} else {
			System.out.println(result.get(0) + " is exiled.");
			removeAlivePlayer(result.get(0));
		}
	}
	
	// used when the first sheriff is elected or the sheriff dies and needs to give the badge to someone else
	public void electedSheriff(Player newSheriff) {
		newSheriff.setSheriff();
	}
	
	// get players died last night and update alive players
	public void deadLastNight() {
		for(Player element : alivePlayers) {
			if(element.getAliveStatus() == false) {
				lastNightDead.add(element);
				removeAlivePlayer(element);
			}
			
		}
	}
	
	// display the message about players died last night
	public void deadLastNightMessage() {
		System.out.print("Last night dead: ");
		for(Player dead : lastNightDead) {
			System.out.print(dead.getNumber() + " ");
		}
		System.out.println();
	}
	
	
	// check if the game is over based on the number of identities
	public boolean gameOver() {
		if(this.wolfNum == 0|| this.villagerNum == 0 || this.godNum == 0) {
			return true;
		}
		return false;
	}
	
	// display game over message 
	// note that werewolf win condition always comes first
	// this might be used every time the number of alive player is decreased
	public void gameOverMessage() {
		if(gameOver()) {
			System.out.println("Game Over");
			if(this.villagerNum == 0 || this.godNum == 0) {
				System.out.println("Werewolves win!");
			} else if(this.wolfNum == 0){
				System.out.println("Good people win!");
			}
		}
	}

}
