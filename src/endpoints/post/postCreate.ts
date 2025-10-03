import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../types";
import prismaClients from "../../../lib/prismaClient";

const Post = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  content: z.string(),
  authorId: z.string().uuid(),
});

export class PostCreate extends OpenAPIRoute {
  schema = {
    tags: ["Post"],
    summary: "Create a new Post",
    request: {
      body: {
        content: {
          "application/json": {
            schema: Post,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created post",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              post: Post,
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const postToCreate = data.body;
    const prisma = await prismaClients.fetch(c.env.DB);
    const post = await prisma.post.create({ data: {
      title: postToCreate.title,
      content: postToCreate.content,
      authorId: postToCreate.authorId,
    } });
    return { success: true, post };
  }
}
