# Arquitetura de Backend — Sistema de Gestão de Estacionamento

## 1. Visão Geral

Arquitetura em camadas simples, organizada por módulo de domínio, seguindo o fluxo:

```
Request → Route → Middleware (validação Zod) → Controller (HTTP) → Service (regra de negócio) → Prisma (dados) → Response
```

### Stack Tecnológica

| Tecnologia        | Finalidade                      |
| ----------------- | ------------------------------- |
| Node.js + Express | Servidor HTTP e roteamento      |
| TypeScript        | Tipagem estática                |
| PostgreSQL        | Banco de dados relacional       |
| Prisma            | ORM e migrations                |
| Zod               | Validação de schemas de entrada |

### Princípios

- **Controller**: só lida com HTTP (`req`/`res`). Não contém regra de negócio.
- **Service**: contém a regra de negócio. Não conhece `req`/`res`, recebe dados já validados.
- **Prisma**: acessado diretamente pelos services (sem camada de repository, por ora, dado que o projeto é simples).
- Um arquivo = uma responsabilidade (um controller por rota, um service por caso de uso).

---

## 2. Estrutura de Pastas

```
parking-system/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   │
│   ├── controllers/
│   │   ├── vehicle/
│   │   │   ├── create-vehicle.controller.ts
│   │   │   ├── list-vehicles.controller.ts
│   │   │   ├── get-vehicle.controller.ts
│   │   │   ├── update-vehicle.controller.ts
│   │   │   └── delete-vehicle.controller.ts
│   │   │
│   │   ├── parking-session/
│   │   │   ├── check-in.controller.ts
│   │   │   ├── check-out.controller.ts
│   │   │   ├── list-sessions.controller.ts
│   │   │   └── get-session.controller.ts
│   │   │
│   │   └── customer/
│   │       ├── create-customer.controller.ts
│   │       └── list-customers.controller.ts
│   │
│   ├── services/
│   │   ├── vehicle/
│   │   │   ├── create-vehicle.service.ts
│   │   │   ├── list-vehicles.service.ts
│   │   │   ├── get-vehicle.service.ts
│   │   │   ├── update-vehicle.service.ts
│   │   │   └── delete-vehicle.service.ts
│   │   │
│   │   ├── parking-session/
│   │   │   ├── check-in.service.ts
│   │   │   ├── check-out.service.ts
│   │   │   ├── list-sessions.service.ts
│   │   │   └── get-session.service.ts
│   │   │
│   │   └── customer/
│   │       ├── create-customer.service.ts
│   │       └── list-customers.service.ts
│   │
│   ├── routes/
│   │   ├── vehicle.routes.ts
│   │   ├── parking-session.routes.ts
│   │   ├── customer.routes.ts
│   │   └── index.ts
│   │
│   ├── schemas/
│   │   ├── vehicle.schema.ts
│   │   ├── parking-session.schema.ts
│   │   └── customer.schema.ts
│   │
│   ├── middlewares/
│   │   ├── validate-request.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   └── auth.middleware.ts
│   │
│   ├── errors/
│   │   ├── app-error.ts
│   │   └── http-status-code.ts
│   │
│   ├── utils/
│   │   └── async-handler.ts
│   │
│   ├── types/
│   │   └── express/
│   │       └── index.d.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 3. Convenções de Nomenclatura

| Item                | Padrão                            | Exemplo                                           |
| ------------------- | --------------------------------- | ------------------------------------------------- |
| Arquivo             | `kebab-case.tipo.ts`              | `create-vehicle.service.ts`                       |
| Função exportada    | `camelCase` + sufixo do tipo      | `createVehicleController`, `createVehicleService` |
| Pasta de módulo     | substantivo no singular           | `vehicle`, `customer`, `parking-session`          |
| Controller          | um arquivo por rota/ação          | `list-vehicles.controller.ts`                     |
| Erros de negócio    | sempre via `AppError`             | nunca `res.status()` dentro do service            |
| Instância do Prisma | singleton em `config/database.ts` | nunca `new PrismaClient()` espalhado              |

---

## 4. Exemplo Prático — Módulo `vehicle`

### 4.1. Schema de validação (Zod)

`src/schemas/vehicle.schema.ts`

```typescript
import { z } from "zod";

