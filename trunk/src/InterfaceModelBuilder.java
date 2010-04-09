import java.io.InputStream;
import java.util.ArrayList;

import com.hp.hpl.jena.ontology.OntModel;
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
	
	public InterfaceModelBuilder(InputStream iStream)
	{
		model = ModelFactory.createOntologyModel();
		model.read(iStream, null, "N3");
		category = model.getResource(prefixUI + "category");
		type = model.getProperty(prefixRDF + "type");
		hasParent = model.getProperty(prefixUI + "hasParent");
		hasInputField = model.getProperty(prefixUI + "hasInputField");
		hasOption = model.getProperty(prefixUI + "hasOption");
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
					String inputType = "";
					if (fieldType.getObject().isResource())
					{
						inputType = ((Resource)fieldType.getObject()).getLocalName();
					}
					else if (fieldType.getObject().isLiteral())
					{
						inputType = fieldType.getObject().toString();
					}
					temp.add(new ElementMold(inputField.getLocalName(), inputType));
					/*
					else if (inputType.equals("selectInput"))
					{
						StmtIterator optionStatements = model.listStatements(inputField, hasOption, (RDFNode)null);
						ArrayList options = new ArrayList();
						while (optionStatements.hasNext())
						{
							Statement optionStatement = optionStatements.nextStatement();
							Resource option = (Resource) optionStatement.getObject();
							options.add(option.getLocalName());
						}
					}
					*/
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
