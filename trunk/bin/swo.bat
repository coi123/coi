@echo off
set dir=%~dp0
wget -nv -O- %1 | %dir%SWtransformer.exe -q - %2 | %dir%SWtransformer.exe -q - %3 -s http://hospital.example/DB/ | mysql -u %4 --password="%5" %6 --table
