import java.util.Arrays;
import java.util.ArrayList;
import java.util.Comparator;

import javax.faces.event.ValueChangeEvent;
import javax.faces.model.SelectItem;

/** a core model class that maintains the inclusion and exclusion tables, maintains the 
 *  SparqlQueryModel and manages links between table items
 */

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
	private int linkSuffix;
	private ArrayList inclLinks;
	private ArrayList exclLinks;
	
	public TablesBean(SparqlQueryModel queryModel)
	{
		inclItems = new ArrayList();
		exclItems = new ArrayList();
		model = queryModel;
		linkSuffix = 0;
		selectedLinkType = "AND";
		inclLinks = new ArrayList();
		exclLinks = new ArrayList();
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
	
	/*
	 * creates a link between different criteria in a table
	 */
	public void createLink()
	{
		TableItemLink newLink = new TableItemLink();
		
		// ensures the list will have items to check
		if (selectedList != null && selectedList.size() > 0)
		{
			ArrayList itemsToLink = new ArrayList();
			
			// iterates through all criteria, collecting those with a toLink value
			// of true
			for (int a = 0; a < selectedList.size(); a++)
			{
				TableItem currentItem = (TableItem)selectedList.get(a);
				if (currentItem.isToLink())
				{
					itemsToLink.add(currentItem);
				}
			}
			
			//if the collection of items to link has more than one item in it
			if (itemsToLink.size() > 1)
			{
				for (int b = 0; b < itemsToLink.size();b++)
				{
					//ensure that the original item is modified
					TableItem currentItem = 
						(TableItem)selectedList.get(selectedList.indexOf(itemsToLink.get(b)));
					newLink.getLinkItems().add(currentItem);
					if (selectedList.equals(inclItems))
					{
						currentItem.setLinkID(selectedLinkType + " " + 
											  linkSuffix + " ");
						currentItem.setToLink(false);
					}
					else
					{
						currentItem.setLinkID(selectedLinkType + " " + 
											  linkSuffix + " ");
						currentItem.setToLink(false);
					}
				}
				
				newLink.setLinkID(selectedLinkType + " " + linkSuffix + " ");
				newLink.setLinkType(selectedLinkType);
				linkSuffix++;
				//modifies the appropriate list
				if (selectedList.equals(inclItems))
				{
					inclLinks.add(newLink);
					
				}
				else 
				{	
					exclLinks.add(newLink);
				}
			}
		}
		sortTableItems();
		updateQueryModel();
	}
	
	/*
	 * the value change listener called when the link type is toggled
	 */
	public void linkTypeChanged(ValueChangeEvent e)
	{
		selectedLinkType = e.getNewValue().toString();
	}
	
	/*
	 * called whenever an item is deleted, links are updated to remove items that have
	 * been deleted and links with only one item are deleted
	 */
	private void cleanLinks(ArrayList linkList)
	{
		for (int i = 0; i < linkList.size(); i++)
		{	
			boolean linkStillValid = false;
			TableItemLink curLink = (TableItemLink) linkList.get(i);
			ArrayList curChildren = curLink.getLinkItems();
			for (int j = 0; j < curChildren.size(); j++)
			{
				TableItem curChild = (TableItem) curChildren.get(j);
				if (selectedList.contains(curChild))
				{
					linkStillValid = true;
				}
				else
				{
					curChildren.remove(curChild);
				}
			}
			if (curChildren.size() == 1)
			{
				((TableItem)curChildren.get(0)).setLinkID(null);
				linkStillValid = false;
			}
			if (linkStillValid == false)
			{
				linkList.remove(curLink);
			}
		}
	}
	
	/*
	 * creates a new TableItem and adds it to the appropriate criteria list
	 */
	public void addItem(String domain, String category, String criteria, String itemID)
	{
		selectedList.add(new TableItem(domain, category, criteria, itemID));
		sortTableItems();
		updateQueryModel();
	}
	
	/*
	 * changes the constraints value of the TableItem corresponding to the textbox
	 * that was altered
	 */
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
	
	/*
	 * changes the boolean flag of a criteria item
	 */
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
	
	/*
	 * deletes an item when its corresponding delete button is clicked
	 */
	public void deleteItemAt(String table, int index)
	{
		if (table.equals("inclTable"))
		{
			TableItem itemToDelete = ((TableItem)inclItems.get(index));
			inclItems.remove(itemToDelete);
			this.cleanLinks(inclLinks);
		}
		else
		{
			TableItem itemToDelete = ((TableItem)exclItems.get(index));
			exclItems.remove(itemToDelete);
			this.cleanLinks(exclLinks);
		}
		sortTableItems();
		updateQueryModel();
	}
	
	/*
	 * clears a table when a reset button is clicked
	 */
	public void clearTable()
	{
		selectedList.clear();
		sortTableItems();
		updateQueryModel();
	}
	
	/*
	 * updates the query model when criteria are added or removed
	 */
	private void updateQueryModel()
	{
		sortTableItems();
		model.setInclusionList(inclItems);
		model.setExclusionList(exclItems);
		model.setInclLinks(inclLinks);
		model.setExclLinks(exclLinks);
	}
	
	/*
	 * Used to sort both tables after criteria are added or removed
	 * 
	 * Items are converted from lists to arrays for sorting and the converted back to
	 * lists for easy manipulation
	 */
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
	
	/*
	 * TableItem comparator that was used in the past, may be useful in the future
	 * when a more appropriate sorting methodology is decided.
	 * 
	 * Enables the sorting of items based on domain and criteria priorities
	 */
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