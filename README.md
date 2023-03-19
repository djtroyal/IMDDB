# Movie Cast and Crew Death Analyzer

This is a Python script that allows users to search for a movie and see the cast and crew members who have passed away, along with their cause of death if available.
## How to Use

1. Run the script by executing the command python imddb.py in the terminal.
2. Enter the name of a movie you want to search for.
3. The script will display a list of movies that match the search term, along with their release year.
4. Enter the number of the movie you want to select from the list.
5. The script will display a list of deceased cast and crew members for the selected movie, along with their birth and death dates and cause of death (if available).

## Dependencies

This script requires the following Python packages to be installed:

1. requests
2. bs4 (BeautifulSoup)

## API Keys

This script uses the following API key:

1. themoviedb.org API key

## Notes

1. If a cast or crew member's birth year is not available, their age at death will be displayed as "N/A".
