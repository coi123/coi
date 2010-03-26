TTLs= $(patsubst %.txt,%.ttl,$(wildcard *.txt))
TTLs: $(TTLs)

LASTs= $(patsubst %.txt,%.last,$(wildcard *.txt))
LASTs: $(LASTs)

.PHONY: TTLs LASTs

%.ttl: %.txt ./csv2ttl
	./csv2ttl $*.txt > $*.ttl
	@head -2 $*.last > a
	@head -2 $*.ttl > b
	@diff -u a b | tail --lines=+3
	@rm a b

test: TTLs

%.last: %.ttl
	cp $*.ttl $*.last

