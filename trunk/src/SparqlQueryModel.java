import java.util.ArrayList;


public class SparqlQueryModel 
{
	private ArrayList inclusionCriteria;
	private ArrayList exclusionCriteria;
	
	private ArrayList prefices;
	private ArrayList fieldsToReturn;
	
	private TableItem maleItem;
	private TableItem femaleItem;
	private TableItem ageMinItem;
	private TableItem ageMaxItem;
	private ArrayList sdtmItems;
	private ArrayList doItems;
	
	private String prefixStatements;
	private String selectionStatement;
	private String criteriaStatement = "";
	private String optionalStatement;
	private String filterStatement;
	private String limitStatement;
	private int varNum;
	
	private int limit;
	
	public SparqlQueryModel()
	{
		inclusionCriteria = new ArrayList();
		exclusionCriteria = new ArrayList();
		
		prefices = new ArrayList();
		fieldsToReturn = new ArrayList();
		
		sdtmItems = new ArrayList();
		doItems = new ArrayList();
		
		prefices.add("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n");
		prefices.add("PREFIX sdtm: <http://www.sdtm.org/vocabulary#>\n");
		prefices.add("PREFIX spl: <http://www.hl7.org/v3ballot/xml/infrastructure/vocabulary/vocabulary#>\n");
		prefices.add("PREFIX do: <http://www.owl-ontologies/wm/DrugOntology.owl#>\n");
		fieldsToReturn.add("?patient");
		fieldsToReturn.add("?dob");
		fieldsToReturn.add("?sex");
		fieldsToReturn.add("?takes");
		fieldsToReturn.add("?indicDate");
		
		varNum = 0;
		
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
	
	public String getSelectionStatement()
	{
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
	
	public String getCriteriaStatement()
	{
		//sorts list into local variables
		readVariables();
		
		//standard query definition for the coi demo
		criteriaStatement  = "WHERE {\n";
		criteriaStatement += "?patient a sdtm:Patient ;\n";
		criteriaStatement += "           sdtm:middleName ?middleName ;\n";
		criteriaStatement += "           sdtm:dateTimeOfBirth ?dob ;\n";
		criteriaStatement += "           sdtm:sex ?sex .\n\n";
		
		//mapping all possible variable combinations: relationship declarations
		if (ageMinItem != null || ageMaxItem != null)
		{
			criteriaStatement += "           ?patient sdtm:hasAge ?age .\n";
		}
		int a;
		for (a = 0; a < sdtmItems.size(); a++)
		{
			TableItem item = (TableItem)sdtmItems.get(a);
			criteriaStatement += "           ?x" + a + " rdf:type sdtm:" + item.getCategory() + " .\n";
			criteriaStatement += "           ?x" + a + " sdtm:dosePerAdministration ?doseX" + a + " .\n";
		}
		int b;
		for (b = 0; b < doItems.size(); b++)
		{
			TableItem item = (TableItem)doItems.get(b);
			criteriaStatement += "           ?x" + (a + b) + " rdf:type do:" + item.getCategory() + " .\n";
			criteriaStatement += "           ?x" + (a + b) + " do:dose ?doseX" + (a + b) + " .\n";
		}
		//mapping all possible variable combinations:query construction
		
		boolean firstItem = true;
		criteriaStatement += "\n           FILTER ("; 
		
		if (maleItem != null && maleItem.getConstraints().equals("true"))
		{
			if (maleItem != null)
			{
				criteriaStatement += "(";
			}
			criteriaStatement += "?sex = \"Male\"";
			firstItem = false;
		}
		if (femaleItem != null && femaleItem.getConstraints().equals("true"))
		{
			if (firstItem == false)
			{
				criteriaStatement += " || ";
			}
			criteriaStatement += "?sex = \"Female\"";
			if (maleItem != null)
			{
				criteriaStatement += ")";
			}
			firstItem = false;
		}
		if (ageMinItem != null)
		{
			if (firstItem == false)
			{
				criteriaStatement += " && ";
			}
			criteriaStatement += "?age >= " + ageMinItem.getConstraints();
			firstItem = false;
		}
		if (ageMaxItem != null)
		{
			if (firstItem == false)
			{
				criteriaStatement += " && ";
			}
			criteriaStatement += "?age <= " + ageMaxItem.getConstraints();
			firstItem = false;
		}
		for (a = 0; a < sdtmItems.size(); a++)
		{
			TableItem item = (TableItem)sdtmItems.get(a);
			if (firstItem == false)
			{
				criteriaStatement += " && ";
			}
			criteriaStatement += "?doseX" + a + " " + item.getConstraints();
			firstItem = false;
		}
		for (b = 0; b < doItems.size(); b++)
		{
			TableItem item = (TableItem)doItems.get(b);
			if (firstItem == false)
			{
				criteriaStatement += " && ";
			}
			criteriaStatement += "?doseX" + (a + b) + " " + item.getConstraints();
			firstItem = false;
		}
		
		criteriaStatement += ") \n";
		criteriaStatement += "} \n";
		
		return criteriaStatement;
	}
	
	public String getLimitStatement()
	{
		return "LIMIT " + limit;
	}
	
	private void readVariables()
	{
		maleItem = null;
		femaleItem = null;
		ageMinItem = null;
		ageMaxItem = null;
		sdtmItems.clear();			
		doItems.clear();

		
		//sorts variables so there is less guesswork
		
		if (!inclusionCriteria.isEmpty())
		{
			for (int j = 0; j < inclusionCriteria.size(); j++)
			{
				TableItem curItem = ((TableItem)inclusionCriteria.get(j));
				if (curItem.getDomain().equals("sdtm"))
				{
					if (curItem.getCategory().equals("Male"))
					{
						maleItem = curItem;
					}
					else if (curItem.getCategory().equals("Female"))
					{
						femaleItem = curItem;
					}
					else if (curItem.getCategory().equals("ageMin"))
					{
						ageMinItem = curItem;
					}
					else if (curItem.getCategory().equals("ageMax"))
					{
						ageMaxItem = curItem;
					}
					else
					{
						sdtmItems.add(curItem);
					}
				}
				else
				{
					doItems.add(curItem);
				}
			}
		}
	}
}