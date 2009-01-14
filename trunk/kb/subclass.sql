WITH temp_drugTree (subject, object, iteration) AS
(
SELECT subject, object, 0
FROM rdf WHERE subject = ‘D:C0002771’
UNION ALLSELECT a.subject, b.object, a.iteration + 1
FROM temp_drugTree AS a, rdf AS b
WHERE a.subject = b.object
)

SELECT subject object iteration
FROM temp_drugTree;
  
