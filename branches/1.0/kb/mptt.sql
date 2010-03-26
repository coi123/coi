SELECT      n1.root_id,
           n1.name n1name, n1.lft n1lft, n1.rgt n1rgt,
           n2.name n2name, n2.lft n2lft, n2.rgt n2rgt
FROM        table AS n1
LEFT OUTER JOIN
   table AS n2
   ON (
       n1.lft = (n2.rgt+1)
       AND
       n1.rgt > n2.rgt
       AND
       n1.root_id = n2.root_id
   )
WHERE    n1.id=$id

UPDATE ||table ||
SET lft=lft + case when lft<".$nodes["n1lft"]." then $inc else -$desc end,
rgt=rgt + case when rgt<".$nodes["n1lft"]." then $inc else -$desc end
WHERE root_id=$root_id
AND
lft>=".$nodes["n2lft"]."
AND
rgt<=".$nodes["n1rgt"]."
