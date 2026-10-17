// Demo version using localStorage instead of backend API

const SCHEDULES_KEY = 'timetable_schedules';
const BLOCKS_KEY = 'timetable_blocks';

const getSchedulesData = () => {
  const data = localStorage.getItem(SCHEDULES_KEY);
  return data ? JSON.parse(data) : [];
};

const saveSchedulesData = (schedules) => {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
};

const getBlocksData = () => {
  const data = localStorage.getItem(BLOCKS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveBlocksData = (blocks) => {
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
};

const timetableService = {
  getSchedules: async (params = {}) => {
    const schedules = getSchedulesData();
    return { results: schedules, count: schedules.length };
  },
  createSchedule: async (data) => {
    const schedules = getSchedulesData();
    const newSchedule = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    schedules.unshift(newSchedule);
    saveSchedulesData(schedules);
    return newSchedule;
  },
  updateSchedule: async (id, data) => {
    const schedules = getSchedulesData();
    const index = schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      schedules[index] = { ...schedules[index], ...data };
      saveSchedulesData(schedules);
      return schedules[index];
    }
    throw new Error('Schedule not found');
  },
  deleteSchedule: async (id) => {
    const schedules = getSchedulesData();
    const filtered = schedules.filter(s => s.id !== id);
    saveSchedulesData(filtered);
  },
  
  // Time Blocks
  getBlocks: async (params = {}) => {
    const blocks = getBlocksData();
    return { results: blocks, count: blocks.length };
  },
  createBlock: async (data) => {
    const blocks = getBlocksData();
    const newBlock = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    blocks.unshift(newBlock);
    saveBlocksData(blocks);
    return newBlock;
  },
  updateBlock: async (id, data) => {
    const blocks = getBlocksData();
    const index = blocks.findIndex(b => b.id === id);
    if (index !== -1) {
      blocks[index] = { ...blocks[index], ...data };
      saveBlocksData(blocks);
      return blocks[index];
    }
    throw new Error('Block not found');
  },
  deleteBlock: async (id) => {
    const blocks = getBlocksData();
    const filtered = blocks.filter(b => b.id !== id);
    saveBlocksData(filtered);
  }
};

export default timetableService;
