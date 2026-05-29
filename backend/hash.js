import bcrypt from "bcrypt";

const password = "Admin123*";
const hash = await bcrypt.hash(password, 12);

console.log("Password :", password);
console.log("Hash     :", hash);