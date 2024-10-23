@echo off
start chrome.exe "file:///%cd%/index.html" --user-data-dir="%cd%/chromedata/" --allow-file-access-from-files --start-fullscreen 
