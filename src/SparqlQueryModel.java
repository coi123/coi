
public class SparqlQueryModel 
{
	private String prefixs;
	private String fieldsToReturn;
	private String selectStatement;
	private String criteria;
	private String whereStatement;
	private String constraints;
	private String filterStatement;
	private int limit;
	private String limitStatement;
	
	public SparqlQueryModel()
	{
		prefixs        = "PREFIX sdtm: <http://www.sdtm.org/vocabulary#>\n" +
				         "PREFIX spl: <http://www.hl7.org/v3ballot/xml/infrastructure/vocabulary/vocabulary#>\r\n";
		fieldsToReturn = "?patient ?dob ?sex ?takes ?indicDate ";
		criteria       = "?patient a sdtm:Patient .\n" +
				         "         sdtm:middleName ?middleName ;\n" +
				         "         sdtm:dateTimeOfBirth ?dob ;\n" +
				         "         sdtm:sex ?sex .\n";
		constraints    = null;
		limit = 30;
	}
	
	public String getPrefixs()
	{
		return prefixs;
	}
	
	public String getSelectStatement()
	{
		if (fieldsToReturn != null)
		{
			selectStatement = "SELECT " + fieldsToReturn + "\n";
		}
		else 
		{
			selectStatement = "";
		}
		selectStatement = filterOutput(selectStatement);
		return selectStatement;
	}
	
	public String getWhereStatement()
	{
		if (criteria != null)
		{
			whereStatement = "WHERE {\n" + 
							  criteria +
							  getFilterStatement() + "}\n";
		}
		else
		{
			whereStatement = "";
		}
		whereStatement = filterOutput(whereStatement);
		return whereStatement;
	}
	
	public String getFilterStatement()
	{
		if (constraints != null)
		{
			filterStatement = "FILTER " + constraints + "\n";
		}
		else
		{
			filterStatement = "";
		}
		filterStatement = filterOutput(filterStatement);
		return filterStatement;
	}
	
	public String getLimitStatement()
	{
		if (limit != -1)
		{
			limitStatement = "LIMIT " + limit;
		}
		else
		{
			limitStatement = "";
		}
		limitStatement = filterOutput(limitStatement);
		return limitStatement;
	}
	
	private String filterOutput(String inString)
	{
		String outString = inString;
		//outString = outString.replaceAll("\n", "&lt;br/&gt;");
		return outString;
	}
}