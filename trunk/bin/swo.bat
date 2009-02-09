@echo off
set dir=%~dp0
set temp=%dir%temp\
for /f "tokens=1,2,3,4,5,6,7,8 delims=.:,\ " %%a in ("%date% %time% %random%") do set "suffix=%%c%%b%%a-%%d%%e%%f%%g-%%h"

\set one=%temp%sdtm-%suffix%.rq 
\set two=%temp%hl7_sdtm-%suffix%.rq 
\set three=%temp%db_hl7-%suffix%.rq

\wget -nv -O %one% %1
\wget -nv -O %two% %2
\wget -nv -O %three% %3

\%dir%SWtransformer -q %one% %two% | %dir%SWtransformer -q - %three% -s http://hospital.example/DB/ | mysql -u %4 --password=%5 %6 --table

\del %one%
\del %two%
\del %three%