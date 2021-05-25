package PlayersAction;

public class Witch extends God{

	private String identity;
	private int heal;
	private int poison;
	
	public Witch() {
		super();
		this.identity = "witch";
		this.heal = 1;
		this.poison = 1;
	}
	
	public String getIdentity() {
		return identity;
	}
	
	public void revive(Player target) {
		target.changeAliveStatus();
		this.heal = 0;
	}
	
	public void poison(Player target) {
		target.dead();
		if(target instanceof Hunter) { //disable shoot ability if poisoned hunter
			((Hunter) target).poisoned();
		}
		this.poison = 0;
	}
	
	public boolean ableToHeal() {
		if(heal==1) {
			return true;
		}
		return false;
	}
	
	public boolean ableToPoison() {
		if(poison==1) {
			return true;
		}
		return false;
	}
}
