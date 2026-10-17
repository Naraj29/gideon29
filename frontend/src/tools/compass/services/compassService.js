// Demo version using localStorage instead of backend API

const STORAGE_KEY = 'compass_waypoints';

const getWaypointsData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveWaypointsData = (waypoints) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(waypoints));
};

const compassService = {
  getWaypoints: async () => {
    const waypoints = getWaypointsData();
    return { results: waypoints, count: waypoints.length };
  },
  
  createWaypoint: async (data) => {
    const waypoints = getWaypointsData();
    const newWaypoint = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    waypoints.unshift(newWaypoint);
    saveWaypointsData(waypoints);
    return newWaypoint;
  },
  
  deleteWaypoint: async (id) => {
    const waypoints = getWaypointsData();
    const filtered = waypoints.filter(w => w.id !== id);
    saveWaypointsData(filtered);
  }
};

export default compassService;
