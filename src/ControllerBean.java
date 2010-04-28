import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.List;


import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.event.ActionEvent;
import javax.faces.event.ValueChangeEvent;
import javax.faces.model.SelectItem;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;

import com.icesoft.faces.component.ext.HtmlPanelGroup;
import com.icesoft.faces.component.ext.HtmlInputText;
import com.icesoft.faces.component.ext.HtmlSelectBooleanCheckbox;
import com.icesoft.faces.component.ext.HtmlCommandButton;
import com.icesoft.faces.component.ext.HtmlCommandLink;
import com.icesoft.faces.component.ext.HtmlDataTable;
import com.icesoft.faces.component.ext.HtmlSelectManyCheckbox;
import com.icesoft.faces.component.ext.HtmlSelectOneRadio;
import com.icesoft.faces.component.ext.UIColumn;
import com.icesoft.faces.component.tree.IceUserObject;
import com.icesoft.faces.component.tree.Tree;
import com.icesoft.faces.context.effects.Effect;
import com.icesoft.faces.context.effects.Fade;
import com.icesoft.faces.context.effects.Highlight;
import com.icesoft.faces.context.effects.JavascriptContext;
import com.icesoft.faces.context.effects.Opacity;


public class ControllerBean 
{
	private URL url;
	private SDTMTreeModel sdtmTreeModel;
	private DOTreeModel doTreeModel;
	private TablesBean tableModel;
	private InterfaceModel interfaceModel;
	private SparqlQueryModel queryModel;
	private EulerEngineModel eulerModel;
	private PatientTableModel patientTableModel;
	private BufferedReader hl7_sdtm;
	private BufferedReader db_hl7;
	private Effect fadeOut;
	
	
	/**acts as a controller providing actionListeners to the interface as well as making
	 * values in different models available to one another through the JSF layer
	 */ 
	public ControllerBean()
	{
		//reads necessary files into models to generate interface tree elements
		InputStream iStream = null;
		try 
		{
			url = new URL("http://localhost:8080/coi/kb/SDTMSuperTree.n3");
	    	iStream = url.openStream();
	    	sdtmTreeModel = new SDTMTreeModel(iStream);
	    	url = new URL("http://localhost:8080/coi/kb/DOSuperTree.n3");
	    	iStream = url.openStream();
	    	doTreeModel = new DOTreeModel(iStream);
	    	url = new URL("http://localhost:8080/coi/kb/demParams.n3");
	    	iStream = url.openStream();
	    	interfaceModel = new InterfaceModel(iStream);
	    	url = new URL("http://localhost:8080/coi/kb/hl7-sdtm.rq");
	    	hl7_sdtm = new BufferedReader(new InputStreamReader(url.openStream()));
	    	url = new URL("http://localhost:8080/coi/kb/db-hl7.rq");
	    	db_hl7 = new BufferedReader(new InputStreamReader(url.openStream()));
		}
		catch (Exception e)
		{
			
		}
		//creates the table and query models
		queryModel = new SparqlQueryModel();
		tableModel = new TablesBean(queryModel);
		eulerModel = new EulerEngineModel();
		patientTableModel = new PatientTableModel();
	}
	
	//effect to hide the study description
	public Effect getFadeOut()
	{
		return fadeOut;
	}
	
	//getters for use by the interface to access backend models
	public SDTMTreeModel getsdtmTreeModel()
	{
		return sdtmTreeModel;
	}
	
	public DOTreeModel getdoTreeModel()
	{
		return doTreeModel;
	}
	
	public TablesBean getTableModel()
	{
		return tableModel;
	}
	
	public SparqlQueryModel getQueryModel()
	{
		return queryModel;
	}
	
	public InterfaceModel getInterfaceModel()
	{
		return interfaceModel;
	}
	
	public EulerEngineModel getEulerModel()
	{
		return eulerModel;
	}
	
	public PatientTableModel getPatientTableModel()
	{
		return patientTableModel;
	}
	
