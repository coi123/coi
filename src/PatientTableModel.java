import java.io.BufferedReader;
import java.util.ArrayList;

/** the class used to run the query transformation and display results of the query
 *  
 *  Will need major modifications when the JNI wrapper is finished from Eric
 */

public class PatientTableModel 
{
	private ArrayList patientItems;
	private String hl7_sdtmString;
	private String db_hl7String;
	
	public PatientTableModel()
	{
		patientItems = new ArrayList();
		hl7_sdtmString = null;
		db_hl7String = null;
	}

	public void setPatientItems(ArrayList inPatientItems) 
	{
		patientItems = inPatientItems;
	}
	
	public void executeAndParse(String sdtmString, BufferedReader hl7_sdtmStream, BufferedReader db_hl7Stream)
	{
		if (hl7_sdtmString == null && db_hl7String == null)
		{
			hl7_sdtmString = "";
			db_hl7String = "";
			String line;
			try
			{
				while ((line = hl7_sdtmStream.readLine())!= null)
				{
					hl7_sdtmString += line + "\n";
				}
				while((line = db_hl7Stream.readLine())!= null)
				{
					db_hl7String += line + "\n";
				}
				hl7_sdtmStream.close();
				db_hl7Stream.close();
			}
			catch(Exception e)
			{
				
			}
		}
		String resultString = SwoQuery.queryPatients(sdtmString, hl7_sdtmString, db_hl7String);
		
		String patient = resultString;
		String dob = "";
		String sex = "";
		String medication = "";
		String datePrescribed = "";
		PatientTableItem newItem = new PatientTableItem(patient, dob, sex, 
														medication, datePrescribed);
		patientItems.add(newItem);
		
		/*
		 * not finished properly
		 */
		
		/*
		String[] patientList = resultString.replace("/00:00:00/gi", "").split("|");
		
		for (int i = 7; i < 90 && patientList.length > 0; i += 5)
		{
			String patient = patientList[i];
			String dob = patientList[i+1];
			String sex = patientList[i+2];
			String medication = patientList[i+3];
			String datePrescribed = patientList[i+4];
			PatientTableItem newItem = new PatientTableItem(patient, dob, sex, 
															medication, datePrescribed);
			patientItems.add(newItem);
		}
		*/
		
	}
	
	public ArrayList getPatientItems() 
	{
		return patientItems;
	}
}
