import { Request, Response } from "express";

class CreateUserController {
  handle(req: Request, res: Response) {
    const input = req.body;
  }
}

export default new CreateUserController();
