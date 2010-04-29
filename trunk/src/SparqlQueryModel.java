import java.util.ArrayList;

/** the model used to generate the SPARQL query from user-selected criteria
 */

public class SparqlQueryModel 
{
	private ArrayList inclusionCriteria;
	private ArrayList exclusionCriteria;
	
	private ArrayList prefices;
	private ArrayList fieldsToReturn;
	
	private ArrayList inclLinks;
	private ArrayList exclLinks;
	private ArrayList unlinkedInclItems;
	private ArrayList unlinkedExclItems;
	
	private String prefixStatements;
	private String selectionStatement;
	private String criteriaStatement = "";
	private String limitStatement;
	int varIncrementer = 0;
	
	private boolean previousStatements = false;
	
	private ArrayList paramsDefined;
	
	private int limit;
	
	/*
	 * defines common prefices and specifies which fields will be returned
	 */
	public SparqlQueryModel()
	{
		inclusionCriteria = new ArrayList();
		exclusionCriteria = new ArrayList();
		
		inclLinks = new ArrayList();
		exclLinks = new ArrayList();
		unlinkedInclItems = new ArrayList();
		unlinkedExclItems = new ArrayList();
		
		paramsDefined = new ArrayList();
		
		prefices = new ArrayList();
		fieldsToReturn = new ArrayList();
			
		prefices.add("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n");
		prefices.add("PREFIX sdtm: <http://www.sdtm.org/vocabulary#>\n");
		prefices.add("PREFIX spl: <http://www.hl7.org/v3ballot/xml/infrastructure/vocabulary/vocabulary#>\n");
		prefices.add("PREFIX do: <http://www.owl-ontologies/wm/DrugOntology.owl#>\n");
		fieldsToReturn.add("?patient");
		fieldsToReturn.add("?dob");
		fieldsToReturn.add("?sex");
		fieldsToReturn.add("?takes");
		fieldsToReturn.add("?indicDate");
		
		limit = 30;
	}
	
	public void setInclusionList(ArrayList arr)
	{
		inclusionCriteria = arr;
	}
	
	public void setExclusionList(ArrayList arr)
	{
		exclusionCriteria = arr;
	}
	

	public void setInclLinks(ArrayList inclLinks) {
		this.inclLinks = inclLinks;
	}

	public ArrayList getInclLinks() {
		return inclLinks;
	}

	public void setExclLinks(ArrayList exclLinks) {
		this.exclLinks = exclLinks;
	}

	public ArrayList getExclLinks() {
		return exclLinks;
	}
	
	/*
	 * generates the single string containing the prefixes for the query
	 */	
	public String getPrefixStatements()
	{
		prefixStatements = "";
		if (!prefices.isEmpty())
		{
			for(int i = 0; i < prefices.size(); i++)
			{
				prefixStatements += prefices.get(i);
			}
			prefixStatements += "\n";
		}
		return prefixStatements;
	}
	
	/*
	 * generates the single string containing the SELECT statement for the query
	 */
	public String getSelectionStatement()
	{
		paramsDefined.clear();
		selectionStatement = "";
		if (!fieldsToReturn.isEmpty())
		{
			selectionStatement = "SELECT ";
			for (int a = 0; a < fieldsToReturn.size(); a++)
			{
				selectionStatement += fieldsToReturn.get(a).toString() + " ";
			}
		}
		return selectionStatement;
	}
	
