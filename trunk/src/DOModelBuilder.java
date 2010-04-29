import java.io.InputStream;

import com.hp.hpl.jena.ontology.OntModel;
import com.hp.hpl.jena.rdf.model.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;

/** a core model class that reads an .n3 ontology from an InputStream into a Jena OntModel.
 *  The model is queried for appropriate nodes when loading the initial tree display
 *  and when expanding nodes, nodes are sorted before returning to ensure Alpha-Order
 *  lists. 
 *  
 *  Note: core logic requires reading a node level below the presentation level to 
 *  identify leaf nodes for display and logic purposes
 */

public class DOModelBuilder 
{
	//defines the urls for important prefixes for use in Jena queries
	private String prefixD = "http://www.owl-ontologies.com/DrugOntology.owl#";
	private String prefixCOLON = "http://www.owl-ontologies.com/2008/4/7/OntologySDTM.owl#";
	
	private OntModel superClassModel;
	private Property superClassOf;
	private Property label;
	
	public DOModelBuilder(InputStream inStream)
	{
		/* defines important properties, initialises the OntModel and reads InputStream*/
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
	
	
	// Called from the constructor of the DOTreeModel, loads all root nodes
	public TreeItem[] getRootSubNodes()
	{
		return getAllSubNodesOf("C0013227");
	}
	
	/*
	 *  can be used to return subNodes of a node to be expanded and used to check
	 *  the presence of leaf nodes / branch nodes
	 */
	public TreeItem[] getAllSubNodesOf(String parentID)
	{
		Resource parent = superClassModel.getResource(prefixD + parentID);
		
		// Checks each resource against the model for statements matching
		// parentResource is superclass of the current resource 
		StmtIterator iter = superClassModel.listStatements(parent, superClassOf, (RDFNode)null);
		ArrayList itemList = new ArrayList();
		
		// checks each resource matching the above statement against statements matching
		// childResource has label labelRepresentation
		// Care is taken in instances where the resource does not have a label (bnodes)
		// A TreeItem is then constructed for each child resource and added to an ArrayList
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
		
		// The populated ArrayList is converted to an array to enable custom sorting
		TreeItem[] subNodeItems = new TreeItem[itemList.size()];
		for (int i = 0; i < subNodeItems.length; i++)
		{
			subNodeItems[i] = (TreeItem) itemList.get(i);
		}
		
		// TreeItems are sorted before they are returned
		TreeItemLabelComparator comparer = new TreeItemLabelComparator();
		Arrays.sort(subNodeItems, comparer);
		return subNodeItems;
	}
	
	// simple comparator that sorts TreeItems into alpha-order by their label
	class TreeItemLabelComparator implements Comparator
	{
		public int compare(Object item1, Object item2) 
		{
			return ((TreeItem)item1).getLabel().compareToIgnoreCase(((TreeItem)item2).getLabel());
		}
	}
}
