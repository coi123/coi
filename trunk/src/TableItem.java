
public class TableItem 
{
	private String domain;
	private String category;
	private String constraints;
	
	public TableItem(String inDomain, String inCategory, String inConstraints)
	{
		setDomain(inDomain);
		setCategory(inCategory);
		setConstraints(inConstraints);
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
}