import { useEffect, useState } from 'react';

type Article = {
    uuid: string;
    title: string;
    description: string;
    content: string;
    url: string;
    image_url: string;
    publication_date: string;
    source: string;
};

const Favorites = () => {
  const [favorites, setFavorites] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/favorites`);
        const favorites = await response.json();
        setFavorites(favorites);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFavorites();
  }, []);

  const RemoveFavorite = async (event:React.MouseEvent, articleId: string)=>{
      event.stopPropagation();
      try{
        const response = await fetch(`http://localhost:5000/api/favorites/${articleId}`, 
            {
                method: "DELETE"
            }
        );
        const updatedfavorites = favorites.filter((article) => article.uuid!== articleId );
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
            <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer">Read more</a>
            <button onClick={(event) => RemoveFavorite(event, selectedArticle.uuid)}> Remove Favourite</button>
            <button onClick={handleBackClick}>Back</button>
        </div>
      ) : (
        <section className="news-articles-preview">
            {favorites.map((article) => (
                <article key={article.uuid} className="news-article-preview" onClick={() => handleArticleClick(article)}>
                    <img src={article.image_url} alt={article.title} />
                    <h2>{article.title}</h2>
                    <p>{article.description}</p>
                    <button onClick={(event) => RemoveFavorite(event, article.uuid)}> Remove Favourite</button>
                </article>
            ))}
        </section>
      )}
    </div>
  );
};

export default Favorites;