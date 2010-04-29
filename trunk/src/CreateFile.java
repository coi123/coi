import java.io.*;
import java.io.BufferedWriter;
import java.net.URLDecoder;

/** this is a utility class meant to be called from the swo.bat file to use in conjunction
 *  with SWtransformer but will become obsolete when the JNI wrapper is created
 */

public class CreateFile 
{	
	public static void main(String[] args)
	{
		try
		{
			File writeFile = new File(args[0]);
			BufferedWriter writer = new BufferedWriter(new FileWriter(writeFile));
			writer.write(URLDecoder.decode(args[1], "UTF-8"));
			writer.close();
		}
		catch (Exception e)
		{
			System.out.println(e);
		}
	}
}
