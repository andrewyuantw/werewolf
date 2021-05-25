package PlayersAction;

public class God extends Player{
	private Boolean wolfOrNot;
	
	public God(){
		super();
		this.wolfOrNot = false;
	}
	
	public boolean getWolfOrNot() {
		return wolfOrNot;
	}
	
	public boolean GodOrNot() {
		return true;
	}
}
