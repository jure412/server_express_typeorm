import { verify } from "jsonwebtoken";
import { DataSource } from "typeorm";
import { LOGIN, LOGOUT, REFRESH_TOKEN } from "./Controllers/AuthController";
import { CREATE_COMMENT, GET_COMMENTS } from "./Controllers/CommentController";
import { LIKE } from "./Controllers/LikeController";
import {
  CREATE_POST,
  DELETE_POST,
  GET_POSTS,
} from "./Controllers/PostController";
import { CREATE_USER, GET_USER, GET_USERS } from "./Controllers/UserController";
import { handlePromise } from "./Helpers/HandlePromise";
const cookies = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const app = express();

export const tokenVariable = "hhhhhhhhhhhhhhhhhhhhh";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "12345678",
  database: "express_typeorm_react_redux",
  synchronize: true,
  logging: true,
  entities: ["src/Entities/*.ts"],
});

const main = async () => {
  try {
    await AppDataSource.initialize();

    const credentials = (req, res, next) => {
      const origin = req.headers.origin;
      if (["http://localhost:8080", "http://localhost:3000"].includes(origin)) {
        res.header("Access-Control-Allow-Credentials", true);
      }
      next();
    };

    const corsOptions = {
      origin: (origin, callback) => {
        if (
          ["http://localhost:8080", "http://localhost:3000"].indexOf(origin) !==
            -1 ||
          !origin
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      optionsSuccessStatus: 200,
    };

    app.use(credentials);
    app.use(cors(corsOptions));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookies());

    const Middleware = function (req: any, res: any, next: () => void) {
      const token: any = req.headers.authorization?.split(" ")[1];
      if (token) {
        verify(token, tokenVariable, (err, decoded) => {
          if (err) res.sendStatus(403);
          req.userId = decoded.userId;
          next();
        });
      } else {
        res.sendStatus(403);
      }
    };

    app.post("/api/login", handlePromise(LOGIN));
    app.post("/api/user/create", handlePromise(CREATE_USER));
    app.get("/api/refresh", handlePromise(REFRESH_TOKEN));
    app.post("/api/logout", handlePromise(LOGOUT));
    app.get("/api/user/:id?", Middleware, handlePromise(GET_USER));
    app.get("/api/users", Middleware, handlePromise(GET_USERS));
    app.post("/api/post/create", Middleware, handlePromise(CREATE_POST));
    app.post("/api/post/delete", Middleware, handlePromise(DELETE_POST));
    app.get("/api/posts/:userId?", Middleware, handlePromise(GET_POSTS));
    app.post("/api/like", Middleware, handlePromise(LIKE));
    app.post("/api/comment/create", Middleware, handlePromise(CREATE_COMMENT));
    app.get("/api/comments/:postId?", Middleware, handlePromise(GET_COMMENTS));

    app.listen(8080, () => {
      console.log("Now running on port 8080");
    });
  } catch (error) {
    console.error(error);
    throw new Error("Unable to connect to db");
  }
};

main();