	/*
	 * generates the single string containing the entire criteria description for the 
	 * query
	 */
	public String getCriteriaStatement()
	{
		previousStatements = false;
		varIncrementer = 0;
		//sorts list into local variables
		readVariables();
		
		//standard query definition for the coi demo
		criteriaStatement  = "WHERE {\n";
		criteriaStatement += "?patient a sdtm:Patient ;\n";
		criteriaStatement += "           sdtm:middleName ?middleName ;\n";
		criteriaStatement += "           sdtm:dateTimeOfBirth ?dob ;\n";
		criteriaStatement += "           sdtm:sex ?sex .\n\n";
		
		//defines all variables
		
		defineVars(inclusionCriteria);
		defineVars(exclusionCriteria);
		
		criteriaStatement += "\n";
		
		// represents all criteria provided
		if (inclLinks.size() > 0         ||
			exclLinks.size() > 0         ||
			unlinkedInclItems.size() > 0 ||
			unlinkedExclItems.size() > 0 )
		{
			criteriaStatement += "FILTER (";
			
			//links are represented first, followed by unlinked items
			
			representLinks(inclLinks);
			representLinks(exclLinks);
			
			addUnlinkedItems(unlinkedInclItems);
			addUnlinkedItems(unlinkedExclItems);
			
			criteriaStatement += ") \n\n";
			
		}
		criteriaStatement += "} \n\n";
		
		return criteriaStatement;
	}
	
	private void defineVars(ArrayList tableItems)
	{
		for (int i = 0; i < tableItems.size(); i++)
		{
			//divides definitions based on the type of criteria provided
			TableItem curItem = (TableItem) tableItems.get(i);
			//sdtm items differ in method of definition
			if (curItem.getDomain().equals("sdtm"))
			{
				//it is an age variable and is handled in a particular manner
				if (curItem.getCategory().equals("ageMin") ||
					curItem.getCategory().equals("ageMax"))
				{
					if (shouldDefine(curItem.getCategory()))
					{
						criteriaStatement += "?patient sdtm:hasAge ?age .\n";
					}
					curItem.setQueryVar("?age");
				}
				// it is a qualitative demographic variable
				else if (!(curItem.getConstraints().contains("<")||
					  curItem.getConstraints().contains(">")||
					  curItem.getConstraints().contains("=")))
				{
					if (shouldDefine(curItem.getCategory()))
					{
						criteriaStatement += "?patient sdtm:" + curItem.getCategory() + " ?" + 
											 curItem.getCategory().toLowerCase() + " . \n";
					}
					curItem.setQueryVar("?" + curItem.getCategory().toLowerCase());
				}
				else //it is a quantitative value from the tree
				{
					if (shouldDefine(curItem.getCategory()))
					{
						criteriaStatement += "?x" + varIncrementer + " rdf:type sdtm:" +
										 	 curItem.getCategory() + " . \n";
						criteriaStatement += "?x" + varIncrementer + 
					                     	 " sdtm:dosePerAdministration ?doseX" + 
					                     	 varIncrementer + " . \n";
						curItem.setQueryVar("?doseX" + varIncrementer);
						varIncrementer++;
					}
					else
					{
						searchListsForVar(inclusionCriteria, curItem);
						searchListsForVar(exclusionCriteria, curItem);
					}
				}
			}
			//DO items are all defined in the same manner
			
			else // it is a DO entry
			{
				if (shouldDefine(curItem.getCategory()))
				{
					criteriaStatement += "?x" + varIncrementer + " rdf:type do:" +
					 					 curItem.getItemID() + " . \n";
					criteriaStatement += "?x" + varIncrementer + " do:dose ?doseX" + 
	                   					 varIncrementer + " . \n";
					curItem.setQueryVar("?doseX" + varIncrementer);
					varIncrementer++;
				}
				else
				{
					searchListsForVar(inclusionCriteria, curItem);
					searchListsForVar(exclusionCriteria, curItem);
				}
			}
		}
	}
	
	/*
	 * searches lists to ensure duplicate variables aren't defined
	 */
	private void searchListsForVar(ArrayList arr, TableItem item)
	{
		for (int a = 0; a < arr.size() && item.getQueryVar() == null; a++)
		{
			TableItem compareItem = (TableItem) arr.get(a);
			if(compareItem.getCategory().equals(item.getCategory()))
			{
				item.setQueryVar(compareItem.getQueryVar());
				break;
			}
		}
	}
	
