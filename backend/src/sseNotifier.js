/**
 * SSE broadcaster — extracted to avoid circular imports between index.js and orders.js
 * All rider/captain SSE clients are stored here.
 */

/** @type {Set<import('http').ServerResponse>} */
export const riderClients = new Set();

/**
 * Send an SSE event to every connected Captain App client.
 * @param {string} eventName
 * @param {object} data
 */
export function broadcastToRiders(eventName, data) {
  const msg = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  riderClients.forEach(client => {
    try {
      client.write(msg);
    } catch {
      riderClients.delete(client);
    }
  });
}
