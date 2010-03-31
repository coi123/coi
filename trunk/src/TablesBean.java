import java.util.ArrayList;
import java.util.Comparator;

import javax.faces.event.ActionEvent;
import javax.faces.event.ValueChangeEvent;
import javax.swing.JTree;
import javax.swing.tree.DefaultMutableTreeNode;

import com.icesoft.faces.component.tree.IceUserObject;

import edu.emory.mathcs.backport.java.util.Arrays;

public class TablesBean 
{
	private ArrayList inclItems;
	private ArrayList exclItems;
	private ArrayList selectedList;
	private boolean inclusionSelected;
	
	private SparqlQueryModel model;
	
	public TablesBean(SparqlQueryModel queryModel)
	{
		inclItems = new ArrayList();
		exclItems = new ArrayList();
		model = queryModel;
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
		TableItem item = new TableItem("sdtm", sex, isChecked);
		selectedList.add(item);
		sortTableItems();
		updateQueryModel();
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
		TableItem item = new TableItem("sdtm", "ageMin", constraints);
		selectedList.add(item);
		sortTableItems();
		updateQueryModel();
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
		TableItem item = new TableItem("sdtm", "ageMax", constraints);
		selectedList.add(item);
		sortTableItems();
		updateQueryModel();
	}
	
	public void addItem(String domain, String category, String criteria)
	{
		selectedList.add(new TableItem(domain, category, criteria));
		sortTableItems();
		updateQueryModel();
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
		sortTableItems();
		updateQueryModel();
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
		sortTableItems();
		updateQueryModel();
	}
	
	public void clearTable()
	{
		selectedList.clear();
		sortTableItems();
		updateQueryModel();
	}
	
	private void updateQueryModel()
	{
		sortTableItems();
		model.setInclusionList(inclItems);
		model.setExclusionList(exclItems);
	}
	
	private void sortTableItems()
	{
		TableItemComparator comp = new TableItemComparator();
		TableItem[] arr1 = new TableItem[inclItems.size()];
		TableItem[] arr2 = new TableItem[exclItems.size()];
		for (int a = 0; a < arr1.length; a++)
		{
			arr1[a] = (TableItem) inclItems.get(a);
		}
		for (int a = 0; a < arr2.length; a++)
		{
			arr2[a] = (TableItem) exclItems.get(a);
		}
		
		Arrays.sort(arr1, comp);
		Arrays.sort(arr2, comp);
		for (int a = 0; a < inclItems.size(); a++)
		{
			inclItems.set(a, arr1[a]);
		}
		for (int a = 0; a < exclItems.size(); a++)
		{
			exclItems.set(a, arr2[a]);
		}
	}
	
	private class TableItemComparator implements Comparator
	{
		public int compare(Object obj1, Object obj2)
		{
			TableItem item1 = (TableItem) obj1;
			TableItem item2 = (TableItem) obj2;
			if(item1.getDomain().equals("sdtm") && item2.getDomain().equals("do"))
			{
				return -1;
			}
			else if(item1.getDomain().equals("do") && item2.getDomain().equals("sdtm"))
			{
				return 1;
			}
			else if(item1.getDomain().equals("sdtm") && item2.getDomain().equals("sdtm"))
			{
				if (item1.getCategory().equals("Male"))
				{
					return -1;
				}
				else if(item2.getCategory().equals("Male"))
				{
					return 1;
				}
				else if (item1.getCategory().equals("Female"))
				{
					return -1;
				}
				else if (item2.getCategory().equals("Female"))
				{
					return 1;
				}
				else if (item1.getCategory().equals("ageMin"))
				{
					return -1;
				}
				else if (item2.getCategory().equals("ageMin"))
				{
					return 1;
				}
				else if (item1.getCategory().equals("ageMax"))
				{
					return -1;
				}
				else if (item2.getCategory().equals("ageMax"))
				{
					return 1;
				}
				else
				{
					return item1.getCategory().compareToIgnoreCase(item2.getCategory());
				}
			}
			else
			{
				return item1.getCategory().compareToIgnoreCase(item2.getCategory());
			}
		}
	}
}