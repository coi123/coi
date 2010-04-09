import java.util.ArrayList;
import java.util.List;

import javax.faces.component.UIComponent;

import com.icesoft.faces.component.ext.HtmlCommandButton;

public class CustomButtonNode extends HtmlCommandButton
{
	private List children;
	private boolean expanded;
	private boolean loaded;
	private CustomButtonNode parent;
	private int width;
	private int offset;
	
	public CustomButtonNode()
	{
		super();
		children = new ArrayList();
		setExpanded(false);
		setLoaded(false);
		setParentButton(null);
		width = 0;
		setOffset(0);
	}
	
	public List getChildren()
	{
		return children;
	}
	
	public void setChildren(ArrayList childList)
	{
		children = childList;
	}
	
	public boolean isExpanded()
	{
		return expanded;
	}
	
	public void setExpanded(boolean value)
	{
		expanded = value;
	}
	
	public boolean isLoaded()
	{
		return loaded;
	}
	
	public void setLoaded(boolean value)
	{
		loaded = value;
	}

	public void setParentButton(CustomButtonNode inParent)
	{
		parent = inParent;
	}
	
	public CustomButtonNode getParentButton()
	{
		return parent;
	}
	
	public void setWidth(int inWidth) 
	{
		width = inWidth;
	}

	public int getWidth() 
	{
		return width;
	}
	
	public void setOffset(int inOffset) 
	{
		offset = inOffset;
	}

	public int getOffset() 
	{
		return offset;
	}
	
}
