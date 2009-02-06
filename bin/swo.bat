@echo off
set dir=%~dp0
cat %1 | %dir%SWtransformer -q - %2 | %dir%SWtransformer -q - %3 -s http://hospital.example/DB/ | mysql -u %4 --password="%5" %6 --table
