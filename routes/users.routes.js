// Khởi tạo server
const express = require("express");
const fs = require("fs");
const Joi = require('joi');

const router = express.Router()

// Middleware kiểm tra sự tồn tại của id
const checkExistId = (req, res, next) => {
    const { id } = req.params;
    try {
        let users = JSON.parse(fs.readFileSync("./database/users.json"))
        const existingUser = users.find(user => user.id === +id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        } else {
            next();
        }
    } catch (error) {
        res.json({
            error,
        })
    }
};



// Middleware check email
const validateEmail = (req, res, next) => {
    let { id } = req.params;
    let { email } = req.body;
    if (!email) {
        res.json({ message: "Email blank" })
    }
    try {
        const users = JSON.parse(fs.readFileSync('./database/users.json'));
        let userId = users.findIndex(user => user.id === +id)
        if (users[userId].email === email) {
            res.json({ message: "Email is the same as the old one" })
        } else {
            let validateSchema = Joi.object({
                email: Joi.string().email({
                    minDomainSegments: 2, tlds: { allow: ['com', 'net'] }
                }),
            })
            let validateResult = validateSchema.validate({ email });
            if (!validateResult.error) next()
            else res.json({ message: validateResult.error.details[0].message })
        }

    } catch (error) {
        res.json({
            error,
        })
    }
}


// Middleware kiểm tra sự tồn tại của username
const checkExistUser = (req, res, next) => {
    const { name, username, email, phone } = req.body;
    try {
        let users = JSON.parse(fs.readFileSync("./database/users.json"))
        const existingUser = users.find(user => user.username === username || user.email === email || user.phone === phone);
        if (existingUser) {
            return res.status(404).json({ message: 'User exists' });
        } else {
            next();
        }
    } catch (error) {
        res.json({
            error,
        })
    }
};
// Middleware kiểm tra sự tồn tại của email
const checkExistEmail = (req, res, next) => {
    const { email} = req.body;
    try {
        let users = JSON.parse(fs.readFileSync("./database/users.json"))
        const existingEmail = users.find(user => user.email === email);
        if (existingEmail) {
            return res.status(404).json({ message: 'Email exists' });
        } else {
            next();
        }
    } catch (error) {
        res.json({
            error,
        })
    }
};

// Middleware validate thông tin
const validate = (req, res, next) => {
    const { name, username, email, phone } = req.body;
    let validateSchema = Joi.object({
        email: Joi.string().email({
            minDomainSegments: 2, tlds: { allow: ['com', 'net'] }
        }),
        username: Joi.string().alphanum().min(3).max(30).required(),
    })
    let validateResult = validateSchema.validate({ username, email });
    if (!validateResult.error) next()
    else res.json({ message: validateResult.error.details[0].message })
}



// Lấy về dữ liệu của toàn bộ users
router.get('/', (req, res) => {
    try {
        let users = JSON.parse(fs.readFileSync('./database/users.json'));
        res.status(200).json({
            message: 'success',
            result: users.length,
            data: users
        })

    } catch (error) {
        res.json({
            error,
        })
    }

})

// Lấy về dữ liệu của một user
router.get('/:id', checkExistId, (req, res) => {
    try {
        let { id } = req.params;
        let users = JSON.parse(fs.readFileSync('./database/users.json'));
        let findUser = users.find((user, i) => user.id === +id)
        res.status(200).json({
            message: "success",
            data: findUser
        })

    } catch (error) {
        res.json({
            error,
        })
    }
})
// Lấy về dữ liệu bài post của một user
router.get('/:id/post', checkExistId, (req, res) => {
    try {
        let { id } = req.params;
        let users = JSON.parse(fs.readFileSync('./database/users.json'));
        let posts=JSON.parse(fs.readFileSync('./database/posts.json'));
        let findUser = users.find((user, i) => user.id === +id)
        let userId=Number(findUser.id)
        let findPost=posts.filter(item=>item.userId===userId)
        res.status(200).json({
            message: "success",
            result: findPost.length,
            data: findPost
        })

    } catch (error) {
        res.json({
            error,
        })
    }
})

// Thêm mới dữ liệu về 1 users vào trong CSDL
router.post("/", validate, checkExistUser, (req, res) => {
    const { name, username, email, phone } = req.body;
    try {
        const users = JSON.parse(fs.readFileSync('./database/users.json'));
        const newId = users[users.length - 1].id + 1;
        const newUser = {
            "id": newId,
            "name": name,
            "username": username,
            "email": email,
            "address": {
                "street": null,
                "suite": null,
                "city": null,
                "zipcode": null,
                "geo": {
                    "lat": null,
                    "lng": null
                }
            },
            "phone": phone,
            "website": null,
            "company": {
                "name": null,
                "catchPhrase": null,
                "bs": null
            }
        };
        users.push(newUser);
        fs.writeFileSync('./database/users.json', JSON.stringify(users))
        res.json({
            message: "Create successfully"
        })

    } catch (error) {
        res.json({
            error,
        })
    }

});

// Chỉnh sửa dữ liệu của 1 user (email)	
router.put("/:id", checkExistId, validateEmail, checkExistEmail, (req, res) => {
    let { id } = req.params;
    let { email } = req.body;

    try {
        const users = JSON.parse(fs.readFileSync('./database/users.json'));
        let userId = users.findIndex(user => user.id === +id)
        users[userId] = { ...users[userId], email };
        fs.writeFileSync('./database/users.json', JSON.stringify(users))
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
        const users = JSON.parse(fs.readFileSync('./database/users.json'));
        const newUsers = users.filter((e, i) => e.id != id)
        fs.writeFileSync('./database/users.json', JSON.stringify(newUsers))
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

