const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res, next);
        } catch (error) {
            if (error.statusCode && error.success === false) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    errors: error.errors || [],
                    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Internal Server Error',
                    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
                });
            }
        }
    };
};

export default asyncHandler;