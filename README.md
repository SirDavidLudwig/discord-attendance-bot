# Discord Attendance Bot

This is a rough prototype of an attendance bot for Discord. It works my mapping the users' accounts to their Pipeline IDs. Then by creating a schedule of classes and the class rosters, the user can simply run the `!attend` command during their class period to mark attendance. Attendance sheets are exported in a CSV format that can be opened with any spreadsheet editor.

For new Discord users, first attendance must be ran with `!attend <pipelineId>` to map their accounts appropriately.

## Schedule Structure

Schedules are kept in the file `data/schedules.json`. below is an example schedule:

```json
{
    "1170-001": {
        "lecture": {
            "MWF": "08:00-08:55"
        },
        "lab": {
            "MW": "09:05-10:05"
        }
    },
    "1170-002": {
        "lecture": {
            "MWF": "10:20-11:15"
        },
        "lab": {
            "MW": "11:25-12:25"
        }
    }
}
```

## Class Rosters

The class rosters are created in the `data/roster` directory. The bot will search for the class rosters using the course identifiers from the schedule file. So each roster file should be named as `<course>-<section>.csv`. Example roster files that would be included with the previous example would be `1170-001.csv` and `1170-002.csv`.

The roster files are plain comma deliminated CSV files. The files should contain three columns: `pipeline ID`, `last name`, and `first name`. The file should not include any header lines. An example is listed below (the header is for readability purposes only)

| Pipeline ID | Last Name  | First Name |
|-------------|------------|------------|
| s6m4h       | Marsh      | Stan       |
| k2b2c       | Broflovski | Kyle       |
| etc9a       | Cartman    | Eric       |
| kmc2v       | McCormick  | Kenny      |
