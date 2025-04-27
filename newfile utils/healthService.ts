import { Platform } from 'react-native';
import * as Health from 'expo-health'; // supports HealthKit & Google Fit

export interface HealthSample {
  timestamp: number;
  steps: number;
  heartRate: number;
}

// Request permissions and return whether granted
export async function requestPermissions() {
  const perms = Platform.select({
    ios: [Health.PermissionSteps, Health.PermissionHeartRate],
    android: [Health.PermissionSteps, Health.PermissionHeartRate],
  })!;
  const { granted } = await Health.requestPermissions(perms);
  return granted;
}

// Fetch today’s total and last 7 days of raw samples
export async function getHealthSamples(): Promise<HealthSample[]> {
  if (!(await requestPermissions())) return [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  // steps samples
  const steps = await Health.getQuantitySamplesAsync({
    startDate: start,
    endDate: end,
    quantityType: Health.QuantityTypeStepCount,
  });

  // heart rate samples
  const hr = await Health.getQuantitySamplesAsync({
    startDate: start,
    endDate: end,
    quantityType: Health.QuantityTypeHeartRate,
  });

  // merge by timestamp
  const map: Record<number, HealthSample> = {};
  steps.forEach(s => {
    const ts = new Date(s.startDate).getTime();
    map[ts] = { timestamp: ts, steps: s.quantity, heartRate: 0 };
  });
  hr.forEach(h => {
    const ts = new Date(h.startDate).getTime();
    map[ts] = map[ts] ? { ...map[ts], heartRate: Math.round(h.quantity) } : { timestamp: ts, steps: 0, heartRate: Math.round(h.quantity) };
  });

  return Object.values(map).sort((a,b)=>a.timestamp - b.timestamp);
}

// Subscribe to live steps updates (only iOS); callback on new total
export function watchSteps(callback: (total: number) => void) {
  if (Health.watchStepCount) {
    const subscription = Health.watchStepCount(({ steps }) => callback(steps));
    return () => subscription.remove();
  }
  return () => {};
}