import { User } from "../entities/User"
import { MyContext } from "../types"
import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Resolver,
} from "type-graphql"
import argon2 from "argon2"

@ObjectType()
class FieldError {
	@Field()
	field: string

	@Field()
	message: string
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[]

	@Field(() => User, { nullable: true })
	user?: User
}

@InputType()
class UsernamePasswordInput {
	@Field()
	username: string
	@Field()
	password: string
}

@Resolver()
export class UserResolver {
	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em }: MyContext
	): Promise<UserResponse> {
		if (options.username.length <= 2) {
			return {
				errors: [
					{
						field: "username",
						message: "Username length must be greater than 2",
					},
				],
			}
		}

		if (options.password.length <= 2) {
			return {
				errors: [
					{
						field: "password",
						message: "Password length must be greater than 2",
					},
				],
			}
		}
		const hashedPassword = await argon2.hash(options.password)
		const user = em.create(User, {
			username: options.username,
			password: hashedPassword,
		})
		try {
			await em.persistAndFlush(user)
		} catch (err) {
			// duplicate username
			//|| err.detail.includes("already exists")) {
			if (err.code === "23505") {
				return {
					errors: [
						{
							field: "username",
							message: "username already exist",
						},
					],
				}
			}
			console.log("message", err.message)
		}
		return { user }
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username: options.username })
		if (!user) {
			return {
				errors: [
					{
						field: "username",
						message: "username doesn't exist",
					},
				],
			}
		}
		const valid = await argon2.verify(user.password, options.password)
		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "password is invalid",
					},
				],
			}
		}

		req.session

		return { user }
	}
}
