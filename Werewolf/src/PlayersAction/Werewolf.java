package PlayersAction;

public class Werewolf extends Player{
	private Boolean wolfOrNot;
	private String identity;
	
	public Werewolf() {
		super();
		this.wolfOrNot = true;
		this.identity = "werewolf";
	}
	
	public boolean getWolfOrNot() {
		return wolfOrNot;
	}
	
	public String getIdentity() {
		return identity;
	}
	
	public void kill(Player target) {
		target.dead();
	}
	
	public void boom() {
		this.dead();
	}
}
