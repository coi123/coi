import java.util.ArrayList;

public class TableItemLink 
{
	private ArrayList linkItems;
	private String linkID;
	private String linkType;
	
	public TableItemLink()
	{
		linkItems = new ArrayList();
		linkID = null;
	}

	public void setLinkItems(ArrayList linkItems) {
		this.linkItems = linkItems;
	}

	public ArrayList getLinkItems() {
		return linkItems;
	}

	public void setLinkID(String linkID) {
		this.linkID = linkID;
	}

	public String getLinkID() {
		return linkID;
	}

	public void setLinkType(String linkType) {
		this.linkType = linkType;
	}

	public String getLinkType() {
		return linkType;
	}
	
	
}
