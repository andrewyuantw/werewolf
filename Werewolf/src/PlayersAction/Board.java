package PlayersAction;

import java.util.*;

public class Board {

	private Map<Integer, ArrayList<Integer>> votesList;
	private Map<Player, Double> playerList;
	private int wolfNum, villagerNum, godNum;
	
	public Board() {
		votesList = new HashMap<Integer, ArrayList<Integer>>();
		playerList = new HashMap<Player, Double>();
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
	
	public void setNums(int wolfNumber, int villagerNumber, int godNumber) {
		this.wolfNum = wolfNumber;
		this.villagerNum = villagerNumber;
		this.godNum = godNumber;
	}
	
	public int[] shuffle() {
		// generate a List that contains the numbers 0 to 9
		ArrayList<Integer> digits = new ArrayList<Integer>(Arrays.asList(1,2,3,4,5,6,7,8,9));
		// shuffle the List
		Collections.shuffle(digits);
		// take the first 4 elements of the List
		int numbers[] = new int[9];
		for(int i=0;i<9;i++){
		    numbers[i] = digits.get(i);
		}
		
		return numbers;
	}
	
	public Player playerRandomizer(int digit) throws Exception {
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
			default:
				throw new Exception("Something went wrong");
		}
	}
	
	public void addPlayer() {
		
	}
	
	public int compareVotes() {
		return 1;
	}
	
	public void displayVoteResult() {
		
	}
	
	public void deadLastNight() {
		
	}
	
	public boolean gameOver() {
		if(this.wolfNum == 0|| this.villagerNum == 0 || this.godNum == 0) {
			return true;
		}
		return false;
	}
	
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
