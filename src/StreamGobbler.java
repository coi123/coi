
import java.io.*;

/** a class found online that properly handles handling external applications' output streams 
 *  in a separate thread
 *  
 *  Was used in conjunction with runtime.exec()
 *  
 *  Will likely become obsolete when the 
 */

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

