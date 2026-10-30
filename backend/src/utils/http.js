export function success(res, status, message, data = {}) {
    return res.status(status).json({ message, success: true, ...data });
}

export function failure(res, status, message) {
    return res.status(status).json({ message, success: false });
}

export function handleError(res, error) {
    console.error(error);
    return failure(res, 500, "Internal server error");
}
