#### Copy the following lines and then run the crontab -e from command line, then paste lines and save the file.
#### if you want to check the crontab list run the crontab -l command

- 0 0 * * * curl -s GET localhost:3000/api/archive/daily
- 0 0 1 * * curl -s GET localhost:3000/api/archive/monthly
- 0 0 1 1 * curl -s GET localhost:3000/api/archive/yearly
- 0 0 * * * curl -s GET localhost:3000/api/analytic/daily
