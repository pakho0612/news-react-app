import express from "express";
import cors from "cors";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

const params = {
  api_token: "b2959c71392c4d77ab6ef95f359cec07",
  categories: '',
  search: '',
  limit: '3'
}

/* app.get("/api/notes", async (req, res) => {
  res.json({ message: "success!" });
}); */

app.get("/api/news/", async(req, res) => {
  const response = await fetch(`https://api.thenewsapi.com/v1/news/top?api_token=${params.api_token}&locale=us&limit=${params.limit}`);
  const articles = await response.json();
  res.json(articles);
});

app.get("/api/favorites", async (req,res) =>{
    const favorites = await prisma.favorites.findMany();
    res.json(favorites);
});

app.post("/api/favorites", async (req, res) => {
    const { uuid,
      title,
      description,
      content,
      url,
      image_url,
      publication_date,
      source} = req.body;
  
    if (!uuid) {
      return res.status(400).send("uuid fields required");
    }
  
    try {
      const favorite = await prisma.favorites.create({
        data: { uuid,
          title,
          description,
          content,
          url,
          image_url,
          publication_date,
          source },
      });
      res.json(favorite);
    } catch (error) {
      res.status(500).send("Oops, something went wrong");
    }
});

app.delete("/api/favorites/:uuid", async (req, res) => {
    //const id = parseInt(req.params.id);
    const uuid:string = req.params.uuid;
    if (!uuid) {
      return res.status(400).send("ID field required");
    }
  
    try {
      await prisma.favorites.delete({
        where: { uuid },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Oops, something went wrong");
    }
});

app.listen(5000, () => {
  console.log("server running on localhost:5000");
});