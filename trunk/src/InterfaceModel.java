import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import com.icesoft.faces.component.ext.HtmlCommandButton;
import com.icesoft.faces.component.ext.HtmlForm;
import com.icesoft.faces.component.ext.HtmlInputText;
import com.icesoft.faces.component.ext.HtmlOutputText;
import com.icesoft.faces.component.ext.HtmlPanelGrid;
import com.icesoft.faces.component.ext.HtmlPanelGroup;
import com.icesoft.faces.component.ext.HtmlSelectOneMenu;
import com.icesoft.faces.context.effects.JavascriptContext;

import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.event.AbortProcessingException;
import javax.faces.event.ActionEvent;
import javax.faces.event.ActionListener;

public class InterfaceModel
{
	/*Interface construction declarations*/
	private HtmlPanelGrid treeStructure;
	private InterfaceModelBuilder interfaceModelBuilder;
	private int idSuffix;
	
	public InterfaceModel(InputStream iStream)
	{
		//panelgrid recieves children in order
		treeStructure = new HtmlPanelGrid();
		treeStructure.setColumns(1);
		interfaceModelBuilder = new InterfaceModelBuilder(iStream);
		initializeInterface();
	}
	
	public HtmlPanelGrid getTreeStructure()
	{
		return treeStructure;
	}
	
	public void setTreeStructure(HtmlPanelGrid inStructure)
	{
		treeStructure = inStructure;
	}
	
	private void initializeInterface()
	{
		ElementMold[] rootNodes = interfaceModelBuilder.getRootNodes();
		for (int a = 0; a < rootNodes.length; a++)
		{
			if (rootNodes[a].getInputType().equals("button"))
			{
				CustomButtonNode nodeToAdd = buildButtonNode(rootNodes[a].getName(), null);
				treeStructure.getChildren().add(nodeToAdd);
				updateInterface();
			}
		}
	}
	
	private CustomButtonNode buildButtonNode(String btnName, CustomButtonNode parent)
	{
		CustomButtonNode newButton = new CustomButtonNode();
		newButton.setValue(btnName);
		newButton.addActionListener(new ActionListener(){
			public void processAction(ActionEvent e)throws AbortProcessingException 
			{
				buttonClicked(e);
			}	
		});
		if (parent != null)
		{
			newButton.setParentButton(parent);
			newButton.setWidth(parent.getWidth() - 15);
			newButton.setOffset(parent.getOffset() + 15);
		}
		else
		{
			newButton.setWidth(520);
			newButton.setOffset(0);
		}
		newButton.setStyle("width:" + newButton.getWidth() + "px; " +
						   "margin-left:" + newButton.getOffset() + "px;" +
				   		   "height:100%");
		newButton.setPartialSubmit(true);
		return newButton;
	}
	
	private HtmlSelectOneMenu buildSelectBox(String[] opts)
	{
		HtmlSelectOneMenu newMenu = new HtmlSelectOneMenu();
		return newMenu;
	}
	
	private HtmlInputText buildTextField(CustomButtonNode parent)
	{
		HtmlInputText text = new HtmlInputText();
		text.setStyle("margin-left:"+(parent.getOffset()+5)+"px;");
		return text;
	}
	
	public void buttonClicked (ActionEvent e)
	{
		CustomButtonNode currentButton = (CustomButtonNode)e.getSource();
		if (currentButton.isExpanded())
		{
			collapseNode(currentButton);
		}
		else
		{
			expandNode(currentButton);
		}
	}
	
	private void expandNode(CustomButtonNode button)
	{
		if (!button.isLoaded())
		{	
			int index = treeStructure.getChildren().indexOf(button);
			ElementMold[] fields = 
				interfaceModelBuilder.getChildrenOf(button.getValue().toString());
			for (int a = 0; a < fields.length; a++)
			{
				if (fields[a].getInputType().equals("button"))
				{
					CustomButtonNode newNode = this.buildButtonNode(fields[a].getName(), button);
					button.getChildren().add(newNode);
				}
				else if (fields[a].getInputType().equals("inputText"))
				{
					HtmlInputText newText = this.buildTextField(button);
					button.getChildren().add(newText);
				}
				else
				{
					HtmlOutputText newItem = new HtmlOutputText();
					newItem.setValue(fields[a].getName() + " " + fields[a].getInputType());
					newItem.setStyle("margin-left:"+(button.getOffset()+5)+"px;");
					button.getChildren().add(newItem);
				}
			}
			button.setLoaded(true);
			treeStructure.getChildren().addAll(index + 1, button.getChildren());
		}
		else
		{
			expandChildrenOf(button);
		}
		button.setExpanded(true);
		updateInterface();
	}
	
	
	private void expandChildrenOf(CustomButtonNode button)
	{
		int index = treeStructure.getChildren().indexOf(button);
		List children = button.getChildren();
		for (int a = 0; a < children.size(); a++)
		{
			treeStructure.getChildren().add(index + 1 + a, (UIComponent)children.get(a));
		}
		for (int a = 0; a < children.size(); a++)
		{
			Object curChild = children.get(a);
			if (curChild instanceof CustomButtonNode)
			{
				CustomButtonNode curButton = (CustomButtonNode) curChild;
				if (curButton.isExpanded())
				{
					this.expandChildrenOf(curButton);
				}
			}
		}
	}
	
	
	private void collapseNode(CustomButtonNode button)
	{
		this.removeAllChildrenOf(button);
		button.setExpanded(false);
		updateInterface();
	}
	
	private void removeAllChildrenOf(CustomButtonNode button)
	{
		List children = button.getChildren();
		for (int a = 0; a < children.size(); a++)
		{
			Object curChild = children.get(a);
			if (curChild instanceof CustomButtonNode)
			{
				removeAllChildrenOf((CustomButtonNode)curChild);
				//comment out when attempting recursive expansion
				//((CustomButtonNode)curChild).setExpanded(false);
			}
			treeStructure.getChildren().remove(curChild);
		}
	}
	
	private void updateInterface()
	{
		treeStructure.processUpdates(FacesContext.getCurrentInstance());
	}
}
