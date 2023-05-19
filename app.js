const express = require("express");
const server = express();
const router = express.Router()
const fs = require("fs");
const bodyParser = require("body-parser")
const usersRoutes = require("./routes/users.routes")
const postsRoutes = require("./routes/posts.routes")

server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())

server.use("/api/v1/users", usersRoutes)
server.use("/api/v1/posts", postsRoutes)


// Khai báo middleware xử lý trang 404
server.use((req, res, next) => {
    res.status(404).send('<h1>PAGE NOT FOUND</h1>');
});

// Cài đặt để server luôn chờ đợi và lắng nghe các request gửi lên từ client
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
