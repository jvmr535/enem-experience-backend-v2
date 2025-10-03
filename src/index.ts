
import { fromHono } from "chanfana";
import { Hono } from "hono";
import { UserCreate } from "./endpoints/user/userCreate";
import { UserDelete } from "./endpoints/user/userDelete";
import { UserFetch } from "./endpoints/user/userFetch";
import { UserList } from "./endpoints/user/userList";
import { PostCreate } from "./endpoints/post/postCreate";
import { PostDelete } from "./endpoints/post/postDelete";
import { PostFetch } from "./endpoints/post/postFetch";
import { PostList } from "./endpoints/post/postList";
import prismaClients from "../lib/prismaClient";

type Bindings = {
	MY_KV: KVNamespace;
	DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});


// Register User endpoints
openapi.get("/api/users", UserList);
openapi.post("/api/users", UserCreate);
openapi.get("/api/users/:userId", UserFetch);
openapi.delete("/api/users/:userId", UserDelete);

// Register Post endpoints
openapi.get("/api/posts", PostList);
openapi.post("/api/posts", PostCreate);
openapi.get("/api/posts/:postId", PostFetch);
openapi.delete("/api/posts/:postId", PostDelete);

export default app;
