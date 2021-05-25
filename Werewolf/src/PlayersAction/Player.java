package PlayersAction;
import java.util.*;
public abstract class Player{
	
	private static int nextNumber=1;
	private boolean alive;
	private int  number = 0;
	private double currVote;
	private boolean voted;
	private boolean joinElection;
	private boolean sheriff;
	private int votedFor;
	
	public Player() {
		this.number = nextNumber;
		this.alive = true;
		this.currVote = 0;
		this.voted = false;
		this.joinElection = false;
		this.sheriff = false;
		this.votedFor = 0;
		nextNumber++;
	}
	
	public void joinElection() {
		this.joinElection = true;
		this.voted = true;
	}
	
	public void vote(Player target) {
		if(sheriff) {
			target.currVote += 1.5;
		} else {
			target.currVote++; 
		}//enter 0? to skip vote
		
		this.voted = true;
		this.votedFor = target.getNumber();
	}
	
	public int getNumber() {
		return number;
	}
	
	public boolean getAliveStatus() {
		return alive;
	}
	
	public double getCurrVote() {
		return currVote;
	}
	
	public boolean VotedOrNot() {
		return voted;
	}
	
	public boolean sheriffOrNot() {
		return sheriff;
	}
	
	public boolean joinedElectionOrNot() {
		return joinElection;
	}
	
	public int getVotedFor() {
		return votedFor;
	}
	
	public String voteMessage() {
		return this.number + " voted for " + this.votedFor;
	}
	
	public void dead() {
		this.alive = false;
	}
	
	public void changeAliveStatus() {
		this.alive = !alive;
	}
	
	public abstract boolean getWolfOrNot();
}
