
public class TableItem 
{
	private String domain;
	private String category;
	private String constraints;
	private String itemID;
	
	public TableItem(String inDomain, String inCategory, String inConstraints, String inID)
	{
		setDomain(inDomain);
		setCategory(inCategory);
		setConstraints(inConstraints);
		setItemID(inID);
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
}