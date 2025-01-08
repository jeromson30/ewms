// Importing mongoose library along with Document and Model types from it
import mongoose, { Document, Model } from "mongoose";

// Defining the structure of a todo item using TypeScript interfaces
export interface ILogin {
  login: string;
  password: string;
}

// Defining a mongoose schema for the todo document, specifying the types 
// and constraints
const loginSchema = new mongoose.Schema<ILogin>(
  {
    login: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' fields to the document
    timestamps: true,
  }
);

// Creating a mongoose model for the todo document
const Login: Model<ILogin> =
  mongoose.models?.Login || mongoose.model("User", loginSchema);

export default Login;