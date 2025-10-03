import { Bool, OpenAPIRoute, Num } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../types";
import prismaClients from "../../../lib/prismaClient";

const Post = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  authorId: z.string().uuid(),
});

export class PostList extends OpenAPIRoute {
  schema = {
    tags: ["Post"],
    summary: "List Posts",
    request: {
      query: z.object({
        page: Num({ description: "Page number", default: 0 }),
      }),
    },
    responses: {
      "200": {
        description: "Returns a list of posts",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              posts: Post.array(),
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
    const posts = await prisma.post.findMany({ skip: page * 10, take: 10 });
    return { success: true, posts };
  }
}
