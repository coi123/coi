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
import javax.faces.component.UISelectItem;
import javax.faces.context.FacesContext;
import javax.faces.event.AbortProcessingException;
import javax.faces.event.ActionEvent;
import javax.faces.event.ActionListener;
import javax.faces.event.ValueChangeEvent;
import javax.faces.event.ValueChangeListener;

public class InterfaceModel
{
	/*Interface construction declarations*/
	private HtmlPanelGrid treeStructure;
	private InterfaceModelBuilder interfaceModelBuilder;
	private HtmlPanelGroup currentPanel;
	private int treeButtonIncr;
	
	public InterfaceModel(InputStream iStream)
	{
		//panelgrid receives children in order
		treeStructure = new HtmlPanelGrid();
		treeStructure.setColumns(1);
		interfaceModelBuilder = new InterfaceModelBuilder(iStream);
		currentPanel = null;
		treeButtonIncr = 0;
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
	
	public HtmlPanelGroup getCurrentPanel()
	{
		return currentPanel;
	}
	
	public void setCurrentPanel(HtmlPanelGroup curGroup)
	{
		currentPanel = curGroup;
	}
	
	// returns the current value pair contained in the panelgroup
	public String getCurrentPanelChildValue(int childIndex)
	{
		Object obj = currentPanel.getChildren().get(childIndex);
		String returnStr = "";
		if (obj instanceof HtmlSelectOneMenu)
		{
			HtmlSelectOneMenu menu = (HtmlSelectOneMenu) obj;
			returnStr = menu.getValue().toString();
		}
		else if (obj instanceof HtmlInputText)
		{
			HtmlInputText text = (HtmlInputText) obj;
			returnStr = text.getValue().toString();
		}
		else if (obj instanceof HtmlOutputText)
		{
			HtmlOutputText text = (HtmlOutputText) obj;
			returnStr = text.getValue().toString();
		}
		return returnStr;
	}
	
	private void initializeInterface()
	{
		ElementMold[] rootNodes = interfaceModelBuilder.getRootNodes();
		for (int a = 0; a < rootNodes.length; a++)
		{
			if (rootNodes[a].getInputType().equals("button"))
			{
				CustomButtonNode nodeToAdd = buildButtonNode(rootNodes[a].getName(), null);
				nodeToAdd.setLoaded(false);
				nodeToAdd.setExpanded(false);
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
		//TODO: better to redesign interface model to support a CSS class with
		//relative positioning for the offset
		newButton.setStyle("width:" + newButton.getWidth() + "px; " +
						   "margin-left:" + newButton.getOffset() + "px;" +
				   		   "height:100%");
		newButton.setPartialSubmit(true);
		newButton.setId("treeButton" + treeButtonIncr);
		treeButtonIncr++;
		return newButton;
	}
	
	private HtmlSelectOneMenu buildSelectBox(String[] opts, CustomButtonNode parent)
	{
		HtmlSelectOneMenu newMenu = new HtmlSelectOneMenu();
		for (int a = 0; a < opts.length; a++)
		{
			UISelectItem item = new UISelectItem();
			item.setItemValue(opts[a]);
			newMenu.getChildren().add(item);
		}
		newMenu.setStyle("margin-left:" + (parent.getOffset() + 5) + "px;");
		newMenu.addValueChangeListener(new ValueChangeListener(){
			public void processValueChange(ValueChangeEvent e)
				throws AbortProcessingException 
			{
				valueChanged(e);
			}
		});
		newMenu.setPartialSubmit(true);
		return newMenu;
	}
	
	private HtmlInputText buildInputTextField(CustomButtonNode parent)
	{
		HtmlInputText text = new HtmlInputText();
		text.setStyle("margin-left:"+(parent.getOffset()+5)+"px;");
		text.addValueChangeListener(new ValueChangeListener(){
			public void processValueChange(ValueChangeEvent e)
			throws AbortProcessingException 
			{
				valueChanged(e);
			}
		});
		text.setPartialSubmit(true);
		return text;
	}
	
	private HtmlOutputText buildOutputTextField(String value, CustomButtonNode parent)
	{
		HtmlOutputText text = new HtmlOutputText();
		text.setValue(value);
		text.setStyle("margin-left:"+(parent.getOffset()+5)+"px;");
		return text;
	}
	
	public void buttonClicked(ActionEvent e)
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
	
	public void valueChanged(ValueChangeEvent e)
	{
		UIComponent curComp = e.getComponent();
		HtmlPanelGroup curPanel = (HtmlPanelGroup) curComp.getParent();
		currentPanel = curPanel;
	}
	
	// expands a node, updates its expansion state. updates its loaded state if
	// applicable and updates the panelGrid 
	private void expandNode(CustomButtonNode button)
	{
		//TODO: add an ordering attribute to the RDF file so the model returns the items
		//in proper order
		if (!button.isLoaded())
		{	
			int index = treeStructure.getChildren().indexOf(button);
			ElementMold[] fields = 
				interfaceModelBuilder.getChildrenOf(button.getValue().toString());
			HtmlPanelGroup childrenContainer = new HtmlPanelGroup();
			for (int a = 0; a < fields.length; a++)
			{
				if (fields[a].getInputType().equals("button"))
				{
					CustomButtonNode newNode = this.buildButtonNode(fields[a].getName(), button);
					button.getChildren().add(newNode);
				}
			}
			for (int a = 0; a < fields.length; a++)
			{
				if (fields[a].getInputType().equals("outputText"))
				{
					HtmlOutputText newText = 
						this.buildOutputTextField(fields[a].getText(),button);
					childrenContainer.getChildren().add(newText);
				}
			}
			for (int a = 0; a < fields.length; a++)
			{
				if (fields[a].getInputType().equals("selectInput"))
				{
					HtmlSelectOneMenu newSelector = 
						this.buildSelectBox(fields[a].getOptions(), button);
					childrenContainer.getChildren().add(newSelector);
				}
			}
			for (int a = 0; a < fields.length; a++)
			{
				if (fields[a].getInputType().equals("inputText"))
				{
					HtmlInputText newText = this.buildInputTextField(button);
					childrenContainer.getChildren().add(newText);
				}
			}
			if (childrenContainer.getChildCount() > 0)
			{
				button.getChildren().add(childrenContainer);
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
	
	//called when a component is being expanded that has expanded child button nodes
	private void expandChildrenOf(CustomButtonNode button)
	{
		int index = treeStructure.getChildren().indexOf(button);
		List children = button.getChildren();
		
		// inserts node items into the appropriate positions in the panelGrid 
		// children collection
		for (int a = 0; a < children.size(); a++)
		{
			treeStructure.getChildren().add(index + 1 + a, (UIComponent)children.get(a));
		}
		
		// checks every child, if it is a button and its expanded state is set to true,
		// recursively call the method to expand the child node
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
	
	//collapses the node, updates its expansion state and updates the panelGrid component
	private void collapseNode(CustomButtonNode button)
	{
		this.removeAllChildrenOf(button);
		button.setExpanded(false);
		updateInterface();
	}
	
	// removes all children of the button from the panelGrid to give the appearance
	// of the node collapsing
	private void removeAllChildrenOf(CustomButtonNode button)
	{
		List children = button.getChildren();
		
		// removes every child of the button from the panel grid.
		// If the node has child buttons that are also expanded, it recursively calls
		// itself to remove their children as well
		for (int a = 0; a < children.size(); a++)
		{
			Object curChild = children.get(a);
			if (curChild instanceof CustomButtonNode &&
				((CustomButtonNode)curChild).isExpanded())
			{
				removeAllChildrenOf((CustomButtonNode)curChild);
			}
			treeStructure.getChildren().remove(curChild);
		}
	}
	
	//necessary housekeeping method that executes updates to the interface
	private void updateInterface()
	{
		treeStructure.processUpdates(FacesContext.getCurrentInstance());
	}
}
