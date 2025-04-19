import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

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

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get username/email and password from body
  //check data is valid or not
  //check user exist or not
  //check password is correct or not
  //generate access token and refresh token
  //save refresh token in cookie and db

  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existedUser) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await existedUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existedUser._id
  );
  const user = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(500, "Something went wrong while logging in the user");
  }

  const options = {
    httpOnly : true,
    secure : true,
  }


  return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
    new ApiResponse(
      200,
      {
        user: user,
        accessToken, refreshToken
      },
      "User logged in successfully"
    )
  )
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id, {
      $set : {
        refreshToken : undefined
      }
    },
     {
      new : true,
     }
  );

  const options = {
    httpOnly : true,
    secure : true,
  }

  return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, null, "User logged out successfully"));
  
});

export { registerUser, loginUser, logoutUser };
