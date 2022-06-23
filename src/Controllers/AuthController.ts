import { sign, verify } from "jsonwebtoken";
import { User } from "../Entities/User";
import { AppDataSource, tokenVariable } from "../../src/index";
import { compareSync } from "bcryptjs";

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
    sendStatus(arg0: number);
    json: (arg: { token: String }) => any;
  }
) => {
  const { email, password } = req.body;
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ email });
  if (!user) {
    return res.status(402).send("EMAIL_NOT_VALID");
  } else {
    // const valid = password === user.password;
    const match = compareSync(password, user.password);
    if (!match) {
      return res.status(402).send("PASSWORD_NOT_VALID");
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
  req: any,
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
    sendStatus(arg0: number);
    json: (arg: { token: String }) => any;
  }
) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(402).send("REFRESH_TOKEN_MISSING");
  const refreshToken = cookies.jwt;

  const userRepo = AppDataSource.getRepository(User);
  const foundUser = await userRepo.findOneBy({
    refreshToken,
  });

  if (!foundUser) return res.status(402).send("REFRESH_TOKEN_NOT_FOUND");
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
    cookies: any;
    id: any;
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
    sendStatus(arg0: number);
    json: (arg: { token: String; user: any }) => any;
  }
) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
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
