
# Setup Instructions
For this News App, there are two steps to setup the client and server app.

## 1. Set up Server App
First, change current working folder to /server folder :
```
cd server
```
Install required modules for the server app:
```
npm install
```
Run the server app :
```
npm start
```
Successive of app starting should be prompted by the console: `server running on localhost:5000`
The server app is default to run on `localhost:5000`

## 2. Set up the Client App
Navigate back to the project directory from /server :
```
cd ..
```
Install required modules for the clien app:
```
npm install
```

Run the client app :
```
npm start
```
On success of starting the client app, a new tab should be opened on your browser.
Or you can manually open [http://localhost:3000](http://localhost:3000) to view it in the browser.


# Application Architecture
![Alt text](NewsApp.png?raw=true "Title")
The News App are constructed by three major sections, the client, server app and the database.
## Client - React
![Alt text](NewsApp_Client.png?raw=true "Title")

The client app is provided by two pages, ``News.tsx`` and ``Favorites.tsx``. While ``NavBar.tsx`` provides quick access to switch bewteen the two pages.

``News.tsx`` focuses on a few puroposes: querying for news, browsing news results, adding/removing favorite news. It also act as interface to the server app for news searching. 

Users are allow to enter keywords for searching specific news. Search by `category` is also possible for the following options: `business` `entertainment` `general` `health` `science` `sports` `technology`. User can also search by `sources` by entering the corresponding identifiers: `google-news`, `bbc-news`, `fox-news`

``Favorites.tsx`` serves in limiting purposes which allows user to view as well as removed all saved favorites. 

## Server - Express
![Alt text](NewsApp_Server.png?raw=true "Title")

The server listens on `port:5000`. It acts as the interface between the client and the database and the news api. It translates REST Api and redirect requests from the clients and isolates the api token from the client app for security.

## Database - PosgreSQL
![Alt text](NewsApp_Database.png?raw=true "Title")

The PosgreSQL server is hosted by Amazon RDS. It can be accessed by RESTful Api.

The database dedicates two tables for storing user's `seraching history` and the list of `favorite news` across the sessions.

The `search history` table consists only the unique string the user has made upon submitting news query. The list of history is fetched from the database everytime the user start the app or upon the transitioning between pages.

The `favorites` table purposely stored all the neccessary info for news viewing. It aims to reduce the number of Api calls to fetch the specific news due to the limitation on the free tier of the News Api token. 

# Special Features

## Infinite Scroll
Infinite scroll is achieved by implementing an `intersection observer` to monitor if the last article element is `in sight of the browser's viewport`. The target article element changes upon a new news fetch is initiated, either a new search or when the target element is in sight.

It is conditioned on `hasMore` variable which indicates if there's more result that has not been fetched from the Api. The observer works as long as there is more news to be fetched from.

Reaching the end of search result would be prompted by `No more Results` at the bottom of the page.
## Side Bar
The side bar locates on the left side of the application. The top left text `Side Bar` allows the user to click open the side bar. The `Close X` text allows the user to close the side bar. `News Home` takes user back to the main page where the search engine is. `Favorites` allows user to go to page to view all saved favorite news.

# Known issues
## 1. Removed News from api
![Alt text](Known_issue_1.png?raw=true "Title")

The News Api might return removed news in the query response where the news entry is invalid on their server. This can be removed by extra filtering at the handleQuery interface on the Client App.

## 2. Limited Access to full news content
![Alt text](Known_issue_2.png?raw=true "Title")

The free Api token offers limited access to the news content, therefore, the content is purposedly capped by the News Api.

## 3. Limited Query Token

The free Api token has 1000 queries limitation per day. In case of reaching the limitation, the api token will be invalid.