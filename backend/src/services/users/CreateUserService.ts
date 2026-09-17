import type { UserRole } from "../../generated/prisma/enums";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

class CreateUserService {
  execute(input: CreateUserInput) {
    console.log("DADOS DO SERVIÇO INPUT", input);
  }
}

export default CreateUserService;
