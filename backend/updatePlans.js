const db = require('./src/config/database');

async function updatePlans() {
    try {
        console.log('Updating plans information...');

        // Update Essentials plan
        await db.query(
            `UPDATE plans SET 
                monthly_price_cents = 1000, 
                yearly_price_cents = 800, 
                credit_limit_monthly = 500,
                features = '["500 credits", "Access to all tools", "Standard resolution"]'
            WHERE slug = 'essentials'`
        );

        // Update Pro plan
        await db.query(
            `UPDATE plans SET 
                monthly_price_cents = 2700, 
                yearly_price_cents = 2300, 
                credit_limit_monthly = 1500,
                features = '["1500 credits", "Premium tools", "4K generation", "Video AI access"]'
            WHERE slug = 'pro'`
        );

        console.log('Plans updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating plans:', err.message);
        process.exit(1);
    }
}

updatePlans();
