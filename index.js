import express from 'express'
import multer from 'multer'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fs from 'fs'

import {
  loginValidation,
  postCreateValidation,
  registerValidation,
  commentCreateValidation
} from './validations.js'

import { handleValidationErrors, checkAuth } from './utils/index.js'

import {
  UserController,
  PostController,
  CommentController
} from './controllers/index.js'

dotenv.config()

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('DB OK')
  })
  .catch(error => console.log('DB Error', error))

const app = express()

const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads')
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage })

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))
app.use(express.static('dist'))

app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
)
app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
)
app.get('/auth/me', checkAuth, UserController.getMe)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  })
})

app.get('/tags', PostController.getLastTags)
app.get('/tags/:tagName', PostController.getPostsByTag)

app.get('/posts', PostController.getAll)
app.get('/posts/:id', PostController.getOne)
app.get('/posts/:id/comments', CommentController.getPostComments)
app.post(
  '/posts',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
)
app.post(
  '/posts/:id/comments',
  checkAuth,
  commentCreateValidation,
  CommentController.create
)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
)

const PORT = process.env.PORT || 3001
app.listen(PORT, error => {
  if (error) {
    return console.log(error)
  }

  console.log(`Server OK, port: ${PORT}`)
})
