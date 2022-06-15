import { User } from "../Entities/User";
import { AppDataSource } from "../../src/index";

// get userS
// "/api/users"
export const GET_USERS = async (
  req: {
    userId: any;
    body: {
      offset: number;
      limit: number;
    };
  },
  res: { json: (arg: User[]) => any }
) => {
  const { offset, limit } = req.body;
  const { userId } = req.userId;
  if (!userId) {
    throw new Error("INVALID_ACCESS");
  }
  const users = await AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.animals", "animal")
    .skip(offset)
    .take(limit)
    .getMany();

  return res.json(users);
};

// get user
// "/api/user/:id?"
export const GET_USER = async (
  req: {
    userId: any;
    body: {
      id: number;
    };
  },
  res: { json: (arg: User) => any }
) => {
  // try {
  // const { userId } = req.userId;
  // console.log({ is: req.userId });
  // if (!userId) {
  //   throw new Error("INVALID_ACCESS");
  // }
  const id = req.body.id || req.userId;
  const user = await AppDataSource.manager.findOneBy(User, {
    id: Number(id),
  });
  return res.json(user);
};

// create user
//  "/api/user/create"

export const CREATE_USER = async (
  req: {
    body: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    };
  },
  res: { json: (arg: User) => any }
) => {
  const { firstName, lastName, email, password } = req.body;
  const user = AppDataSource.manager.create(User, {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  });
  await AppDataSource.manager.save(user);
  return res.json(user);
};
