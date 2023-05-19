// Khởi tạo server
const express = require("express");
const fs = require("fs");
const Joi = require('joi');

const router = express.Router()

// Middleware kiểm tra sự tồn tại của id
const checkExistId = (req, res, next) => {
    const { id } = req.params;
    try {
        let posts = JSON.parse(fs.readFileSync("./database/posts.json"))
        const existingPost = posts.find(post => post.id === +id);
        if (!existingPost) {
            return res.status(404).json({ message: 'Post not found' });
        } else {
            next();
        }
    } catch (error) {
        res.json({
            error,
        })
    }
};


// Middleware 
const validateTitle = (req, res, next) => {
    let { id } = req.params;
    let { title } = req.body;
    if (!title) {
        res.json({ message: "Email blank" });

    }
    try {
        const posts = JSON.parse(fs.readFileSync('./database/posts.json'));
        let postId = posts.findIndex(post => post.id === +id)
        if (posts[postId].title === title) {
            res.json({ message: "Title is the same as the old one" })
        } else {
            next()
        }
    } catch (error) {
        res.json({
            error,
        })
    }
}

// Middleware kiểm tra sự tồn tại của title
const checkExistTitle = (req, res, next) => {
    let { title, body } = req.body;
    if (!title || !body) {
        return res.status(404).json({ message: 'Input blank' });
    }
    try {
        const posts = JSON.parse(fs.readFileSync('./database/posts.json'));
        const existingPost = posts.find(post => post.title === title || post.body === body);
        if (existingPost) {
            return res.status(404).json({ message: 'Post exists' });
        } else {
            next();
        }
    } catch (error) {
        res.json({
            error,
        })
    }
};




// Lấy về dữ liệu của toàn bộ posts
router.get('/', (req, res) => {
    try {
        let posts = JSON.parse(fs.readFileSync('./database/posts.json'));
        res.status(200).json({
            message: 'success',
            result: posts.length,
            data: posts
        })

    } catch (error) {
        res.json({
            error,
        })
    }

})

// Lấy về dữ liệu của một post
router.get('/:id', checkExistId, (req, res) => {
    try {
        let { id } = req.params;
        const posts = JSON.parse(fs.readFileSync('./database/posts.json'));
        let findPost = posts.find((post, i) => post.id === +id)
        res.status(200).json({
            message: "success",
            data: findPost
        })

    } catch (error) {
        res.json({
            error,
        })
    }
})

// Thêm mới dữ liệu về 1 post vào trong CSDL
router.post("/", checkExistTitle, (req, res) => {
    const { userId, title, body } = req.body;
    try {
        const posts = JSON.parse(fs.readFileSync('./database/posts.json'));
        const newId = posts[posts.length - 1].id + 1;
        const newPost = {
            "userId": userId,
            "id": newId,
            "title": title,
            "body": body
        };
        posts.push(newPost);
        fs.writeFileSync('./database/posts.json', JSON.stringify(posts))
        res.json({
            message: "Create successfully"
        })

    } catch (error) {
        res.json({
            error,
        })
    }

});

// Chỉnh sửa dữ liệu của 1 post 
router.put("/:id", checkExistId, checkExistTitle, (req, res) => {
    let { id } = req.params;
    let { title, body } = req.body;

    try {
        const posts = JSON.parse(fs.readFileSync('./database/posts.json'));
        let postId = posts.findIndex(post => post.id === +id)
        posts[postId] = { ...posts[postId], title, body };
        fs.writeFileSync('./database/posts.json', JSON.stringify(posts))
        res.json({
            message: "Update successfully"
        })

    } catch (error) {
        res.json({
            error,
        })
    }
})

// Xoá dữ liệu về một user	
router.delete("/:id", checkExistId, (req, res) => {
    let { id } = req.params;
    try {
        const posts = JSON.parse(fs.readFileSync('./database/posts.json'));
        const newPosts = posts.filter((e, i) => e.id != id)
        fs.writeFileSync('./database/posts.json', JSON.stringify(newPosts))
        res.json({
            message: "Delete successfully"
        })

    } catch (error) {
        res.json({
            error,
        })
    }
})





module.exports = router;

