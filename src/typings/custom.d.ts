declare namespace Express {
  export interface Request {
    user?: {
      subject?: string;
      permissions?: string[];
    };
  }
}
