import https from "https";

/**
 * Pings the server's own health endpoint every 14 minutes to prevent
 * Render's free tier from putting the service to sleep.
 */
export const startKeepAlive = () => {
    const url = process.env.FRONTEND_URL;
    
    if (!url || !url.includes("onrender.com")) {
        console.log("KeepAlive: Skipping (Not a Render production environment)");
        return;
    }

    const healthUrl = `${url}/health`;
    
    console.log(`KeepAlive: Initialized. Pinging ${healthUrl} every 14 minutes.`);

    // 14 minutes in milliseconds (Render sleeps after 15 mins of inactivity)
    const interval = 14 * 60 * 1000;

    setInterval(() => {
        https.get(healthUrl, (res) => {
            if (res.statusCode === 200) {
                console.log(`[${new Date().toISOString()}] KeepAlive: Successfully pinged ${healthUrl}`);
            } else {
                console.error(`[${new Date().toISOString()}] KeepAlive: Failed with status ${res.statusCode}`);
            }
        }).on("error", (err) => {
            console.error(`[${new Date().toISOString()}] KeepAlive Error:`, err.message);
        });
    }, interval);
};
