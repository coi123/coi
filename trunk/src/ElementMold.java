import java.util.ArrayList;


public class ElementMold 
{
	private String inputType;
	private String name;
	private String[] options;
	private ArrayList optionsList;
	private String text;
	
	public ElementMold()
	{
		inputType = null;
		name = null;
		optionsList = new ArrayList();
		text = "";
	}
	
	public ElementMold(String inName, String type)
	{
		name = inName;
		inputType = type;
		optionsList = new ArrayList();
	}
	
	public String getName()
	{
		return name;
	}
	
	public void setName(String value)
	{
		name = value;
	}
	
	public String getInputType()
	{
		return inputType;
	}
	
	public void setInputType(String value)
	{
		inputType = value;
	}
	
	public void addOption(String option)
	{
		optionsList.add(option);
	}
	
	public String[] getOptions()
	{
		options = new String[optionsList.size()];
		for (int a = 0; a < options.length; a++)
		{
			options[a] = optionsList.get(a).toString();
		}
		return options;
	}
	
	public void setText(String value)
	{
		text = value;
	}
	
	public String getText()
	{
		return text;
	}
	
}
