import { Request, Response } from "express";
import CreateUserService from "../../services/users/CreateUserService";

class CreateUserController {
  async handle(req: Request, res: Response) {
    const input = req.body;

    const service = new CreateUserService();
    await service.execute(input);

    res.status(201).json();
  }
}

export default new CreateUserController();
