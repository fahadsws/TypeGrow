const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { DateTime } = require('luxon');

const getISTTime = () => {
  return DateTime.now().setZone('Asia/Kolkata');
};

exports.createPost = async (req, res) => {
  try {
    const { linkedinId } = req.user;
    const { content, is_slot, time, date, is_schedule } = req.body;

    let slotId = null;

    if (is_schedule && time && date) {
      const slot = await prisma.slots.create({
        data: {
          time,
          date,
          user_id: linkedinId,
          is_schedule: 1,
        },
      });
      slotId = slot.id;
    }

    if (is_slot && !slotId) {
      slotId = is_slot;
    }

    const post = await prisma.posts.create({
      data: {
        author: linkedinId,
        content,
        is_slot: slotId || 0,
      },
    });

    return res.json({
      status: true,
      message: slotId
        ? is_schedule
          ? 'Post Created on Schedule successfully'
          : 'Post Created on Slot successfully'
        : 'Post Created successfully',
      data: post,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// exports.createPost = async (req, res) => {
//   try {
//     const { linkedinId } = req.user;
//     const { content } = req.body;

//     const post = await prisma.posts.create({
//       data: {
//         author: linkedinId,
//         content,
//       }
//     });
//     res.json({
//       status: true,
//       message: "Post Created successfully",
//       data: post
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.slotPost = async (req, res) => {
  try {
    const { linkedinId } = req.user;
    const { content, is_slot } = req.body;

    const post = await prisma.posts.create({
      data: {
        author: linkedinId,
        content,
        is_slot
      }
    });
    res.json({
      status: true,
      message: "Post Created on Slot successfully",
      data: post
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.schedulePost = async (req, res) => {
  try {
    const { linkedinId } = req.user;
    const { content, time, date } = req.body;

    const slot = await prisma.slots.create({
      data: {
        time,
        date,
        user_id: linkedinId,
        is_schedule: 1
      }
    });

    const post = await prisma.posts.create({
      data: {
        author: linkedinId,
        content,
        is_slot: slot.id
      }
    });
    res.json({
      status: true,
      message: "Post Created on Schedule successfully",
      data: post
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSlot = async (req, res) => {
  try {
    const { linkedinId } = req.user;
    const { time, day } = req.body;
    const days = day.join(',');
    const post = await prisma.slots.create({
      data: {
        time,
        day: days,
        user_id: linkedinId
      }
    });
    res.json({
      status: true,
      message: "Slot Added successfully",
      data: post
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSlot = async (req, res) => {
  try {
    const { linkedinId } = req.user;
    const currentISTTime = getISTTime().toFormat('HH:mm');
    const post = await prisma.slots.findMany({
      where: {
        user_id: linkedinId,
        is_schedule: 0,
        time: {
          gte: currentISTTime,
        },
      }
    });
    res.json({
      status: true,
      message: "Slot Get successfully",
      data: post
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};