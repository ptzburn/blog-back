import { body } from 'express-validator'

export const loginValidation = [
  body('email', 'Incorrect email format').isEmail(),
  body('password', 'Password is at least 5 symbols long').isLength({ min: 5 })
]

export const registerValidation = [
  body('email', 'Incorrect email format').isEmail(),
  body('password', 'Password is at least 5 symbols long').isLength({ min: 5 }),
  body('fullName', 'Enter the name').isLength({ min: 3 }),
  body('avatarUrl', 'Incorrect URL').optional().isURL()
]

export const postCreateValidation = [
  body('title', 'Enter the title.').isLength({ min: 3 }).isString(),
  body('text', 'Type some more text.').isLength({ min: 3 }).isString(),
  body('tags', 'Incorrect tag format.').optional().isString(),
  body('imageUrl', 'Incorrect URL.').optional().isString()
]
