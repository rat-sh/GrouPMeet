import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err.message, err.stack);
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
    res.status(statusCode).json({
        error: process.env.NODE_ENV === "development"
            ? (err.message || "Internal Server Error")
            : "Internal Server Error",
        ...process.env.NODE_ENV === "development" && { stack: err.stack }
    });
};
