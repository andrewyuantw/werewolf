package PlayersAction;

public class Hunter extends God{
	private String identity;
	private boolean shootable;
	
	public Hunter() {
		super();
		this.identity = "hunter";
		this.shootable = true;
	}
	
	
	public String getIdentity() {
		return identity;
	}
	
	public boolean getShootStatus() {
		return shootable;
	}
	
	public void poisoned() {
		shootable = false;
	}
	
	public void shoot(Player target) {
		target.dead();
	}
}
