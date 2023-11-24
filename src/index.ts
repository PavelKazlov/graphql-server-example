// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: Author
  }

  type Books {
    title: String
  }

  type Author {
    id: ID!
    name: String
    books: [Books]
  }

  type Library {
    branch: String!
    booksNew: [BookNew!]
  }

  # A book has a title and author
  type BookNew {
    title: String!
    author: AuthorNew!
  }

  # An author has a name
  type AuthorNew {
    name: String!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    authors: [Author]
    author(id: ID!): Author
    numberSix: Int! # Should always return the number 6 when queried
    numberSeven: Int! # Should always return 7
    libraries: [Library]
  }



  type Mutation {
    addBook(title: String, author: String): [Book]
  }

`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
    authors: () => authors,
    author: (parent, args, contextValue, info) => {
      return authors.find((item) => item.id === args.id);
    },
    numberSix() {
      return 6;
    },
    numberSeven() {
      return 7;
    },
    libraries() {
      // Return our hardcoded array of libraries
      return libraries;
    },
  },
  Library: {
    booksNew(parent) {
      // Filter the hardcoded array of books to only include
      // books that are located at the correct branch
      return booksNew.filter((book) => book.branch === parent.branch);
    },
  },
  BookNew: {
    // The parent resolver (Library.books) returns an object with the
    // author's name in the "author" field. Return a JSON object containing
    // the name, because this field expects an object.
    author(parent) {
      return {
        name: parent.author,
      };
    },
  },
  // Because Book.author returns an object with a "name" field,
  // Apollo Server's default resolver for Author.name will work.
  // We don't need to define one.
  Mutation: {
    addBook: (title: String, author: String) => {
      return [...books, { title, author }];
      //   return { title, author };
    },
    // addBook: (title: String, author: String) => [...books, { title, author: { name: author } }],
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);

let books = [
  {
    title: "The Awakening",
    // author: "Kate Chopin",
    author: { name: "Kate Chopin" },
  },
  {
    title: "City of Glass",
    // author: "Paul Auster",
    author: { name: "Paul Auster" },
  },
];

let authors = [
  {
    id: "1",
    name: "Kate Chopin",
    books: [{ title: "The Awakening" }],
  },
  {
    id: "2",
    name: "Paul Auster",
    books: [{ title: "City of Glass" }],
  },
];

const libraries = [
  {
    branch: "downtown",
  },
  {
    branch: "riverside",
  },
];

// The branch field of a book indicates which library has it in stock
const booksNew = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
    branch: "riverside",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
    branch: "downtown",
  },
];
