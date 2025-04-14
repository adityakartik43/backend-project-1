import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // vaidatation - not empty
  // check if user aready exists
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create a user object - create entry in db
  // remove password and refresh token field from response
  // chcek user creation
  // return res

  const { name, username, email, password } = req.body;

  // console.log(req.body)

  if ([name, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.coverImage[0]?.path;

  // console.log(req.files.avatar[0])

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  // console.log(avatar)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const newUser = await User.create({
    name,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // console.log(newUser);

  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

return res.status(201).json(
  new ApiResponse(201, createdUser, "User created successfully")
);

});

export default registerUser;
