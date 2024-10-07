export const JoiValidator = (validationSchema) => {
    return (req, res, next) => {
      const { error } = validationSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          status: "failure",
          message: "Validation error",
          errors: error.details.map((err) => err.message)
        });
      }
      next();
    };
  };