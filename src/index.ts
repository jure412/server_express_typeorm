import { decode } from "jsonwebtoken";
// import  cors  from "cors";
import { DataSource } from "typeorm";
import { CREATE_ANIMAL, GET_ANIMALS } from "./Controllers/AnimalController";
import { LOGIN } from "./Controllers/AuthController";
import { CREATE_USER, GET_USER, GET_USERS } from "./Controllers/UserController";
import { User } from "./Entities/User";
import { ErrorHandler } from "./Helpers/ErrorHandler";
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

    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));

    const Middleware = function (req: any, _: any, next: () => void) {
      const token: any = req.headers.authorization?.split(" ")[1];
      if (token) {
        const data: any = decode(token);
        if (data) {
          req.userId = data.userId;
          next();
        } else {
          throw new Error("INVALID_TOKEN");
        }
      } else {
        throw new Error("TOKEN_MISSING");
      }
    };

    app.post("/api/login", ErrorHandler(LOGIN));
    app.post("/api/user/:id?", Middleware, ErrorHandler(GET_USER));
    app.get("/api/users", Middleware, ErrorHandler(GET_USERS));
    app.post("/api/user/create", Middleware, ErrorHandler(CREATE_USER));
    app.get("/api/animals", Middleware, ErrorHandler(GET_ANIMALS));
    app.post("/api/animal/create", Middleware, ErrorHandler(CREATE_ANIMAL));

    app.listen(8080, () => {
      console.log("Now running on port 8080");
    });
  } catch (error) {
    console.error(error);
    throw new Error("Unable to connect to db");
  }
};

main();
