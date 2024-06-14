# Software engineering deadlines countdown

Based on [ai-deadlines](https://aideadlin.es) by @abshkdz
and [sec-deadlines](https://sec-deadlines.github.io)

## Adding/updating a conference

<!-- * Read the data format description below. **Note that the timezone format sign is inverted** (e.g., UTC+7 is written as `Etc/GMT-7`). It's [not a bug][0]. I hate this format too. I'd be happy to move to a different timezone JavaScript library that uses a friendlier format, but I don't have time for that. -->
* Update `_data/conferences.yml`. You can do that on Github or locally after forking the repo.
* Send a pull request

### Conference entry record

Example record:

```
- name: ICSE
  description: International Conference on Software Engineering - Research Track
  year: 2025
  link: https://conf.researchr.org/track/icse-2025/icse-2025-research-track
  deadline: 
  - "2024-03-15 23:59"
  - "2024-06-26 23:59"
  date: April 26 - May 4, 2025
  place: Ottawa, Ontario, Canada
  notes: April 26 - May 4, 2025

  tags: [CO, RPT]
```

Descriptions of the fields:

| Field name    | Description                                                             |
|---------------|-------------------------------------------------------------------------|
| `name`\*      | Short entry name, without year                 |
| `description` | Description, or long name                      |
| `year`\*      | Year the event is happening                    |
| `link`\*      | URL to the entry home page                     |
| `deadline`\*  | A list of deadlines. ([Gory details below][8]) |
| `date`        | When the entry is happening                    |
| `place`       | Where the entry is happening                   |
| `note`        | Extra [notes][7] about the deadline            |
| `tags`        | One or multiple [tags][3]                      |


Fields marked with asterisk (\*) are required.


### Deadline format

The *deadline* field can contain:

1. The simplest option: a date and time in ISO format. Example: `["2017-08-19 23:59"]` (Note that you need to wrap even a single deadline in a list).
2. If a deadline is rolling, you can use a template date, just substitute the
   year with `%y` and the year before the conference with `%Y`. Example:
   `["%y-01-15 23:59"]` means there is a deadline on the 15th January in the
   same year as the conference.
3. A list of (1) or (2). Example of two rolling deadlines, with one in the end
   of October in the year prior to the conference year, and the second in the
   end of February in the same year as the conference:
  ```
  - "%Y-10-31 23:59"
  - "%y-02-28 23:59"
  ```
4. If the deadline has not yet been announced, use `["TBA"]` as the deadline for the conference (case sensitive.) It will show up at the bottom of future conferences.

On the page, all deadlines are displayed in viewer's local time (that's a feature).

*Note:* If the deadline hour is `{h}:00`, it will be automatically translated into `{h-1}:59:59` to avoid pain and confusion when it happens to be midnight in local time.


### Timezones

Please remember that the timezone should be AoE (Anywhere on Earth) when you submit a pull request.

<!-- The timezone is specified in [tz format][1]. Unlike abbreviations (e.g. EST), these are un-ambiguous. Here are tz codes for some common timezones:

| Common name                   | tz                                                                 |
|-------------------------------|--------------------------------------------------------------------|
| UTC                           | `Etc/UTC`                                                          |
| America Pacific Time          | `America/Los_Angeles`                                              |
| Pacific Standard Time (UTC-8) | `Etc/GMT+8` (Yes, the sign is inverted for some weird reason)      |
| America Eastern Time          | `America/New_York`                                                 |
| Eastern Standard Time (UTC-5) | `Etc/GMT+5`                                                        |
| American Samoa Time (UTC-11)  | `Pacific/Samoa` or `Etc/GMT+11`. This timezone does not use DST.   |
| Aleutian Islands              | `America/Adak`                                                     | -->

### Note

The *note* field can be used to indicate additional information about a deadline. For example, if an abstract is required before the deadline.

### Tags

The *tag* field indicates the type of deadline entry you are adding. Users can filter deadlines based on tags. There are two main categories:

- **Venue type:** The type of venues the deadline indicates. For example, is it a conference (`CO`), a workshop (`WO`), or a special edition of a journal (`JO`).
- **Tracks:** Software engineering conferences generally have multiple tracks with different goals, scopes, requirements, and deadlines. For example, ICSE 2025 has a [Research][5] and a [New Ideas and Emerging Results][6] tracks. The former is a research paper track (`RPT`), while the latter is a new idea and emerging results track (`NIER`). We are currently testing our tag groups for tracks and welcome any suggestions! :)

A complete tag list is available in [`types.yml`][4].

[0]: https://momentjs.com/timezone/docs/#/zone-object/offset/
[1]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
[2]: https://www.timeanddate.com/time/zones/aoe
[3]: #tags
[4]: _data/types.yml
[5]: https://conf.researchr.org/track/icse-2025/icse-2025-research-track
[6]: https://conf.researchr.org/track/icse-2025/icse-2025-nier
[7]: #note
[8]: #deadline-format
