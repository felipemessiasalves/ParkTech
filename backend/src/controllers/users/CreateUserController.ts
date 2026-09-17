import { Request, Response } from "express";
import CreateUserService from "../../services/users/CreateUserService";

class CreateUserController {
  handle(req: Request, res: Response) {
    const input = req.body;

    const service = new CreateUserService();
    service.execute(input);
  }
}

export default new CreateUserController();
