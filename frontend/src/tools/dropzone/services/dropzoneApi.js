// Demo version - Dropzone requires real-time signaling, not suitable for localStorage
// This is a mock implementation for demo purposes

const dropzoneApi = {
  createSession: async () => {
    // Mock session creation
    return { pin: Math.random().toString(36).substring(2, 8).toUpperCase(), session_id: Date.now().toString() };
  },
  joinSession: async (pin) => {
    // Mock join - always succeeds in demo
    return { success: true, session_id: Date.now().toString() };
  },
  sendMessage: async (pin, sender, type, payload) => {
    // Mock message send - in production this would use WebRTC signaling
    return { success: true };
  },
  pollMessages: async (pin, targetSender) => {
    // Mock poll - returns empty in demo
    return { messages: [] };
  },
  dropMessage: async (msgId) => {
    // Mock drop
    return { success: true };
  },
  endSession: async (pin) => {
    // Mock end session
    return { success: true };
  }
};

export default dropzoneApi;
