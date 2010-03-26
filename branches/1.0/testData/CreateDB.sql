/* CreateDB.sql - scoop csv files from <http://www.w3.org/2008/04/DiabeticPatientsDataSet/> into an SQL DB.
 * $Id: CreateDB.sql,v 1.9 2008/09/30 11:24:43 eric Exp $
 */

create table Sex_DE (ID tinyint primary key, EnterpriseEntryID int, DefinitionSetID int, Entry int, EntryCode int DEFAULT 0, EntryName char(9), EntryMnemonic enum('', 'F', 'M', 'U'), IsInactiveFLAG boolean, IsEnforcedFLAG boolean, IsCurrentFLAG boolean, EffectiveDT datetime) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/Sex_DE.csv' into table Sex_DE fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;
/* | Warning | 1366 | Incorrect integer value: '' for column 'EntryCode' at row 1 | */

create table Person (ID int primary key, MiddleName char(1), SexDE tinyint, foreign key (SexDE) references Sex_DE(ID), DateOfBirth datetime, LastEditedDTTM datetime) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/Person.csv' into table Person fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

create table Medication_DE (ID int primary key, Entry int, EntryCode varchar(255), EntryName varchar(100), NDC bigint, DDI int, Strength varchar(20), Form varchar(6), Qty char(1), UnitOfMeasure varchar(14), ControlSubstanceCode enum('', 'C2', 'C3', 'C4', 'C5', 'U'), RouteOfAdminDE int, DrugName varchar(40), LabelerName char(0), DisplayName varchar(100)) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/Medication_DE.csv' into table Medication_DE fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;
/* | Warning | 1366 | Incorrect integer value: '' for column 'NDC' at row 43    |
 * ... 5506, 6353, 7772, 13229, 19312, 19319, 23418, 30511, 30512, 32091, 37316, 38024, 39003, 43960, 44073, 44531, 44598, 45369, 59359, 68344
 * a total of 21 empty values for NDC codes */

create table Item_Medication (ID bigint primary key, PatientID int, foreign key (PatientID) references Person(ID), EntryName varchar(255), IsAbnormalFLAG boolean, IsErrorFLAG boolean, ItemType enum("ME"), PerformedDTTM datetime) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/Item_Medication.csv' into table Item_Medication fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

create table VitalSigns (IsAbnormalFLAG boolean, PatientID int, foreign key (PatientID) references Person(ID), QoID tinyint, Qo varchar(25), QoMnemonic enum('BP DIAS', 'BP SYS', 'HGT', 'LMP', 'O2', 'PainScale', 'PUL QUAL', 'PUL RATE', 'RESP', 'RESP QUAL', 'TEMP', 'WGT'), AnswerDET varchar(15), NumericFinding float, UnitsMnemonic enum('', 'cm', 'F', 'in', 'kg', 'lb'), AnswerDataName enum('DateTime', 'Numeric', 'Single'), PerformedDTTM datetime, FindingStatus enum('Active', 'Entered in Error')) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/VitalSigns.csv' into table VitalSigns fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

create table Encounter (ID int primary key, ProviderID int, PatientID int not null, foreign key (PatientID) references Person (id), VisitID int not null, DTTM datetime, EncounterTypeDE tinyint, ReferringProviderID int, Provider2ID int, LockedDTTM char(0)) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/Encounter.csv' into table Encounter fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

create table ICD9_Diagnosis_DE (ID int primary key, EnterpriseEntryID int, DefinitionSetID tinyint, Entry int, EntryCode varchar(10), EntryName varchar(150), EntryMnemonic varchar(10), IsInactiveFLAG boolean, IsEnforcedFLAG boolean, IsCurrentFLAG boolean, EffectiveDT datetime, HighAge tinyint, LowAge tinyint, SexDE tinyint, foreign key (SexDE) references Sex_DE(id), DisplayName varchar(150), InjuryTypeReqFLAG boolean) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/ICD9_Diagnosis_DE.csv' into table ICD9_Diagnosis_DE fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

create table Encounter_Diagnosis (EncounterID int, foreign key (EncounterID) references Encounter(ID), ICD9DiagnosisDE int, foreign key (ICD9DiagnosisDE) references ICD9_Diagnosis_DE(ID)) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/Encounter_Diagnosis.csv' into table Encounter_Diagnosis fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

create table ICD9_Procedure_DE (ID int primary key, EnterpriseEntryID int, DefinitionSetID tinyint, Entry int, EntryCode varchar(10), EntryName varchar(150), EntryMnemonic varchar(10), IsInactiveFLAG boolean, IsEnforcedFLAG boolean, IsCurrentFLAG boolean, EffectiveDT datetime, SexDE tinyint, foreign key (SexDE) references Sex_DE(id)) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/ICD9_Procedure_DE.csv' into table ICD9_Procedure_DE fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

/* Medication.ItemID appears to be a ref to Item_Medication.ID, though
/* of our 340 entries, 93 don't match up. This foreign key constraint
 * has been dropped 'till we can figure out the exceptions.
 */
