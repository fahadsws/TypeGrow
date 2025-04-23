const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.Login = async (req, res) => {
    try {
        const { uniid, name, email, image, accessToken } = req.body;

        let user = await prisma.users.findFirst({
            where: {
                uniid: uniid
            }
        });

        if (!user) {
            user = await prisma.users.create({
                data: {
                    uniid: uniid,
                    name: name,
                    email: email,
                    profile_image: image,
                    accessToken: accessToken,
                    is_trial: 1
                }
            });
        }
        res.json({
            status: true,
            message: "User login successfully",
            data: user
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};