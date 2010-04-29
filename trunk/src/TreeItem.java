

/** a utility class containing fields needed in the construction of ice:tree models
 */

public class TreeItem 
{
	private String itemID;
	private String parentID;
	private String itemLabel;
	
	public TreeItem(String itemID, String parentID, String itemLabel)
	{
		setItemID(itemID);
		setParentID(parentID);
		setLabel(itemLabel);
	}
	
	public String getItemID()
	{
		return itemID;
	}
	
	public void setItemID(String value)
	{
		itemID = value;
	}
	
	public String getParentID()
	{
		return parentID;
	}
	
	public void setParentID(String value)
	{
		parentID = value;
	}
	
	public String getLabel()
	{
		return itemLabel;
	}
	
	public void setLabel(String value)
	{
		itemLabel = value;
	}
}
