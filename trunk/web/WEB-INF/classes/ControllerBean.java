import javax.faces.event.ActionEvent;
import javax.faces.event.ValueChangeEvent;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;

import com.icesoft.faces.component.ext.HtmlInputText;
import com.icesoft.faces.component.ext.HtmlSelectBooleanCheckbox;
import com.icesoft.faces.component.ext.HtmlCommandButton;
import com.icesoft.faces.component.ext.HtmlCommandLink;
import com.icesoft.faces.component.ext.HtmlDataTable;
import com.icesoft.faces.component.ext.UIColumn;
import com.icesoft.faces.component.tree.IceUserObject;
import com.icesoft.faces.component.tree.Tree;
import com.icesoft.faces.context.effects.Effect;
import com.icesoft.faces.context.effects.Fade;
import com.icesoft.faces.context.effects.Highlight;
import com.icesoft.faces.context.effects.Opacity;


public class ControllerBean 
{
	private SDTMTreeModel sdtmTreeModel;
	private DOTreeModel doTreeModel;
	private TablesBean tableModel;
	private SparqlQueryModel queryModel;
	private Effect fadeOut;
	
	public ControllerBean()
	{
		sdtmTreeModel = new SDTMTreeModel();
		doTreeModel = new DOTreeModel();
		tableModel = new TablesBean();
		queryModel = new SparqlQueryModel();
	}
	
	public Effect getFadeOut()
	{
		return fadeOut;
	}
	
	public SDTMTreeModel getsdtmTreeModel()
	{
		return sdtmTreeModel;
	}
	
	public DOTreeModel getdoTreeModel()
	{
		return doTreeModel;
	}
	
	public TablesBean getTableModel()
	{
		return tableModel;
	}
	
	public SparqlQueryModel getQueryModel()
	{
		return queryModel;
	}
	
	public void setInclusion(ActionEvent e)
	{
		tableModel.setInclusion();
		fadeOut = new Fade();
	}
	
	public void setExclusion(ActionEvent e)
	{
		tableModel.setExclusion();
		fadeOut = new Fade();
	}
	
	public void constraintsChanged(ValueChangeEvent e)
	{
		HtmlInputText edited = (HtmlInputText) e.getSource();
		HtmlDataTable table = (HtmlDataTable) edited.getParent().getParent();
		int index = table.getRowIndex();
		String tableName = table.getId();
		String newText = (String) e.getNewValue();
		tableModel.changeConstraintsAt(newText, tableName, index);
	}
	
	public void deleteRow(ActionEvent e)
	{
		HtmlCommandButton deleteBtn = (HtmlCommandButton) e.getSource();
		HtmlDataTable table = (HtmlDataTable) deleteBtn.getParent().getParent();
		String tableName = table.getId();
		int index = table.getRowIndex();
		tableModel.deleteItemAt(tableName, index);
	}
	
	public void maleClicked(ValueChangeEvent e)
	{
		HtmlSelectBooleanCheckbox maleToggle = (HtmlSelectBooleanCheckbox) e.getSource();
		boolean checked = maleToggle.isSelected();
		String isChecked;
		if (checked)
		{
			isChecked = "true";
		}
		else
		{
			isChecked = "false";
		}
		tableModel.toggleSex("Male", isChecked);
	}
	
	public void femaleClicked(ValueChangeEvent e)
	{
		HtmlSelectBooleanCheckbox femaleToggle = (HtmlSelectBooleanCheckbox) e.getSource();
		boolean checked = femaleToggle.isSelected();
		String isChecked;
		if (checked)
		{
			isChecked = "true";
		}
		else
		{
			isChecked = "false";
		}
		tableModel.toggleSex("Female", isChecked);
	}
	
	public void setAgeMin (ActionEvent e)
	{
		HtmlInputText ageMinText = (HtmlInputText) e.getSource();					
		String constraints = (String) ageMinText.getValue();
		tableModel.setAgeMin(constraints);
	}
	
	public void setAgeMax (ActionEvent e)
	{
		HtmlInputText ageMaxText = (HtmlInputText) e.getSource();
		String constraints = (String) ageMaxText.getValue();
		tableModel.setAgeMax(constraints);
	}
	
	public void expandSDTMTreeModel(ActionEvent e)
    {
    	Tree tree = (Tree) e.getSource();
  
    	DefaultMutableTreeNode exNode = tree.getNavigatedNode();
    	if (tree.getNavigationEventType().equals("expand"))
    	{
    		if (sdtmTreeModel.getNodesLoaded().contains(exNode) == false)
    		{
    			sdtmTreeModel.expandModel(exNode);
    		}
    	}
    }
	
	public void sdtmTreeNodeSelected(ActionEvent e)
	{
		HtmlCommandLink link = (HtmlCommandLink) e.getSource();
		String nodeText = link.getValue().toString();
		sdtmTreeModel.setSelectedNodeText(nodeText);
	}
	
	public void sdtmApplyBtnPress(ActionEvent e)
	{
		String domain = "SDTM";
		String category = sdtmTreeModel.getSelectedNodeText();
		String constraints = "";
		tableModel.addItem(domain, category, constraints);
	}
	
	public void expandDOTreeModel(ActionEvent e)
    {
    	Tree tree = (Tree) e.getSource();
  
    	DefaultMutableTreeNode exNode = tree.getNavigatedNode();
    	if (tree.getNavigationEventType().equals("expand"))
    	{
    		if (doTreeModel.getNodesLoaded().contains(exNode) == false)
    		{
    			doTreeModel.expandModel(exNode);
    		}
    	}
    }
	
	public void doTreeNodeSelected(ActionEvent e)
	{
		HtmlCommandLink link = (HtmlCommandLink) e.getSource();
		String nodeText = link.getValue().toString();
		doTreeModel.setSelectedNodeText(nodeText);
	}
	
	public void doApplyBtnPress(ActionEvent e)
	{
		String domain = "DO";
		String category = doTreeModel.getSelectedNodeText();
		String constraints = "";
		tableModel.addItem(domain, category, constraints);
	}
	
	public void clearTable(ActionEvent e)
	{
		tableModel.clearTable();
	}
}
