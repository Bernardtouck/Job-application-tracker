import { UserPayload } from "../middleware/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; // Add your custom property
    }
  }
}