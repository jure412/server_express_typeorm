import { compareSync } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { AppDataSource, tokenVariable } from "../../src/index";
import { User } from "../Entities/User";

// login user
// "/api/login"
export const LOGIN = async (
  req: {
    body: {
      email: string;
      password: string;
    };
  },
  res: {
    status: any;
    cookie(
      arg0: string,
      refreshToken: string,
      arg2: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: string;
        maxAge: number;
      }
    );
    json: (arg: { token: String }) => {};
  }
) => {
  const { email, password } = req.body;
  const userRepo = AppDataSource.getRepository(User);

  const user: any = await userRepo
    .createQueryBuilder("user")
    .where("user.email = :email", { email: email })
    .addSelect("user.password")
    .getOne();

  if (!user) {
    return res.status(401).send("EMAIL_NOT_VALID");
  } else {
    // const valid = password === user.password;
    const match = compareSync(password, user.password);
    if (!match) {
      return res.status(401).send("PASSWORD_NOT_VALID");
    } else {
      const accessToken: string = sign({ userId: user.id }, tokenVariable, {
        expiresIn: "10s",
      });
      const refreshToken = sign({ userId: user.id }, tokenVariable, {
        expiresIn: "1d",
      });
      user.refreshToken = refreshToken;
      userRepo.save(user);
      const { password, ...newObj } = user;
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ token: `Bearer ${accessToken}` });
    }
  }
};

export const REFRESH_TOKEN = async (
  req,
  res: {
    status: any;
    cookie(
      arg0: string,
      refreshToken: string,
      arg2: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: string;
        maxAge: number;
      }
    );
    json: (arg: { token: String }) => {};
  }
) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).send("REFRESH_TOKEN_MISSING");
  const refreshToken = cookies.jwt;

  const userRepo = AppDataSource.getRepository(User);

  const foundUser = await userRepo.findOneBy({
    refreshToken,
  });

  if (!foundUser) return res.status(401).send("REFRESH_TOKEN_NOT_FOUND");
  verify(refreshToken, tokenVariable, (err, decoded) => {
    if (err || foundUser.id !== decoded.userId)
      return res.status(402).send("REFRESH_TOKEN_NOT_VALID");
    const accessToken = sign({ userId: decoded.userId }, tokenVariable, {
      expiresIn: "30s",
    });
    res.json({ token: `Bearer ${accessToken}` });
  });
};

export const LOGOUT = async (
  req: {
    cookies: {
      jwt: string;
    };
    body: {
      email: string;
      password: string;
    };
  },
  res: {
    clearCookie(
      arg0: string,
      arg1: { httpOnly: boolean; sameSite: string; secure: boolean }
    );
    sendStatus(arg0: number);
  }
) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;

  const userRepo = AppDataSource.getRepository(User);
  const foundUser = await userRepo.findOneBy({
    refreshToken,
  });

  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  foundUser.refreshToken = null;
  userRepo.save(foundUser);

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);

  return res;
};
