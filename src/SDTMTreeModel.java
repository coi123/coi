import com.icesoft.faces.component.tree.IceUserObject;

import javax.swing.tree.DefaultTreeModel;
import javax.swing.tree.DefaultMutableTreeNode;

import java.util.ArrayList;
import java.io.InputStream;
import java.net.URL;

/** a core model class that provides the underlying DefaultTreeModel for the SDTMTree
 *  component of the interface
 */

public class SDTMTreeModel {

    // tree default model, used as a value for the tree component
    private DefaultTreeModel model;
    private DefaultMutableTreeNode rootTreeNode;
    private String selectedNode;
    //type DefaultMutableTreeNode
    private ArrayList nodeCollection;
    //type IceUserObject
    private ArrayList objectCollection;
    //type TreeItem
    private ArrayList rawNodesCollection;
    //type DefaultMutableTreeNode
    private ArrayList nodesLoaded;
    private URL url;
    
    private SDTMModelBuilder builder;
    
    public SDTMTreeModel(InputStream iStream)
    {
        // create root node with its children expanded
        rootTreeNode = new DefaultMutableTreeNode();
        IceUserObject rootObject = new IceUserObject(rootTreeNode);
        rootObject.setText("SDTM");
        rootObject.setExpanded(true);
        rootTreeNode.setUserObject(rootObject);
        TreeItem rootRawNode = new TreeItem("root", null, "root");
        // model is accessed by by the ice:tree component
        model =  new DefaultTreeModel(rootTreeNode);
        
        nodeCollection = new ArrayList();
        nodeCollection.add(rootTreeNode);
        
        objectCollection = new ArrayList();
        objectCollection.add(rootObject);
        
        rawNodesCollection = new ArrayList();
        rawNodesCollection.add(rootRawNode);
        
        nodesLoaded = new ArrayList();
        nodesLoaded.add(rootTreeNode);
        
        selectedNode = null;
        
        try 
        {
            builder = new SDTMModelBuilder(iStream);
        }
        catch (Exception ex)
        {
        	System.out.println("Exception: " + ex);
        }
        initRoot(rootTreeNode);
    }
    
    public DefaultTreeModel getModel() 
    {
        return model;
    }
    
    public ArrayList getNodesLoaded()
    {
    	return nodesLoaded;
    }
    
    public String getSelectedNodeText()
    {
    	return selectedNode;
    }
    
    // sets the selected node text for use if the node is added to a table
    // also sets other useful params through setSelectedNodePropertyAndId
    public void setSelectedNodeText(String selNode)
    {
    	selectedNode = selNode;
    }
    
    /* Loads the root node and preloads the nodes below the presentation level to 
     * properly identify child nodes
     */
    public void initRoot(DefaultMutableTreeNode node)
    {
    	try
        { 
	        TreeItem[] rawRootSubNodes = builder.getRootSubNodes();
	        
	        /*
	         * loads the first level of nodes
	         */
	        DefaultMutableTreeNode[] treeRootMutNodes = new DefaultMutableTreeNode[rawRootSubNodes.length];
	        IceUserObject[] treeRootBranches = new IceUserObject[rawRootSubNodes.length];
	        for (int i = 0; i < rawRootSubNodes.length; i++)
	        {
	        	treeRootMutNodes[i] = new DefaultMutableTreeNode();
	        	treeRootBranches[i] = new IceUserObject(treeRootMutNodes[i]);
	        	treeRootBranches[i].setText(rawRootSubNodes[i].getLabel());
	        	treeRootMutNodes[i].setUserObject(treeRootBranches[i]);
	        	rootTreeNode.add(treeRootMutNodes[i]);
	        }
	        updateCollections(treeRootMutNodes, treeRootBranches, rawRootSubNodes);
	        
	        /*
	         * pre-loads the subnodes of every level one node in order to properly 
	         * identify branch nodes and leaf nodes and attaches those nodes to the 
	         * underlying layer
	         */
	        for (int j = 0; j < rawRootSubNodes.length; j++)
	        {
	        	TreeItem[] rawRootSubSubNodes = builder.getAllSubNodesOf(rawRootSubNodes[j].getItemID());
		        
		        DefaultMutableTreeNode[] treeRootSubMutNodes = new DefaultMutableTreeNode[rawRootSubSubNodes.length];
		        IceUserObject[] treeRootSubBranches = new IceUserObject[rawRootSubSubNodes.length];
		        for (int k = 0; k < rawRootSubSubNodes.length; k++)
		        {
		        	treeRootSubMutNodes[k] = new DefaultMutableTreeNode();
		        	treeRootSubBranches[k] = new IceUserObject(treeRootSubMutNodes[k]);
		        	treeRootSubBranches[k].setText(rawRootSubSubNodes[k].getLabel());
		        	treeRootSubMutNodes[k].setUserObject(treeRootSubBranches[k]);
		        	treeRootMutNodes[j].add(treeRootSubMutNodes[k]);
		        }
		        updateCollections(treeRootSubMutNodes, treeRootSubBranches, rawRootSubSubNodes);
	        }
	        checkLeaves();
	        
        }
        catch (Exception ex)
        {
        	System.out.println("Exception has occured: " + ex);
        }
    }
    
