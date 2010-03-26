import java.io.BufferedReader;
import java.io.InputStream;

import com.hp.hpl.jena.n3.turtle.TurtleReader;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

import java.net.*;
import java.util.ArrayList;

public class SDTMTreeParser 
{
	//private BufferedReader bReader;
	private String sdtmFileString;
	//private BufferedReader buReader;
	
	
	//private InputStream iStream;
	//private InputStream inStream;
	
	private TreeItem[] treeItemsSublevel1;
	private TreeItem[] treeItemsSublevel2;
	private ArrayList treeItemsSublevel1List;
	private ArrayList treeItemsSublevel2List;
	/*
	public SDTMTreeParser(InputStream stream1)
	{
		iStream = stream1;
	}
	*/
	
	public SDTMTreeParser(BufferedReader iReader)
	{
		String line = "";
		treeItemsSublevel1List = new ArrayList();
		treeItemsSublevel2List = new ArrayList();
		try
		{
			while ((line = iReader.readLine())!= null)
			{
				sdtmFileString += line + "\n";
			}
			iReader.close();
		}
		catch (Exception e)
		{
			System.out.println ("error has occurred: " + e);
		}
	}
	public TreeItem[] getFirstSublevel()
	{
		return treeItemsSublevel1;
	}
	
	public TreeItem[] getSecondSublevel()
	{
		return treeItemsSublevel2;
	}
	
	/*
	public void parseTree(String inName, int inLevel)
	{	
		try
		{
			//first iteration to find children
			String[] lines = sdtmFileString.split("\n");
			for (int a = 0; a < lines.length; a++)
			{
				if(lines[a].startsWith(":") == true)
				{
					String[] SDTMArray = lines[a].split(" ");
					String curName = SDTMArray[0].substring(SDTMArray[0].indexOf(":") + 1);
					String curParent = "";
					if (SDTMArray[2].startsWith(":") == true)
					{
						curParent = SDTMArray[2].substring(SDTMArray[2].indexOf(":") + 1, SDTMArray[2].indexOf("."));
					}
					else if (SDTMArray[2].startsWith("owl") == true)
					{
						curParent = "SDTM";
					}
					else
					{
						curParent = SDTMArray[2];
					}
					int curLevel = Integer.parseInt(SDTMArray[5].substring(0,1));
					if (curParent.equals(inName) && curLevel == inLevel + 1)
					{
						TreeItem curItem = new TreeItem(curName, curParent, curLevel);
						treeItemsSublevel1List.add(curItem);
					}
				}
			}
			treeItemsSublevel1 = new TreeItem[treeItemsSublevel1List.size()];
			for (int a = 0; a < treeItemsSublevel1List.size(); a++)
			{
				treeItemsSublevel1[a] = (TreeItem) treeItemsSublevel1List.get(a);
			}
			//second iteration to find children of children
			lines = sdtmFileString.split("\n");
			for (int a = 0; a < lines.length; a++)
			{
				if(lines[a].startsWith(":") == true)
				{
					String[] SDTMArray = lines[a].split(" ");
					String curName = SDTMArray[0].substring(SDTMArray[0].indexOf(":") + 1);
					String curParent = "";
					if (SDTMArray[2].startsWith(":") == true)
					{
						curParent = SDTMArray[2].substring(SDTMArray[2].indexOf(":") + 1, SDTMArray[2].indexOf("."));
					}
					else if (SDTMArray[2].startsWith("owl") == true)
					{
						curParent = "SDTM";
					}
					else
					{
						curParent = SDTMArray[2];
					}
					int curLevel = Integer.parseInt(SDTMArray[5].substring(0,1));
					for (int i = 0; i < treeItemsSublevel1.length; i++)
					{
						if (curParent.equals(treeItemsSublevel1[i].getName()) 
						 && curLevel == (treeItemsSublevel1[i].getLevel() + 1))
						{
							TreeItem curItem = new TreeItem(curName, curParent, curLevel);
							treeItemsSublevel2List.add(curItem);
						}
					}
				}
			}
			treeItemsSublevel2 = new TreeItem[treeItemsSublevel2List.size()];
			for (int a = 0; a < treeItemsSublevel2List.size(); a++)
			{
				treeItemsSublevel2[a] = (TreeItem) treeItemsSublevel2List.get(a);
			}
			
		}
		catch (Exception e)
		{
			System.out.println("Exception thrown: " + e);
		}
	}*/
}
