---
title: Dates and Time
summary: Date and time creation, parts, arithmetic, formatting and time zones.
description: Date and time creation, parts, arithmetic, formatting and time zones.
icon: phosphor-duotone:calendar
order: 6
---

# Dates and Time

Date and time creation, parts, arithmetic, formatting and time zones. 47 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `clearTimezone` | `clearTimezone( ... )` | always |  |
| `createDate` | `createDate( ... )` | always | Creates a date from year, month and day. |
| `createDateTime` | `createDateTime( ... )` | always | Creates a date-time. All seven arguments are required: year, month, day, hour, minute, second, millisecond. |
| `createODBCDate` | `createODBCDate( ... )`, `datetime.toOdbcDate( ... )` | always | Returns an ODBC date string such as {d '2024-03-15'}. |
| `createODBCDateTime` | `createODBCDateTime( ... )`, `datetime.toOdbcDateTime( ... )` | always | Returns an ODBC timestamp string. |
| `createODBCTime` | `createODBCTime( ... )`, `datetime.toOdbcTime( ... )` | always | Returns an ODBC time string. |
| `createTime` | `createTime( ... )` | always |  |
| `createTimeSpan` | `createTimeSpan( ... )` | always |  |
| `dateAdd` | `dateAdd( ... )`, `datetime.add( ... )` | always | Adds an amount of a date part to a date: dateAdd( part, number, date ). |
| `dateCompare` | `dateCompare( ... )`, `datetime.compare( ... )` | always | Returns -1, 0 or 1 when the first date is before, equal to or after the second. |
| `dateConvert` | `dateConvert( ... )` | always |  |
| `dateDiff` | `dateDiff( ... )`, `datetime.diff( ... )` | always | Returns the difference between two dates in the given part: dateDiff( part, date1, date2 ). |
| `dateFormat` | `dateFormat( ... )`, `datetime.dateFormat( ... )`, `string.dateFormat( ... )` | always | Formats a date with a pattern such as "yyyy-MM-dd". Pattern letters follow Java: "MM" is the month and "mm" is the minute. |
| `datePart` | `datePart( ... )` | always |  |
| `dateTimeFormat` | `dateTimeFormat( ... )`, `datetime.dateTimeFormat( ... )`, `datetime.format( ... )`, `string.dateTimeFormat( ... )` | always | Formats a date and time with a Java-style pattern. |
| `day` | `day( ... )`, `datetime.day( ... )`, `string.day( ... )` | always | Returns the day of the month. |
| `dayOfWeek` | `dayOfWeek( ... )`, `datetime.dayOfWeek( ... )`, `string.dayOfWeek( ... )` | always | Returns the day of the week; Sunday is 1. |
| `dayOfWeekAsString` | `dayOfWeekAsString( ... )`, `datetime.dayOfWeekAsString( ... )`, `string.dayOfWeekAsString( ... )` | always |  |
| `dayOfWeekShortAsString` | `dayOfWeekShortAsString( ... )`, `datetime.dayOfWeekShortAsString( ... )`, `string.dayOfWeekShortAsString( ... )` | always |  |
| `dayOfYear` | `dayOfYear( ... )`, `datetime.dayOfYear( ... )`, `string.dayOfYear( ... )` | always | Returns the day of the year. |
| `daysInMonth` | `daysInMonth( ... )`, `datetime.daysInMonth( ... )`, `string.daysInMonth( ... )` | always | Returns the number of days in the month of a date. |
| `daysInYear` | `daysInYear( ... )`, `datetime.daysInYear( ... )`, `string.daysInYear( ... )` | always | Returns the number of days in the year of a date. |
| `firstDayOfMonth` | `firstDayOfMonth( ... )`, `datetime.firstDayOfMonth( ... )`, `string.firstDayOfMonth( ... )` | always |  |
| `getNumericDate` | `getNumericDate( ... )`, `datetime.getNumericDate( ... )` | always |  |
| `getTickCount` | `getTickCount( ... )` | always | Returns a millisecond counter that increases with time. |
| `getTime` | `getTime( ... )`, `datetime.getTime( ... )` | always |  |
| `getTimezone` | `getTimezone( ... )`, `datetime.getTimezone( ... )`, `datetime.timezone( ... )` | always |  |
| `getTimezoneInfo` | `getTimezoneInfo( ... )` | always |  |
| `hour` | `hour( ... )`, `datetime.hour( ... )`, `string.hour( ... )` | always | Returns the hour of a date-time. |
| `isLeapYear` | `isLeapYear( ... )` | always | Returns true for a leap year. |
| `millisecond` | `millisecond( ... )`, `datetime.millisecond( ... )`, `string.millisecond( ... )` | always |  |
| `minute` | `minute( ... )`, `datetime.minute( ... )`, `string.minute( ... )` | always | Returns the minute of a date-time. |
| `month` | `month( ... )`, `datetime.month( ... )`, `string.month( ... )` | always | Returns the month (1 to 12) of a date. |
| `monthAsString` | `monthAsString( ... )`, `datetime.monthAsString( ... )`, `string.monthAsString( ... )` | always |  |
| `monthShortAsString` | `monthShortAsString( ... )`, `datetime.monthShortAsString( ... )`, `string.monthShortAsString( ... )` | always |  |
| `nanosecond` | `nanosecond( ... )`, `datetime.nanosecond( ... )` | always |  |
| `now` | `now( ... )` | always | Returns the current date and time. |
| `offset` | `offset( ... )`, `datetime.offset( ... )` | always |  |
| `parseDateTime` | `parseDateTime( ... )`, `string.toDateTime( ... )` | always |  |
| `quarter` | `quarter( ... )`, `datetime.quarter( ... )`, `string.quarter( ... )` | always | Returns the quarter (1 to 4). |
| `second` | `second( ... )`, `datetime.second( ... )`, `string.second( ... )` | always | Returns the second of a date-time. |
| `setTimezone` | `setTimezone( ... )` | always |  |
| `timeFormat` | `timeFormat( ... )`, `datetime.timeFormat( ... )`, `string.timeFormat( ... )` | always | Formats the time of a date with a Java-style pattern such as "HH:mm:ss". |
| `timeUnits` | `timeUnits( ... )` | always |  |
| `toEpochMillis` | `toEpochMillis( ... )`, `datetime.toEpochMillis( ... )` | always | Returns the milliseconds since 1970-01-01T00:00:00Z. |
| `week` | `week( ... )`, `datetime.week( ... )`, `string.week( ... )` | always |  |
| `year` | `year( ... )`, `datetime.year( ... )`, `string.year( ... )` | always | Returns the year of a date. |
