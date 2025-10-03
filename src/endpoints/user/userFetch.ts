import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../types";
import prismaClients from "../../../lib/prismaClient";

const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
});

export class UserFetch extends OpenAPIRoute {
  schema = {
    tags: ["User"],
    summary: "Get a single User by ID",
    request: {
      params: z.object({
        userId: Str({ description: "User ID" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns a single user if found",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              user: User,
            }),
          },
        },
      },
      "404": {
        description: "User not found",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: Str(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { userId } = data.params;
    const prisma = await prismaClients.fetch(c.env.DB);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, user };
  }
}
