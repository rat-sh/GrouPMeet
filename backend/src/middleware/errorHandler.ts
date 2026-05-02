import type { Request, Response, NextFunction } from "express";
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.log("Error :", err.message);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        error: err.message || "Internal Server Error",
        ...process.env.NODE_ENV === "development" && { stack: err.stack }
    })
}
