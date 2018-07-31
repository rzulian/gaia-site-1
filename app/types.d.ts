// declare module 'sendmail';
import { UserDocument } from "./models/user";

declare global {
  namespace Express {
    export interface User extends UserDocument {

    }

    export interface Request {
      flash(): { [key: string]: string[] };
      flash(message: string): any;
      flash(event: string, message: string): any;
      categoryName(cat: string): string;
  
      // user?: User;
      foundUser?: UserDocument;
      body: any;
      ip: string;
    }
  
    export interface Response {
      locals: {[_: string]: any};
    }
  }  
}
