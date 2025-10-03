import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../types";
import prismaClients from "../../../lib/prismaClient";

const User = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().optional(),
});

export class UserCreate extends OpenAPIRoute {
  schema = {
    tags: ["User"],
    summary: "Create a new User",
    request: {
      body: {
        content: {
          "application/json": {
            schema: User,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created user",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              user: User,
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const userToCreate = data.body;
    const prisma = await prismaClients.fetch(c.env.DB);
    
    const user = await prisma.user.create({ data: {
      email: userToCreate.email,
      name: userToCreate.name || null,
    } });
    
    return { success: true, user };
  }
}
