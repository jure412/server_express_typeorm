import { User } from "../Entities/User";
import { AppDataSource } from "../../src/index";
import { hash } from "bcryptjs";

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
  res: {
    status: any;
    json: (arg: [any[], number]) => any;
  }
) => {
  const { userId } = req;
  if (!userId) {
    return res.status(402).send("INVALID_ACCESS");
  }

  const users = await AppDataSource.manager.findAndCount(User);

  const shapedRes = users[0].map(({ password, refreshToken, ...user }) => user);
  return res.json([shapedRes, users[1]]);
};

// get user
// "/api/user/:id?"
export const GET_USER = async (
  req: {
    params: any;
    userId: any;
    body: {
      id?: number;
    };
  },
  res: { json: (arg: User) => any }
) => {
  const id = req.params.id || req.userId;

  const user = await AppDataSource.manager.findOne(User, {
    select: ["firstName", "lastName", "email", "id"],
    where: { id },
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
    password: await hash(password, 10),
  });
  await AppDataSource.manager.save(user);
  return res.json(user);
};