	/* 
	 * the action listener called when a user clicks the add inclusion button 
	 */
	public void setInclusion(ActionEvent e)
	{
		//toggles the appearance on the inclusion and exclusion areas
		FacesContext fcontext = FacesContext.getCurrentInstance();
		String javaCall = "document.getElementById(\"INCLUSIONGRP\").className=\"selected\";" +
		                  "document.getElementById(\"EXCLUSIONGRP\").className=\"unselected\";";
		JavascriptContext.addJavascriptCall(fcontext, javaCall);
		
		//alerts the tableModel that another table has been selected and
		//cause the study info panel to disappear if it is visible
		tableModel.setInclusion();
		fadeOut = new Fade();
	}
	
	/* 
	 * the action listener called when a user clicks the add exclusion button 
	 */
	public void setExclusion(ActionEvent e)
	{
		//toggles the appearance on the inclusion and exclusion areas
		FacesContext fcontext = FacesContext.getCurrentInstance();
		String javaCall = "document.getElementById(\"INCLUSIONGRP\").className=\"unselected\";" +
		                  "document.getElementById(\"EXCLUSIONGRP\").className=\"selected\";";
		JavascriptContext.addJavascriptCall(fcontext, javaCall);
		
		//alerts the tableModel that another table has been selected and
		//cause the study info panel to disappear if it is visible
		tableModel.setExclusion();
		fadeOut = new Fade();
	}
	
	/* 
	 * the valueChangeListener called when a user changes the constraints of an
	 * entry in the inclusion/exclusion tables
	 */
	public void constraintsChanged(ValueChangeEvent e)
	{	
		//derives necessary information about the event and which constraint was changed
		HtmlInputText edited = (HtmlInputText) e.getSource();
		HtmlDataTable table = (HtmlDataTable) edited.getParent().getParent();
		int index = table.getRowIndex();
		String tableName = table.getId();
		String newText = (String) e.getNewValue();
		
		//flags the tableModel with the new value, the corresponding table and the row
		tableModel.changeConstraintsAt(newText, tableName, index);
	}
	
	/* 
	 * the valueChangeListener called when a user checks a box indicating that that row 
	 * should be included in the link created when the link button is pressed 
	 */
	public void addLinkToggle(ValueChangeEvent e)
	{
		//derives necessary information about the event and which checkbox was clicked
		HtmlSelectBooleanCheckbox box = (HtmlSelectBooleanCheckbox)e.getSource();
		HtmlDataTable table = (HtmlDataTable) box.getParent().getParent();
		int index = table.getRowIndex();
		String tableName = table.getId();
		
		//flags the tableModel with the corresponding table and row of the event
		tableModel.changeToLinkAt(tableName, index);
	}
	
	/* 
	 * the actionListener called when the delete button for an entry is clicked
	 */
	public void deleteRow(ActionEvent e)
	{
		//derives necessary information about the event and which button was clicked
		HtmlCommandButton deleteBtn = (HtmlCommandButton) e.getSource();
		HtmlDataTable table = (HtmlDataTable) deleteBtn.getParent().getParent();
		String tableName = table.getId();
		int index = table.getRowIndex();
		
		//flags the tableModel with the corresponding table and row of the event
		tableModel.deleteItemAt(tableName, index);
	}
	
	/* 
	 * the action listener called when the link button is pressed, simply flags the
	 * table model as all parameters are already stored
	 */
	public void createLink(ActionEvent e)
	{
		tableModel.createLink();
	}
	
	/* 
	 * the valueChangeListener called when the type of link is changed, passes the
	 * event to a method in the table model
	 */
	public void linkTypeChanged(ValueChangeEvent e)
	{
		tableModel.linkTypeChanged(e);
	}
	