create table tempMedication (ID bigint primary key, ItemID varchar(15), FormOfMedicationDE enum("0"), FreqUnitsDE tinyint, Dose tinyint DEFAULT 0, Refill tinyint, RoutOfAdministrationDE tinyint, QuantityToDispense smallint DEFAULT 0, DaysToTake tinyint, PrescribedByID int, MedDictDE int, foreign key (MedDictDE) references Medication_DE(ID)) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/Medication.csv' into table tempMedication fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
create table Medication (ID bigint primary key, ItemID bigint, /* foreign key (ItemID) references Item_Medication(ID), */ FormOfMedicationDE enum("0"), FreqUnitsDE tinyint, Dose tinyint DEFAULT 0, Refill tinyint, RoutOfAdministrationDE tinyint, QuantityToDispense smallint DEFAULT 0, DaysToTake tinyint, PrescribedByID int, MedDictDE int, foreign key (MedDictDE) references Medication_DE(ID)) ENGINE = INNODB;
insert into Medication select * from tempMedication where ItemID != "";
drop table tempMedication;
show warnings;

create table ResultsByEncounter (EncounterDate datetime, EncounterType enum("Lab Encounter", "AUDIT"), EncounterID int, foreign key (EncounterID) references Encounter(ID), PatientID int, foreign key (PatientID) references Person(ID)) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/ResultsByEncounter.csv' into table ResultsByEncounter fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

create table TestResults (ActivityHeaderID double, ItemID double primary key, IsAbnormalFLAG boolean, PatientID int, foreign key (PatientID) references Person(ID), QoID int, Qo varchar(255), QoMnemonic varchar(255), AnswerDET varchar(255), NumericResult double, ResultStage enum("", "C", "F", "P"), UnitsMnemonic varchar(255), UnitsDET varchar(255), ShortRefRange varchar(255), AbnormalFlagType enum("", "A", "C", "H", "I", "L", "LL", "N", "R", "S"), AnswerDataName enum("Numeric", "Text"), SetOrder tinyint, PerformedDTTM datetime, CurrentID double) ENGINE = INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/TestResults.csv' into table TestResults fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

select count(*) 
  from Encounter_Diagnosis 
  join Encounter on Encounter_Diagnosis.EncounterID=Encounter.ID 
    join Person on Encounter.PatientID=Person.id 
  join ICD9_Diagnosis_DE on Encounter_Diagnosis.ICD9DiagnosisDE=ICD9_Diagnosis_DE.ID;

select count(*) 
  from Medication 
  join Item_Medication on Medication.ItemID=Item_Medication.ID 
    join Person on Item_Medication.PatientID=Person.ID;

SELECT Person.ID, 
       Sex_DE.EntryMnemonic AS S, 
       Item_Medication.EntryName AS drug, 
       Medication_DE.NDC, Medication.Dose AS dose, 
       SUBSTR(Item_Medication.PerformedDTTM, 1, 10) AS startDate, 
       Medication.DaysToTake AS days 
  FROM Person 
  JOIN Sex_DE ON Person.SexDE=Sex_DE.ID 
  JOIN Item_Medication ON Person.ID=Item_Medication.PatientID 
  JOIN Medication ON Item_Medication.ID=Medication.ItemID 
  JOIN Medication_DE ON Medication_DE.ID=Medication.MedDictDE
ORDER BY Person.ID, startDate;


SELECT Person.ID, Sex_DE.EntryMnemonic AS S, Item_Medication.EntryName AS drug, Medication_DE.NDC, Medication.Dose AS dose, SUBSTR(Item_Medication.PerformedDTTM, 1, 10) AS startDate, Medication.DaysToTake AS days, Encounter.*, Encounter_Diagnosis.* 
  FROM Person
  JOIN Sex_DE ON Person.SexDE=Sex_DE.ID 
  JOIN Item_Medication ON Person.ID=Item_Medication.PatientID 
  JOIN Medication ON Item_Medication.ID=Medication.ItemID 
  JOIN Medication_DE ON Medication_DE.ID=Medication.MedDictDE 

  JOIN Encounter ON Encounter.PatientID=Person.id
                    AND SUBSTR(Encounter.DTTM, 1, 10)=SUBSTR(Item_Medication.PerformedDTTM, 1, 10)
  JOIN Encounter_Diagnosis ON Encounter_Diagnosis.EncounterID=Encounter.ID 
  JOIN ICD9_Diagnosis_DE ON Encounter_Diagnosis.ICD9DiagnosisDE=ICD9_Diagnosis_DE.ID
 WHERE Item_Medication.EntryName like "%etformin%"
ORDER BY Person.ID, startDate;

create table NDCcodes (ingredient int, RxCUI int, labelType enum('Branded','Clinical'), name varchar(255), NDC double) ENGINE=INNODB;
load data LOCAL infile 'D:/acasvn/coi/testData/NDCcodes_BrandedDrugs.csv' into table NDCcodes fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 0 lines;
load data LOCAL infile 'D:/acasvn/coi/testData/NDCcodes_ClinicalDrugs.csv' into table NDCcodes fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 0 lines;

/* add hacked patient data from Helen Chen.
 * http://www.w3.org/mid/OFD3E69095.3558DC6E-ON852574AC.0056CAA2-852574AC.0058422D@agfa.com
 */

load data LOCAL infile 'D:/acasvn/coi/testData/MockPerson.csv' into table Person fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

load data LOCAL infile 'D:/acasvn/coi/testData/MockMedication.csv' into table Medication fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

load data LOCAL infile 'D:/acasvn/coi/testData/MockItem_Medication.csv' into table Item_Medication fields terminated by ',' ENCLOSED BY '"' lines terminated by '\n' ignore 1 lines;
show warnings;

