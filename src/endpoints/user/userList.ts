import { Bool, OpenAPIRoute, Num } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../types";
import prismaClients from "../../../lib/prismaClient";

const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
});

export class UserList extends OpenAPIRoute {
  schema = {
    tags: ["User"],
    summary: "List Users",
    request: {
      query: z.object({
        page: Num({ description: "Page number", default: 0 }),
      }),
    },
    responses: {
      "200": {
        description: "Returns a list of users",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              users: User.array(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { page } = data.query;
    const prisma = await prismaClients.fetch(c.env.DB);
    const users = await prisma.user.findMany({ skip: page * 10, take: 10 });
    return { success: true, users };
  }
}
