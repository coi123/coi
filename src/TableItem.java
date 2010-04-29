	
/**class that allows for creation of object collections for table column value
 * attributes and query model population
 */

public class TableItem 
{
	private String linkID;
	private String domain;
	private String category;
	private String constraints;
	private String itemID;
	private boolean toLink;
	private String queryVar;
	

	public TableItem(String inDomain, String inCategory, String inConstraints, String inID)
	{
		//list of parameters with initial values
		setLinkID(null);
		setDomain(inDomain);
		setCategory(inCategory);
		setConstraints(inConstraints);
		setItemID(inID);
		setToLink(false);
	}
	
	/*
	 * getters and setters for the fields of the object
	 */
	public void setLinkID(String inLinkID) 
	{
		linkID = inLinkID;
	}

	public String getLinkID() 
	{
		return linkID;
	}

	public String getDomain()
	{
		return domain;
	}
	
	public void setDomain(String value)
	{
		domain = value;
	}
	
	public String getCategory()
	{
		return category;
	}
	
	public void setCategory(String value)
	{
		category = value;
	}
	
	public String getConstraints()
	{
		return constraints;
	}
	
	public void setConstraints(String value)
	{
		constraints = value;
	}
	
	public String getItemID()
	{
		return itemID;
	}
	
	public void setItemID(String value)
	{
		itemID = value;
	}

	public void setToLink(boolean inToLink) 
	{
		toLink = inToLink;
	}

	public boolean isToLink() 
	{
		return toLink;
	}

	public void setQueryVar(String queryVar) {
		this.queryVar = queryVar;
	}

	public String getQueryVar() {
		return queryVar;
	}
}