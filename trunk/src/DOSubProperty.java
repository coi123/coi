
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/** A utility class that queries an sqlite database containing properties of some 
 *  drug entries to display when a drug is selected
 */

public class DOSubProperty
{
	public static String getPropertyFromNode(String node)
	{
		String property = "";
		try
		{
			// initialises database connection parameters, creates a connection and
			// queries the database for the property fields 
			Statement stmt;
			Class.forName("org.sqlite.JDBC");
			String connUrl = "jdbc:sqlite:/C:/aca/coi/kb/DOsub";
			Connection conn = DriverManager.getConnection(connUrl);
			stmt = conn.createStatement();
			
			String executionString = "SELECT name,' ',const,' ',value,'.' FROM property WHERE id=='D:" + node + "';";
			// String executionString = "SELECT * FROM property WHERE id=='" + node + "';";
			
			ResultSet result = stmt.executeQuery(executionString);
			
			boolean finished = false;
			
			// Note: some clipping of the results is required as the entries contain
			// some .n3 formatting
			while(result.next() && !finished)
			{
				for(int i = 1; i < 7; i++)
				{
					property += result.getString(i);
					property = property.replaceAll("D:", "");
					property = property.replace('_', ' ');
					property = property.replace('+', ' ');
				}
				finished = true;
			}
			result.close();
		}
		catch (Exception e)
		{
			property = "Error has occurred: " + e;
		}
		return property;
	}
}
