import com.icesoft.faces.component.ext.HtmlSelectBooleanCheckbox;


public class TableItem 
{
	private String linkID;
	private String domain;
	private String category;
	private String constraints;
	private String itemID;
	private boolean toLink;
	private HtmlSelectBooleanCheckbox linkCheck;
	
	/**class that allows for creation of object collections for table column value
	 * attributes
	 */
	public TableItem(String inDomain, String inCategory, String inConstraints, String inID)
	{
		//list of parameters with initial values
		linkID = null;
		setDomain(inDomain);
		setCategory(inCategory);
		setConstraints(inConstraints);
		setItemID(inID);
		toLink = false;
		linkCheck = null;
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

	public void setLinkCheck(HtmlSelectBooleanCheckbox inLinkCheck) 
	{
		linkCheck = inLinkCheck;
	}

	public HtmlSelectBooleanCheckbox getLinkCheck() {
		return linkCheck;
	}
}