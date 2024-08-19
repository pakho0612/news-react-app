import {useEffect, useState, useRef} from 'react';
import { Autocomplete, TextField} from '@mui/material';
import './News.css';


interface Article {
    url: string;
    title: string;
    description: string;
    content: string;
    image_url: string;
    publication_date: string;
    source: string;
};

interface favoriteArticle {
    id: number;
    url: string;
    title: string;
    description: string;
    content: string;
    image_url: string;
    publication_date: string;
    source: string;
};

interface newsApiArticle {
    source: {
        id:string;
        name:string;
    };
    author: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
}

interface newsApiResponse {
    status:string;
    totalResults: number;
    articles:newsApiArticle[];
};

interface History{
    searchquery: string
}

const pageSize:number = 8;

function News(){
    const [articles, setArticles] = useState<Article[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [favorites, setFavorites] = useState<favoriteArticle[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    // Search 
    const [query, setQuery] = useState<string>("");
    const [queryHistory, setHistoryQuery] = useState<string[]>([]);
    const [category, setCategory] = useState<string>("");
    const [source, setSource] = useState<string>("");

    const observerTarget = useRef(null);

    useEffect(() => {
        const fetchFavorites = async () => {
          try {
            const response = await fetch(`http://localhost:5000/api/news/favorites`);
            const favorites:favoriteArticle[] = await response.json();
            setFavorites(favorites);
          } catch (err) {
            console.log(err);
          }
        };
    
        fetchFavorites();
      }, []);
      
    useEffect(() => {
        const fetchSearchHistory = async () => {
          try {
            const response = await fetch(`http://localhost:5000/api/news/searchHistory`);
            const search_history_obj:History[] = await response.json();
            setHistoryQuery(search_history_obj.map((obj) => obj.searchquery));
          } catch (err) {
            console.log(err);
          }
        };
    
        fetchSearchHistory();
      }, []);

      useEffect (() => {
        if (loading)
            return;
        const observer = new IntersectionObserver( (entries) => {
            if (entries[0].isIntersecting && hasMore){
                handleQuery(true);
            }
        }, { threshold: 0.8 });
        if (observerTarget.current)
            observer.observe(observerTarget.current);
        return ()=>{
            if (observerTarget.current)
                observer.unobserve(observerTarget.current);
        }
      }, [observerTarget, hasMore, page, loading]);

      const handleQuery = async (LoadMore:boolean) => {
          setLoading(true);
          try {
              var InitArticles:Article[] = LoadMore ? articles : [];
              var InitPage = LoadMore ? page : 1;

              const query_response = await fetch(`http://localhost:5000/api/news/query?query=${query}&category=${category}&source=${source}&page=${InitPage}&pageSize=${pageSize}`);
              const api_query_obj:newsApiResponse = await query_response.json();

              if (api_query_obj && api_query_obj['articles']){
                // Extract the neccessary fields from the news api response and convert to Article[]
                var Transformed_articles: Article[]=[];
                api_query_obj['articles'].forEach( (api_article:newsApiArticle) => {
                    Transformed_articles.push({
                        url: api_article.url,
                        title: api_article.title,
                        description: api_article.description,
                        content: api_article.content,
                        image_url: api_article.urlToImage,
                        publication_date: api_article.publishedAt,
                        source: api_article.source.name,
                    });
                });
                setArticles(InitArticles.concat(Transformed_articles));
                setHasMore((api_query_obj.totalResults-page*pageSize)>0);
                setPage(InitPage+1);

                // Insert search history only if not empty and unique
                if (query && !queryHistory.includes(query)){
                    const searchHistory_response = await fetch("http://localhost:5000/api/news/searchHistory", 
                        {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({query})
                    });
                    const newQueryHistory = await searchHistory_response.json();
                    setHistoryQuery([ newQueryHistory.searchquery,...queryHistory]);
                }
              };
              if(!hasMore){
                setQuery("");
                setCategory("");
                setSource("");
              }
          } catch (err){
              console.log(err);
          } finally{
            setLoading(false);
          }
      };

    const saveFavorite = async (event:React.MouseEvent, article: Article)=>{
        event.stopPropagation();
        try{
            const response = await fetch("http://localhost:5000/api/news/favorites", 
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(article)
            });
            const newFavorite = await response.json();
            setFavorites([newFavorite, ...favorites]);
        } catch (err){
            console.log(err);
        }
    };

    const removeFavorite = async (event:React.MouseEvent, article: Article)=>{
        event.stopPropagation();
        try{
            let articleid:number = 0;
            favorites.forEach( (favoriteArticle) =>{
              if(favoriteArticle.url === article.url){
                articleid = favoriteArticle.id;
              };
            });
            const response = await fetch(`http://localhost:5000/api/news/favorites/${articleid}`, 
                {
                  method: "DELETE"
            });
            const updatedfavorites = favorites.filter((favouriteArticle) => favouriteArticle.url!== article.url );
            setFavorites(updatedfavorites);
        } catch (err){
            console.log(err);
        }
    };
    const handleArticleClick = (article: Article) => {
        setSelectedArticle(article);
    };

    const handleBackClick = () => {
        setSelectedArticle(null);
    };

    return (
        <div>
          {selectedArticle ? (
            <div className="news-article">
                <h2>{selectedArticle.title}</h2>
                <img src={selectedArticle.image_url} alt={selectedArticle.title} />
                <p>{selectedArticle.content}</p>
                <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer">Original Source</a>
                {favorites.map((favoriteArticle)=>favoriteArticle.url).includes(selectedArticle.url)?(
                    <button onClick={(event) => removeFavorite(event, selectedArticle)}> Remove Favourite</button>
                ):(
                    <button onClick={(event) => saveFavorite(event, selectedArticle)}> Save Favourite</button>
                )}

                <button onClick={handleBackClick}>Back</button>
            </div>
          ) : (
            <div>
            <form className='search-form' onSubmit={(event)=> {event.preventDefault(); handleQuery(false);}}>
                <Autocomplete size={"small"}  value = {query} freeSolo={true} sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label='Search for news articles' required />}  
                id="auto-complete" options={queryHistory} defaultValue={query} 
                onInputChange={(event, newValue:string) => {setQuery(newValue)}}/>
                <input value = {category} onChange={(event)=> setCategory(event.target.value)} placeholder='Category' />
                <input value = {source} onChange={(event)=> setSource(event.target.value)} placeholder='Source' />
            
                <div className='edit-buttons'>
                    <button type='submit'>Search</button>
                </div>
            </form>
            <section className="news-articles-preview">
                {articles.map((article, index) => (
                    <article key={index} className="news-article-preview" onClick={() => handleArticleClick(article)} ref={articles.length === index + 1 ? observerTarget : null}>
                        <div className="news-article-preview-source">{article.source}</div>
                        <h2>{article.title}</h2>
                        <p>{article.description}</p>
                        <footer className='news-article-preview-date'>published on {article.publication_date.substring(0, 10)}</footer>
                        {favorites.map((favoriteArticle)=>favoriteArticle.url).includes(article.url)?(
                            <button onClick={(event) => removeFavorite(event, article)}> Remove Favorite</button>
                        ):(
                            <button onClick={(event) => saveFavorite(event, article)}> Save Favorite</button>
                        )}
                    </article>
                ))}
            </section>
            </div>
          )}
          <center>
            {loading && <p>Loading...</p>}
            {!hasMore && <p>No more results</p>}
          </center>
        </div>
    );
};

export default News;