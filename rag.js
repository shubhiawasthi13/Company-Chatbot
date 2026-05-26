import { indexTheDocument } from "./prepare.js";
import dotenv from "dotenv";
dotenv.config();

const path = "./extended_company_policy_handbook.pdf"
indexTheDocument(path);