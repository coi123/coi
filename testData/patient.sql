SELECT union1.somePerson AS somePerson
       FROM (
    SELECT 1 AS _DISJOINT_, NULL AS somePerson, ADMINISTRATION.id AS ADMINISTRATION, ADMINISTRATION.name AS PATIENT_name, someTest.attr2 AS FOOP_gen0
           FROM Patient AS ADMINISTRATION
                INNER JOIN Names AS PATIENT_name ON PATIENT_name.id=ADMINISTRATION.name
                INNER JOIN bar AS someTest ON someTest.id=PATIENT_name.patient
  UNION
    SELECT 2 AS _DISJOINT_, PATIENT_name.patient AS somePerson, ADMINISTRATION.id AS ADMINISTRATION, ADMINISTRATION.name AS PATIENT_name, somePerson.attr2 AS FOOP_gen0
           FROM Patient AS ADMINISTRATION
                INNER JOIN Names AS PATIENT_name ON PATIENT_name.id=ADMINISTRATION.name
                INNER JOIN bar AS somePerson ON somePerson.id=PATIENT_name.patient
             ) AS union1