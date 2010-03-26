import java.net.*;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import com.hp.hpl.jena.n3.turtle.TurtleReader;
import com.hp.hpl.jena.rdf.model.*;

public class Tester 
{
	public static void main(String[] args)
	{
		/*
		try 
		{
			URL url = new URL("http://localhost:8080/coi/kb/SDTMTree.n3");
			InputStream inStream = url.openStream();
			BufferedReader reader = new BufferedReader (new InputStreamReader (inStream));
			SDTMTreeParser tester = new SDTMTreeParser(reader);
			tester.parseTree(null, 1);
			TreeItem[] items = tester.getTreeItems();
			System.out.println("Made it out of parser");
		}
		catch (Exception ex)
		{
			System.out.println("Exception: " + ex);
		}
		*/
		try
		{
			URL url = new URL("http://localhost:8080/coi/kb/SDTMTree.n3");
			InputStream inStream = url.openStream();
			System.out.println("Modelfactory is being a jerk");
			System.out.println("it apparently worked");
			
			
			TurtleReader reader;
		}
		catch (Exception e)
		{
			System.out.println("Exception occurred: " + e);
		}
	}
}
