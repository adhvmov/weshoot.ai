/**
 * Webhook Controller
 * Handles webhooks from external services (Freepik Mystic)
 */
const db = require('../config/database');
const freepikService = require('../services/freepikService');

/**
 * Handle Freepik Mystic webhook callback
 * Receives async generation results
 */
const handleFreepikMysticWebhook = async (req, res) => {
    try {
        // Get signature from headers
        const signature = req.headers['x-webhook-signature'] || req.headers['x-freepik-signature'];

        // Verify signature
        const payload = JSON.stringify(req.body);
        const isValid = freepikService.verifyWebhookSignature(payload, signature);

        if (!isValid) {
            console.warn('[Webhook] Invalid signature from Freepik');
            return res.status(401).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        const { task_id, status, generated } = req.body;

        console.log(`[Webhook] Freepik Mystic callback - Task: ${task_id}, Status: ${status}`);

        if (!task_id) {
            return res.status(400).json({
                success: false,
                message: 'task_id is required'
            });
        }

        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Find the operation by mystic_task_id
            const operationResult = await client.query(
                'SELECT * FROM operations_history WHERE mystic_task_id = $1',
                [task_id]
            );

            if (operationResult.rows.length === 0) {
                console.warn(`[Webhook] Operation not found for task_id: ${task_id}`);
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Operation not found'
                });
            }

            const operation = operationResult.rows[0];

            // Update operation status
            await client.query(
                'UPDATE operations_history SET mystic_status = $1 WHERE id = $2',
                [status, operation.id]
            );

            // If generation completed, download and save images
            if (status === 'COMPLETED' && generated && generated.length > 0) {
                console.log(`[Webhook] Downloading ${generated.length} generated image(s)`);

                for (const imageUrl of generated) {
                    try {
                        // Download image to local storage
                        const downloadResult = await freepikService.downloadGeneratedImage(imageUrl);

                        // Update the asset with the local URL
                        await client.query(
                            'UPDATE project_assets SET file_url = $1 WHERE id = $2',
                            [downloadResult.url, operation.asset_id]
                        );

                        console.log(`[Webhook] Image saved: ${downloadResult.url}`);
                    } catch (downloadError) {
                        console.error('[Webhook] Failed to download image:', downloadError.message);
                        // Continue with other images even if one fails
                    }
                }

                // Mark operation as success
                await client.query(
                    'UPDATE operations_history SET status = $1 WHERE id = $2',
                    ['success', operation.id]
                );
            } else if (status === 'FAILED') {
                // Mark operation as failed
                await client.query(
                    'UPDATE operations_history SET status = $1 WHERE id = $2',
                    ['failed', operation.id]
                );
            }

            await client.query('COMMIT');

            res.json({
                success: true,
                message: 'Webhook processed successfully'
            });

        } catch (dbError) {
            await client.query('ROLLBACK');
            console.error('[Webhook] Database error:', dbError);
            throw dbError;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('[Webhook] Processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed'
        });
    }
};

module.exports = {
    handleFreepikMysticWebhook
};
