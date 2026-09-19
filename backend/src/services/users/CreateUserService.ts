import prisma from "../../config/database";
import type { UserRole } from "../../generated/prisma/enums";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

class CreateUserService {
  async execute(input: CreateUserInput) {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
        password: input.password,
      },
    });

    return user;
  }
}

export default CreateUserService;
