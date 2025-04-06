import asyncHandler from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async(_req, res)=>{
    res.status(200).json({
        message:"OK",
        name: "Aditya Kartik"
    })
})

export default registerUser