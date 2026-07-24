$action = New-ScheduledTaskAction -Execute "C:\nodejs\node.exe" -Argument '"d:\qualitec 2.0\daily-number-cron.js"' -WorkingDirectory "d:\qualitec 2.0"
$trigger = New-ScheduledTaskTrigger -Daily -At 07:50
Register-ScheduledTask -TaskName "datasheetDailyRun" -Action $action -Trigger $trigger -Force
