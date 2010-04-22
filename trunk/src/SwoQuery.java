
import java.io.*;
import java.net.URLEncoder;
import java.util.*;

public class SwoQuery 
{
	public static String queryPatients(String sdtmParam, 
								String hl7_sdtmParam, 
								String db_hl7Param)
	{
		String stringToReturn = "Start of program output: \n";
		
		sdtmParam = "\"" + sdtmParam + "\"";
		hl7_sdtmParam = "\"" + hl7_sdtmParam + "\"";
		db_hl7Param = "\"" + db_hl7Param + "\"";
		
		String db_link = "http://localhost:3306/coi";
		String user = "root";
		String password = "aca";
		String table = "coi";
		
		String[] cmd = new String[]{"C:\\Temp\\bin\\swo.bat", sdtmParam, 
									hl7_sdtmParam, db_hl7Param, db_link,
									user, password, table};
		
		Runtime rt = Runtime.getRuntime();
		try
		{
			Process proc = rt.exec(cmd);
			
			StreamGobbler errorGobbler = new StreamGobbler(proc.getErrorStream(), "Error");
			StreamGobbler outputGobbler = new StreamGobbler(proc.getInputStream(), "Output");
			errorGobbler.start();
			outputGobbler.start();
			
			proc.waitFor();
			
			
			stringToReturn += errorGobbler.getProgramOutput();
			stringToReturn += outputGobbler.getProgramOutput();
			stringToReturn += " :end of program input";
		}
		
		catch (Exception e)
		{
			e.printStackTrace();
			stringToReturn += "Error from query executor: " + e.toString();
		}
		
		return stringToReturn;
	}
}