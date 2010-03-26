import java.util.ArrayList;

import javax.faces.event.ActionEvent;
import javax.faces.event.ValueChangeEvent;
import javax.swing.JTree;
import javax.swing.tree.DefaultMutableTreeNode;

import com.icesoft.faces.component.tree.IceUserObject;

public class TablesBean 
{
	private ArrayList inclItems;
	private ArrayList exclItems;
	private ArrayList selectedList;
	private boolean inclusionSelected;
	
	public TablesBean()
	{
		inclItems = new ArrayList();
		exclItems = new ArrayList();
	}
	
	public void setInclusion()
	{
		selectedList = inclItems;
	}
	
	public void setExclusion()
	{
		selectedList = exclItems;
	}
	
	public ArrayList getInclItems()
	{
		return inclItems;
	}
	
	public ArrayList getExclItems()
	{
		return exclItems;
	}
	
	public void toggleSex(String sex, String isChecked)
	{
		for (int a = 0; a < selectedList.size(); a++)
		{
			if (((TableItem)selectedList.get(a)).getCategory().equals(sex))
			{
				((TableItem)selectedList.get(a)).setConstraints(isChecked);
				return;
			}
		}
		TableItem item = new TableItem("SDTM", sex, isChecked);
		selectedList.add(item);
	}
	
	public void setAgeMin(String constraints)
	{
		for (int a = 0; a < selectedList.size(); a++)
		{
			if (((TableItem)selectedList.get(a)).getCategory().equals("ageMin"))
			{
				((TableItem)selectedList.get(a)).setConstraints(constraints);
				return;
			}
		}
		TableItem item = new TableItem("SDTM", "ageMin", constraints);
		selectedList.add(item);
	}
	
	public void setAgeMax(String constraints)
	{
		for (int a = 0; a < selectedList.size(); a++)
		{
			if (((TableItem)selectedList.get(a)).getCategory().equals("ageMax"))
			{
				((TableItem)selectedList.get(a)).setConstraints(constraints);
				return;
			}
		}
		TableItem item = new TableItem("SDTM", "ageMax", constraints);
		selectedList.add(item);
	}
	
	public void addItem(String domain, String category, String criteria)
	{
		selectedList.add(new TableItem(domain, category, criteria));
	}
	
	public void changeConstraintsAt(String newText, String tableName, int rowIndex)
	{
		if (tableName.equals("inclTable"))
		{
			((TableItem)inclItems.get(rowIndex)).setConstraints(newText);
		}
		else
		{
			((TableItem)exclItems.get(rowIndex)).setConstraints(newText);
		}
	}
	
	public void deleteItemAt(String table, int index)
	{
		if (table.equals("inclTable"))
		{
			inclItems.remove(index);
		}
		else
		{
			exclItems.remove(index);
		}
	}
	
	public void clearTable()
	{
		selectedList.clear();
	}
}