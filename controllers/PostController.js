import fs from 'fs'
import path from 'path'

import PostModel from '../models/Post.js'

export const getAll = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'new'
    const posts = await PostModel.find()
      .populate('user')
      .sort(sortBy === 'new' ? { createdAt: -1 } : { viewsCount: -1 })
      .exec()

    res.json(posts)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Fetching posts failed.'
    })
  }
}

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec()

    const tags = posts
      .map(post => post.tags)
      .flat()
      .slice(0, 5)

    res.json(tags)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Fetching tags failed.'
    })
  }
}

export const getPostsByTag = async (req, res) => {
  try {
    const tag = req.params.tagName
    const posts = await PostModel.find({ tags: tag }).populate('user').exec()

    res.json(posts)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Fetching posts failed.'
    })
  }
}

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id

    const doc = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { returnDocument: 'after' }
    ).populate('user')

    if (!doc) {
      return res.status(404).json({
        message: 'Post not found.'
      })
    }

    res.json(doc)
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: 'Fetching the post failed.'
    })
  }
}

export const remove = async (req, res) => {
  try {
    const postId = req.params.id
    const post = await PostModel.findById(postId)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.imageUrl) {
      const filePath = path.join(
        process.cwd(),
        'uploads',
        post.imageUrl.split('/').pop()
      )
      fs.unlink(filePath, err => {
        if (err) {
          console.error('Failed to delete image:', err)
        }
      })
    }

    await PostModel.findByIdAndDelete(postId)
    res.status(204).json({
      message: 'success'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: 'Removing the post failed.'
    })
  }
}

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(','),
      user: req.userId
    })

    const post = await doc.save()

    res.json(post)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Publishing the post failed.'
    })
  }
}

export const update = async (req, res) => {
  try {
    const postId = req.params.id

    await PostModel.updateOne(
      {
        _id: postId
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags.split(',')
      }
    )

    res.json({
      success: true
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Unable to update the post.'
    })
  }
}
