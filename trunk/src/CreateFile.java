import java.io.*;
import java.io.BufferedWriter;
import java.io.OutputStreamWriter;
import java.net.URLDecoder;

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
