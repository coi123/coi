import com.icesoft.faces.component.tree.IceUserObject;
import com.icesoft.faces.component.tree.Tree;

import javax.faces.event.ActionEvent;
import javax.swing.tree.DefaultTreeModel;
import javax.swing.tree.DefaultMutableTreeNode;

import java.io.BufferedReader;
import java.util.ArrayList;
import java.util.List;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;

public class DOTreeModel {

    // tree default model, used as a value for the tree component
    private DefaultTreeModel model;
    private DefaultMutableTreeNode rootTreeNode;
    private String selectedNode;
    private String selectedNodeProperty;
    //type DefaultMutableTreeNode
    private ArrayList nodeCollection;
    //type IceUserObject
    private ArrayList objectCollection;
    //type TreeItem
    private ArrayList rawNodesCollection;
    //type DefaultMutableTreeNode
    private ArrayList nodesLoaded;
    private URL url;
    
    private DOModelBuilder builder;
    
    public DOTreeModel()
    {
        // create root node with its children expanded
        rootTreeNode = new DefaultMutableTreeNode();
        IceUserObject rootObject = new IceUserObject(rootTreeNode);
        rootObject.setText("General Drug");
        rootObject.setExpanded(false);
        rootTreeNode.setUserObject(rootObject);
        TreeItem rootRawNode = new TreeItem("root", null, "General Drug");
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
        	url = new URL("http://localhost:8080/coi/kb/DOSuperTree.n3");
        	InputStream iStream = url.openStream();
            
            builder = new DOModelBuilder(iStream);
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
    
    public String getSelectedNodeProperty()
    {
    	return selectedNodeProperty;
    }
    
    private void setSelectedNodeProperty(String selectedNode)
    {
    	String nodeID = "";
    	for (int a = 0; a < rawNodesCollection.size(); a++)
    	{
    		if (((TreeItem)rawNodesCollection.get(a)).getLabel().equals(selectedNode))
    		{
    			nodeID = ((TreeItem)rawNodesCollection.get(a)).getItemID();
    			break;
    		}
    	}
    	selectedNodeProperty = DOSubProperty.getPropertyFromNode(nodeID);
    }
    
    public void setSelectedNodeText(String selNode)
    {
    	selectedNode = selNode;
    	setSelectedNodeProperty(selNode);
    }
    
    public void initRoot(DefaultMutableTreeNode node)
    {
    	try
        { 
	        TreeItem[] rawRootSubNodes = builder.getRootSubNodes();
	        
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
    
    public void expandModel(DefaultMutableTreeNode node)
    {
    	try
        { 
	        int nodeIndex = nodeCollection.indexOf(node);
	        String itemID = ((TreeItem) rawNodesCollection.get(nodeIndex)).getItemID();
	        TreeItem[] rawLevel1SubNodes = builder.getAllSubNodesOf(itemID);
	        int listIndex = 0;
	        
	        for (int j = 0; j < rawLevel1SubNodes.length; j++)
	        {
	        	for (int k = 0; k < rawNodesCollection.size(); k++)
	        	{
	        		if (((TreeItem)rawNodesCollection.get(k)).getItemID().equals(rawLevel1SubNodes[j].getItemID()))
	        		{
	        			listIndex = k;
	        		}
	        	}
	        	
	        	TreeItem[] rawLevel2SubNodes = 
	        		    builder.getAllSubNodesOf(rawLevel1SubNodes[j].getItemID());
		        DefaultMutableTreeNode[] treeLevel2MutNodes = new DefaultMutableTreeNode[rawLevel2SubNodes.length];
		        IceUserObject[] treeLevel2Branches = new IceUserObject[rawLevel2SubNodes.length];
		        for (int k = 0; k < rawLevel2SubNodes.length; k++)
		        {
		        	treeLevel2MutNodes[k] = new DefaultMutableTreeNode();
		        	treeLevel2Branches[k] = new IceUserObject(treeLevel2MutNodes[k]);
		        	treeLevel2Branches[k].setText(rawLevel2SubNodes[k].getLabel());
		        	treeLevel2MutNodes[k].setUserObject(treeLevel2Branches[k]);
		        	((DefaultMutableTreeNode)nodeCollection.get(listIndex)).add(treeLevel2MutNodes[k]);
		        	//TODO: ADD A NESTED LOOP TO ATTACH NEXT NODE LEVEL, WILL NOT
		        	//BE DIFFICULT AS THE level2 ARRAYS CAN BE DIRECTLY ACCESSED.
		        }
		        updateCollections(treeLevel2MutNodes, treeLevel2Branches, rawLevel2SubNodes);
	        }
	        checkLeaves();
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
