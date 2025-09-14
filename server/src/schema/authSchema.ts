import { buildSchema } from "graphql";

const schema = buildSchema(`
    type User {
    id: ID!
    name: String!
    email: String!
    isVerified: Boolean!
    }
    type AuthPayload {
    token: String
    user: User
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): String
    verifyEmail(email: String!, otp: String!): String
    login(email: String!, password: String!): AuthPayload
  }

  type Query {
    me: User
  }
`);

export default schema;