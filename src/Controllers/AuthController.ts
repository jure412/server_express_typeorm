import { sign } from "jsonwebtoken";
import { User } from "../Entities/User";
import { AppDataSource, tokenVariable } from "../../src/index";

// login user
// "/api/login"
export const LOGIN = async (
  req: {
    id: any;
    body: {
      email: string;
      password: string;
    };
  },
  res: { json: (arg: { token: String }) => any },
  next
) => {
  const { email, password } = req.body;
  const user = await AppDataSource.manager.findOneBy(User, {
    email: email,
  });
  if (!user) {
    throw new Error("BROKEN");
  } else {
    const valid = password === user.password;
    // compareSync(password, user.password);
    if (!valid) {
      throw new Error("BROKEN");
    } else {
      const token = sign({ userId: user.id }, tokenVariable, {
        expiresIn: "7d",
      });
      return res.json({ token: `Bearer ${token}` });
    }
  }
};
