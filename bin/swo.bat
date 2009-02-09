@echo off
set dir=%~dp0
set temp=%dir%temp\
for /f "tokens=1,2,3,4,5,6,7,8 delims=.:,\ " %%a in ("%date% %time% %random%") do set "suffix=%%c%%b%%a-%%d%%e%%f%%g-%%h"

if not exist %temp% mkdir %temp%

rem set one=%temp%sdtm-%suffix%.rq 
rem set two=%temp%hl7_sdtm-%suffix%.rq 
rem set three=%temp%db_hl7-%suffix%.rq

rem wget -nv -O %one% %1
rem wget -nv -O %two% %2
rem wget -nv -O %three% %3

rem %dir%SWtransformer -q %one% %two% | %dir%SWtransformer -q - %three% -s http://hospital.example/DB/ | mysql -u %4 --password=%5 %6 --table

rem del %one%
rem del %two%
rem del %three%