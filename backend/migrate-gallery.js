const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'app_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

const prompts = [
    { image_url: '/img/prompt_img/armchair_1_min_bd4d0f0e23.png', prompt: 'Warm, spacious minimalist interior shot at eye level, with sheer white curtains, and low afternoon sunlight casting long striped shadows across a light wooden floor.' },
    { image_url: '/img/prompt_img/tumbler_4_min_ed80bb69c0.png', prompt: 'Outdoor autumn scene, featuring a moss-covered stone ledge in the foreground. Softly blurred background of warm red and orange foliage with a hint of light rain.' },
    { image_url: '/img/prompt_img/bag_1_min_e658f15f7a.png', prompt: 'Outdoor meadow scene shot straight-on at mid-height, with tall wild grasses surrounding a large rectangular mirror laid flat on the ground. The product stands centered on the mirror.' },
    { image_url: '/img/prompt_img/butter_2_min_53804c91bc.png', prompt: 'Close-up shot of the product standing upright, filling most of the frame, surrounded by a dense layer of whole peanuts in their shells.' },
    { image_url: '/img/prompt_img/armchair_2_min_ec8eb362ae.png', prompt: 'Beige wall and floor bathed in soft afternoon light that casts dappled tree shadows across the surface. The product sits beside a small black side table holding an amber glass vase with a few delicate branches.' },
    { image_url: '/img/prompt_img/can_3_min_e0c5d88012.png', prompt: 'Product centered against a soft pastel gradient. Slight reflection on the floor.' },
    { image_url: '/img/prompt_img/candle_1_min_ffe1b39ff1.png', prompt: 'Product resting on a piece of textured driftwood. Neutral beige backdrop and surface, warm soft studio lighting.' },
    { image_url: '/img/prompt_img/bag_3_min_3830e4b2f7.png', prompt: 'Calm blue sea and hazy distant shoreline under a clear sky. The product sits centered on a simple white rectangular pedestal in the foreground.' },
    { image_url: '/img/prompt_img/candle_3_min_7fc297c809.png', prompt: 'Studio still-life with juicy tangerines, green leaves, and curling orange peels arranged closely around the product, set against a muted olive background with a thin wisp of smoke rising above.' },
    { image_url: '/img/prompt_img/can_1_min_2cc88e17b2.png', prompt: 'Dreamy outdoor scene with a dramatic pastel sunset sky in pink, orange, and lilac tones. The product stands near the edge of a smooth, slanted pastel-pink platform.' },
    { image_url: '/img/prompt_img/chair_1_min_7ef7ec285d.png', prompt: 'Warm oak wooden floor, white wall behind, gentle morning sunlight creating diagonal lines across the scene.' },
    { image_url: '/img/prompt_img/lipstick_1_min_3ef4b3a089.png', prompt: 'Product placed near a wall with long, angled shadows cast by directional lighting. Background in muted pastel.' },
    { image_url: '/img/prompt_img/can_2_min_6eabb7f749.png', prompt: 'Top-down studio shot with a dense bed of big mint leaves filling the entire frame, speckled with dewy water drops. The product is nestled among the leaves.' },
    { image_url: '/img/prompt_img/necklace_2_min_b22093079b.png', prompt: 'Product resting on warm golden beach sand, shot from directly above. The sand is a mix of fine grains and tiny pebbles.' },
    { image_url: '/img/prompt_img/lipstick_2_min_7ab353b07d.png', prompt: 'Low-angle warm studio light, neutral background, faint reflection on the base, focus on tactile realism and depth.' },
    { image_url: '/img/prompt_img/sneaker_2_min_a7ca6bd400.png', prompt: 'Top-down shot of a dense patch of blooming pink and white flowers with uneven realistic petals, filling the entire frame. The product rests nestled among the flowers.' },
    { image_url: '/img/prompt_img/lamp_1_min_620de4badf.png', prompt: 'A muted terracotta cabinet against a plain light wall, with a bold framed abstract artwork on the right.' },
    { image_url: '/img/prompt_img/shampoo_1_min_6d742a9405.png', prompt: 'Bathroom scene with sage-green tiled walls and a narrow built-in ledge where the product stands centered in a beam of warm sunlight. Strong directional light.' },
    { image_url: '/img/prompt_img/necklace_3_min_093d34ec71.png', prompt: 'Product lying on wet black volcanic sand at the water’s edge, as a thin wave of white sea foam curls around and partly over it.' },
    { image_url: '/img/prompt_img/sneaker_3_min_f04f7e55be.png', prompt: 'Calm blue ocean and pale cloudy sky forming a clean horizon in the background. The product rests on a rugged, textured rock ledge in the foreground.' },
    { image_url: '/img/prompt_img/toy_2_min_0db18329b1.png', prompt: 'Cozy, softly lit bedroom scene shot with the product lying on rumpled playful kid\'s bedding.' },
    { image_url: '/img/prompt_img/tumbler_1_min_34bcae2163.png', prompt: 'Moody studio close-up shot, with a low mound of glossy roasted coffee beans filling the foreground and a smooth dark grey gradient backdrop behind.' },
    { image_url: '/img/prompt_img/toy_3_min_f1ffab6f3a.png', prompt: 'A smooth warm beige backdrop and a rustic light-wood stool centered in the frame. Product placed on the flat top of the stool.' },
    { image_url: '/img/prompt_img/tumbler_3_min_cb6d8e02d9.png', prompt: 'Minimal studio scene with a clean white wall casting soft shadows, an olive branch entering from the left, and a single outstretched hand along the lower right edge.' },
    { image_url: '/img/prompt_img/shampoo_2_min_5c5c353d8f.png', prompt: 'Minimal studio scene with a smooth beige backdrop, where the product floats diagonally through a clear horizontal band of water across the frame.' }
];

const run = async () => {
    try {
        console.log('Creating prompt_gallery table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS prompt_gallery (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                image_url TEXT NOT NULL,
                prompt TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table created successfully!');

        console.log('Seeding initial prompts...');
        for (const p of prompts) {
            await pool.query(
                'INSERT INTO prompt_gallery (image_url, prompt) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [p.image_url, p.prompt]
            );
        }
        console.log('Seeding successful!');

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

run();