	/*
	 * represents all linked relationships among the criteria
	 */
	private void representLinks(ArrayList tableLinks)
	{
		for (int a = 0; a < tableLinks.size(); a++)
		{
			// checks for conditions that entail additional info before the constraint
			// statement
			TableItemLink link = (TableItemLink)tableLinks.get(a);
			if (previousStatements)
			{
				criteriaStatement += " && ";
			}
			if (tableLinks.equals(exclLinks))
			{
				criteriaStatement += "!";
			}
			criteriaStatement += "(";
			String linkType = link.getLinkType();
			ArrayList linkItems = link.getLinkItems();
			
			for (int b = 0; b < linkItems.size(); b++)
			{
				// checks for the presence of previous items that entail an additional
				// boolean operator
				if (b > 0 && linkType.equals("AND"))
				{
					criteriaStatement += " && ";
				}
				else if (b > 0 && linkType.equals("OR"))
				{
					criteriaStatement += " || ";
				}
				TableItem item = (TableItem) linkItems.get(b);
				
				//populates the constraint statement
				populateStatement(item, tableLinks);
				
				previousStatements = true;
			}
			criteriaStatement += " )";
		}
	}
	
	private void addUnlinkedItems(ArrayList items)
	{
		//*Need to add bound statements depending on inclusion or exclusion statements
		for (int a = 0; a < items.size(); a++)
		{
			// checks for the presence of previous items that entail an additional
			// boolean operator
			if (previousStatements)
			{
				criteriaStatement += " && ";
			}
			if (items.equals(unlinkedExclItems))
			{
				criteriaStatement += "!(";
			}
			TableItem item = (TableItem)items.get(a); 
			
			//populates the constraint statement
			populateStatement(item, items);
			
			if (items.equals(unlinkedExclItems))
			{
				criteriaStatement += ")";
			}
			previousStatements = true;
		}
	}
	
	private void populateStatement(TableItem item, ArrayList list)
	{
		//creates the constraint statement based on the type of constraint
		if (item.getCategory().contains("ageMin"))
		{
			criteriaStatement += item.getQueryVar() + " > " + item.getConstraints();
		}
		else if (item.getCategory().contains("ageMax"))
		{
			criteriaStatement += item.getQueryVar() + " < " + item.getConstraints();
		}
		else if (!(item.getConstraints().contains("<")||
				  item.getConstraints().contains(">")||
				  item.getConstraints().contains("=")))
		{
			if (item.getConstraints() != null && item.getConstraints() != "")
			{
				criteriaStatement += item.getQueryVar() + " = \"" + item.getConstraints() + "\"";
			}
			else
			{
				criteriaStatement += "bound(" + item.getQueryVar() + ")";
			}
			
		}
		else
		{
			criteriaStatement += item.getQueryVar() + " " + item.getConstraints();
			if ((list.equals(inclLinks)||list.equals(unlinkedInclItems))&&
				 item.getConstraints().contains("<"))
			{
				criteriaStatement += " && !bound(" + item.getQueryVar() + ")";
			}
			else if ((list.equals(exclLinks)||list.equals(unlinkedExclItems))&&
					  !item.getConstraints().contains("<"))
			{
				criteriaStatement += " && !bound(" + item.getQueryVar() + ")";
			}
		}
	}
	
	/*
	 * generates the limit statement
	 */
	public String getLimitStatement()
	{
		limitStatement = "LIMIT " + limit;
		return limitStatement;
	}
	
	/*
	 * reads in variables to collections to reduce guessing later
	 */
	private void readVariables()
	{
		paramsDefined.clear();
		unlinkedInclItems.clear();
		unlinkedExclItems.clear();
		
		for (int a = 0; a < inclusionCriteria.size(); a++)
		{
			TableItem item = (TableItem)inclusionCriteria.get(a);

			if(item.getLinkID() == null)
			{
				unlinkedInclItems.add(item);
			}
		}
		for (int b = 0; b < exclusionCriteria.size(); b++)
		{
			TableItem item = (TableItem)exclusionCriteria.get(b);

			if(item.getLinkID() == null)
			{
				unlinkedExclItems.add(item);
			}
		}
	}
	
	/*
	 * checks if a particular item should be defined
	 */
	private boolean shouldDefine(String itemCategory)
	{
		if (!paramsDefined.contains(itemCategory))
		{
			paramsDefined.add(itemCategory);
			return true;
		}
		else
		{
			return false;
		}
	}
}