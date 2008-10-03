set x=sendfilter
mkdir build
xcopy "%x%" build /i /e

cd build\chrome
7z a -tzip "%x%.jar" * -r -mx=0
cd ..\..

rmdir /s /q build\chrome\content
rmdir /s /q build\chrome\locale
rmdir /s /q build\chrome\skin

cd build

del chrome.manifest
ren chrome.manifest.arch chrome.manifest

7z a -tzip "%x%.xpi" * -r -mx=9
cd ..

move build\%x%.xpi %x%.xpi

rmdir /s /q build


