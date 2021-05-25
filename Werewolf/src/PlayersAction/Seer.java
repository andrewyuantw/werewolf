package PlayersAction;

public class Seer extends God{
	private Boolean wolfOrNot;
	private String identity;
	
	public Seer() {
		super();
		this.wolfOrNot = false;
		this.identity = "seer";
	}
	
	public boolean getWolfOrNot() {
		return wolfOrNot;
	}
	
	public String getIdentity() {
		return identity;
	}
	
	public boolean checkPlayer(Player target) {
		return target.getWolfOrNot();
	}
}
