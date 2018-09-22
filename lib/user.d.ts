export interface IAbstractUser {
  account: {
    username: string,
    email: string,
    password: string
  };
  settings: {
    mailing: {
      newsletter: boolean,
      game: {
        /** Delay before sending a notification, in seconds */
        delay: number,
        activated: boolean
      } 
    },
    game: {
      noFactionFill: boolean
    }
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
  meta: {
    nextGameNotification: Date,
    lastGameNotification: Date
  };
  authority: string;
}

export interface IUser extends IAbstractUser {
  _id: string;
}