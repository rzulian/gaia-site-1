import { NextFunction, Request, Response } from "express";
import * as createError from 'http-errors';

export function loggedIn(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    next(createError(401, "You need to be logged in"));
  } else {
    next();
  }
}

export function loggedOut(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    next(createError(401, "You need to be logged in"));
  } else {
    next();
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.isAdmin()) {
    next(createError(403, "You need to be admin"));
  } else {
    next();
  }
}
