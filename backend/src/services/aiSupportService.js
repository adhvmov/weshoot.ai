const axios = require('axios');

// 1. Knowledge Base (JSON)
const KNOWLEDGE_BASE = {
    "platform": {
        "name": "WeShoot",
        "description": "WeShoot is an AI-powered creative studio that helps businesses, agencies, and creators generate professional product photography and visual assets using AI tools.",
        "last_updated": "2026-01-21"
    },
    "plans": {
        "free_trial": {
            "cost": "Free",
            "credits": 50,
            "features": [
                "Access to standard tools",
                "Basic AI operations"
            ],
            "limits": {
                "2k_upscale": 2,
                "remove_background": 5,
                "ai_photoshoot": 5,
                "ai_background": 5,
                "ai_fashion": 2,
                "ai_edit": 5,
                "shadows": 5,
                "fix_light": 3,
                "restricted": ["4k_upscale", "ai_video", "tech_support"]
            }
        },
        "essentials": {
            "cost": {
                "monthly": 12,
                "yearly": 9
            },
            "credits": 450,
            "features": [
                "Standard image editing tools",
                "Resolution up to 2K",
                "1 month history retention",
                "API Starter Pack"
            ]
        },
        "pro": {
            "cost": {
                "monthly": 29,
                "yearly": 24
            },
            "credits": 1400,
            "features": [
                "Full access to premium tools",
                "Resolution up to 4K",
                "3 months history retention",
                "Priority support"
            ]
        },
        "business": {
            "cost": "Custom",
            "features": [
                "Unlimited access to most tools",
                "Advanced API workflows",
                "Dedicated onboarding and support",
                "Early beta access"
            ]
        }
    },
    "tools": {
        "upscale": {
            "description": "Improve image quality and resolution",
            "cost": {
                "2x": 12,
                "4x": 18
            },
            "presets": ["General", "Product", "Places", "People", "Digital Art", "Text"]
        },
        "remove_background": {
            "description": "Automatically removes background with high precision",
            "cost": 5
        },
        "ai_photoshoot": {
            "description": "Generates professional product photography scenes",
            "cost": 5,
            "modes": ["Precise", "Creative", "Inspiration", "Background", "Product Swap"]
        },
        "ai_edit": {
            "description": "Modify specific parts of an image using text prompts",
            "cost": 5
        },
        "shadows": {
            "description": "Adds realistic shadows to products",
            "cost": 5
        },
        "fix_light": {
            "description": "Enhances lighting and colors automatically",
            "cost": 10
        }
    },
    "faqs": [
        {
            "question": "Why is my image blurry?",
            "answer": "Use Improve Quality & Upscale. Choose the People preset for faces."
        },
        {
            "question": "Can I use images commercially?",
            "answer": "Yes, commercial use is allowed on paid plans."
        },
        {
            "question": "How do I get 4K images?",
            "answer": "4K is available only on Pro and Business plans."
        }
    ]
};

// 2. System Prompt
const SYSTEM_PROMPT = `
You are WeShoot AI Support Assistant.

Role:
- Answer user questions accurately using the internal WeShoot Knowledge Base provided below.
- Only provide answers related to the WeShoot platform, tools, plans, and usage.
- If the user's question is not found in the knowledge base or is unrelated to WeShoot, politely do NOT answer and direct them to contact official support.

Knowledge Base:
${JSON.stringify(KNOWLEDGE_BASE, null, 2)}

Language rules:
- Always respond in the same language the user uses:
  - If the user writes in Arabic -> respond in Arabic.
  - If the user writes in English -> respond in English.
- Internal reasoning can be in English, but user-facing responses must match their language.

Behavior rules:
- Be clear, concise, and professional.
- Never invent information about plans, pricing, tools, or features.
- Respect user's subscription plan and credit limitations.
- Always provide polite guidance if a requested feature is unavailable in their plan.

Prompt generation rules (for AI image tools):
- Prompts must be realistic, production-ready, and suitable for AI image models.
- Include lighting, camera angle, environment, props, and mood when relevant.
- Output final prompts in professional English, regardless of user input language.

Fallback rules:
- If the AI does not know the answer or the question is unrelated to WeShoot, respond:
  Arabic: "عذرًا، لا أستطيع الإجابة على هذا السؤال. يرجى التواصل مع الدعم الفني عبر صفحة الاتصال."
  English: "Sorry, I cannot answer this question. Please contact support via the contact page."

Tone and style:
- Polite, professional, and helpful.
- Never provide personal opinions or external advice unrelated to WeShoot.

You are not a general chatbot.
You are a professional AI support assistant strictly for WeShoot.
`;

// 3. OpenRouter API Logic
const generateAIResponse = async (messages) => {
    try {
        const payload = {
            "model": "nousresearch/hermes-3-llama-3.1-405b:free",
            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                ...messages
            ]
        };

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", payload, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || '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'}`, // Using provided key as default/fallback if env var missing
                "HTTP-Referer": process.env.SITE_URL || "https://weshoot.net",
                "X-Title": "WeShoot",
                "Content-Type": "application/json"
            }
        });

        // Check/Parse output
        const aiMessage = response.data.choices[0].message.content;
        return aiMessage;

    } catch (error) {
        console.error("AI Support Error:", error?.response?.data || error.message);
        return null; // Return null to signal controller to use fallback
    }
};

module.exports = {
    generateAIResponse
};
