import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  //   console.log(errors.array({ onlyFirstError: true }));
  console.log(req.body);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array({ onlyFirstError: true }) });
  }
  next();
};

//user validation
export const validateUserSignupRequest = [
  body("username").notEmpty().withMessage("Username is required!"),
  body("fname").notEmpty().withMessage("First name is required!"),
  body("lname").notEmpty().withMessage("last name is required!"),
  body("email").isEmail().withMessage("Enter valid email"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password should be at least 5 character"),
  body("bio").optional(),
  body("role").isEmpty().withMessage("Role field is required"),
  handleValidation,
];
export const validateUserLoginRequest = [
  body("email").isEmail().withMessage("Enter valid email"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password should be at least 5 character"),
  handleValidation,
];
export const validateUpdateUserRequest = [
  body("username").isString().optional(),
  body("bio").isString().optional(),
  body("fname").isString().optional(),
  body("lname").isString().optional(),
  handleValidation,
];

//blog validation
export const validateBlogRequest = [
  body("title").notEmpty().withMessage("Title field is required!"),
  body("content").notEmpty().withMessage("Content field is required!"),
  body("category").notEmpty().withMessage("Category field required"),
  handleValidation,
];
export const validatePasswordResetRequest = [
  body("password")
    .notEmpty()
    .withMessage("Current Password field is required!"),
  body("newPassword").notEmpty().withMessage("New Password field is required!"),
  handleValidation,
];
