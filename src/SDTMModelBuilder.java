import java.io.BufferedReader;
import java.io.InputStream;

import com.hp.hpl.jena.ontology.OntModel;
import com.hp.hpl.jena.rdf.model.*;

import java.net.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;

public class SDTMModelBuilder 
{
	private String sdtmFileString;
	private String prefixCOLON = "http://www.owl-ontologies.com/2008/4/7/OntologySDTM.owl#";
	private String prefixOWL = "http://www.w3.org/2002/07/owl#";
	
	private OntModel subClassModel;
	private OntModel superClassModel;
	private Property superClassOf;
	
	public SDTMModelBuilder(InputStream inStream)
	{
		try
		{
			superClassModel = ModelFactory.createOntologyModel();
			superClassModel.read(inStream, null, "N3");
			superClassOf = superClassModel.getProperty(prefixCOLON + "superClassOf");
		}
		catch (Exception e)
		{
			System.out.println ("error has occurred: " + e);
		}
	}
	
	public TreeItem[] getRootSubNodes()
	{
		ResIterator iter = superClassModel.listSubjects();
		Resource thing = superClassModel.getResource(prefixOWL + "Thing");
		ArrayList rootItemList = new ArrayList();
		while (iter.hasNext())
		{
			Resource res = iter.nextResource();
			if ((!superClassModel.contains(null, superClassOf, res) || 
				superClassModel.contains(thing, superClassOf, res)) &&
				res.isAnon() == false &&
				res.getLocalName().matches("[A-Z].*"))
			{
				TreeItem rootNodeItem = new TreeItem(res.getLocalName(), null,
													 res.getLocalName());
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
		Resource parent = superClassModel.getResource(prefixCOLON + parentID);
		StmtIterator iter = superClassModel.listStatements(parent, superClassOf, (RDFNode) null);
		ArrayList itemList = new ArrayList();
		
		while (iter.hasNext())
		{
			Statement stmt = iter.nextStatement();
			Resource child = (Resource) stmt.getObject();
			TreeItem childItem = new TreeItem(child.getLocalName(), 
											  parentID, child.getLocalName());
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
