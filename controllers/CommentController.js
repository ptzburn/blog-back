import CommentModel from '../models/Comment.js'
import PostModel from '../models/Post.js'

export const getPostComments = async (req, res) => {
  try {
    const comments = await CommentModel.find({ post: req.params.id })
      .populate('user', 'fullName avatarUrl')
      .exec()

    res.json(comments)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Fetching comments failed.'
    })
  }
}

export const create = async (req, res) => {
  try {
    const doc = new CommentModel({
      text: req.body.text,
      post: req.params.id,
      user: req.userId
    })

    const comment = await doc.save()
    await PostModel.findByIdAndUpdate(req.params.id, {
      $inc: { commentsCount: 1 }
    })

    res.status(201).json(comment)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Failed to add comment.'
    })
  }
}
