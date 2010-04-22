
import java.io.*;
import java.util.*;

public class StreamGobbler extends Thread
{
    InputStream is;
    String type;
    OutputStream os;
    String output;
    
    StreamGobbler(InputStream is, String type)
    {
        this(is, type, null);
    }
    StreamGobbler(InputStream is, String type, OutputStream redirect)
    {
        this.is = is;
        this.type = type;
        this.os = redirect;
    }
    
    public void run()
    {
    	output = "";
        try
        {
            InputStreamReader isr = new InputStreamReader(is);
            BufferedReader br = new BufferedReader(isr);
            String line=null;
            while ( (line = br.readLine()) != null)
            {
            	output += line + "\n"; 
            }
        } 
        catch (IOException ioe)
        {
            ioe.printStackTrace();
        }
    }
    
    public String getProgramOutput()
    {
    	return output;
    }
}

