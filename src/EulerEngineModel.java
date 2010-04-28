import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;

import javax.faces.context.FacesContext;
import javax.faces.model.SelectItem;

import com.icesoft.faces.context.effects.JavascriptContext;

import euler.EulerRunner;

public class EulerEngineModel 
{
	private String targetTempFile;
	private SelectItem[] prefixSelectItems;
	private String[] prefixLabels = {"prefix :", "prefix owl:", "prefix rdfs:", 
									 "prefix xsd:", "prefix math:", "prefix log:",
									 "prefix e:", "prefix var:", "prefix r:",
									 "prefix n3:"};
	private String[] prefixValues = {"@prefix : <http://www.owl-ontologies.com/2008/4/7/OntologySDTM.owl#>.",
									 "@prefix owl: <http://www.w3.org/2002/07/owl#>.",
									 "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.",
									 "@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.",
									 "@prefix math: <http://www.w3.org/2000/10/swap/math#>.",
									 "@prefix log: <http://www.w3.org/2000/10/swap/log#>.",
									 "@prefix e: <http://eulersharp.sourceforge.net/2003/03swap/log-rules#>.",
									 "@prefix var: <http://localhost/var#>.",
									 "@prefix r: <http://www.w3.org/2000/10/swap/reason#>.",
									 "@prefix n3: <http://www.w3.org/2004/06/rei#>."};
	
	private SelectItem[] langRadios;
	private String[] langRadioLabels = {"N3", "Prolog", " Backchain Only Prolog", "SEM",
										"SQL", "JSON", "Prover9"};
	private String[] langRadioArgVals = {"N3", "--prolog", "--prolog-bchain", "--sem",
										 "--sql", "--json", "--prover9"};
	
	private SelectItem[] resultOpts;
	private String[] resultOptLabels = {"Display Proof", "Display All Results", "Debug"};
	private String[] resultOptValues = {"true", "true", "true"};
	
	private String evalFileUrl;
	private String ruleFileSource;
	private String ruleFileUrl;
	private String ruleFileString;
	private String language;
	private boolean proof;
	private boolean fullResults;
	private boolean debugInfo;

	private String eulerResults;
	
	public EulerEngineModel()
	{
		targetTempFile = "C:\\Temp\\EulerTempFile-" + Math.random() + ".n3";
		
		prefixSelectItems = new SelectItem[prefixLabels.length];
		for (int a = 0; a < prefixLabels.length && a < prefixValues.length; a++)
		{
			SelectItem item = new SelectItem();
			item.setLabel(prefixLabels[a]);
			item.setValue(prefixValues[a]);
			prefixSelectItems[a] = item;
		}
		
		langRadios = new SelectItem[langRadioLabels.length];
		for (int b = 0; b < langRadioLabels.length && b < langRadioArgVals.length; b++)
		{
			SelectItem item = new SelectItem();
			item.setLabel(langRadioLabels[b]);
			item.setValue(langRadioArgVals[b]);
			langRadios[b] = item;
		}
		
		resultOpts = new SelectItem[resultOptLabels.length];
		for (int c = 0; c < resultOptLabels.length && c < resultOptValues.length; c++)
		{
			SelectItem item = new SelectItem();
			item.setLabel(resultOptLabels[c]);
			item.setValue(resultOptValues[c]);
			resultOpts[c] = item;
		}
		
		evalFileUrl = "";
		ruleFileSource = "";
		ruleFileUrl = "";
		ruleFileString = "";
		
		proof = false;
		fullResults = false;
		debugInfo = false;
		
		eulerResults = null;
	}
	
	public String[] getResultOptLabels()
	{
		return resultOptLabels;
	}
	
	public String[] resultOptValues()
	{
		return resultOptValues;
	}
	
	public SelectItem[] getPrefixSelectItems()
	{
		return prefixSelectItems;
	}
	
	public void setPrefixSelectItems(SelectItem[] value)
	{
		prefixSelectItems = value;
	}
	
	public SelectItem[] getLangRadios()
	{
		return langRadios;
	}
	
	public SelectItem[] getResultOpts()
	{
		return resultOpts;
	}
	
	public String getEulerResults()
	{
		return eulerResults;
	}
	
	public void setEulerResults(String results)
	{
		eulerResults = results;
	}
	
	public String getEvalFileUrl()
	{
		return evalFileUrl;
	}
	
	public void setEvalFileUrl(String value)
	{
		evalFileUrl = value;
	}
	
	public void setRuleFileSource(String value)
	{
		ruleFileSource = value;
	}
	
	public String getRuleFileSource()
	{
		return ruleFileSource;
	}
	
	public void setRuleFileUrl(String value)
	{
		ruleFileUrl = value;
	}
	
	public String getRuleFileUrl()
	{
		return ruleFileUrl;
	}
	
	public void setRuleFileString(String value)
	{
		ruleFileString = value;
	}
	
	public String getRuleFileString()
	{
		return ruleFileString;
	}
	
	// prototype method, attempted to allow dynamic inclusion of prefixes to Euler
	// user-created rules
	/*
	public void changePrefixes(String[] newPrefixArr)
	{
		StringBuffer buffer = new StringBuffer();
		String newPrefixStr = "";
		for(int a = 0; a < newPrefixArr.length; a++)
		{
			newPrefixStr += newPrefixArr[a];
		}
		buffer.append(newPrefixStr);
		ruleFileString.replaceAll("prefix", "");
		buffer.append(ruleFileString);
		
		ruleFileString = buffer.toString();
	}
	*/
	public void setLanguage(String value)
	{
		language = value;
	}
	
	public String getLanguage()
	{
		return language;
	}
	
	public void setProof(String value)
	{
		if (value.equals("true"))
		{
			proof = true;
		}
		else
		{
			proof = false;
		}
	}
	
	public boolean getProof()
	{
		return proof;
	}
	
	public void setFullResults(String value)
	{
		if (value.equals("true"))
		{
			fullResults = true;
		}
		else
		{
			fullResults = false;
		}
	}
	
	public boolean getFullResults()
	{
		return fullResults;
	}
	
	public void setDebugInfo(String value)
	{
		if (value.equals("true"))
		{
			debugInfo = true;
		}
		else
		{
			debugInfo = false;
		}
	}
	
	public boolean getDebugInfo()
	{
		return debugInfo;
	}
	
	public void executeQuery()
	{	
		ArrayList argList = new ArrayList();
		String[] args;
		
		if (language != null && !language.equals("N3"))
		{
			argList.add(language);
		}
		
		if(!proof)
		{
			argList.add("--nope");
		}
		
		if(fullResults)
		{
			argList.add("--think");
		}
		
		if(debugInfo)
		{
			argList.add("--debug");
		}
		
		argList.add(evalFileUrl);
		argList.add("--query");
		
		if (ruleFileSource.equals("load"))
		{
			argList.add(ruleFileUrl);
		}
		else
		{
			writeTempFile(targetTempFile, ruleFileString);
			argList.add(targetTempFile);
		}
		
		args = new String[argList.size()];
		for (int a = 0; a < args.length; a++)
		{
			args[a] = (String)argList.get(a);
		}
		
		eulerResults = EulerRunner.doProof(args);
		File tempFile = new File(targetTempFile);
		tempFile.delete();
	}
	
	private void writeTempFile(String fileName, String inputString)
	{
		try 
		{
			FileWriter writer = new FileWriter(fileName);
			writer.write(inputString);
			writer.close();
		}
		catch (IOException e)
		{
			
		}
	}
	
	
}