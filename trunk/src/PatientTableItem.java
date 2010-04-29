
/** a utility class for the PatientTableModel, each field corresponds to a column in the
 *  table.
 */

public class PatientTableItem 
{
	private String patient;
	private String dob;
	private String gender;
	private String medication;
	private String datePrescribed;
	
	public PatientTableItem()
	{
		new PatientTableItem(null,null,null,null, null);
	}
	
	public PatientTableItem(String inPatient, String inDob, String inGender,
			                String inMeds, String inDatePrescribed)
	{
		setPatient(inPatient);
		setDob(inDob);
		setGender(inGender);
		setMedication(inMeds);
		setDatePrescribed(inDatePrescribed);
	}

	public void setPatient(String patient) {
		this.patient = patient;
	}

	public String getPatient() {
		return patient;
	}

	public void setDob(String dob) {
		this.dob = dob;
	}

	public String getDob() {
		return dob;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getGender() {
		return gender;
	}

	public void setMedication(String medication) {
		this.medication = medication;
	}

	public String getMedication() {
		return medication;
	}

	public void setDatePrescribed(String datePrescribed) {
		this.datePrescribed = datePrescribed;
	}

	public String getDatePrescribed() {
		return datePrescribed;
	}
	
	
}
