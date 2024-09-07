import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticate";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getSingleBlog,
  getTrendingBlogs,
  getUserBlogs,
  likeBlogPost,
  unlikeBlogPost,
  updateBlog,
} from "../controllers/blog";
import multer from "multer";
import { validateBlogRequest } from "../middlewares/validate";

const router = Router();

const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  upload.single("coverImage"),
  validateBlogRequest,
  authenticateUser,
  createBlog
);
router.put(
  "/:blogId",
  upload.single("coverImage"),
  authenticateUser,
  updateBlog
);
router.get("/", getAllBlogs);
router.get("/user/:username", getUserBlogs);
router.get("/:blogId", getSingleBlog);
router.delete("/:blogId", authenticateUser, deleteBlog);

router.post("/:blogId/like", authenticateUser, likeBlogPost);
router.post("/:blogId/unlike", authenticateUser, unlikeBlogPost);
router.get("/@/trending", getTrendingBlogs);

export default router;