	/* 
	 * the action listener called when the add button is clicked under the demographic
	 * portion of the interface
	 */
	public void addDemClicked(ActionEvent e)
	{
		HtmlPanelGroup currentGroup = interfaceModel.getCurrentPanel();
		//ensures that only valid panelgroups are read
		if (currentGroup != null && currentGroup.getChildCount() == 2)
		{
			//collects the information for a table item with information from the
			//panel group and adds it to the model
			String domain = "sdtm";
			String category = interfaceModel.getCurrentPanelChildValue(0);
			String constraint = interfaceModel.getCurrentPanelChildValue(1);
			tableModel.addItem(domain, category, constraint, category);
		}
	}
	
	/* 
	 * the action listener called when an expand/collapse icon of the SDTM tree 
	 * is clicked, provides lazy-loading functionality (loading the tree as it is 
	 * traversed) to improve performance
	 */
	public void expandSDTMTreeModel(ActionEvent e)
    {
		//derives information about the event
    	Tree tree = (Tree) e.getSource();
    	DefaultMutableTreeNode exNode = tree.getNavigatedNode();
    	
    	//only expand the model if the node is being expanded for the first time
    	if (tree.getNavigationEventType().equals("expand") && 
    		sdtmTreeModel.getNodesLoaded().contains(exNode) == false)
    	{
    			sdtmTreeModel.expandModel(exNode);
    	}
    }
	
	/* 
	 * the actionListener called when a node is selected in the SDTM tree,
	 * retrieves the node's text and sets it as a field in the sdtmTreeModel
	 */
	public void sdtmTreeNodeSelected(ActionEvent e)
	{
		HtmlCommandLink link = (HtmlCommandLink) e.getSource();
		String nodeText = link.getValue().toString();
		sdtmTreeModel.setSelectedNodeText(nodeText);
	}
	
	/* 
	 * the actionListener called when the apply button for the SDTM tree is clicked,
	 * constructs a table item's parameters and passes it to the tableModel
	 */
	public void sdtmApplyBtnPress(ActionEvent e)
	{
		String domain = "sdtm";
		String category = sdtmTreeModel.getSelectedNodeText();
		String constraints = "";
		tableModel.addItem(domain, category, constraints, category);
	}
	
	/* 
	 * the action listener called when an expand/collapse icon of the DO tree 
	 * is clicked, provides lazy-loading functionality (loading the tree as it is 
	 * traversed) to improve performance
	 */
	public void expandDOTreeModel(ActionEvent e)
    {
		//derives information about the event
    	Tree tree = (Tree) e.getSource();
    	DefaultMutableTreeNode exNode = tree.getNavigatedNode();
    	
    	//only expand the model if the node is being expanded for the first time
    	if (tree.getNavigationEventType().equals("expand") && 
    		doTreeModel.getNodesLoaded().contains(exNode) == false)
    	{
    			doTreeModel.expandModel(exNode);
    	}
    }
	
	/* 
	 * the actionListener called when a node is selected in the DO tree,
	 * retrieves the node's text and sets it as a field in the sdtmTreeModel
	 */
	public void doTreeNodeSelected(ActionEvent e)
	{
		HtmlCommandLink link = (HtmlCommandLink) e.getSource();
		String nodeText = link.getValue().toString();
		doTreeModel.setSelectedNodeText(nodeText);
	}
	
	/* 
	 * the actionListener called when the apply button for the SDTM tree is clicked,
	 * constructs a table item's parameters and passes it to the tableModel
	 */
	public void doApplyBtnPress(ActionEvent e)
	{
		String domain = "do";
		String category = doTreeModel.getSelectedNodeText();
		String constraints = "";
		String drugID = doTreeModel.getSelectedNodeId();
		tableModel.addItem(domain, category, constraints, drugID);
	}
	
	// the action listener called when the clear button is pressed
	public void clearTable(ActionEvent e)
	{
		tableModel.clearTable();
	}
	
