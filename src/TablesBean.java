import java.util.Arrays;
import java.util.ArrayList;
import java.util.Comparator;

import javax.faces.component.UIInput;
import javax.faces.context.FacesContext;
import javax.faces.event.ValueChangeEvent;
import javax.faces.model.SelectItem;

import com.icesoft.faces.component.ext.HtmlDataTable;
import com.icesoft.faces.component.ext.HtmlSelectBooleanCheckbox;
import com.icesoft.faces.component.ext.HtmlSelectOneRadio;
import com.icesoft.faces.context.effects.JavascriptContext;


public class TablesBean 
{
	private ArrayList inclItems;
	private ArrayList exclItems;
	private ArrayList selectedList;
	private boolean inclusionSelected;
	
	private SparqlQueryModel model;
	
	private SelectItem[] linkRadioButtons;
	private String selectedLinkType;
	private String[] radioItemLabels = {"AND","OR"};
	private int inclLinkSuffix;
	private int exclLinkSuffix;
	
	public TablesBean(SparqlQueryModel queryModel)
	{
		inclItems = new ArrayList();
		exclItems = new ArrayList();
		model = queryModel;
		inclLinkSuffix = 0;
		exclLinkSuffix = 0;
		selectedLinkType = "AND";
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
	
	public String getSelectedLinkType()
	{
		return selectedLinkType;
	}
	
	public SelectItem[] getLinkRadioButtons()
	{
	    String[] names = radioItemLabels;
		linkRadioButtons = new SelectItem[names.length];
		for (int a = 0; a < names.length; a++)
		{
			linkRadioButtons[a] = new SelectItem();
			linkRadioButtons[a].setLabel(names[a]);
			linkRadioButtons[a].setValue(names[a]);
		}
		return linkRadioButtons;
	}
	
	public void createLink()
	{
		if (selectedList != null && selectedList.size() > 0)
		{
			ArrayList itemsToLink = new ArrayList();
			for (int a = 0; a < selectedList.size(); a++)
			{
				TableItem currentItem = (TableItem)selectedList.get(a);
				if (currentItem.isToLink())
				{
					itemsToLink.add(currentItem);
				}
			}
			if (itemsToLink.size() > 0)
			{
				for (int b = 0; b < itemsToLink.size();b++)
				{
					TableItem currentItem = (TableItem)itemsToLink.get(b);
					if (selectedList.equals(inclItems))
					{
						currentItem.setLinkID(selectedLinkType + " " + 
											  inclLinkSuffix + " ");
						currentItem.setToLink(false);
					}
					else
					{
						currentItem.setLinkID(selectedLinkType + " " + 
											  exclLinkSuffix + " ");
						currentItem.setToLink(false);
					}
				}
				if (selectedList.equals(inclItems))
				{
					inclLinkSuffix++;
				}
				else 
				{
					exclLinkSuffix++;
				}
			}
		}
		sortTableItems();
		updateQueryModel();
	}
	
	public void linkTypeChanged(ValueChangeEvent e)
	{
		selectedLinkType = e.getNewValue().toString();
	}
	
	public void addItem(String domain, String category, String criteria, String itemID)
	{
		selectedList.add(new TableItem(domain, category, criteria, itemID));
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
	
	public void changeToLinkAt(String tableName, int rowIndex)
	{
		if (tableName.equals("inclTable"))
		{
			TableItem thisItem = (TableItem)inclItems.get(rowIndex);
			thisItem.setToLink(!thisItem.isToLink());
		}
		else
		{
			TableItem thisItem = (TableItem)exclItems.get(rowIndex);
			thisItem.setToLink(!thisItem.isToLink());
		}
	}
	
	public void deleteItemAt(String table, int index)
	{
		if (table.equals("inclTable"))
		{
			TableItem itemToDelete = ((TableItem)inclItems.get(index));
			inclItems.remove(itemToDelete);
		}
		else
		{
			TableItem itemToDelete = ((TableItem)exclItems.get(index));
			exclItems.remove(itemToDelete);
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
	
	private void debug(String message)
	{
		JavascriptContext.addJavascriptCall(FacesContext.getCurrentInstance(), 
											"alert('" + message + "');");
	}
	
	private class TableItemComparator implements Comparator
	{
		public int compare(Object obj1, Object obj2)
		{
			TableItem item1 = (TableItem) obj1;
			TableItem item2 = (TableItem) obj2;
			if (item1.getLinkID()!=null && item2.getLinkID() == null)
			{
				return -1;
			}
			else if (item1.getLinkID()== null && item2.getLinkID() != null)
			{
				return 1;
			}
			else if (item1.getLinkID()!= null && item2.getLinkID() != null)
			{
				if (item1.getLinkID().equals(item2.getLinkID()))
				{
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
						return item1.getCategory().compareToIgnoreCase(item2.getCategory());
					}
					else
					{
						return item1.getCategory().compareToIgnoreCase(item2.getCategory());
					}
				}
				else
				{
					return item1.getLinkID().compareToIgnoreCase(item2.getLinkID());
				}
			}
			else //(both link id's are null)
			{
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
					return item1.getCategory().compareToIgnoreCase(item2.getCategory());
				}
				else
				{
					return item1.getCategory().compareToIgnoreCase(item2.getCategory());
				}
			}
		}
	}
}