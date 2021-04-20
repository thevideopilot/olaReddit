import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants"
import { Post } from "./entities/Post"
import microConfig from "./mikro-orm.config"
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/post"

const main = async () => {
	const orm = await MikroORM.init(microConfig)
	// run the migrations
	await orm.getMigrator().up()

	//this only creates an instance of the post
	// const post = orm.em.create(Post, { title: "my first post" })

	// //to insert post into the DB
	// await orm.em.persistAndFlush(post)

	// const post = await orm.em.find(Post, {})
	// console.log(post)

	// or
	// console.log("-----------sql---------")

	// await orm.em.nativeInsert(Post, { title: "my first post 2" })
	const app = express()

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver],
			validate: false,
		}),
		context: () => ({ em: orm.em }),
	})

	apolloServer.applyMiddleware({ app })

	app.listen(4000, () => {
		console.log("Server started on localhost:4000")
	})
}

main().catch(err => {
	console.log(err)
})