	/*
	 * the valueChangeListener called when the user changes the url of the file
	 * to be evaluated
	 */
	public void evalFileChanged(ValueChangeEvent e)
	{
		if (e.getNewValue() != null)
		{
			eulerModel.setEvalFileUrl(e.getNewValue().toString());
		}
	}
	
	/*
	 * the valueChangeListener called when the user toggles the radio button set
	 * that controls the source of the ruleFile
	 */
	public void toggleEulerRuleSourceFile(ValueChangeEvent e)
	{
		if (e.getNewValue()!=null)
		{
			eulerModel.setRuleFileSource(e.getNewValue().toString());
		}
	}
	
	/*
	 * the valueChangeListener called when the user changes the url of the rule file
	 */
	public void ruleFileUrlChanged(ValueChangeEvent e)
	{
		if (e.getNewValue() != null)
		{
			eulerModel.setRuleFileUrl(e.getNewValue().toString());
		}
	}
	
	/*
	 * the valueChangeListener called when the user changes the user defined rule
	 */
	public void ruleFileStringChanged(ValueChangeEvent e)
	{
		if (e.getNewValue() != null)
		{
			eulerModel.setRuleFileString(e.getNewValue().toString());
		}
	}
	
	// the valueChangeListener for the prototype prefix adding checkbox set
	/*
	public void prefixesAltered(ValueChangeEvent e)
	{
		HtmlSelectManyCheckbox boxSetClicked = (HtmlSelectManyCheckbox) e.getSource();
		String[] prefixes = (String[])boxSetClicked.getSelectedValues();
		eulerModel.changePrefixes(prefixes);
		JavascriptContext.addJavascriptCall(FacesContext.getCurrentInstance(), 
		"alert(\"" + eulerModel.getRuleFileString() + "\")");
	}
	*/
	
	/*
	 * the valueChangeListener called when the user toggles the radio button set
	 * specifying the language to return results in
	 */
	public void returnLanguageChanged(ValueChangeEvent e)
	{
		HtmlSelectOneRadio radio = (HtmlSelectOneRadio)e.getSource();
		if (radio.getLocalValue() != null)
		{
			eulerModel.setLanguage(radio.getLocalValue().toString());
		}
	}
	
	/*
	 * the valueChangeListener called when the proof checkbox is toggled
	 */
	public void proofToggled(ValueChangeEvent e)
	{
		if (e.getNewValue() != null)
		{
			eulerModel.setProof(e.getNewValue().toString());
		}
	}
	
	/*
	 * the valueChangeListener called when the fullResults checkbox is toggled
	 */
	public void fullResultsToggled(ValueChangeEvent e)
	{
		if (e.getNewValue() != null)
		{
			eulerModel.setFullResults(e.getNewValue().toString());
		}
	}
	
	/*
	 * the valueChangeListener called when the debugInfo checkbox is toggled
	 */
	
	public void debugInfoToggled(ValueChangeEvent e)
	{
		if (e.getNewValue() != null)
		{
			eulerModel.setFullResults(e.getNewValue().toString());
		}
	}
	
	/*
	 * the actionListener called when the Run Euler button is called
	 */
	public void eulerSubmitClicked(ActionEvent e)
	{
		eulerModel.executeQuery();
		//could be suited to open a new window with the results instead of passing
		//passing to a new tab
	}
	
	/*
	 * the actionListener called when the Run Query button is called, not finished,
	 * requires the JNI wrapper of the SWObjects transformer
	 */
	public void queryDbClicked(ActionEvent e)
	{
		FacesContext context = FacesContext.getCurrentInstance();
		
		String sdtmString = queryModel.getPrefixStatements() + 
							queryModel.getSelectionStatement() +
							queryModel.getCriteriaStatement() +
							queryModel.getLimitStatement();
		/*
		patientTableModel.executeAndParse(sdtmString, hl7_sdtm, db_hl7);
		*/
		//executed as a final measure
		String jsCall = "window.open('patientList.jsp');";
		
		JavascriptContext.addJavascriptCall(context, jsCall);
		
	}
}
