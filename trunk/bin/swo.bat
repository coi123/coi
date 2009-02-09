@echo off
set dir=%~dp0
set temp=%dir%temp\
set suffix=%random%-%random%-%random%

if not exist %temp% mkdir %temp%

set one=%temp%sdtm-%suffix%.rq 
set two=%temp%hl7_sdtm-%suffix%.rq 
set three=%temp%db_hl7-%suffix%.rq

wget -nv -O %one% %1
wget -nv -O %two% %2
wget -nv -O %three% %3

%dir%SWtransformer -q %one% %two% | %dir%SWtransformer -q - %three% -s %4 | mysql -u %5 --password=%6 %7 --table

del %one%
del %two%
del %three%