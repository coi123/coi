@echo off
set dir=%~dp0
set temp=%dir%temp\
set suffix=%random%-%random%-%random%

if not exist %temp% mkdir %temp%

set one=%temp%sdtm-%suffix%.rq 
REM set two=%temp%hl7_sdtm-%suffix%.rq 
REM set three=%temp%db_hl7-%suffix%.rq

REM set one=%temp%sdtm.rq 
set two=%temp%hl7_sdtm.rq 
set three=%temp%db_hl7.rq


REM set result1=%temp%result1-%suffix%
REM set result2=%temp%result2-%suffix%

wget -nv -O %one% %1
REM wget -nv -O %two% %2
REM -nv -O %three% %3


REM %dir%SWtransformer -q %one% %two% | %dir%SWtransformer -q - %three% -s %4 | mysql -u %5 --password=%6 %7 --table

%dir%SWtransformer -q %one% %two% | %dir%SWtransformer -q - %three% -s http://hospital.example/DB/ | mysql -u %2 --password=aca coi --table

REM %dir%SWtransformer -q %one% %two% > %result1%
REM %dir%SWtransformer -q %result1% %three% -s %4 > %result2%

REM del %one%
REM del %two%
REM del %three%