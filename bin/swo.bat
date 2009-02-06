REM @echo off
REM set dir=%~dp0
REM wget -nv -O- %1 | %dir%SWtransformer.exe -q - %2 | %dir%SWtransformer.exe -q - %3 -s http://hospital.example/DB/ | mysql -u %4 --password="%5" %6 --table
REM cat %1 | %dir%SWtransformer.exe -q - %2 | %dir%SWtransformer.exe -q - %3 -s http://hospital.example/DB/ | mysql -u %4 --password="%5" %6 --table

set dir=%~dp0
set temp=%dir%temp\

wget -nv -O %temp%one %1
REM wget -nv %2 -O %temp%two
REM wget -nv %3 -O %temp%three

REM cat %temp%one | %dir%SWtransformer -q - %dir%two | %dir%SWtransformer -q - %dir%three -s http://hospital.example/DB/ | mysql -u %4 --password="%5" %6 --table

REM del %dir%one
REM del %dir%two
REM del %dir%three
