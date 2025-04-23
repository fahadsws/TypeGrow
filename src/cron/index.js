const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { DateTime } = require('luxon');


const getISTTime = () => {
    return DateTime.now().setZone('Asia/Kolkata');
};

const postToLinkedIn = async (text, id, accessToken) => {
    try {
        // const formattedText = convertHtmlToPlainText(text);
        const body = {
            author: `urn:li:person:${id}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: text
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        };

        const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`LinkedIn API error for post:`, error.message);
        return null;
    }
};

// const cronJob = async () => {
//     try {
//         const now = getISTTime();
//         const hour = now.getHours();
//         const minute = now.getMinutes();
//         const day = ((new Date().getDay() + 6) % 7) + 1;

//         const posts = await prisma.$queryRaw`
//         SELECT 
//             p.id AS post_id, 
//             p.content, 
//             p.is_slot, 
//             u.accessToken, 
//             u.uniid AS linkedin_id, 
//             s.time
//         FROM posts p
//         JOIN users u ON p.author = u.uniid
//         LEFT JOIN slots s ON p.is_slot = s.id
//         WHERE p.is_post = 0
//         AND (p.is_slot IS NULL OR FIND_IN_SET(${day}, s.day) > 0)
//     `;

//         for (const post of posts) {
//             const { post_id, content, accessToken, linkedin_id, is_slot, time } = post;

//             if (!accessToken || !linkedin_id) {
//                 console.warn(`Missing LinkedIn ID or token for post ${post_id}`);
//                 continue;
//             }
//             if (is_slot && time) {
//                 const slotTime = new Date(time);
//                 if (slotTime.getHours() !== hour || slotTime.getMinutes() !== minute) {
//                     console.log(`⏳ Post ${post_id} scheduled for ${slotTime.getHours()}:${slotTime.getMinutes()} IST, skipping.`);
//                     continue;
//                 }
//             }
//             const response = await postToLinkedIn(content || 'Default post content', linkedin_id, accessToken);
//             if (response) {
//                 await prisma.$executeRaw`UPDATE posts SET is_post = 1 WHERE id = ${post_id}`;
//             } else {
//                 console.warn(`❌ Failed to publish post ${post_id}`);
//             }
//         }
//     } catch (error) {
//         console.error('Error in cron job:', error);
//     }
// };

// const cronJob = async () => {
//     try {
//         const now = getISTTime();
//         const currentHour = now.hour;
//         const currentMinute = now.minute;
//         const day = ((new Date().getDay() + 6) % 7) + 1;
//         const todayDate = new Date().toISOString().slice(0, 10); 

//         const posts = await prisma.$queryRaw`
//             SELECT 
//                 p.id AS post_id, 
//                 p.content, 
//                 p.is_slot, 
//                 u.accessToken, 
//                 u.uniid AS linkedin_id, 
//                 s.time
//             FROM posts p
//             JOIN users u ON p.author = u.uniid
//             LEFT JOIN slots s ON p.is_slot = s.id
//             WHERE p.is_post = 0
//             AND (p.is_slot IS NULL OR FIND_IN_SET(${day}, s.day) > 0)
//         `;

//         for (const post of posts) {
//             const { post_id, content, accessToken, linkedin_id, is_slot, time } = post;

//             if (!accessToken || !linkedin_id) {
//                 console.warn(`⚠️ Missing LinkedIn ID or token for post ${post_id}`);
//                 continue;
//             }

//             if (is_slot && time) {
//                 const [slotHour, slotMinute] = time.split(':').map(Number);

//                 if (slotHour !== currentHour || slotMinute !== currentMinute) {
//                     console.log(`⏳ Post ${post_id} scheduled for ${slotHour}:${slotMinute} IST, skipping.`);
//                     continue;
//                 }
//             }

//             const response = await postToLinkedIn(content || 'Default post content', linkedin_id, accessToken);
//             if (response) {
//                 await prisma.$executeRaw`UPDATE posts SET is_post = 1 WHERE id = ${post_id}`;
//                 console.log(`✅ Posted to LinkedIn: post ${post_id}`);
//             } else {
//                 console.warn(`❌ Failed to publish post ${post_id}`);
//             }
//         }
//     } catch (error) {
//         console.error('🔥 Error in cron job:', error);
//     }
// };

const cronJob = async () => {
    try {
        const now = getISTTime();
        const currentHour = now.hour;
        const currentMinute = now.minute;
        const todayDate = new Date().toISOString().slice(0, 10);
        const day = ((new Date().getDay() + 6) % 7) + 1;
        const posts = await prisma.$queryRaw`
            SELECT 
                p.id AS post_id, 
                p.content, 
                p.is_slot, 
                s.date,
                u.accessToken, 
                u.uniid AS linkedin_id, 
                s.time,
                s.is_schedule
            FROM posts p
            JOIN users u ON p.author = u.uniid
            LEFT JOIN slots s ON p.is_slot = s.id
            WHERE p.is_post = 0
            AND (
                (p.is_slot AND s.is_schedule = 1 AND s.date = ${todayDate})
                OR 
                (s.is_schedule = 0 AND (p.is_slot IS NOT NULL AND FIND_IN_SET(${day}, s.day) > 0))
                OR
                (p.is_slot = 0)
            )
            `;

        for (const post of posts) {
            const { post_id, content, accessToken, linkedin_id, is_slot, is_schedule, time } = post;

            if (!accessToken || !linkedin_id) {
                console.warn(`⚠️ Missing LinkedIn ID or token for post ${post_id}`);
                continue;
            }

            if (is_slot && time) {
                const [slotHour, slotMinute] = time.split(':').map(Number);

                if (slotHour !== currentHour || slotMinute !== currentMinute) {
                    console.log(`⏳ Post ${post_id} scheduled for ${slotHour}:${slotMinute} IST, skipping.`);
                    continue;
                }
            }

            const response = await postToLinkedIn(content || 'Default post content', linkedin_id, accessToken);
            if (response) {
                await prisma.$executeRaw`UPDATE posts SET is_post = 1 WHERE id = ${post_id}`;
                console.log(`✅ Posted to LinkedIn: post ${post_id}`);
            } else {
                console.warn(`❌ Failed to publish post ${post_id}`);
            }
        }
    } catch (error) {
        console.error('🔥 Error in cron job:', error);
    }
};



const initCron = () => {
    cron.schedule('*/1 * * * *', () => {
        cronJob();
    });
    console.log('⏰ Cron job scheduled to run every 2 minutes');
};

module.exports = {
    initCron
};
