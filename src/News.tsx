import {useEffect, useState, useRef, useCallback} from 'react';
import './News.css';


interface Article {
    uuid: string;
    title: string;
    description: string;
    content: string;
    url: string;
    image_url: string;
    publication_date: string;
    source: string;
};

const test:Article[] = [
    {
        uuid: "b5878249-c7c8-4dd6-8966-527425663338",
        title: "The Philippines Is Washington’s New Front Line Against China",
        description: "Manila is receiving unprecedented U.S. help to beef up its defenses.",
        content: "some dummy content 1",
        url: "https://foreignpolicy.com/2024/08/15/philippines-united-states-china-defense/",
        image_url: "https://foreignpolicy.com/wp-content/uploads/2024/08/PHILLIPINES-CHINA-US-MILITARY-GettyImages-2165977201.png?w=1000",
        publication_date: "2024-08-15T13:45:56.000000Z",
        source: "foreignpolicy.com"
    },
    {
        uuid: "9f452b0c-2169-47aa-b1e1-1b794306cc56",
        title: "WATCH: Angry passenger throws computer monitor at airline employees before fleeing",
        description: "Frontier Airlines employees experienced the wrath of an irate passenger who reportedly missed her flight at Chicago O'Hare International Airport on July 30, 202...",
        content: "some dummy content 2",
        url: "https://www.foxnews.com/us/watch-angry-passenger-throws-computer-monitor-airline-employees-before-fleeing",
        image_url: "https://static.foxnews.com/foxnews.com/content/uploads/2024/08/frontier-fight-ohare-featured.jpg",
        publication_date: "2024-08-15T13:44:11.000000Z",
        source: "foxnews.com"
    },
    {
        uuid: "495cbf11-5535-4b32-aaf4-c5fe78628288",
        title: "Zelenskyy says Ukrainian troops have full control of the Russian town of Sudzha",
        description: "Ukrainian President Volodymyr Zelenskyy said that troops control the Russian town of Sudzha in the Kursk region amid their incursion into Russian territory.",
        content: "some dummy content 3",
        url: "https://www.nbcnews.com/news/world/zelenskyy-says-ukrainian-troops-control-russian-town-sudzha-rcna166700",
        image_url: "https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/rockcms/2024-08/240815-ukraine-sumy-wc-1427-90a342.jpg",
        publication_date: "2024-08-15T13:44:16.000000Z",
        source: "nbcnews.com"
    }
];

function News(){
    const [articles, setArticles] = useState<Article[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    const [favorites_uuid, setFavorites_uuid] = useState<String[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    // Default News are fetched from top stories
    useEffect( () =>{
        const fetchTopStories = async() => {
            try{
                /*const response = await fetch("http://localhost:5000/api/news/topstories");
                const topstories:Article[] = await response.json();
                setArticles(topstories);*/
                setArticles(test);
            } catch (err){
                console.log(err);
            }
        };
        fetchTopStories();
    }, [page]);

    useEffect(() => {
        const fetchFavorites = async () => {
          try {
            const response = await fetch(`http://localhost:5000/api/favorites`);
            const favorites:Article[] = await response.json();
            setFavorites_uuid(favorites.map((favorite) => favorite.uuid));
          } catch (err) {
            console.log(err);
          }
        };
    
        fetchFavorites();
      }, []);

    const lastArticleRef = useCallback(
        (node: HTMLDivElement | null) => {
          if (loading) return;
          if (observer.current) observer.current.disconnect();
          observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
              setPage((prevPage) => prevPage + 1);
            }
          });
          if (node) observer.current.observe(node);
        },
        [loading, hasMore]
      );

    const saveFavorite = async (event:React.MouseEvent, article: Article)=>{
        event.stopPropagation();
        try{
            const response = await fetch("http://localhost:5000/api/favorites", 
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(article)
            });
            const newFavorite = await response.json();
            setFavorites_uuid([newFavorite.uuid, ...favorites_uuid]);
        } catch (err){
            console.log(err);
        }
    };

    const removeFavorite = async (event:React.MouseEvent, articleId: string)=>{
        event.stopPropagation();
        try{
            const response = await fetch(`http://localhost:5000/api/favorites/${articleId}`, 
                {
                  method: "DELETE"
            });
            const updatedfavorites = favorites_uuid.filter((id) => id!== articleId );
            setFavorites_uuid(updatedfavorites);
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
                <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer">Read more</a>
                {favorites_uuid.includes(selectedArticle.uuid)?(
                    <button onClick={(event) => removeFavorite(event, selectedArticle.uuid)}> Remove Favourite</button>
                ):(
                    <button onClick={(event) => saveFavorite(event, selectedArticle)}> Save Favourite</button>
                )}

                <button onClick={handleBackClick}>Back</button>
            </div>
          ) : (
            <section className="news-articles-preview">
                {articles.map((article, index) => (
                    <article key={article.uuid} className="news-article-preview" onClick={() => handleArticleClick(article)} ref={articles.length === index + 1 ? lastArticleRef : null}>
                        <img src={article.image_url} alt={article.title} />
                        <h2>{article.title}</h2>
                        <p>{article.description}</p>
                        {favorites_uuid.includes(article.uuid)?(
                            <button onClick={(event) => removeFavorite(event, article.uuid)}> Remove Favorite</button>
                        ):(
                            <button onClick={(event) => saveFavorite(event, article)}> Save Favorite</button>
                        )}
                    </article>
                ))}
            </section>
          )}
        </div>
    );
};

export default News;