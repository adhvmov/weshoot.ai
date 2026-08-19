const fs = require('fs');
const path = require('path');

// Helper to recursively copy directories using native fs
function copyRecursiveSync(src, dest) {
    const stats = fs.statSync(src);
    const isDirectory = stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

async function fixAssets() {
    console.log('🔧 Starting Asset Synchronization (Native Node.js Version)...');

    const frontendPublic = path.resolve(__dirname, '../frontend/public');
    const adminPublic = path.resolve(__dirname, '../admin/public');

    // 1. Ensure Admin Public Directory Exists
    console.log(`📁 Ensuring admin public directory exists: ${adminPublic}`);
    if (!fs.existsSync(adminPublic)) {
        fs.mkdirSync(adminPublic, { recursive: true });
    }

    const foldersToSync = [
        'site_icons',
        'img',
        'add_shadow',
        'ai_fashion_models',
        'ai_photoshoot',
        'background_templets',
        'blur_background',
        'video'
    ];

    foldersToSync.forEach(folder => {
        const src = path.join(frontendPublic, folder);
        const dest = path.join(adminPublic, folder);

        if (fs.existsSync(src)) {
            console.log(`📋 Copying ${folder}...`);
            copyRecursiveSync(src, dest);
            console.log(`✅ ${folder} copied successfully.`);
        } else {
            console.warn(`⚠️  Frontend ${folder} directory not found!`);
        }
    });

    console.log('\n🎉 Asset sync complete!');
    console.log('\n👇 NEXT STEPS (CRITICAL):');
    console.log('1. Rebuild Frontend:  cd ../frontend && npm run build');
    console.log('2. Rebuild Admin:     cd ../admin && npm run build');
    console.log('3. Restart Apache:    sudo systemctl restart apache2');
}

fixAssets();
