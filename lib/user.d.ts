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
        /** Delay before sending a mail notification, in seconds */
        delay: number,
        /** Are email notifications enabled? */
        activated: boolean
      } 
    },
    game: {
      noFactionFill: boolean,
      /** Are sound notifications enabled? */
      soundNotification: boolean
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
    lastGameNotification: Date,
    games?: {
      finished: number
    }
  };
  authority: string;
}

export interface IUser extends IAbstractUser {
  _id: string;
}