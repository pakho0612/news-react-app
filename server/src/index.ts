import express from "express";
import cors from "cors";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

const news_api_token:string = "62981cb526ce4c2ca07f0caf22249f90";

app.get("/api/news/query", async(req, res) => {
  try {
    // send query to api
    const searchquery = String(req.query.query);
    const category = req.query.category;
    const source = req.query.source;
    const page = req.query.page;
    const pageSize = req.query.pageSize;

    const response = await fetch(`https://newsapi.org/v2/top-headlines?apiKey=${news_api_token}&locale=us&q=${searchquery}&category=${category}&sources=${source}&page=${page}&pageSize=${pageSize}`);
    const articles = await response.json();
    
    res.json(articles);
    
  } catch (err) {
    res.status(500).send("query:post\n"+err);
  }
});

app.get("/api/news/searchHistory", async(req,res) => {
  const search_history = await prisma.search_history.findMany();
  res.json(search_history);
});

app.post("/api/news/searchHistory", async(req,res) => {
  try {
  const searchquery = String(req.body.query);
  const search_history = await prisma.search_history.create({
    data: {searchquery}
  });
  res.json(search_history);
  } catch (err){
    res.status(500).send("searchHistory:post\n"+err);
  };
});

app.get("/api/news/favorites", async (req,res) =>{
  const favorites = await prisma.favorites.findMany();
  res.json(favorites);
});

app.post("/api/news/favorites", async (req, res) => {
    const { url,
      title,
      description,
      content,
      image_url,
      publication_date,
      source} = req.body;
  
    if (!url) {
      return res.status(400).send("url fields required");
    }
  
    try {
      const favorite = await prisma.favorites.create({
        data: { url,
          title,
          description,
          content,
          image_url,
          publication_date,
          source },
      });
      res.json(favorite);
    } catch (err) {
      res.status(500).send("favorites:post\n"+err);
    }
});

app.delete("/api/news/favorites/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) {
      return res.status(400).send("ID field required");
    }
  
    try {
      await prisma.favorites.delete({
        where: { id },
      });
      res.status(204).send("Entry deleted : " + id);
    } catch (err) {
      res.status(500).send("favorites:delete\n"+err);
    }
});

app.listen(5000, () => {
  console.log("server running on localhost:5000");
});