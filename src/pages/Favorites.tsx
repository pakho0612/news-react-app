import { useEffect, useState } from 'react';

type favoriteArticle = {
    id: number;
    url: string;
    title: string;
    description: string;
    content: string;
    image_url: string;
    publication_date: string;
    source: string;
};

const Favorites = () => {
  const [favorites, setFavorites] = useState<favoriteArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<favoriteArticle | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/news/favorites`);
        const favorites = await response.json();
        setFavorites(favorites);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFavorites();
  }, []);

  const RemoveFavorite = async (event:React.MouseEvent, articleId: number)=>{
      event.stopPropagation();
      try{
        const response = await fetch(`http://localhost:5000/api/news/favorites/${articleId}`, 
            {
                method: "DELETE"
            }
        );
        const updatedfavorites = favorites.filter((article) => article.id!== articleId );
        setFavorites(updatedfavorites);
      } catch (err){
        console.log(err);
      }
  };
  const handleArticleClick = (article: favoriteArticle) => {
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
            <button onClick={(event) => RemoveFavorite(event, selectedArticle.id)}> Remove Favourite</button>
            <button onClick={handleBackClick}>Back</button>
        </div>
      ) : (
        <section className="news-articles-preview">
            {favorites.map((article) => (
                <article key={article.id} className="news-article-preview" onClick={() => handleArticleClick(article)}>
                    <img src={article.image_url} alt={article.title} />
                    <h2>{article.title}</h2>
                    <p>{article.description}</p>
                    <button onClick={(event) => RemoveFavorite(event, article.id)}> Remove Favourite</button>
                </article>
            ))}
        </section>
      )}
    </div>
  );
};

export default Favorites;