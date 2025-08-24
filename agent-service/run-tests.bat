@echo off
echo Running ChatController Tests...
echo.

echo Building the project...
call gradlew.bat clean build -x test

echo.
echo Running unit tests...
call gradlew.bat test --tests "*ChatControllerTest*"

echo.
echo Running integration tests...
call gradlew.bat test --tests "*ChatControllerIntegrationTest*"

echo.
echo All tests completed!
pause