    /*
     *  The method called when a node is clicked for expansion that has not be loaded.
     *  This method expands the model the tree is based on to provide navigate to the
     *  sub-nodes requested.
     *  
     *  Because all of the level one nodes have already been returned, they do not need
     *  to be loaded into the tree model, but the do need to be loaded in order to pre-
     *  load their children
     */
    public void expandModel(DefaultMutableTreeNode node)
    {
    	try
        { 
	        int nodeIndex = nodeCollection.indexOf(node);
	        String itemID = ((TreeItem) rawNodesCollection.get(nodeIndex)).getItemID();
	        
	        // returns all sub-nodes of the node clicked
	        TreeItem[] rawLevel1SubNodes = builder.getAllSubNodesOf(itemID);
	        int listIndex = 0;
	        
	        // for every sub-node of the node clicked 
	        for (int j = 0; j < rawLevel1SubNodes.length; j++)
	        {
	        	// finds the index of the node in the collection of TreeItems maintained 
	        	for (int k = 0; k < rawNodesCollection.size(); k++)
	        	{
	        		if (((TreeItem)rawNodesCollection.get(k)).getItemID().equals(rawLevel1SubNodes[j].getItemID()))
	        		{
	        			listIndex = k;
	        		}
	        	}
	        	
	        	// returns all subNode TreeItems of the current childNode
	        	TreeItem[] rawLevel2SubNodes = 
	        		    builder.getAllSubNodesOf(rawLevel1SubNodes[j].getItemID());
		        
	        	/* subsequent code creates arrays for the DefaulMutableTreeNode and
	        	 * IceUserObject elements of the tree nodes.
	        	 * Each node is constructed in a standard manner and then added to the
	        	 * appropriate parent node in the nodeCollection
	        	 * All collections are subsequently updated
	        	 */
	        	
	        	DefaultMutableTreeNode[] treeLevel2MutNodes = new DefaultMutableTreeNode[rawLevel2SubNodes.length];
		        IceUserObject[] treeLevel2Branches = new IceUserObject[rawLevel2SubNodes.length];
		        for (int k = 0; k < rawLevel2SubNodes.length; k++)
		        {
		        	treeLevel2MutNodes[k] = new DefaultMutableTreeNode();
		        	treeLevel2Branches[k] = new IceUserObject(treeLevel2MutNodes[k]);
		        	treeLevel2Branches[k].setText(rawLevel2SubNodes[k].getLabel());
		        	treeLevel2MutNodes[k].setUserObject(treeLevel2Branches[k]);
		        	((DefaultMutableTreeNode)nodeCollection.get(listIndex)).add(treeLevel2MutNodes[k]);
		        }
		        updateCollections(treeLevel2MutNodes, treeLevel2Branches, rawLevel2SubNodes);
	        }
	        checkLeaves();
	        // finally the node is added to the nodesLoaded list to ensure it is not
	        // loaded again
	        nodesLoaded.add(node);
        }
        catch (Exception ex)
        {
        	DefaultMutableTreeNode test = new DefaultMutableTreeNode();
	        IceUserObject testObj = new IceUserObject(test);
	        testObj.setText("Exception: " + ex);
	        test.setUserObject(testObj);
	        rootTreeNode.add(test);
        }
    }
    
    // updates all lists with any newly loaded DefaultMutableTreeNodes, IceUserObjects
    // and TreeItems
    private void updateCollections(DefaultMutableTreeNode[] addNodes,
    							   IceUserObject[] addObjects,
    							   TreeItem[] addRawItems)
    {
    	for (int i = 0; i < addNodes.length; i++)
    	{
    		if (!nodeCollection.contains(addNodes[i]))
    		{
    			nodeCollection.add(addNodes[i]);
    			objectCollection.add(addObjects[i]);
    			rawNodesCollection.add(addRawItems[i]);
    		}
    	}
    }
    
    // checks every node for children and sets the boolean flag of the IceUserObject 
    // as to whether it should be rendered as a branch node or leaf node
    private void checkLeaves()
    {
    	for (int a = 0; a < nodeCollection.size(); a++)
    	{
    		DefaultMutableTreeNode evalNode = 
    				(DefaultMutableTreeNode) nodeCollection.get(a);
    		((IceUserObject) objectCollection.get(a)).setLeaf(false);
    		if (evalNode.getChildCount() < 1)
    		{
    			((IceUserObject) objectCollection.get(a)).setLeaf(true);
    		}
    	}
    }
}
