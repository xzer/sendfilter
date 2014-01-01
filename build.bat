set x=sendfilter
set v=%1

mkdir build
xcopy "%x%" build /i /e

cd build

7z a -tzip "%x%.xpi" * -r -mx=9
cd ..

move build\%x%.xpi %x%.%v%.xpi

rmdir /s /q build


