import { __prod__ } from "./constants"
import { Post } from "./entities/Post"
import { MikroORM } from "@mikro-orm/core"
import path from "path"

export default {
	migrations: {
		path: path.join(__dirname, "./migrations"), // path to the folder with migrations
		pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files - for type t or j
	},
	entities: [Post],
	dbName: "postgres",
	user: "postgres",
	password: "    ",
	type: "postgresql",
	debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0] // use "as const" to cast it to a const to preserve the type or use "Parameters"(returns an array) to export with the type "init" expects
