import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../types";
import prismaClients from "../../../lib/prismaClient";

const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
});

export class UserDelete extends OpenAPIRoute {
  schema = {
    tags: ["User"],
    summary: "Delete a User",
    request: {
      params: z.object({
        userId: Str({ description: "User ID" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns if the user was deleted successfully",
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
    const user = await prisma.user.delete({ where: { id: userId } }).catch(() => null);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, user };
  }
}
