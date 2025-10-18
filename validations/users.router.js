const { Router } = require("express");
const userModel = require("../models/user.model");
const {upload, deleteFromCloudinary} = require("../config/clodinary.config");
const postModel = require("../models/post.model");


const userRouter = Router()

userRouter.get('/', async (req, res) => {
    const users = await userModel.find().sort({_id: -1})
    res.status(200).json(users)
})

userRouter.put('/', upload.single('avatar') , async (req, res) => {
    const id = req.userId
    const {email} = req.body
    const filePath = req.file.path
    const user = await userModel.findById(id)
    if(filePath){
        const deleteId = user.avatar?.split('uploads/')[1]
        const id = deleteId.split('.')[0]
        console.log(deleteId, "deleteId")
        console.log(id, "id")
        await deleteFromCloudinary(`uploads/${id}`)
    }

    await userModel.findByIdAndUpdate(id, {email, avatar: filePath })
    res.status(200).json({message: "user updated successfully"})
})
userRouter.delete('/:id', async (req, res) => {
    const targetUserId = req.params.id
    const userId = req.userId

    const user = await userModel.findById(userId)
    const targetUser = await userModel.findById(targetUserId)

    if(user.role !== 'admin' && targetUserId !== userId){
        return res.status(403).json({error: "You dont have perimition"})
    }

    await userModel.findByIdAndDelete(targetUserId)
    await postModel.deleteMany({author: targetUserId})
    res.json({message: 'user deleted successfully'})
})

module.exports = userRouter