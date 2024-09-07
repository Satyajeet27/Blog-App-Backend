import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Blog from "../models/blog";
import fs from "fs/promises";
import cloudinary from "../config/cloudinary";
import User from "../models/user";

export const createBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(createHttpError(404, "CoverImage field required"));
    }
    const imageExtenstion = req.file?.mimetype.split("/").at(-1) as string;
    // const ImageFileName = req.file?.filename + imageExtenstion;
    const filePath = req?.file.path;
    const imageType = ["jpeg", "jpg", "png"];
    if (!imageType.includes(imageExtenstion)) {
      await fs.unlink(filePath);
      return next(
        createHttpError(400, "CoverImage should be in jpg/jpeg/png format")
      );
    }

    // console.log(filePath);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "blog-cover-image",
      resource_type: "image",
    });
    const coverImage = result.secure_url;
    // console.log(result);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.log(error);
    }

    const blog = await Blog.create({
      author: req.userId,
      ...req.body,
      coverImage,
    });
    res.status(201).send({ message: "Blog Successfully created", blog });
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Something went wrong with create blog api!"));
  }
};

export const updateBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { blogId } = req.params;
    const { title, content, tags, category } = req.body;
    const blog = await Blog.findOne({ _id: blogId });
    let coverImage = blog?.coverImage;
    if (!blog) {
      return next(
        createHttpError(500, "Blog is not available for requested id")
      );
    }
    // console.log(req.userId, blog.author.toString());
    if (req.userId !== blog.author.toString()) {
      return next(createHttpError(409, "Not Authorized to update data"));
    }

    //
    if (req.file) {
      const imageExtenstion = req.file?.mimetype.split("/").at(-1) as string;
      // const ImageFileName = req.file?.filename + imageExtenstion;
      const filePath = req?.file.path;
      const imageType = ["jpeg", "jpg", "png"];
      if (!imageType.includes(imageExtenstion)) {
        return next(
          createHttpError(400, "CoverImage should be in jpg/jpeg/png format")
        );
      }
      //
      const publicId =
        "blog-cover-image/" + blog.coverImage.split("/").at(-1)?.split(".")[0];
      // console.log(publicId);
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });

      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "image",
        folder: "blog-cover-image",
      });
      coverImage = result.secure_url;
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.log(error);
      }
    }

    await blog.updateOne(
      { $set: { title, tags, category, content, coverImage } },
      { new: true }
    );

    res.status(200).send({ message: "updated", blog });
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Something went wrong with update blog api!"));
  }
};

export const getAllBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogs = await Blog.find({}).populate({
      path: "author",
      select: "username",
    });
    if (!blogs) {
      return next(createHttpError(404, "No any blog available"));
    }
    return res.status(200).send({ blogs });
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Something went wrong with get all blog api"));
  }
};
export const getUserBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const userId = req.userId;
    const { username } = req.params;
    const user = await User.findOne({ username }).select(
      "username bio createdAt"
    );
    if (!user) {
      return next(
        createHttpError(404, "No Blogs aavailable with requested username")
      );
    }
    const blogs = await Blog.find({ author: user._id });
    if (!blogs) {
      return next(createHttpError(404, "No any blog available"));
    }
    return res.status(200).send({ blogs, author: user });
  } catch (error) {
    console.log(error);
    next(createHttpError(500, "Something went wrong with get user blog api"));
  }
};

export const getSingleBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { blogId } = req.params;
    const blogs = await Blog.findOne({ _id: blogId }).populate({
      path: "author",
      select: "username",
    });
    if (!blogs) {
      return next(createHttpError(404, "No any blog available"));
    }
    return res.status(200).send({ blogs });
  } catch (error) {
    console.log(error);
    next(createHttpError(500, "Something went wrong with get single blog api"));
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOne({ _id: blogId });
    if (!blog) {
      return next(createHttpError(404, "Blog not available"));
    }
    if (req.userId !== blog.author.toString()) {
      return next(
        createHttpError(404, "Not authorized to make changes in blog")
      );
    }
    const publicId =
      "blog-cover-image/" + blog.coverImage.split("/").at(-1)?.split(".")[0];
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: "image",
    });
    await blog.deleteOne();
    return res
      .status(200)
      .send({ message: "Requested blog deleted successfully!" });
  } catch (error) {
    console.log(error);
    next(createHttpError(500, "Something went wrong with delete blog api"));
  }
};

export const likeBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOne({ _id: blogId }).populate({
      path: "likedBy",
      select: "username",
    });
    if (!blog) {
      return next(createHttpError(404, "Blog post not found"));
    }
    // console.log(blog);
    // console.log(req.userId, typeof req.userId);
    // console.log(blog.likedBy.includes(req.userId));
    if (blog.likedBy.includes(req.userId)) {
      return next(createHttpError(400, "You have already liked this post"));
    }
    blog.likes = Number(blog.likes) + 1;
    blog.likedBy.push(req.userId);
    blog.save();
    res.status(200).json({ message: "Blog post liked", likes: blog.likes });
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Something went wrong with likeBlogPost API"));
  }
};
export const unlikeBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogPost = await Blog.findById(req.params.blogId);
    if (!blogPost) {
      return next(createHttpError(404, "Blog post not found"));
    }

    // Check if the user has not liked the blog post
    if (!blogPost.likedBy.includes(req.userId)) {
      return res.status(400).json({ message: "You have not liked this post" });
    }

    // Remove the user from the likedBy array and decrement likes count
    blogPost.likedBy = blogPost.likedBy.filter(
      (userId) => userId.toString() !== req.userId
    );

    if (Number(blogPost.likes) >= 1) {
      blogPost.likes = Number(blogPost.likes) - 1;
    } else {
      blogPost.likes = 0;
    }
    await blogPost.save();

    res
      .status(200)
      .json({ message: "Blog post unliked", likes: blogPost.likes });
  } catch (err) {
    console.log(err);
    next(
      createHttpError(500, "Something went wrong with unlike blog post api")
    );
  }
};

export const getTrendingBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogs = await Blog.find({})
      .sort("-likes")
      .limit(3)
      .populate({ path: "author", select: "username" })
      .select("author title content createdAt");
    // console.log(blogs);
    return res.send(blogs);
  } catch (error) {
    console.log(error);
  }
};
