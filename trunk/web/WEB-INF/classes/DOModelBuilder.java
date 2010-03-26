import java.io.BufferedReader;
import java.io.InputStream;

import com.hp.hpl.jena.ontology.OntModel;
import com.hp.hpl.jena.rdf.model.*;

import java.net.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;

public class DOModelBuilder 
{
	private String sdtmFileString;
	private String prefixD = "http://www.owl-ontologies.com/DrugOntology.owl#";
	private String prefixCOLON = "http://www.owl-ontologies.com/2008/4/7/OntologySDTM.owl#";
	private String prefixRDFS = "http://www.w3.org/2000/01/rdf-schema#";
	
	private OntModel superClassModel;
	private Property superClassOf;
	private Property level;
	private Property label;
	
	public DOModelBuilder(InputStream inStream)
	{
		try
		{
			superClassModel = ModelFactory.createOntologyModel();
			superClassModel.read(inStream, null, "N3");
			superClassOf = superClassModel.getProperty(prefixCOLON + "superClassOf");
			label = superClassModel.getProperty(prefixD + "label");
			
		}
		catch (Exception e)
		{
			System.out.println ("error has occurred: " + e);
		}
	}
	
	public TreeItem[] getRootSubNodes()
	{
		ResIterator iter = superClassModel.listSubjects();
		Resource rootResource = superClassModel.getResource(prefixD + "C0013227");
		ArrayList rootItemList = new ArrayList();
		while (iter.hasNext())
		{
			Resource res = iter.nextResource();
			if (superClassModel.contains(rootResource, superClassOf, res))
			{
				StmtIterator iter2 = superClassModel.listStatements(res, label, (RDFNode)null );
				String nodeLabel = "";
				if (iter2.hasNext())
				{
					Statement stmt = iter2.nextStatement();
					nodeLabel = stmt.getObject().toString();
				}
				else
				{
					nodeLabel = res.getLocalName();
				}
				TreeItem rootNodeItem = new TreeItem(res.getLocalName(), 
													 rootResource.getLocalName(),
													 nodeLabel);
				rootItemList.add(rootNodeItem);
			}
		}
		TreeItem[] rootSubNodeItems = new TreeItem[rootItemList.size()];
		for (int i = 0; i < rootSubNodeItems.length; i ++)
		{
			rootSubNodeItems[i] = (TreeItem) rootItemList.get(i);
		}
		TreeItemLabelComparator comparer = new TreeItemLabelComparator();
		Arrays.sort(rootSubNodeItems, comparer);
		return rootSubNodeItems;
	}
	
	public TreeItem[] getAllSubNodesOf(String parentID)
	{
		Resource parent = superClassModel.getResource(prefixD + parentID);
		StmtIterator iter = superClassModel.listStatements(parent, superClassOf, (RDFNode)null);
		ArrayList itemList = new ArrayList();
		
		while (iter.hasNext())
		{
			Statement stmt = iter.nextStatement();
			Resource childID = (Resource)stmt.getObject();
			StmtIterator childIter = superClassModel.listStatements(childID, label, (RDFNode)null);
			String childLabel = "";
			if(childIter.hasNext())
			{
				Statement stmt2 = childIter.nextStatement();
				childLabel = stmt2.getObject().toString();
			}
			else
			{
				childLabel = childID.getLocalName();
			}
			TreeItem childItem = new TreeItem(childID.getLocalName(), 
											  parentID, childLabel);
			itemList.add(childItem);
		}
		TreeItem[] subNodeItems = new TreeItem[itemList.size()];
		for (int i = 0; i < subNodeItems.length; i++)
		{
			subNodeItems[i] = (TreeItem) itemList.get(i);
		}
		TreeItemLabelComparator comparer = new TreeItemLabelComparator();
		Arrays.sort(subNodeItems, comparer);
		return subNodeItems;
	}
	
	class TreeItemLabelComparator implements Comparator
	{
		public int compare(Object item1, Object item2) 
		{
			return ((TreeItem)item1).getLabel().compareToIgnoreCase(((TreeItem)item2).getLabel());
		}
	}
}