export const createVehicleSchema = z.object({
  body: z.object({
    plate: z.string().min(7).max(8),
    model: z.string().min(1),
    color: z.string().min(1),
    customerId: z.string().uuid(),
  }),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>["body"];
```

### 4.2. Middleware de validação

`src/middlewares/validate-request.middleware.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export function validateRequest(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Dados inválidos", errors: error.errors });
      }
      next(error);
    }
  };
}
```

### 4.3. Service (regra de negócio)

`src/services/vehicle/create-vehicle.service.ts`

```typescript
import { prisma } from "../../config/database";
import { CreateVehicleInput } from "../../schemas/vehicle.schema";
import { AppError } from "../../errors/app-error";

export async function createVehicleService(data: CreateVehicleInput) {
  const plateExists = await prisma.vehicle.findUnique({
    where: { plate: data.plate },
  });

  if (plateExists) {
    throw new AppError("Veículo já cadastrado com essa placa", 409);
  }

  const vehicle = await prisma.vehicle.create({ data });
  return vehicle;
}
```

### 4.4. Controller (camada HTTP)

`src/controllers/vehicle/create-vehicle.controller.ts`

```typescript
import { Request, Response } from "express";
import { createVehicleService } from "../../services/vehicle/create-vehicle.service";

export async function createVehicleController(req: Request, res: Response) {
  const vehicle = await createVehicleService(req.body);
  return res.status(201).json(vehicle);
}
```

### 4.5. Rota

`src/routes/vehicle.routes.ts`

```typescript
import { Router } from "express";
import { createVehicleController } from "../controllers/vehicle/create-vehicle.controller";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createVehicleSchema } from "../schemas/vehicle.schema";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.post(
  "/",
  validateRequest(createVehicleSchema),
  asyncHandler(createVehicleController),
);

export default router;
```

### 4.6. Utilitário — async handler

`src/utils/async-handler.ts`

```typescript
import { Request, Response, NextFunction, RequestHandler } from "express";

export function asyncHandler(fn: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### 4.7. Erro customizado

`src/errors/app-error.ts`

```typescript
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

### 4.8. Middleware de tratamento de erros

`src/middlewares/error-handler.middleware.ts` (deve ser o último middleware registrado em `app.ts`)

```typescript
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Erro interno do servidor" });
}
```

---

## 5. Fluxo Completo de uma Requisição

1. Requisição chega na **rota** (`routes/vehicle.routes.ts`).
2. O **middleware de validação** valida `body`/`query`/`params` com Zod. Se inválido, retorna `400` antes de chegar no controller.
3. O **controller** recebe a requisição já validada, chama o **service** correspondente.
4. O **service** executa a regra de negócio e acessa o banco via **Prisma**. Se houver violação de regra, lança `AppError`.
5. O **error handler** (middleware global) captura qualquer erro lançado e formata a resposta.
6. O **controller** devolve a resposta HTTP de sucesso.

---

## 6. Evolução Futura (sem quebrar o padrão atual)

À medida que o projeto crescer, os seguintes itens podem ser adicionados sem reestruturar o que já existe:

- **`repositories/`** — isolar queries do Prisma dos services (útil para trocar ORM ou mockar em testes).
- **`dtos/`** — quando os tipos de retorno da API divergirem dos models do Prisma.
- **`__tests__/`** — testes espelhando a estrutura de `controllers/` e `services/`.
- **`repositories/` + injeção de dependência** — se a complexidade de regras de negócio aumentar muito.

---

## 7. Resumo de Responsabilidades por Camada

| Camada         | Responsabilidade                                  | Não deve conter                            |
| -------------- | ------------------------------------------------- | ------------------------------------------ |
| `routes/`      | Definir endpoints e encadear middlewares          | Regra de negócio                           |
| `schemas/`     | Validação de formato dos dados de entrada (Zod)   | Acesso a banco                             |
| `middlewares/` | Validação, autenticação, tratamento de erro       | Regra de negócio específica de domínio     |
| `controllers/` | Receber `req`, chamar service, devolver `res`     | Lógica de negócio, acesso direto ao Prisma |
| `services/`    | Regras de negócio, orquestração, acesso ao Prisma | `req`/`res` do Express                     |
| `errors/`      | Definição de erros customizados                   | Lógica de negócio                          |
