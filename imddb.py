import requests
import re
from bs4 import BeautifulSoup

def search_movies(movie_name):
    api_key = "YOUR_API_KEY_HERE"
    response = requests.get(f"https://api.themoviedb.org/3/search/movie?api_key={api_key}&query={movie_name}")
    data = response.json()
    results = data["results"]
    return results

def get_movie_details(movie_id):
    api_key = "YOUR_API_KEY_HERE"
    response = requests.get(f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={api_key}&append_to_response=credits")
    data = response.json()
    cast = data["credits"]["cast"]
    crew = data["credits"]["crew"]
    return cast + crew

def get_person_details(person_id):
    api_key = "YOUR_API_KEY_HERE"
    response = requests.get(f"https://api.themoviedb.org/3/person/{person_id}?api_key={api_key}")
    data = response.json()
    return data

def display_movie_list(movies):
    for i, movie in enumerate(movies):
        print(f"{i+1}. {movie['title']} ({movie['release_date'][:4]})")

def get_cause_of_death(name, birth_year, death_year):
    name_parts = name.lower().split()
    firstname = name_parts[0].replace(" ", "+")
    lastname = name_parts[-1].replace(" ", "+")
    url = f"https://www.findagrave.com/memorial/search?firstname={firstname}&lastname={lastname}&birthyear={birth_year}&birthyearfilter=5&deathyear={death_year}&deathyearfilter=5"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    memorial_section = soup.find("div", {"id": "memorials"})
    if memorial_section:
        memorial_links = memorial_section.find_all("a")
        for link in memorial_links:
            if "memorial" in link["href"]:
                memorial_url = f"https://www.findagrave.com{link['href']}"
                memorial_response = requests.get(memorial_url)
                memorial_soup = BeautifulSoup(memorial_response.text, "html.parser")
                full_bio = memorial_soup.find("p", {"id": "fullBio"})
                if full_bio:
                    return full_bio.text
    return None

def main():
    movie_name = input("Enter a movie name: ")
    movies = search_movies(movie_name)
    display_movie_list(movies)
    movie_index = int(input("Enter the number of the movie you want to see cast and crew for: ")) - 1
    movie = movies[movie_index]
    movie_id = movie["id"]
    cast_and_crew = get_movie_details(movie_id)
    for member in cast_and_crew:
        person_id = member["id"]
        person = get_person_details(person_id)
        name = person["name"]
        birthday = person["birthday"]
        deathday = person.get("deathday", None)
        if deathday:
            print(f"{name} ({birthday} - {deathday})")
        else:
            print(f"{name} ({birthday})")

if __name__ == "__main__":
    while True:
        query = input("Enter a movie title or type 'exit' to quit: ")
        if query.lower() == "exit":
            break

        movie_results = search_movies(query)
        if movie_results:
            for i, movie in enumerate(movie_results):
                print(f"{i+1}. {movie['title']} ({movie['release_date'][:4]})")

            selected_movie = int(input("Enter the number of the movie you want to select: "))
            selected_movie = movie_results[selected_movie - 1]

            cast_and_crew = get_movie_details(selected_movie['id'])
            if cast_and_crew:
                deceased = [member for member in cast_and_crew if get_person_details(member['id']).get('deathday')]
                if deceased:
                    for member in deceased:
                        person_id = member['id']
                        person_details = get_person_details(person_id)
                        name = member['name']
                        deathday = person_details.get('deathday')
                        birthday = person_details.get('birthday')
                        if birthday:
                            birth_year = int(birthday.split("-")[0])
                            death_year = int(deathday.split("-")[0])
                            age_at_death = death_year - birth_year
                        else:
                            age_at_death = "N/A"
                        cause_of_death = get_cause_of_death(name, birth_year, death_year)
                        print(f"{name} (Died: {deathday}, Age at Death: {age_at_death})")
                        if cause_of_death:
                            print(f"    Cause of Death: {cause_of_death}")
                else:
                    print("No deceased cast and crew members.")
            else:
                print("No cast and crew information available.")
        else:
            print("No movie results found.")

import requests
import re
from bs4 import BeautifulSoup

def search_movies(movie_name):
    api_key = "YOUR_API_KEY_HERE"
    response = requests.get(f"https://api.themoviedb.org/3/search/movie?api_key={api_key}&query={movie_name}")
    data = response.json()
    results = data["results"]
    return results

def get_movie_details(movie_id):
    api_key = "YOUR_API_KEY_HERE"
    response = requests.get(f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={api_key}&append_to_response=credits")
    data = response.json()
    cast = data["credits"]["cast"]
    crew = data["credits"]["crew"]
    return cast + crew

def get_person_details(person_id):
    api_key = "YOUR_API_KEY_HERE"
    response = requests.get(f"https://api.themoviedb.org/3/person/{person_id}?api_key={api_key}")
    data = response.json()
    return data

def display_movie_list(movies):
    for i, movie in enumerate(movies):
        print(f"{i+1}. {movie['title']} ({movie['release_date'][:4]})")

def get_cause_of_death(name, birth_year, death_year):
    name_parts = name.lower().split()
    firstname = name_parts[0].replace(" ", "+")
    lastname = name_parts[-1].replace(" ", "+")
    url = f"https://www.findagrave.com/memorial/search?firstname={firstname}&lastname={lastname}&birthyear={birth_year}&birthyearfilter=5&deathyear={death_year}&deathyearfilter=5"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    memorial_section = soup.find("section", {"id": "searchResults"})
    if memorial_section:
        memorial_links = memorial_section.find_all("a")
        for link in memorial_links:
            if "memorial" in link["href"]:
                memorial_url = f"https://www.findagrave.com{link['href']}"
                memorial_response = requests.get(memorial_url)
                memorial_soup = BeautifulSoup(memorial_response.text, "html.parser")
                full_bio = memorial_soup.find("div", {"id": "bio-section"})
                if full_bio:
                    return full_bio.text.strip()
    return None

def main():
    while True:
        query = input("Enter a movie title or type 'exit' to quit: ")
        if query.lower() == "exit":
            break

        movie_results = search_movies(query)
        if movie_results:
            for i, movie in enumerate(movie_results):
                print(f"{i+1}. {movie['title']} ({movie['release_date'][:4]})")

            selected_movie = int(input("Enter the number of the movie you want to select: "))
            selected_movie = movie_results[selected_movie - 1]

            cast_and_crew = get_movie_details(selected_movie['id'])
            if cast_and_crew:
                deceased = [member for member in cast_and_crew if get_person_details(member['id']).get('deathday')]
                if deceased:
                    for member in deceased:
                        person_id = member['id']
                        person_details = get_person_details(person_id)
                        name = member['name']
                        deathday = person_details.get('deathday')
                        birthday = person_details.get('birthday')
                        if birthday:
                            birth_year = int(birthday.split("-")[0])
                            death_year = int(deathday.split("-")[0])
                            age_at_death = death_year - birth_year
                        else:
                            age_at_death = "N/A"
                        cause_of_death = get_cause_of_death(name, birth_year, death_year)
                        print(f"{name} (Died: {deathday}, Age at Death: {age_at_death})")
                        if cause_of_death:
                            print(f"    Cause of Death: {cause_of_death}")
                else:
                    print("No deceased cast and crew members.")
            else:
                print("No cast and crew information available.")
        else:
            print("No movie results found.")

if __name__ == "__main__":
    main()
