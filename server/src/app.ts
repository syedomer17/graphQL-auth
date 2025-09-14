import express from 'express';
import { graphqlHTTP } from "express-graphql";
import connectDB from './config/db';
import schema from './schema/authSchema';
import { authResolver } from './resolvers/authResolver';
import { authMiddleware } from './middleware/auth';
import env from './config/env';

const app = express();

// Connect to the database
connectDB();

// Middleware to parse JSON requests
app.use(express.json());

// Authentication middleware
app.use(authMiddleware);

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: authResolver,
    graphiql: true,
}));

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});