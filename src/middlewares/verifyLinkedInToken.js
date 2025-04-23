const verifyLinkedInToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const linkedInRes = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!linkedInRes.ok) {
            throw new Error("LinkedIn token is invalid");
        }
        const profile = await linkedInRes.json();
        req.user = {
            linkedinId: profile.sub,
            Name: profile.name,
        };
        next();
    } catch (err) {
        return res.status(200).json({ status: 401, message: "Invalid or expired LinkedIn token" });
    }
};

module.exports = verifyLinkedInToken;
