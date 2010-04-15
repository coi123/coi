import java.io.InputStream;
import java.util.ArrayList;

import com.hp.hpl.jena.ontology.OntModel;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.*;



public class InterfaceModelBuilder 
{
	private OntModel model;
	private String prefixUI = "http://www.UI.org/vocabulary#";
	private String prefixRDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
	private String prefixCOLON = "http://www.owl-ontologies.com/2008/4/7/OntologySDTM.owl#";
	private Resource category;
	private Property type;
	private Property hasParent;
	private Property hasInputField;
	private Property hasOption;
	private Property hasValue;
	
	public InterfaceModelBuilder(InputStream iStream)
	{
		model = ModelFactory.createOntologyModel();
		model.read(iStream, null, "N3");
		category = model.getResource(prefixUI + "category");
		type = model.getProperty(prefixRDF + "type");
		hasParent = model.getProperty(prefixUI + "hasParent");
		hasInputField = model.getProperty(prefixUI + "hasInputField");
		hasOption = model.getProperty(prefixUI + "hasOption");
		hasValue = model.getProperty(prefixUI + "hasValue");
	}
	
	public ElementMold[] getRootNodes()
	{
		ArrayList rootNodes = new ArrayList();
		StmtIterator iter = model.listStatements(null, type, category);
		while(iter.hasNext())
		{
			Statement stmt = iter.nextStatement();
			Resource sub = stmt.getSubject();
			if (!model.listStatements(sub, hasParent,(RDFNode) null).hasNext())
			{
				rootNodes.add(new ElementMold(sub.getLocalName(), "button"));
			}
		}
		ElementMold[] elements = new ElementMold[rootNodes.size()];
		for (int i = 0; i < elements.length; i++)
		{
			elements[i] = ((ElementMold)rootNodes.get(i));
		}
		return elements;
	}
	
	public ElementMold[] getChildrenOf(String name)
	{
		ElementMold[] elements;
		ArrayList temp = new ArrayList();
		
		Resource currentCriteria = model.getResource(prefixCOLON + name); 		
		//NOTE: emphasis is placed on developer creating well-formed n3
		
		//first attempt at using sparql 
		/*
		String query = "PREFIX ui: <http://www.UI.org/vocabulary#> \n" +
                       "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n" +
                       "PREFIX : <http://www.owl-ontologies.com/2008/4/7/OntologySDTM.owl#> \n" +
                       
                       "SELECT ?childItem ?rdfType ?inputType ?option ?value \n" +
                       "WHERE {?childItem rdf:type ?rdfType . \n" +
                       "       ?childItem ui:hasParent :" + name + " . \n" +
                       
                       "       OPTIONAL {?childItem ui:hasInputField ?inputField . \n" +
                       "                 ?inputField rdf:type ?inputType . \n" +
                       "                 ?inputField ui:hasValue ?value . \n" +
                       "                 ?inputField ui:hasOption ?option . \n" +
                       "      }" +
                       
                       "}";
		
		Query modelQuery = QueryFactory.create(query);
		QueryExecution queryExec = QueryExecutionFactory.create(modelQuery, model);
		ResultSet res = queryExec.execSelect();
		if (res.hasNext())
		{
			
		}
		*/
		
		StmtIterator iter = model.listStatements(null, hasParent, currentCriteria);
		//for each child of the button
		while (iter.hasNext())
		{
			Statement stmt = iter.nextStatement();
			Resource sub = stmt.getSubject();
			StmtIterator subTypeChecker = model.listStatements(sub, type,(RDFNode) null);
			//finding the type of the child
			
			Statement subTypeStmt = subTypeChecker.nextStatement();
			Resource subType = (Resource)subTypeStmt.getObject();
			if (subType.getLocalName().equals("category")) //it is a nested button
			{
				temp.add(new ElementMold(sub.getLocalName(), "button"));
			}
			else //it is of type parameter
			{	
				StmtIterator subFields = model.listStatements(sub, hasInputField,(RDFNode) null);
				//for every field
				while (subFields.hasNext())
				{
					Statement subField = subFields.nextStatement();
					Resource inputField = (Resource)subField.getObject();
					StmtIterator fieldTypeChecker = model.listStatements(inputField, type, (RDFNode)null);
					Statement fieldType = fieldTypeChecker.nextStatement();
					
					String inputType = ((Resource)fieldType.getObject()).getLocalName();
					ElementMold moldToAdd = new ElementMold(inputField.getLocalName(), inputType);
					
					if (inputType.equals("selectInput"))
					{
						StmtIterator optionStatements = model.listStatements(inputField, hasOption, (RDFNode)null);
						while (optionStatements.hasNext())
						{
							Statement optionStatement = optionStatements.nextStatement();
							Literal option = (Literal) optionStatement.getObject();
							moldToAdd.addOption(option.toString());
						}	
					}
					if (inputType.equals("outputText"))
					{
						StmtIterator valueStatement = model.listStatements(inputField, hasValue, (RDFNode)null);
						Statement valueStmt = valueStatement.nextStatement();
						String text = valueStmt.getObject().toString();
						moldToAdd.setText(text);
					}
					temp.add(moldToAdd);
				}
			}
		}
		elements = new ElementMold[temp.size()];
		for (int b = 0; b < elements.length; b++)
		{
			elements[b] = ((ElementMold)temp.get(b));
		}
		return elements;
	}
}
