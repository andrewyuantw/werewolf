package PlayersAction;

public class Villager extends Player{
	
	private Boolean wolfOrNot;
	private String identity;
	
	public Villager() {
		super();
		this.wolfOrNot = false;
		this.identity = "villager";
	}
	
	public boolean getWolfOrNot() {
		return wolfOrNot;
	}
	
	public String getIdentity() {
		return identity;
	}
	
	public boolean GodOrNot() {
		return false;
	}
}
