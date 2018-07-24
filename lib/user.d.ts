export interface IAbstractUser {
  account: {
    username: string,
    email: string,
    password: string,
    newsletter: boolean
  };
  security: {
    lastIp: string,
    lastLogin: {
      ip: string,
      date: Date
    },
    confirmed: boolean,
    confirmKey: string,
    reset: {
      key: string,
      issued: Date
    }
  };
  authority: string;
}

export interface IUser extends IAbstractUser {
  _id: string;
}