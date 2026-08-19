
// Shared Tool Definitions for Editor and Header
import React from 'react';

export const TOOLS = [
    {
        id: 1,
        icon: '/site_icons/icon-7.svg',
        shortName: 'improve quality',
        image: '/img/tools/enhance.png',
        video: '/video/tools/enhance-79352e8350856988951c624229a2e74b.mp4',
        path: '/editor/#operation=upscale',
        title: 'Improve quality & Upscale',
        description: 'Increase resolution and clarity',
        group: 1,
        slug: 'upscale'
    },
    {
        id: 2,
        icon: '/site_icons/icon-4.svg',
        shortName: 'remove background',
        image: '/img/tools/remove_bg.png',
        video: '/video/tools/remove_bg-f6045fe63f17a1a42b07ff97ce4e20af.mp4',
        path: '/editor#operation=remove_bg',
        title: 'Remove background',
        description: 'Extract objects automatically',
        group: 1,
        slug: 'remove_bg'
    },
    {
        id: 3,
        icon: '/site_icons/icon-11.svg',
        shortName: 'ai photoshoot',
        image: '/img/tools/ai_backgrounds.png',
        video: '/video/tools/ai_backgrounds-fdd35ebda59e84353c036a434a4f8b95.mp4',
        path: '/editor#operation=photoshoot',
        title: 'AI Photoshoot',
        description: 'Professional product shots',
        group: 1,
        slug: 'photoshoot'
    },
    {
        id: 4,
        icon: '/site_icons/icon-6.svg',
        shortName: 'ai background',
        image: '/img/tools/ai_backgrounds_template.png',
        video: '/video/tools/ai_backgrounds_template-b1471ce71b1c759e55e82d0f58703f76.mp4',
        path: '/editor#operation=backgrounds',
        title: 'AI backgrounds (templates)',
        description: 'Generate scenic backgrounds',
        group: 1,
        slug: 'generation_bg'
    },
    {
        id: 5,
        icon: '/site_icons/brush.svg',
        shortName: 'erase brush',
        image: '/img/tools/fix_with_brush.png',
        video: '/video/tools/fix_with_brush-5ab90e0c96ae972f2b7bc8f128c04f4e.mp4',
        path: '/editor#operation=eraser',
        title: 'Erase brush',
        description: 'Remove unwanted objects',
        group: 1,
        slug: 'eraser'
    },
    {
        id: 6,
        icon: '/site_icons/icon-15.svg',
        shortName: 'ai edit',
        image: '/img/tools/ai_edit.png',
        video: '/video/tools/ai_edit-d82b4d7d7114e1660f912fb8e4415daa.mp4',
        path: '/editor#operation=ai-edit',
        title: 'AI Edit',
        description: 'Edit with text prompts',
        group: 1,
        slug: 'ai_edit'
    },
    {
        id: 7,
        icon: '/site_icons/icon-5.svg',
        shortName: 'shadows',
        image: '/img/tools/add_shadows.png',
        video: '/video/tools/add_shadows-50963f4a0a94c073d504468d8e2b119e.mp4',
        path: '/editor#operation=shadows',
        title: 'Add shadows',
        description: 'Realistic lighting effects',
        group: 2,
        slug: 'shadows'
    },
    {
        id: 8,
        icon: '/site_icons/icon-8.svg',
        shortName: 'light fix',
        image: '/img/tools/correct_colors.png',
        video: '/video/tools/correct_colors-6015fdc4875e825450a591ea9e0da1da.mp4',
        path: '/editor#operation=light-fix',
        title: 'Fix light & colors',
        description: 'Auto-enhance lighting',
        credits: 10,
        group: 2,
        slug: 'light_fix'
    },
    {
        id: 9,
        icon: '/site_icons/icon-18.svg',
        shortName: 'resize & expand',
        image: '/img/tools/expand.png',
        video: '/video/tools/expand-5f39db8b877304a7b2debaebade2a59d.mp4',
        path: '/editor#operation=resize',
        title: 'Resize & Expand',
        description: 'Smart resizing & outpainting',
        group: 2,
        slug: 'resize'
    },
    {
        id: 10,
        icon: '/site_icons/icon-19.svg',
        shortName: 'blur background',
        image: '/img/tools/blur_bg.png',
        video: '/video/tools/blur_bg-c465df0a3e42e62c377248577f113018.mp4',
        path: '/editor#operation=blur',
        title: 'Blur background',
        description: 'Depth of field effects',
        group: 2,
        slug: 'blur'
    },
    {
        id: 11,
        icon: '/site_icons/text.svg',
        shortName: 'add text',
        image: '/img/tools/text.png',
        video: '/video/tools/text-7af5cb5e2ba079eea587726626af54c2.mp4',
        path: '/editor#operation=text',
        title: 'Add text',
        description: 'Typography on images',
        group: 3,
        isNew: true,
        slug: 'text'
    },
    {
        id: 12,
        icon: '/site_icons/icon-13.svg',
        shortName: 'ai fashion models',
        image: '/img/tools/ai_fashion_model.png',
        video: '/video/tools/ai_fashion_models-321de5f2b3d65f613e2b45ce82c75bc6.mp4',
        path: '/editor#operation=fashion',
        title: 'AI Fashion Models',
        description: 'On-model photography',
        credits: 13,
        group: 3,
        isNew: true,
        slug: 'fashion'
    },
    {
        id: 13,
        icon: '/site_icons/icon-14.svg',
        shortName: 'video',
        image: '/img/tools/ai_video.png',
        video: '/video/tools/ai_video-11e0376230967ea53fa7a142188998bd.mp4',
        path: '/editor#operation=video',
        title: 'Image to video',
        description: 'Animate your visuals',
        group: 3,
        isNew: true,
        slug: 'video'
    },
];

