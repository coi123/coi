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
	private ArrayList sdtmInItems;
	private ArrayList doInItems;
	private ArrayList sdtmExItems;
	private ArrayList doExItems;
	
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
		
		sdtmInItems = new ArrayList();
		doInItems = new ArrayList();
		sdtmExItems = new ArrayList();
		doExItems = new ArrayList();
		
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
		for (a = 0; a < sdtmInItems.size(); a++)
		{
			TableItem item = (TableItem)sdtmInItems.get(a);
			criteriaStatement += "           ?x" + a + " rdf:type sdtm:" + item.getCategory() + " .\n";
			criteriaStatement += "           ?x" + a + " sdtm:dosePerAdministration ?doseX" + a + " .\n";
		}
		int b;
		for (b = 0; b < doInItems.size(); b++)
		{
			TableItem item = (TableItem)doInItems.get(b);
			criteriaStatement += "           ?x" + (a + b) + " rdf:type do:" + item.getCategory() + " .\n";
			criteriaStatement += "           ?x" + (a + b) + " do:dose ?doseX" + (a + b) + " .\n";
		}
		int c;
		for (c = 0; c < sdtmExItems.size(); c++)
		{
			TableItem item = (TableItem)sdtmExItems.get(c);
			criteriaStatement += "           ?x" + (a + b + c) + " rdf:type do:" + item.getCategory() + " .\n";
			criteriaStatement += "           ?x" + (a + b + c) + " do:dose ?doseX" + (a + b + c) + " .\n";
		}
		int d;
		for (d = 0; d < doExItems.size(); d++)
		{
			TableItem item = (TableItem)doExItems.get(d);
			criteriaStatement += "           ?x" + (a + b + c + d) + " rdf:type do:" + item.getCategory() + " .\n";
			criteriaStatement += "           ?x" + (a + b + c + d) + " do:dose ?doseX" + (a + b + c + d) + " .\n";
		}
		//mapping all possible variable combinations:query construction
		
		boolean firstItem = true;
		criteriaStatement += "\n           FILTER ("; 
		
		if (maleItem != null && maleItem.getConstraints().equals("true"))
		{
			if (femaleItem != null && femaleItem.getConstraints().equals("true"))
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
			if (maleItem != null && maleItem.getConstraints().equals("true"))
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
		for (a = 0; a < sdtmInItems.size(); a++)
		{
			TableItem item = (TableItem)sdtmInItems.get(a);
			if (firstItem == false)
			{
				criteriaStatement += " && ";
			}
			if (item.getConstraints().contains("<"))
			{
				criteriaStatement += "(";
			}
			criteriaStatement += "?doseX" + a + " " + item.getConstraints();
			firstItem = false;
			if (item.getConstraints().contains("<"))
			{
				criteriaStatement += " || !bound (?x" + a + "))";
			}
		}
		for (b = 0; b < doInItems.size(); b++)
		{
			TableItem item = (TableItem)doInItems.get(b);
			if (firstItem == false)
			{
				criteriaStatement += " && ";
			}
			if (item.getConstraints().contains("<"))
			{
				criteriaStatement += "(";
			}
			criteriaStatement += "?doseX" + (a + b) + " " + item.getConstraints();
			firstItem = false;
			if (item.getConstraints().contains("<"))
			{
				criteriaStatement += " || !bound (?x" + ( a + b ) + "))";
			}
		}
		for (c = 0; c < sdtmExItems.size(); c++)
		{
			TableItem item = (TableItem)sdtmExItems.get(c);
			if (firstItem == false)
			{
				criteriaStatement += " && ";
			}
			if (item.getConstraints().contains(">"))
			{
				criteriaStatement += "(";
			}
			criteriaStatement += "!(?doseX" + (a + b + c) + " " + item.getConstraints() + ")";
			firstItem = false;
			if (item.getConstraints().contains(">"))
			{
				criteriaStatement += " || !bound (?x" + ( a + b + c ) + "))";
			}
		}
		for (d = 0; d < doExItems.size(); d++)
		{
			TableItem item = (TableItem)doExItems.get(d);
			if (firstItem == false)
			{
				criteriaStatement += " && ";
			}
			if (item.getConstraints().contains(">"))
			{
				criteriaStatement += "(";
			}
			criteriaStatement += "!(?doseX" + (a + b + c + d) + " " + item.getConstraints() + ")";
			firstItem = false;
			if (item.getConstraints().contains(">"))
			{
				criteriaStatement += " || !bound (?x" + ( a + b + c + d ) + "))";
			}
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
		sdtmInItems.clear();			
		doInItems.clear();
		sdtmExItems.clear();			
		doExItems.clear();

		
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
						sdtmInItems.add(curItem);
					}
				}
				else
				{
					doInItems.add(curItem);
				}
			}
		}
		if (!exclusionCriteria.isEmpty())
		{
			for (int k = 0; k < exclusionCriteria.size(); k++)
			{
				TableItem curItem = ((TableItem)exclusionCriteria.get(k));
				if (curItem.getDomain().equals("sdtm"))
				{
					sdtmExItems.add(curItem);
				}
				else
				{
					doExItems.add(curItem);
				}
			}
		}
	}
}