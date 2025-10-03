import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../types";
import prismaClients from "../../../lib/prismaClient";

const Post = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  authorId: z.string().uuid(),
});

export class PostDelete extends OpenAPIRoute {
  schema = {
    tags: ["Post"],
    summary: "Delete a Post",
    request: {
      params: z.object({
        postId: Str({ description: "Post ID" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns if the post was deleted successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              post: Post,
            }),
          },
        },
      },
      "404": {
        description: "Post not found",
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
    const { postId } = data.params;
    const prisma = await prismaClients.fetch(c.env.DB);
    const post = await prisma.post.delete({ where: { id: postId } }).catch(() => null);
    if (!post) {
      return { success: false, error: "Post not found" };
    }
    return { success: true, post };
  }
}
